# AdherePod
Medication adherence app for elderly and low-literacy users. Voice-native, device-based.
## Tech Stack
Next.js 16 (App Router) with React 19, NextAuth v5 (credentials, JWT), PostgreSQL via Neon + Drizzle ORM, Radix UI + Tailwind CSS 4 + Lucide icons, SendGrid email, Vercel Cron (every 15 min), OpenAI Agents SDK (`@openai/agents` with `RealtimeAgent`/`RealtimeSession`, model `gpt-4o-mini-realtime-preview`), Google Gemini Imagen 4.0 (hero image), Zod validation, hosted on Vercel.
## Project Structure
The Next.js app lives in `app/`. All commands should be run from that directory.
```
app/
  src/
    app/              # Pages and API routes
      (auth)/         # Auth pages (sign-in, sign-up, forgot/reset password)
      api/
        auth/         # NextAuth endpoints
        medications/  # CRUD (GET, POST, PUT, DELETE) + reminder fields
        user/settings/ # User settings GET/PUT (timezone, daily summary prefs)
        cron/send-reminders/  # Vercel Cron — per-medication email reminders
        cron/daily-summary/   # Vercel Cron — daily medication summary emails
        sign-up/      # User registration
        forgot-password/ & reset-password/
        users/        # Admin-only user list (GET) + role/providerType (PUT) + set-password (POST)
        emails/       # Email history API (GET, optional ?id= or ?patientId=)
        webhooks/sendgrid/   # SendGrid Event Webhook handler (POST)
        voice/session/       # Generates ephemeral OpenAI realtime API keys
        voice/conversations/ # GET (list/detail, ?patientId=) and POST (create)
        voice/conversations/messages/ # POST (save) and PATCH (end conversation)
        provider/patients/   # Provider-patient assignment CRUD (GET/POST/DELETE)
        provider/patients/[patientId]/notes/ # Clinical notes per medication (GET/POST/DELETE)
      my-medications/        # Patient dashboard — meds list + voice chat
      provider-dashboard/    # Provider dashboard — patient list + meds/conversations
    components/
      ui/             # Radix-based UI (button, card, input, badge, label)
      medication-card.tsx, conversation-history.tsx, clinical-notes.tsx
      provider-patient-card.tsx, voice-chat.tsx
    lib/
      auth.ts         # NextAuth config with DrizzleAdapter
      db/index.ts     # Neon/Drizzle connection
      db/schema.ts    # Schema (users, accounts, sessions, medications, conversations, conversationMessages, emailSends, emailEvents)
      voice/tools.ts  # Voice tools (listMedications, addMedication, editMedication, deleteMedication, toggleReminder, setReminderTimes, checkCamera)
      tokens.ts       # Token generation/hashing
      email.ts        # SendGrid integration (logs to emailSends)
  public/             # hero-image.png, gage-clifton.jpg, andrew-furman.jpg
  tests/              # Playwright e2e tests
  drizzle.config.ts, playwright.config.ts
  scripts/
    login.ts          # Browser login automation (Playwright) — see CLI Commands below
```
## Development Workflow
After implementing a new feature, start dev server and open browser to verify: `cd app && npm run dev & open http://localhost:3000`
## Common Commands
```bash
cd app
npm run dev                                           # Dev server (localhost:3000)
npm run build                                         # Production build
npx drizzle-kit push                                  # Push schema to Neon DB
TEST_BASE_URL=https://adherepod.com npx playwright test  # Tests against production
cd .. && vercel --prod                                # Deploy (from repo root)
```
## CLI Commands (Developer Tools)
Located in `app/scripts/`. Run from `app/` via npm scripts.
### Login Script
Opens a real browser window logged into AdherePod — useful for demos and manual testing.
```bash
cd app
npm run login                    # admin on localhost:3000
npm run login:doctor             # doctor on localhost:3000 → provider-dashboard
npm run login:admin              # admin on localhost:3000 → my-medications
npm run login:prod               # admin on adherepod.com
npm run login:doctor:prod        # doctor on adherepod.com

# With extra options:
npm run login -- -u doctor -e prod -p admin
npm run login -- --email user@example.com --password yourpassword
npm run login -- --url https://preview-xyz.vercel.app -u admin
```
**Options:** `--user/-u` (admin|doctor|patient), `--env/-e` (local|prod|preview URL), `--page/-p` (meds|provider|admin|home), `--port`, `--email`, `--password`

