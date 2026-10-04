# AdherePod Demo Script

A structured walkthrough of every major feature in AdherePod, organized as a demo script. Use this to plan video recordings, live demos, or investor walkthroughs.

---

## Demo Overview

**Core pitch (30 seconds):**
"AdherePod is a voice-native medication adherence app built for elderly and low-literacy users. At its core, patients maintain a medication list and talk to an AI voice assistant to manage it -- no typing, no confusing menus. Behind the scenes, there's a provider backend where care team members monitor their patients, and an automated email reminder system that keeps patients on track."

**Three pillars to showcase:**
1. Patient experience (voice-first medication management)
2. Provider backend (care team visibility and clinical notes)
3. Automated engagement (email reminders and delivery tracking)

---

## Act 1: The Patient Experience

### Scene 1.1: Homepage and Sign-Up

**What to show:**
- Landing page with sticky nav, hero section, embedded Loom video
- Voice-first callout section with example commands
- Features grid (6 cards): Voice-Native Interface, Device Integration, Medication Management, Interaction Alerts, Adherence Tracking, Provider Platform
- "How It Works" 3-step flow: Talk -> Discuss -> Get Notified
- "Who It's For" cards: Elderly Patients, Caregivers, Providers, Payers, Low-Literacy Users, Chronic Care Programs
- Team section
- Click "Sign Up" -> show the clean sign-up form (name, email, password)

**Key talking points:**
- Designed for accessibility: large text, simple flows, voice-first
- No app store download needed -- runs in any browser
- Works on phones, tablets, and desktop

**Route:** `/` (homepage) -> `/auth/sign-up`

---

### Scene 1.2: Patient Dashboard -- Medications Tab

**What to show:**
- Two-column layout: medication list on left, voice chat on right
- Add a medication manually using the form:
  - Name: "Lisinopril 10mg"
  - Times per day: 2
  - Timing: "morning and evening with food"
  - Start date, optional end date, notes
- Show the medication card after creation:
  - Name, frequency badge, timing with clock icon, start date with calendar icon
  - Edit and delete buttons
- Enable email reminders:
  - Toggle the bell icon on the medication card
  - Show reminder times auto-populated (2x/day -> 08:00 and 20:00)
  - Customize a time to demonstrate flexibility

**Key talking points:**
- Simple card-based UI -- each medication is one card with clear information
- Reminders are per-medication and fully customizable
- Auto-populated times based on frequency reduce setup friction

**Route:** `/my-medications` (Medications tab)

---

### Scene 1.3: Voice Chat -- The Core Feature

**What to show:**
- Click the phone icon to start a voice conversation
- Demonstrate these voice commands live:
  1. **"What medications am I taking?"** -- AI lists current meds
  2. **"Add Metformin 500mg, twice a day, with breakfast and dinner"** -- AI adds med, card appears in real-time on left
  3. **"Set a reminder for Metformin at 7:30 AM and 6:30 PM"** -- AI toggles reminder and sets times
  4. **"Change Lisinopril to once a day"** -- AI edits existing med
  5. **"Delete Lisinopril"** -- AI removes med after confirmation
- Show the real-time transcript appearing as you speak
- Show medication list auto-refreshing after each voice tool action
- Optionally demonstrate camera: point at a pill bottle, AI reads the label

**Key talking points:**
- No typing required -- everything done by voice
- Real-time: medication list updates instantly as voice commands execute
- 7 built-in voice tools: list, add, edit, delete, toggle reminder, set times, check camera
- WebRTC connection via OpenAI's Realtime API for low-latency conversation
- Designed for users who struggle with small buttons and text input

**Route:** `/my-medications` (Medications tab, voice chat panel)

---

### Scene 1.4: History Tab

**What to show:**
- Switch to the "History" tab (Message Circle icon)
- Show the unified timeline mixing:
  - Voice conversations (with auto-generated titles, duration, timestamps)
  - Sent emails (reminders and daily summaries)
