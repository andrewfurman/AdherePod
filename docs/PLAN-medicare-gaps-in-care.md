# Medicare Gaps in Care — Implementation Plan

## Overview

This plan adds support for Medicare Advantage (MA) gaps-in-care workflows to AdherePod. The goal is to allow providers and care team members to import HEDIS-based care gaps for their patients, have the voice agent **casually** surface those gaps during natural conversation, document patient responses, and produce data in formats that MA plans can ingest for CMS Star Ratings reporting.

---

## Table of Contents

1. [Naming & Terminology](#1-naming--terminology)
2. [Database Schema Changes](#2-database-schema-changes)
3. [Insurance / Eligibility (Stedi Integration)](#3-insurance--eligibility-stedi-integration)
4. [Care Gap Import (Provider Side)](#4-care-gap-import-provider-side)
5. [Voice Agent Updates](#5-voice-agent-updates)
6. [Care Gap Documentation & Logging](#6-care-gap-documentation--logging)
7. [Provider Dashboard Updates](#7-provider-dashboard-updates)
8. [Export / API — Reporting Back to MA Plans](#8-export--api--reporting-back-to-ma-plans)
9. [File Format Research Summary](#9-file-format-research-summary)
10. [Implementation Phases](#10-implementation-phases)
11. [New Environment Variables](#11-new-environment-variables)
12. [Open Questions](#12-open-questions)

---

## 1. Naming & Terminology

Patients don't know what "gaps in care" means. We use **different terminology per audience**:

| Audience | Term | Where it appears |
|---|---|---|
| **Patients** (voice agent) | "Health check-ins" or "wellness check-ins" | Voice conversations, patient-facing UI |
| **Providers / Care team** | "Gaps in Care" or "Care Gaps" | Provider dashboard, import UI, clinical reports |
| **API / Data export** | `careGaps` (code), HEDIS measure IDs (export) | Database, API responses, HEDIS files |

### Voice Agent Phrasing Examples
Instead of: *"You have an open gap in care for breast cancer screening."*

Use: *"By the way — have you had a mammogram in the last year or so? Sometimes it's easy to lose track."*

Or: *"One more thing before we wrap up — has your doctor checked your blood pressure recently?"*

The agent treats these as **casual, conversational check-ins** — not clinical interrogations.

---

## 2. Database Schema Changes

### New Tables

#### `insuranceInfo`
Stores patient insurance/coverage data, populated via Stedi eligibility checks.

```
insuranceInfo
├── id               text (UUID, PK)
├── userId           text (FK → users, CASCADE DELETE)
├── payerId          text           — Stedi/CMS payer ID (e.g., "BCBS", "UHC", "CMS")
├── payerName        text           — Human-readable payer name
├── memberId         text           — Member/subscriber ID on the plan
├── planName         text           — Plan name from 271 response
├── planType         text           — "MA" | "MA-PD" | "PDP" | "commercial" | "medicaid" | "other"
├── groupNumber      text           — Group number if applicable
├── insuranceTypeCode text          — From 271: "MA", "MB", "MC", etc.
├── coverageStart    date           — Coverage effective date
├── coverageEnd      date           — Coverage termination date (null = active)
├── eligibilityJson  jsonb          — Full Stedi 271 response for reference
├── lastCheckedAt    timestamp      — Last eligibility verification
├── createdAt        timestamp
├── updatedAt        timestamp
└── UNIQUE(userId, payerId, memberId)
```

#### `careGapDefinitions`
Lookup table of standard HEDIS measure definitions. Seeded with common MA measures.

```
careGapDefinitions
├── id               text (UUID, PK)
├── measureId        text (UNIQUE)  — HEDIS measure ID (e.g., "BCS-E", "COL-E", "CBP")
├── measureName      text           — "Breast Cancer Screening"
├── measureVersion   text           — "HEDIS MY 2025"
├── description      text           — Full description of the measure
├── category         text           — "screening", "chronic", "medication", "behavioral"
├── targetPopulation text           — "Women 50-74", "Adults 18-75 with diabetes", etc.
├── voicePromptHint  text           — Casual phrasing hint for the voice agent
├── closureCriteria  text           — What evidence closes this gap
├── hedisValueSet    jsonb          — Relevant CPT/ICD codes for closure
├── isActive         boolean (default: true)
├── createdAt        timestamp
└── updatedAt        timestamp
```

#### `careGaps`
Per-patient care gap instances, imported by providers or health plans.

```
careGaps
├── id               text (UUID, PK)
├── patientId        text (FK → users, CASCADE DELETE)
├── definitionId     text (FK → careGapDefinitions)
├── insuranceInfoId  text (FK → insuranceInfo, nullable)
├── status           text           — "open" | "closed_by_report" | "closed_by_voice" | "closed_by_provider" | "excluded"
├── source           text           — "plan_import" | "provider_manual" | "csv_upload" | "api"
├── importedBy       text (FK → users) — Provider/admin who imported
├── gapOpenDate      date           — When the gap was identified
├── gapCloseDate     date           — When it was closed (null if open)
├── dueDate          date           — Compliance deadline (usually end of measurement year)
├── priority         text           — "high" | "medium" | "low"
├── externalId       text           — ID from the health plan's system (for round-tripping)
├── metadata         jsonb          — Flexible field for plan-specific data
├── createdAt        timestamp
└── updatedAt        timestamp
```

#### `careGapInteractions`
Records each time the voice agent asks about a gap and what the patient said.

```
careGapInteractions
├── id               text (UUID, PK)
├── careGapId        text (FK → careGaps, CASCADE DELETE)
├── conversationId   text (FK → conversations, CASCADE DELETE)
├── interactionType  text           — "asked" | "patient_confirmed" | "patient_denied" | "patient_unsure" | "patient_deferred"
├── patientResponse  text           — Free-text summary of what the patient said
├── extractedDate    date           — Date of service extracted from conversation (e.g., "I got my mammogram last March")
├── extractedProvider text          — Provider name mentioned ("Dr. Smith did it")
├── extractedLocation text          — Facility mentioned ("at Memorial Hospital")
├── agentNotes       text           — Agent's assessment of the interaction
├── confidence       text           — "high" | "medium" | "low" — how confident the agent is in the closure
├── reviewedBy       text (FK → users, nullable) — Provider who reviewed this interaction
├── reviewStatus     text           — "pending_review" | "confirmed" | "rejected"
├── reviewedAt       timestamp
├── createdAt        timestamp
└── updatedAt        timestamp
```

### Schema Changes to Existing Tables

#### `users` table — add fields:
```
├── medicareId       text           — Medicare Beneficiary Identifier (MBI) for eligibility lookups
├── dateOfBirth      date           — Needed for eligibility checks and measure targeting
├── gender           text           — "M" | "F" | "U" — needed for gender-specific measures (BCS, etc.)
```

---

## 3. Insurance / Eligibility (Stedi Integration)

### Overview
Use [Stedi's Real-Time Eligibility Check API](https://www.stedi.com/docs/healthcare/send-eligibility-checks) to verify patient insurance coverage and identify Medicare Advantage enrollment.

### API Integration

**Endpoint:** `POST https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3`

**Authentication:** API key in `Authorization` header.

**Flow:**
1. Provider enters patient's insurance details (payer, member ID) or Medicare MBI
2. Server calls Stedi 270 eligibility request
3. Stedi returns 271 response with coverage details
4. Parse response: store plan info in `insuranceInfo`, detect MA plan via `insuranceTypeCode = "MA" or "MB"`
5. If MA plan detected, enable care gap workflows for that patient

**Key Implementation Details:**
- CMS payer ID for Medicare: `"CMS"` — requires MBI (not SSN)
- CMS requires `X-Forwarded-For` header with origin IP addresses (as of Nov 2025)
- Commercial payers: detect MA via `benefitsInformation.insuranceTypeCode = MA or MB`
- Store full 271 JSON in `eligibilityJson` for audit trail
- Support batch eligibility checks for bulk onboarding

### New API Routes

```
POST /api/insurance/verify          — Run Stedi eligibility check for a patient
GET  /api/insurance/:patientId      — Get stored insurance info for a patient
PUT  /api/insurance/:id             — Update insurance info manually
```

### New Environment Variables
```
STEDI_API_KEY          — Production Stedi API key
STEDI_TEST_API_KEY     — Test Stedi API key (for mock responses)
```

---

## 4. Care Gap Import (Provider Side)

### Import Methods

#### A. CSV Upload
Providers or plan administrators upload a CSV with columns:
```csv
patient_email,measure_id,gap_open_date,due_date,priority,external_id
john@example.com,BCS-E,2025-01-15,2025-12-31,high,PLAN-GAP-12345
john@example.com,COL-E,2025-01-15,2025-12-31,medium,PLAN-GAP-12346
jane@example.com,CBP,2025-02-01,2025-12-31,high,PLAN-GAP-12347
```

- Match patients by email
- Validate measure IDs against `careGapDefinitions`
- Show preview before committing
- Report unmatched patients / invalid measures

#### B. Manual Entry
Provider selects a patient → clicks "Add Care Gap" → picks from dropdown of HEDIS measures → sets priority and due date.

#### C. API Import (Future — Phase 3)
```
POST /api/care-gaps/import    — Bulk JSON import from health plan systems
```

Accepts array of care gaps with patient identifiers (email, MBI, or internal ID).

### Seed Data — Common MA HEDIS Measures

Pre-populate `careGapDefinitions` with the most impactful measures for Star Ratings:

| Measure ID | Name | Category | Weight |
|---|---|---|---|
| **BCS-E** | Breast Cancer Screening | Screening | 1x |
| **COL-E** | Colorectal Cancer Screening | Screening | 1x |
| **CBP** | Controlling High Blood Pressure | Intermediate Outcome | 3x |
| **HBD** | Hemoglobin A1c Control for Diabetes | Intermediate Outcome | 3x |
| **KED** | Kidney Health Evaluation for Diabetes | Process | 1x (new 2026) |
| **SPD** | Statin Therapy for Patients with Diabetes | Process | 1x |
| **SPC** | Statin Therapy for CVD | Process | 1x |
| **TRC** | Transitions of Care | Process | 3x |
| **ADH-RAS** | Medication Adherence — RAS Antagonists (Hypertension) | Intermediate Outcome | 3x |
| **ADH-DIAB** | Medication Adherence — Diabetes Medications | Intermediate Outcome | 3x |
| **ADH-STAT** | Medication Adherence — Statins (Cholesterol) | Intermediate Outcome | 3x |
| **COA** | Care for Older Adults | Process | 1x |
| **AMP** | Antidepressant Medication Management | Process | 1x |
| **FMC** | Follow-Up After ED Visit for Mental Illness | Process | 1x |
| **CRE** | Cardiac Rehabilitation | Process | 1x |

Each definition includes a `voicePromptHint` — a suggested casual phrasing for the voice agent.

### New API Routes
```
GET    /api/care-gaps/definitions        — List all care gap definitions
POST   /api/care-gaps/import             — CSV or JSON bulk import
GET    /api/care-gaps?patientId=xxx      — List gaps for a patient
POST   /api/care-gaps                    — Create single care gap
PUT    /api/care-gaps/:id                — Update gap status
DELETE /api/care-gaps/:id                — Remove a gap
GET    /api/care-gaps/summary?patientId= — Summary counts (open/closed/pending)
```

---

## 5. Voice Agent Updates

### Updated System Prompt

Add the following section to the existing RealtimeAgent instructions:

```
Health check-ins (care gaps):
- Before the conversation starts, you'll receive a list of open health check-in items
  for this patient. These are preventive care or chronic condition management items
  their health plan has flagged.
- Your PRIMARY job is still to help with whatever the patient wants. Let them lead.
- AFTER they've asked their questions and seem satisfied, casually bring up
  ONE open check-in item at a time. Use natural, conversational language.
- DO NOT say "gap in care" or "HEDIS measure" or any clinical jargon.
- Examples of how to ask:
  • Screening: "Oh, one more thing — have you had a [mammogram/colonoscopy/etc.]
    in the past [timeframe]?"
  • Blood pressure: "By the way, do you know what your blood pressure was at your
    last checkup?"
  • HbA1c: "When's the last time your doctor checked your blood sugar levels?"
  • Medication: "Are you still taking your [statin/blood pressure medicine] every day?
    Any trouble keeping up with it?"
- If the patient says YES (they got the screening, their levels are good, etc.):
  • Ask a brief follow-up: "Do you remember roughly when that was?" or "That's great,
    was that at your regular doctor's office?"
  • Call the log_care_gap_response tool with the details.
- If the patient says NO or is unsure:
  • Don't pressure them. Say something like "No worries, it might be worth bringing up
    with your doctor next time you're in."
  • Log the response as "patient_denied" or "patient_unsure".
- If the patient seems annoyed or wants to move on:
  • Stop immediately. Say "No problem at all!" and move on.
  • Log as "patient_deferred".
- Only ask about 2-3 gaps maximum per conversation. Don't overwhelm them.
- Prioritize gaps marked as "high" priority first.
```

### New Voice Tools

#### `listCareGaps`
```typescript
name: "list_care_gaps"
description: "Get open health check-in items for the current patient (called at conversation start)"
parameters: {} // empty — uses session userId
execute: GET /api/care-gaps?patientId={userId}&status=open
```

#### `logCareGapResponse`
```typescript
name: "log_care_gap_response"
description: "Record the patient's response to a health check-in question"
parameters:
  careGapId: string (required) — the care gap being discussed
  interactionType: enum ["patient_confirmed", "patient_denied", "patient_unsure", "patient_deferred"]
  patientResponse: string (required) — brief summary of what the patient said
  extractedDate: string (optional) — "YYYY-MM-DD" if patient mentioned when they had the service
  extractedProvider: string (optional) — doctor/facility name if mentioned
  extractedLocation: string (optional) — where they had the service
  confidence: enum ["high", "medium", "low"] — agent's confidence in the information
execute: POST /api/care-gaps/interactions
```

### Conversation Flow

```
1. Patient starts conversation
2. Agent greets patient warmly (existing behavior)
3. Agent silently calls list_care_gaps to load open items
4. Patient asks their questions, manages medications (existing behavior)
5. When patient seems done / natural pause:
   a. Agent casually brings up highest-priority open gap
   b. Listens to patient response
   c. Calls log_care_gap_response with details
   d. If time/flow permits, asks about one more gap
6. Agent wraps up naturally
7. Conversation ends (existing behavior)
```

---

## 6. Care Gap Documentation & Logging

### Interaction → Review Pipeline

1. **Voice agent logs interaction** via `log_care_gap_response` tool → creates `careGapInteractions` record with `reviewStatus = "pending_review"`
2. **Provider reviews** on dashboard → sees pending interactions → can:
   - **Confirm**: marks `reviewStatus = "confirmed"`, updates `careGaps.status = "closed_by_voice"`, sets `gapCloseDate`
   - **Reject**: marks `reviewStatus = "rejected"`, gap stays open, adds note for why
3. **Auto-close logic** (optional, configurable per plan): if `confidence = "high"` and patient gave a specific date + provider, auto-set `reviewStatus = "confirmed"` after a configurable delay

### What Gets Stored

For each care gap interaction:
- The conversation ID (link to full transcript)
- Exactly what the patient said (free-text)
- Structured data extracted: date of service, provider name, location
- Agent's confidence level
- Timestamp

This creates an **audit trail** that the MA plan can use for supplemental data submission.

---

## 7. Provider Dashboard Updates

### New "Care Gaps" Tab

Add a third tab alongside "Medications" and "Conversations":

**Tab: Care Gaps** (visible when patient has MA insurance or any imported gaps)

#### Care Gap Cards
Each open gap displayed as a card:
```
┌─────────────────────────────────────────────┐
│ 🔴 HIGH  Breast Cancer Screening (BCS-E)    │
│ Due: Dec 31, 2025                           │
│ Status: Open                                │
│                                              │
│ Voice Check-in: ⏳ Pending review            │
│ "Patient said she had a mammogram in March  │
│  at Memorial Hospital with Dr. Johnson"     │
│ Confidence: High                            │
│                                              │
│ [✓ Confirm Closure]  [✗ Reject]  [📝 Note]  │
└─────────────────────────────────────────────┘
```

#### Summary Bar
At top of Care Gaps tab:
```
Open: 4  |  Pending Review: 2  |  Closed: 8  |  Excluded: 1
```

#### Import Button
"Import Care Gaps" button → opens modal:
- **CSV Upload**: drag-and-drop or file picker
- **Manual Add**: dropdown of HEDIS measures + date fields
- Preview table before confirming import

#### Patient Insurance Badge
On the patient card in the sidebar, show insurance type:
```
┌─────────────────────────┐
│ 👤 John Smith            │
│ john@example.com        │
│ 💊 5 medications         │
│ 🏥 UHC Medicare Adv.    │  ← NEW: insurance badge
│ 🔴 4 open care gaps     │  ← NEW: gap count
└─────────────────────────┘
```

### Insurance Management Section

New section in patient detail (accessible from provider dashboard):
- **Verify Eligibility** button → triggers Stedi 270/271 check
- Shows current coverage: plan name, type, member ID, coverage dates
- Last verified date
- Manual entry option for plans without EDI support

---

## 8. Export / API — Reporting Back to MA Plans

### Export Formats

We need to support **multiple output formats** because MA plans use different systems:

#### A. FHIR Da Vinci DEQM `$care-gaps` Response (Primary)

The [HL7 Da Vinci DEQM Implementation Guide](https://build.fhir.org/ig/HL7/davinci-deqm/gaps-in-care-reporting.html) defines the standard FHIR-based format for care gap reporting. This is the **recommended primary format**.

**Endpoint:** `GET /api/care-gaps/export/fhir?patientId=xxx&periodStart=2025-01-01&periodEnd=2025-12-31`

Returns a FHIR `Parameters` resource containing `Bundle` entries:
- `MeasureReport` resources (one per measure per patient)
- `DetectedIssue` resources for each gap (open or closed)
- `Patient`, `Organization`, `Practitioner` references
- Gap status: `open-gap` | `closed-gap`
- Evidence: linked `DocumentReference` to conversation transcript

This format is what modern health plan systems and HIEs expect.

#### B. CSV/Excel Export (Operational)

For plans that just need a spreadsheet to work with:

**Endpoint:** `GET /api/care-gaps/export/csv?patientId=xxx`

```csv
patient_name,patient_mbi,measure_id,measure_name,status,gap_open_date,gap_close_date,closure_method,closure_date_of_service,closure_provider,closure_location,confidence,conversation_id,reviewed_by,review_date
John Smith,1EG4-TE5-MK72,BCS-E,Breast Cancer Screening,closed_by_voice,2025-01-15,2025-04-02,voice_check_in,2025-03-15,Dr. Johnson,Memorial Hospital,high,conv-123,nurse.jones@clinic.com,2025-04-03
```

#### C. HEDIS Supplemental Data Format (For NCQA/CMS Submission)

For feeding data back into the plan's HEDIS reporting engine. Uses the plan's existing supplemental data intake format (varies by HEDIS vendor).

**Endpoint:** `GET /api/care-gaps/export/supplemental?format=generic`

Minimum fields per NCQA guidelines:
- Member ID
- Date of service
- Place of service (facility, office, telehealth)
- Procedure/service performed (CPT code if available)
- Provider type
- Evidence of provider accountability

Since NCQA doesn't mandate a specific file format, we output a structured JSON/CSV that maps to common HEDIS vendor intake formats (Cotiviti, Inovalon, Conduent, etc.).

#### D. 837P Encounter Data (Future — Phase 4)

For plans that want to submit supplemental encounter data to CMS in the ANSI X12 837P format. This is complex and likely requires partnership with a clearinghouse (could use Stedi for this too).

### API Endpoints Summary
```
GET  /api/care-gaps/export/fhir           — FHIR DEQM care-gaps bundle
GET  /api/care-gaps/export/csv            — CSV download
GET  /api/care-gaps/export/supplemental   — HEDIS supplemental data format
POST /api/care-gaps/export/bulk           — Async bulk export (NDJSON)
```

---

## 9. File Format Research Summary

### What MA Plans Need to Report to CMS

Medicare Advantage plans report quality data to CMS primarily through:

1. **HEDIS (via NCQA)** — Annual quality measure reporting
   - Submitted to NCQA's Interactive Data Submission System (IDSS)
   - Patient-Level Detail (PLD) files submitted by June 15 annually
   - NCQA does **not** mandate a specific file format for data exchange but encourages HL7/FHIR
   - Transitioning to Electronic Clinical Data Systems (ECDS) by 2030 — uses FHIR/CQL

2. **Encounter Data (via CMS EDS)** — Claims-level data
   - Uses ANSI X12 837 (5010) format — 837-I (institutional) and 837-P (professional)
   - Submitted through CMS Encounter Data Front-End System (EDFES)
   - Full transition from RAPS to EDS completed in 2022

3. **Star Ratings** — Calculated from HEDIS, CAHPS, HOS, and other data
   - Clinical HEDIS measures now ~50-65% of Star Rating score
   - Triple-weighted measures (medication adherence, blood pressure, HbA1c) are highest impact

### Our Approach

AdherePod sits in the **supplemental data gathering** layer. We:
- Collect patient-reported information via voice conversations
- Create structured records that can feed into the plan's existing HEDIS reporting pipeline
- Use FHIR DEQM as the primary interoperability format
- Provide CSV/JSON for plans that need simpler integration
- Do NOT directly submit to CMS (that's the plan's responsibility)

### Key Standard: Da Vinci DEQM

The [Da Vinci Data Exchange for Quality Measures (DEQM)](https://build.fhir.org/ig/HL7/davinci-deqm/gaps-in-care-reporting.html) IG is the emerging standard for gaps-in-care data exchange. It defines:
- `$care-gaps` operation for querying gaps
- `MeasureReport` resource for measure-level results
- `DetectedIssue` resource for individual gaps
- Support for bulk async export via FHIR Bulk Data (NDJSON)

This is what we should build toward as the primary API format.

---

## 10. Implementation Phases

### Phase 1 — Foundation (Database + Insurance + Basic Import)
- [ ] Add new database tables (`insuranceInfo`, `careGapDefinitions`, `careGaps`, `careGapInteractions`)
- [ ] Add new fields to `users` table (`medicareId`, `dateOfBirth`, `gender`)
- [ ] Run schema migration (`npx drizzle-kit push`)
- [ ] Seed `careGapDefinitions` with 15 common HEDIS measures
- [ ] Build Stedi eligibility verification API route (`/api/insurance/verify`)
- [ ] Build insurance info CRUD routes
- [ ] Build care gap CRUD API routes
- [ ] Add insurance section to provider dashboard (manual entry + verify button)

### Phase 2 — Provider Dashboard + Import
- [ ] Add "Care Gaps" tab to provider dashboard
- [ ] Build care gap card component with status badges
- [ ] Build summary bar (open/closed/pending counts)
- [ ] Build CSV import modal with preview
- [ ] Build manual care gap entry form
- [ ] Add insurance badge to patient sidebar card
- [ ] Add care gap count to patient sidebar card

### Phase 3 — Voice Agent Integration
- [ ] Add `list_care_gaps` voice tool
- [ ] Add `log_care_gap_response` voice tool
- [ ] Update voice agent system prompt with care gap check-in instructions
- [ ] Build care gap interaction API routes
- [ ] Add care gap context loading at conversation start
- [ ] Test conversational flow with different gap types
- [ ] Add "pending review" indicators to provider dashboard

### Phase 4 — Review Pipeline + Export
- [ ] Build provider review UI (confirm/reject buttons on interaction cards)
- [ ] Implement gap status transitions (open → closed_by_voice)
- [ ] Build FHIR DEQM export endpoint (`/api/care-gaps/export/fhir`)
- [ ] Build CSV export endpoint
- [ ] Build HEDIS supplemental data export endpoint
- [ ] Build bulk async export for large datasets
- [ ] Add export buttons to provider dashboard

### Phase 5 — Advanced (Future)
- [ ] API-based care gap import from health plan systems
- [ ] Auto-close logic with configurable confidence thresholds
- [ ] 837P encounter data export (via Stedi or other clearinghouse)
- [ ] Payer-to-payer data exchange (Da Vinci PDex)
- [ ] Analytics dashboard (closure rates, time-to-close, voice vs. manual)
- [ ] SMART on FHIR app for embedding in EHR systems

---

## 11. New Environment Variables

```
# Stedi (Insurance Eligibility)
STEDI_API_KEY=           # Production API key
STEDI_TEST_API_KEY=      # Test API key for mock responses
STEDI_NPI=               # Organization's NPI for eligibility requests
STEDI_ORG_NAME=          # Organization name for 270 requests

# Care Gaps
CARE_GAP_AUTO_CLOSE=false          # Enable auto-close for high-confidence responses
CARE_GAP_AUTO_CLOSE_DELAY_HOURS=48 # Hours to wait before auto-closing
```

---

## 12. Open Questions

1. **Who is the customer?** Are we selling to MA plans directly, or to provider groups / ACOs that contract with MA plans? This affects the import/export flow.

2. **HEDIS vendor integration**: Should we build direct integrations with major HEDIS software vendors (Cotiviti, Inovalon, Conduent) or keep the export generic?

3. **Patient consent**: Do we need explicit consent from the patient before asking about care gaps? HIPAA covers treatment/payment/operations, but this is plan-initiated outreach.

4. **Supplemental data audit trail**: NCQA requires "evidence of provider accountability" for supplemental data. Is a voice transcript + provider review sufficient, or do we need additional documentation?

5. **Care gap refresh frequency**: How often should we re-import gaps from the health plan? Monthly? Quarterly? Real-time API?

6. **Multi-plan patients**: Some patients have both MA and supplemental coverage. How do we handle gaps from different plans?

7. **NPI and Taxonomy**: For Stedi eligibility checks and 837 encounter data, we need a registered NPI. Whose NPI do we use — the provider's or the organization's?

8. **Billing codes**: When the voice agent gathers gap closure information, is there a billable service code (e.g., chronic care management 99490, or telephone E/M 99441-99443)?

---

## References

- [CMS 2026 Star Ratings Measures and Weights](https://www.cms.gov/files/document/2026-star-ratings-measures.pdf)
- [CMS 2026 Star Ratings Technical Notes](https://www.cms.gov/files/document/2026-star-ratings-technical-notes.pdf)
- [NCQA HEDIS Data Submission](https://www.ncqa.org/hedis/data-submission/)
- [NCQA HEDIS ECDS Reporting](https://www.ncqa.org/hedis/the-future-of-hedis/hedis-electronic-clinical-data-system-ecds-reporting/)
- [Da Vinci DEQM Gaps in Care Reporting](https://build.fhir.org/ig/HL7/davinci-deqm/gaps-in-care-reporting.html)
- [Da Vinci DEQM $care-gaps Operation](https://build.fhir.org/ig/HL7/davinci-deqm/OperationDefinition-care-gaps.html)
- [HAPI FHIR Care Gaps Documentation](https://hapifhir.io/hapi-fhir/docs/clinical_reasoning/caregaps.html)
- [Stedi Real-Time Eligibility Checks](https://www.stedi.com/docs/healthcare/send-eligibility-checks)
- [Stedi Eligibility Check JSON API](https://www.stedi.com/docs/api-reference/healthcare/post-healthcare-eligibility)
- [CMS Encounter Data Submission Guide](https://www.csscoperations.com/internet/csscw3_files.nsf/F/CSSCED_Submission_Processing_Guide_20201009.pdf/$FILE/ED_Submission_Processing_Guide_20201009.pdf)
- [KFF: Gaps in Medicare Advantage Data](https://www.kff.org/medicare/issue-brief/gaps-in-medicare-advantage-data-remain-despite-cms-actions-to-increase-transparency/)
