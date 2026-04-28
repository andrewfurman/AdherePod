# AdherePod: Ben Franklin Technology Partners Application Preparation

This document maps every key requirement and due diligence area from the Ben Franklin Technology Partners Healthcare Investment Group guide to AdherePod's current status and our plan to address each item. Items marked **In Place** are ready today. Items marked **Planned** need action before or during the application process.

## 1. LOCATION REQUIREMENT

**Status: Partially In Place**

Ben Franklin requires a significant presence in Bucks, Chester, Delaware, Montgomery, or Philadelphia Counties, and U.S. incorporation.

**What we have:**
- Andrew Furman (Head of Engineering) and Tyler Kaufman (Head of Partnerships) are both based in Harrisburg, PA
- All operations, engineering, and strategy work happen in Pennsylvania

**What we need to address:**
- Harrisburg is in Dauphin County, which is outside Ben Franklin's five county service area (Bucks, Chester, Delaware, Montgomery, Philadelphia). We need to establish a presence in one of those counties. Options include:
  - Register a co-working space or virtual office in Philadelphia (most practical)
  - Relocate the company's headquarters address to the Philadelphia metro area
  - If Gage Clifton or another team member is located in one of the five counties, formalize that as the company's primary office
- Incorporate AdherePod as a U.S. entity (Delaware C Corp or Pennsylvania LLC/Corp) if not already done. Confirm current incorporation status and get documentation in order.

**Plan for job creation narrative:**
- Emphasize that engineering, product, and partnership roles will be hired in the Southeastern PA region as we scale
- Outline a 12 month hiring plan: first hires would be a clinical operations lead and a second engineer, both based in the Philadelphia metro area
- Highlight that the hardware fulfillment and device configuration operation could be located in the region

## 2. MATCHING CAPITAL ($1:$1 MINIMUM)

**Status: Planned**

Ben Franklin requires at minimum $1 of outside capital for every $1 they invest. Higher ratios are preferred. Match can come from outside investment, grants, or in some cases revenue.