- Expand a voice conversation:
  - Full transcript showing user and assistant messages
  - Tool calls visible (e.g., "addMedication called with {...}")
  - Any captured images from camera usage
- Expand an email:
  - Full HTML email body rendered inline
  - Delivery event timeline: sent -> delivered -> opened
  - SendGrid tracking data (timestamps, IP addresses)
- Delete an old conversation or email

**Key talking points:**
- Complete audit trail of every interaction
- Patients can review what they discussed with the AI
- Email delivery status visible -- know if a reminder was actually delivered and opened
- Providers can also view this history for their assigned patients

**Route:** `/my-medications` (History tab)

---

### Scene 1.5: Settings Tab

**What to show:**
- Switch to the "Settings" tab
- Reminder settings card:
  - Timezone dropdown (ET, CT, MT, PT, AKT, HT)
  - Daily summary email toggle
  - Summary time picker (appears when toggle is on)
- Password change card:
  - Current password, new password, confirm
- Demonstrate changing timezone and summary time

**Key talking points:**
- Timezone-aware: reminders arrive at the right local time
- Daily summary gives a single morning email listing all meds for the day
- Cron jobs run every 15 minutes and respect user timezone settings

**Route:** `/my-medications` (Settings tab)

---

## Act 2: The Provider Backend

### Scene 2.1: Provider Dashboard -- Patient List

**What to show:**
- Log in as a provider (nurse, doctor, or care team member)
- Show the three-panel layout:
  - Left sidebar: patient list with search and "Add Patient" button
  - Main area: patient detail view
  - Mobile: patient list becomes horizontal scrollable chips
- Search for a patient by name or email
- Click "Add Patient" to open the assignment dialog:
  - Search for patients
  - Show "Add" button for unassigned patients
  - Show "Already added" badge for assigned patients
- Select a patient from the list to load their details

**Key talking points:**
- Providers only see patients assigned to them (enforced by authorization)
- Many-to-many: one provider can have many patients, one patient can have multiple providers
- Assignments tracked with audit trail (who assigned, when)
- Both admins and providers can establish provider-patient links

**Route:** `/provider-dashboard`

---

### Scene 2.2: Viewing a Patient's Medications

**What to show:**
- With a patient selected, show their medications tab:
  - Full medication list with same card UI as patient view
  - Providers can add, edit, and delete medications for their patients
- Clinical Notes feature:
  - Expand a medication to see clinical notes section
  - Show existing notes (author name, date, content)
  - Add a new clinical note (e.g., "Monitor blood pressure weekly, patient reports dizziness")
  - Delete a note

**Key talking points:**
- Providers have full medication management for assigned patients
- Clinical notes are per-medication, not per-patient -- granular annotation
- Notes visible to the patient and all assigned providers
- Audit trail: every note shows who wrote it and when

**Route:** `/provider-dashboard` (Medications tab for selected patient)

---

### Scene 2.3: Viewing a Patient's Conversations

**What to show:**
- Switch to the "Conversations" tab for the selected patient
- Show list of patient's voice conversations
- Expand a conversation to see:
  - Full transcript
  - What voice tools the patient used
  - Captured images (if camera was used)
  - Duration and timestamps

**Key talking points:**
- Providers can review what patients discussed with the AI assistant
- See exactly what medication changes were made via voice
- Helps providers understand patient behavior and adherence patterns
- Read-only: providers observe but can't modify conversation records

**Route:** `/provider-dashboard` (Conversations tab for selected patient)

---

## Act 3: Email Reminders and Automation

### Scene 3.1: Per-Medication Reminders

**What to show:**
- Return to patient view or show from provider's perspective
- Show a medication with reminders enabled:
  - Bell icon toggled on (orange/active state)
  - Reminder times displayed (e.g., "08:00, 14:00, 20:00" for 3x daily)