**Env vars used:** `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` (admin), `TEST_DOCTOR_EMAIL`/`TEST_DOCTOR_PASSWORD` (doctor), `TEST_PATIENT_EMAIL`/`TEST_PATIENT_PASSWORD` (patient, optional)
## Database
Schema: `app/src/lib/db/schema.ts`. After modifying, run `npx drizzle-kit push` from `app/`. `DATABASE_URL` must be set in `.env.local`.
### Tables
- **users** — NextAuth accounts + role [patient/provider/admin], providerType [nurse/doctor/care_team_member], timezone, dailySummary fields
- **accounts**, **sessions**, **verificationTokens** — NextAuth internals
- **medications** — name, timesPerDay, timingDescription, startDate, endDate, notes, reminderEnabled, reminderTimes, lastReminderSentAt
- **providerPatients** — Many-to-many (providerId, patientId, assignedBy). UNIQUE on (providerId, patientId)
- **clinicalNotes** — Provider notes on medications (medicationId, authorId, content)
- **conversations** / **conversationMessages** — Voice chat records (userId, status, role, content, toolName, toolArgs)
- **emailSends** / **emailEvents** — Email logging + SendGrid webhook events
## Voice Chat Architecture
OpenAI Agents SDK with WebRTC: Client gets ephemeral key via `/api/voice/session`, creates `RealtimeSession` with `RealtimeAgent` + medication tools, transcript captured via `transport_event`/`agent_end`, messages saved to DB, meds auto-refresh on `agent_tool_end`.
## Email Reminders
SendGrid + Vercel Cron. Per-medication reminders (toggle on/off, customizable HH:mm times, cron checks every 15 min). Daily summary (per-user timezone/time/enable). Cron endpoints: `/api/cron/send-reminders` and `/api/cron/daily-summary` (authenticated via `CRON_SECRET` Bearer). Voice-controllable ("remind me to take X at 8am"). Bell icon toggle on med cards, Settings tab for preferences. Config in `app/vercel.json`.
## Testing
Playwright at `app/playwright.config.ts`. Default: `localhost:3001`. Production: `TEST_BASE_URL=https://adherepod.com npx playwright test`.
### Current Tests (39)
Auth flow (7), Public pages (5), Camera & Voice (5), View as User (3), Provider & Patient (7), Provider API (3).
## Auth
Credentials-based (email/password) via NextAuth v5. Middleware (`src/middleware.ts`) protects routes. Session user ID via `auth()` in API routes.
- **Roles:** `patient` (default, /my-medications), `provider` (nurse/doctor/care_team_member, /provider-dashboard, can manage assigned patients' meds + clinical notes), `admin` (full access, impersonation, user management, password setting)
- **Provider-Patient:** Many-to-many via `providerPatients`. Both admins and providers can establish links.
- **Authorization:** `src/lib/authorization.ts` — `canAccessPatientData(callerId, patientId)` checks patient/admin/assigned-provider.
- **Admin seeded:** `aifurman@gmail.com`
## Email History & SendGrid Webhooks
All emails logged to `emailSends` (full HTML body + SendGrid message ID). Webhooks POST to `/api/webhooks/sendgrid` (delivered, open, click, bounce etc.), stored in `emailEvents`, deduped on `sgEventId`. `/api/emails` returns history (admin: all users, regular: own only, `?id=xxx` for detail). History tab: unified timeline of voice + emails, click to view HTML + delivery status. SendGrid webhook URL: `https://adherepod.com/api/webhooks/sendgrid`, verification key: `SENDGRID_WEBHOOK_KEY` env var.
## Homepage
Sticky nav, hero with Loom demo, voice-first callout, features grid (6), How It Works (3 steps), Who It's For (6 cards), team bios, CTA, footer.
## Environment Variables
Set in `.env.local` (local) and Vercel project settings (production): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`, `OPENAI_API_KEY`, `CRON_SECRET`, `SENDGRID_WEBHOOK_KEY`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`.
## Git Safety
Before every commit, check that no sensitive files (.env, .env.local, credentials, API keys, passwords) are being staged. Never commit secrets. Files with credentials must be in .gitignore.
## Deployment
Vercel project: `andrew-furmans-projects/adherepod`, root dir `app/`. Pushing to `main` auto-deploys to **AdherePod.com**. Single environment (production only). Manual: `cd /path/to/AdherePod && vercel --prod`.
## Email Preferences
Emails via Himalaya: "Hi" greeting, plaintext (no bold/italic), no em dashes, clickable hyperlinks. Use multipart (text/plain + text/html).
## Maintaining This File
**This is a living document.** Keep it up to date as the app evolves. Update when changing: tables/schema, API routes/pages, dependencies, commands/workflows, test patterns, architecture decisions, CLI tools, or environment variables. Every developer should update this file when they make changes that affect project structure, conventions, or setup.