**What we have:**
- Active investor conversations (Gage Clifton's network, former pharma CEO connection)
- An investor deck is complete and ready for distribution

**What we need to address:**
- Determine our target raise amount. If requesting $150K from Ben Franklin, we need at least $150K in matching funds committed or closed
- Formalize conversations with angel investors and convert interest into signed commitments (SAFEs, convertible notes, or equity term sheets)
- Explore grant funding as supplemental match:
  - SBIR/STTR grants (NIH, NSF) for digital health and medication adherence technology
  - Pennsylvania Department of Community and Economic Development (DCED) programs
  - Federal Rural Health Transformation Program ($50B, 2026 to 2030) could support deployment grants
- Document all capital raised with proper legal instruments (no handshake deals, as Ben Franklin specifically flags this in due diligence)
- Revenue from paid pilots could also count toward match in some situations. Target closing at least one paid pilot before or during the application process.

## 3. STAGE OF COMMERCIALIZATION

**Status: In Place (Strong Position)**

Ben Franklin invests in digital health companies beyond the idea stage, looking for paid pilots and market traction.

**What we have:**
- A fully functional MVP deployed at adherepod.com with:
  - Voice native AI medication management (OpenAI Agents SDK with real time WebRTC)
  - Camera based prescription reading (Google Gemini vision)
  - Medication CRUD, reminders, drug interaction detection
  - Provider dashboard with multi patient views and clinical notes
  - Email reminder system (SendGrid with delivery tracking)
  - Full authentication with patient, provider, and admin roles
  - 30 automated end to end tests (Playwright)
- Hardware prototype plan finalized (Samsung Galaxy Tab A9 in kiosk mode, approximately $125 per unit)
- A working demo script (3 to 5 minute walkthrough with a realistic patient scenario)

**What we need to address:**
- Close at least one paid pilot before presenting to the External Review Committee. The Bill Kaufman / AKM conversation identified $5K per 90 day pilot engagements as the right entry point with independent TPAs and self funded employers.
- Document any letters of intent, pilot agreements, or verbal commitments from potential customers
- Prepare demo environment specifically for the 45 minute ERC presentation (live product demo with a real patient scenario, showing voice interaction, camera intake, provider dashboard, and adherence reporting)

## 4. BUDGET AND MILESTONES (ERC Requirement)

**Status: Planned**

Ben Franklin will provide an Excel template. Budget and milestones must match in total and cover up to 12 months. They suggest rounding to nearest $25K.

**Proposed 12 Month Budget and Milestones (Draft, to be refined):**

| Milestone | Timeline | Budget |
|-----------|----------|--------|
| Close 3 paid pilot partnerships (TPAs, self funded employers) | Months 1 to 3 | $75,000 |
| HIPAA compliance certification and SOC 2 Type 1 audit | Months 2 to 4 | $50,000 |
| Hardware pilot deployment (25 tablet devices configured and shipped) | Months 3 to 5 | $25,000 |
| Hire clinical operations lead (Philadelphia metro) | Months 3 to 4 | $50,000 |
| Pilot outcome data collection and ROI analysis | Months 4 to 8 | $25,000 |
| Product enhancements (smart pill dispenser integration, LTE provisioning) | Months 5 to 9 | $50,000 |
| Scale to 100 active users across pilot partners | Months 8 to 12 | $25,000 |
| **Total** | **12 Months** | **$300,000** |

This assumes a $300K total round ($150K Ben Franklin + $150K match). Adjust based on actual raise target.

## 5. DUE DILIGENCE PREPARATION

Ben Franklin's due diligence covers many areas. Here is our readiness for each:

### 5a. Technical Feasibility

**Status: In Place**

- Working MVP demonstrates core technology viability
- Voice AI powered by OpenAI's production API (proven infrastructure)
- Vision/camera powered by Google Gemini (production API)
- PostgreSQL database on Neon (serverless, scalable)
- Deployed on Vercel (enterprise grade hosting)
- Next steps are incremental (hardware deployment, integrations) not fundamental research

### 5b. Intellectual Property

**Status: Needs Work**

**What we have:**
- Proprietary codebase (voice agent architecture, tool integration system, camera intake pipeline)
- Defensible "hardware moat" strategy (device in the home creates switching costs and data advantage)
- Data moat (comprehensive, real time medication adherence data across all patient medications)

**What we need to address:**
- Consult a patent attorney to evaluate patentability of:
  - Voice native medication management system with real time AI agent
  - Camera based prescription and pill bottle reading for medication onboarding
  - Combined voice/vision/device adherence tracking platform
- File at least a provisional patent application before the Ben Franklin application
- Register the AdherePod trademark
- Document all IP ownership clearly (assignment agreements from all co founders)

### 5c. Competition

**Status: In Place**

We have a clear differentiation story:

| Competitor | What They Do | How We Differ |
|-----------|-------------|--------------|
| MedaCube, Hero, MedMinder | Smart pill dispensers | Hardware only, no AI intelligence, no voice interaction |
| Pill reminder apps | Smartphone notifications | Requires digital literacy; AdherePod is voice native, no screens to navigate |
| Care navigation firms | Human care coordinators | Expensive ($50+ PMPM), not scalable; AdherePod automates at $10 PMPM |
| PBM adherence programs | Carrier driven programs | Only track PBM managed drugs; AdherePod tracks all medications including OTC and samples |

**Key differentiators:**
- Voice first (solves literacy/digital divide barrier for 65+ population)
- AI native (not a timer or buzzer, but an intelligent agent that understands medications)
- Zero friction onboarding (pre configured device shipped to home, no setup required)
- Full medication picture (tracks everything, not just insured prescriptions)

### 5d. Business Plan Soundness

**Status: Partially In Place**

**What we have:**
- Clear go to market strategy (self funded employers and independent TPAs first, Medicare Advantage plans second)
- Defined pricing model ($10 PMPM target for enterprise, $5K per 90 day pilot for initial validation)
- Multiple revenue channels identified (subscription, device margin, data analytics)
- Strong market sizing ($528B annual cost of non adherence, $22B+ adherence market)

**What we need to address:**
- Build a formal financial model with:
  - 3 year revenue projections (conservative, base, optimistic)
  - Unit economics (CAC, LTV, device cost, gross margin per subscriber)
  - Burn rate and runway calculations
  - Break even analysis
- Write a concise formal business plan document (5 to 10 pages) covering market, product, GTM, financials, and team

### 5e. Management Team

**Status: In Place**

- **Gage Clifton** (Head of Product): Deep experience with the nation's largest health insurance companies, healthcare policy and strategy expertise
- **Andrew Furman** (Head of Engineering): AI/LLM engineer, former PwC consultant who built software for UnitedHealthcare, Aetna, and Blue Cross Blue Shield plans
- **Tyler Kaufman** (Head of Partnerships): Performance marketing and revenue growth leader in healthcare and tech, strategic partnership development

**What we need to address:**
- Formalize advisory board with healthcare industry veterans (the former pharma CEO connection and Bill Kaufman / AKM relationship are strong candidates)
- Prepare bios that emphasize healthcare domain expertise and relevant prior work
- Consider adding a clinical advisor (physician or pharmacist) to strengthen clinical credibility

### 5f. Corporate Structure and Legal Documentation

**Status: Needs Work**

**What we need to address:**
- Confirm or establish corporate entity (Delaware C Corp is standard for venture backed startups)
- Draft and execute co founder agreements with:
  - Equity split documentation
  - IP assignment clauses (all founders assign IP to the company)
  - Vesting schedules
  - Roles and responsibilities
- Establish a formal Board of Directors (or at minimum, document governance structure)
- Set up proper accounting (QuickBooks or similar) with a CPA
- Open a business bank account
- Ensure all prior investments are properly documented (no handshake deals)
- Draft standard employment/contractor agreements for future hires

### 5g. Accounting Practices

**Status: Needs Work**

- Set up formal bookkeeping from day one (even if expenses are minimal today)
- Engage a CPA familiar with startup accounting
- Track all expenses, capital contributions, and revenue through proper books
- Be prepared to produce quarterly unaudited financial statements (a Ben Franklin reporting requirement post funding)

### 5h. Debt, Subordination, and Accounts Payable

**Status: In Place (by default)**

- As a pre revenue startup with no prior debt, there are no subordination or AP issues
- Document this cleanly: no outstanding debt, no liens, no pending litigation
- If any angel investment is structured as convertible notes, be prepared to subordinate those to Ben Franklin's senior position (this is a standard Ben Franklin requirement)

## 6. DEAL TERMS READINESS

**Status: Informational (No Action Required Yet)**

Understanding what Ben Franklin will propose:

- **Instrument:** Convertible note with detachable warrant (typical for their investments)
- **Interest:** 8% simple, non compounding. Payments are the lesser of 3% of revenue or interest due (cash conserving)
- **Conversion discount:** Typically 20% off next qualified financing round price
- **Valuation cap:** May be included
- **Warrant:** 25% coverage (cancellable if note has conversion discount, no double dip)
- **Closing fee:** 1%
- **Maturity:** 5 years (balloon payment, but exits/conversions usually happen before)
- **Board observation:** Non voting seat for lifetime of loan
- **Negative pledge:** Ben Franklin consent required for IP transfer or technology liens
- **No personal guarantees required**

**What to consider:**
- These terms are founder friendly (no personal guarantee, cash conserving interest, long maturity)
- The negative pledge and board observation seat are standard. Factor these into any future financing discussions.
- Ensure any co investors' notes can be subordinated to Ben Franklin (they require seniority)

## 7. POST FUNDING REPORTING REQUIREMENTS

**Status: Planned**

If funded, Ben Franklin requires:
- Quarterly unaudited financial statements (within 30 to 45 days of quarter end)
- Quarterly product, fundraising, team, and IP updates
- Board materials and minutes
- Annual Economic Impact Survey for 5 years

**Plan:**
- Set up quarterly reporting cadence from the start (even before funding, this is good practice)
- Use board observation meetings to also fulfill the update requirement
- Track job creation metrics (Ben Franklin cares deeply about regional job growth)

## 8. TIMELINE AND NEXT STEPS

Ben Franklin board approvals occur in **March, June, September, and December**. The full process takes up to 4 months.

### Recommended Action Plan:

**Immediate (Next 2 Weeks):**
1. Confirm or establish corporate entity and incorporation
2. Execute co founder agreements with IP assignment
3. Consult patent attorney; file provisional patent application
4. Register AdherePod trademark
5. Determine if we have or can establish a presence in one of the five qualifying counties

**Short Term (Weeks 3 to 6):**
6. Close at least one paid pilot ($5K, 90 day engagement)
7. Build formal financial model (3 year projections, unit economics)
8. Secure at least one matching capital commitment (angel investor, grant, or revenue)
9. Set up formal accounting and business bank account
10. Submit Ben Franklin application via website

**Application Phase (Weeks 6 to 12):**
11. Complete Budget and Milestones Excel template when provided
12. Prepare 45 minute ERC presentation with live product demo
13. Brief all team members on Ben Franklin process and due diligence expectations
14. Compile corporate documents package (incorporation, agreements, cap table, financial statements)

**Target:** Submit application in time for the **September 2026 board cycle**, with the June cycle as a stretch goal if pilots close quickly.

## 9. KEY RISKS AND MITIGATION

| Risk | Mitigation |
|------|-----------|
| Harrisburg is outside the 5 county service area | Establish Philadelphia co working space or virtual office; plan to hire first employees in Philadelphia metro |
| No matching capital committed yet | Parallel track angel fundraising and grant applications; pilot revenue can supplement match |
| No patents filed | File provisional patent ASAP (12 month window to convert to full application) |
| No formal corporate entity | Engage startup attorney to incorporate and draft founder agreements within 2 weeks |
| No paid customers yet | Prioritize closing AKM/Bill Kaufman pilot lead; target 1 to 3 pilots before ERC presentation |
| No formal financials | Engage CPA, set up QuickBooks, begin tracking all expenses retroactively |

## 10. BEN FRANKLIN ALIGNMENT SUMMARY

| Ben Franklin Criteria | AdherePod Fit | Readiness |
|----------------------|---------------|-----------|
| Digital health company | Yes, voice native AI medication adherence platform | Strong |
| Unmet medical need | Yes, $528B annual cost of non adherence, 50% of chronic patients non adherent | Strong |
| Beyond idea stage | Yes, fully functional MVP deployed at adherepod.com | Strong |
| Paid pilots / traction | In progress, active pilot conversations with AKM and independent TPAs | Moderate |
| SE Pennsylvania presence | Needs attention, team is in Harrisburg (Dauphin County) | Needs Work |
| U.S. incorporation | Needs confirmation/action | Needs Work |
| $1:$1 matching capital | Not yet committed, but investor conversations active | Moderate |
| Job creation potential | Strong narrative, plan to hire in Philadelphia metro | Strong |
| Defensible technology | Proprietary AI platform, hardware moat strategy, patent filing needed | Moderate |
| Management team | Three co founders with healthcare, engineering, and partnerships expertise | Strong |