- Explain the cron system:
  - Vercel Cron runs every 15 minutes
  - Checks each medication's reminder times against current time in user's timezone
  - Sends email if within the 15-minute window and not already sent
- Show a received reminder email (from email inbox or History tab):
  - Clean plaintext-style email
  - "Hi [name], it's time to take [medication]"
  - Includes medication details and timing

**Key talking points:**
- Reminders are per-medication, not per-user -- different meds can have different times
- Timezone-aware: a patient in Pacific time gets reminders at their local 8am, not Eastern
- Deduplication: won't send the same reminder twice (tracks `lastReminderSentAt`)
- Controllable by voice: "Hey, remind me to take Metformin at 8am"

**Route:** `/my-medications` (Medications tab, bell icon on any med card)

---

### Scene 3.2: Daily Summary Email

**What to show:**
- Go to Settings tab and show daily summary preferences:
  - Toggle enabled
  - Time set to 08:00
  - Timezone set correctly
- Show a received daily summary email:
  - Lists all active medications for the day
  - Includes times per day and timing descriptions
  - Sent once per day at the configured time

**Key talking points:**
- One email each morning summarizing all meds -- simple reference card
- Configurable time and timezone
- Can be disabled if patient only wants per-medication reminders
- Separate cron job from per-medication reminders

**Route:** `/my-medications` (Settings tab)

---

### Scene 3.3: Email Delivery Tracking

**What to show:**
- Go to History tab
- Click on a sent email to expand it
- Show the delivery event timeline:
  - "sent" event with timestamp
  - "delivered" event (email reached mailbox)
  - "open" event (patient opened the email)
  - Optionally "click" event if email contained links
- Show that bounced or failed emails are also tracked

**Key talking points:**
- Full delivery lifecycle tracked via SendGrid webhooks
- Know definitively whether a reminder was delivered and read
- Valuable for providers monitoring whether patients are engaged
- All events stored in `emailEvents` table with deduplication

**Route:** `/my-medications` (History tab, expanded email)

---

## Act 4: Admin Capabilities

### Scene 4.1: User Management

**What to show:**
- Log in as admin
- Go to the "Users" tab on the patient dashboard
- Show the users table:
  - All users listed with name, email, role, provider type, created date, last login
  - Inline editing of name and email
  - Role dropdown (patient/provider/admin)
  - Provider type dropdown (appears when role=provider)
- Demonstrate changing a user's role from patient to provider
- Show the "Set Password" modal (Key icon):
  - Admin can directly set a user's password
- Show the "Send Reset Email" action (Mail icon)

**Key talking points:**
- Centralized user management for the admin
- Can onboard providers by changing role and setting provider type
- Can set passwords directly for initial setup or support scenarios
- All role changes take effect immediately

**Route:** `/my-medications` (Users tab, admin only)

---

### Scene 4.2: Admin Impersonation ("View As")

**What to show:**
- From the Users tab, click the Eye icon on a patient
- Show the amber impersonation banner: "Viewing as: [patient name] (read-only)"
- Navigate through the patient's view:
  - See their medications exactly as they see them
  - See their history tab
  - See their settings
- Note the read-only state -- no edits possible while impersonating
- Click "Exit" on the banner to return to admin view

**Key talking points:**
- Admins can see exactly what any user sees
- Useful for debugging issues, support tickets, onboarding help
- Read-only to prevent accidental changes while impersonating
- URL-based (`?viewAs=userId`) for easy sharing/bookmarking

**Route:** `/my-medications?viewAs=[userId]`

---

## Suggested Demo Flow (5-7 minute version)

| Time | Section | What to Cover |
|------|---------|---------------|
| 0:00 | Opening | "This is AdherePod. Voice-native medication adherence for elderly and low-literacy users." |
| 0:15 | Homepage | Quick scroll through landing page, point out key sections |
| 0:45 | Sign up | Quick sign-up flow |
| 1:00 | Add medication | Add one medication manually to show the form |
| 1:30 | Voice chat | The hero moment: add a medication by voice, set a reminder by voice, list meds by voice |
| 3:00 | Reminders | Show bell icon toggle, reminder times, explain cron system |
| 3:30 | History | Show conversation + email timeline, expand one of each |
| 4:00 | Provider login | Switch to provider account, show patient list |
| 4:30 | Patient view | View patient's meds, add a clinical note |
| 5:00 | Conversations | Show patient's voice history from provider view |
| 5:30 | Admin | Quick tour of user management and impersonation |
| 6:00 | Email tracking | Show delivery events for a sent reminder |
| 6:30 | Close | "Medication management through conversation, not complexity." |

---

## Suggested Demo Flow (2-3 minute version)

| Time | Section | What to Cover |
|------|---------|---------------|
| 0:00 | Opening | "AdherePod: medication adherence through voice, not screens." |
| 0:10 | Homepage | 5-second scroll of landing page |
| 0:15 | Dashboard | Show medication list with a few meds already populated |
| 0:30 | Voice chat | Live voice demo: add a med, set a reminder (the hero moment) |
| 1:30 | Reminders | Show reminder configuration, mention email system |
| 1:45 | History | Quick look at conversation + email timeline |
| 2:00 | Provider | Switch to provider view, show patient's meds + clinical note |
| 2:30 | Close | "Voice-first. Provider-connected. Reminder-driven." |

---

## Screen Inventory

Every screen and tab referenced in this demo:

| Screen | Route | Roles | Description |
|--------|-------|-------|-------------|
| Homepage | `/` | Public | Landing page with features, how it works, team |
| Sign In | `/auth/sign-in` | Public | Email/password login |
| Sign Up | `/auth/sign-up` | Public | Account creation |
| Forgot Password | `/auth/forgot-password` | Public | Request password reset email |
| Reset Password | `/auth/reset-password` | Public | Set new password via token |
| My Medications | `/my-medications` | Patient, Admin | Meds list + voice chat (Medications tab) |
| History | `/my-medications` | Patient, Admin | Conversation + email timeline (History tab) |
| Settings | `/my-medications` | Patient, Admin | Timezone, daily summary, password (Settings tab) |
| Users | `/my-medications` | Admin only | All users table with management (Users tab) |
| Impersonation | `/my-medications?viewAs=X` | Admin only | View as another user (read-only) |
| Provider Dashboard | `/provider-dashboard` | Provider, Admin | Patient list + detail view |
| Patient Medications | `/provider-dashboard` | Provider, Admin | Selected patient's meds + clinical notes |
| Patient Conversations | `/provider-dashboard` | Provider, Admin | Selected patient's voice history |

---

## Feature Checklist for Demo

Use this to verify you've covered each feature:

- [ ] Homepage walkthrough
- [ ] User sign-up flow
- [ ] Manual medication creation (form)
- [ ] Voice-based medication creation
- [ ] Voice-based medication editing
- [ ] Voice-based medication deletion
- [ ] Voice-based reminder setup
- [ ] Medication list with card UI
- [ ] Bell icon reminder toggle
- [ ] Customizable reminder times
- [ ] Daily summary email settings
- [ ] Timezone configuration
- [ ] History tab -- conversation timeline
- [ ] History tab -- email timeline
- [ ] Expand conversation to see transcript
- [ ] Expand email to see HTML + delivery events
- [ ] Provider dashboard patient list
- [ ] Provider search and add patient
- [ ] Provider view patient medications
- [ ] Provider add clinical note
- [ ] Provider view patient conversations
- [ ] Admin user management table
- [ ] Admin role/provider type changes
- [ ] Admin set password / send reset
- [ ] Admin impersonation (View As)
- [ ] Camera integration (optional)
- [ ] Password change flow
- [ ] Forgot/reset password flow
