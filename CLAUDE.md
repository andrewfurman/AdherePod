# AdherePod

Medication adherence app for elderly and low-literacy users. Voice-native, device-based.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Auth:** NextAuth v5 (beta) with credentials provider, JWT sessions
- **Database:** PostgreSQL via Neon (serverless), Drizzle ORM
- **UI:** Radix UI, Tailwind CSS 4, Lucide icons
- **Email:** SendGrid (password reset flows, medication reminders, daily summaries)
- **Cron:** Vercel Cron Jobs (every 15 min — medication reminders + daily summary)
- **Voice:** OpenAI Agents SDK (`@openai/agents`) with `RealtimeAgent` / `RealtimeSession`, model `gpt-4o-mini-realtime-preview`
- **Image Generation:** Google Gemini Imagen 4.0 API (hero image)
- **Hosting:** Vercel (deploy via `vercel --prod` from repo root)
- **Validation:** Zod (voice tool parameter schemas)

## Project Structure

The Next.js app lives in `app/`. All commands should be run from that directory.

```
app/
  src/
    app/              # Pages and API routes
      (auth)/         # Auth pages (sign-in, sign-up, forgot/reset password)
      api/
        auth/         # NextAuth endpoints
        medications/  # CRUD for medications (GET, POST, PUT, DELETE) + reminder fields
        user/
          settings/   # User settings GET/PUT (timezone, daily summary prefs)
        cron/
          send-reminders/  # Vercel Cron — sends per-medication email reminders
          daily-summary/   # Vercel Cron — sends daily medication summary emails
        sign-up/      # User registration
        forgot-password/
        reset-password/
        users/        # Admin-only user list (GET) + role/providerType management (PUT) + set-password (POST)
        emails/       # Email history API (GET with optional ?id= or ?patientId=)
        webhooks/
          sendgrid/   # SendGrid Event Webhook handler (POST)
        voice/
          session/          # Generates ephemeral OpenAI realtime API keys
          conversations/    # GET (list/detail, supports ?patientId=) and POST (create) conversations
            messages/       # POST (save message) and PATCH (end conversation)
        provider/
          patients/         # Provider-patient assignment CRUD (GET/POST/DELETE)
            [patientId]/
              notes/        # Clinical notes per medication (GET/POST/DELETE)
      my-medications/ # Patient dashboard — medications list + voice chat side by side
      provider-dashboard/  # Provider dashboard — patient list + medications/conversations
    components/
      ui/             # Radix-based UI components (button, card, input, badge, label)
      medication-card.tsx  # Medication card with reminder toggle UI
      conversation-history.tsx  # Unified history timeline (voice conversations + emails, supports patientId prop)
      clinical-notes.tsx  # Clinical notes list + add form per medication
      provider-patient-card.tsx  # Compact patient card for provider sidebar
      voice-chat.tsx  # Voice chat component with RealtimeAgent, transcript display
    lib/
      auth.ts         # NextAuth config with DrizzleAdapter
      db/
        index.ts      # Neon/Drizzle database connection
        schema.ts     # Database schema (users, accounts, sessions, medications, conversations, conversationMessages, emailSends, emailEvents)
      voice/
        tools.ts      # Voice agent tools (listMedications, addMedication, editMedication, deleteMedication, toggleReminder, setReminderTimes, checkCamera)
      tokens.ts       # Token generation/hashing utils
      email.ts        # SendGrid email integration (logs sends to emailSends table)
  public/
    hero-image.png    # Homepage hero image (generated via Imagen 4.0)
    gage-clifton.jpg  # Team photo
    andrew-furman.jpg # Team photo
  tests/              # Playwright e2e tests
  drizzle.config.ts   # Drizzle Kit config
  playwright.config.ts # Supports TEST_BASE_URL env var for production testing
```

## Development Workflow

After implementing a new feature, always start the dev server and open it in the browser so we can visually verify the changes:

```bash
cd app
npm run dev &
open http://localhost:3000
```

## Common Commands

```bash
cd app
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npx drizzle-kit push     # Push schema changes to Neon DB
npx playwright test      # Run e2e tests (needs dev server on port 3001)

# Run tests against production
TEST_BASE_URL=https://adherepod.com npx playwright test

# Deploy to Vercel (run from repo root, not app/)
cd .. && vercel --prod
```

## Database

Schema is in `app/src/lib/db/schema.ts`. After modifying, run `npx drizzle-kit push` from `app/` to sync with Neon. Env var `DATABASE_URL` must be set (in `.env.local`).

### Tables

- **users** — NextAuth user accounts (+ role [patient/provider/admin], providerType [nurse/doctor/care_team_member], timezone, dailySummaryEnabled, dailySummaryTime, lastDailySummarySentAt)
- **accounts**, **sessions**, **verificationTokens** — NextAuth internals
- **medications** — User medications (name, timesPerDay, timingDescription, startDate, endDate, notes, reminderEnabled, reminderTimes, lastReminderSentAt)
- **providerPatients** — Many-to-many junction table (providerId, patientId, assignedBy, createdAt). UNIQUE on (providerId, patientId)
- **clinicalNotes** — Provider notes on medications (medicationId, authorId, content, createdAt, updatedAt)
- **conversations** — Voice chat conversation records (userId, status, startedAt, endedAt)
- **conversationMessages** — Individual messages in a conversation (role, content, toolName, toolArgs)
- **emailSends** — Logged email sends (userId, recipientEmail, messageType, subject, htmlBody, sgMessageId, sentAt)
- **emailEvents** — SendGrid webhook events (emailSendId, sgEventId, event, timestamp, metadata)

## Voice Chat Architecture

The voice assistant uses OpenAI's Agents SDK with WebRTC:

1. **Client** calls `/api/voice/session` to get an ephemeral OpenAI API key
2. **Client** creates a `RealtimeSession` with a `RealtimeAgent` configured with medication tools
3. **Agent** can call tools (`list_medications`, `add_medication`, `edit_medication`, `delete_medication`, `toggle_reminder`, `set_reminder_times`, `check_camera`) which hit `/api/medications`
4. **Transcript** events are captured via `transport_event` (user speech) and `agent_end` (agent response)
5. **Messages** are saved to the database via `/api/voice/conversations/messages`
6. **Medications list** auto-refreshes via `agent_tool_end` callback

## Email Reminders

Per-medication email reminders and daily summary emails powered by SendGrid + Vercel Cron:

- **Per-medication reminders:** Toggle on/off per medication with customizable HH:mm times. Cron checks every 15 min.
- **Daily summary:** Configurable per-user (timezone, time, enable/disable). Lists all active medications.
- **Cron endpoints:** `/api/cron/send-reminders` and `/api/cron/daily-summary` — authenticated via `CRON_SECRET` Bearer token.
- **Voice control:** Users can say "remind me to take X at 8am" or "turn off reminders for X" via voice tools.
- **UI:** Bell icon toggle on medication cards, Settings tab for timezone/daily summary preferences.
- **Config:** `app/vercel.json` defines cron schedules.

## Testing

Playwright config is at `app/playwright.config.ts`. Tests run against `localhost:3001` by default, or against a production URL via `TEST_BASE_URL` env var.

```bash
# Local testing
npx next dev -p 3001 &
npx playwright test

# Production testing
TEST_BASE_URL=https://adherepod.com npx playwright test
```

### Current Tests (30)
- **Auth flow (7):** homepage, sign-in, sign-out, redirect tests
- **Public pages (5):** privacy, security, medicare-advantage, device, investors, logos
- **Camera & Voice (5):** camera API, voice assistant card, transcript area
- **View as User (3):** admin impersonation, read-only mode, history tab
- **Provider & Patient (7):** role dropdown options, provider sub-type, provider-dashboard access/redirect, empty patient list, search, sign out
- **Provider API (3):** auth required for provider patients and clinical notes endpoints

## Auth

- Credentials-based (email/password) via NextAuth v5
- Middleware (`src/middleware.ts`) protects routes and redirects
- Session user ID available via `auth()` in API routes
- **User types:** Three roles — `"patient"` (default), `"provider"`, `"admin"`. Exposed in JWT + session along with `providerType`.
  - **Patient:** Regular user, sees /my-medications dashboard
  - **Provider:** Nurse/Doctor/Care Team Member. Sub-type is display-only (no permission differences). Redirected to /provider-dashboard on login. Can view/edit/add/delete assigned patients' medications and add clinical notes.
  - **Admin:** Full access. Impersonation, user management, can assign patients to providers, can set user passwords.
- **Provider-Patient:** Many-to-many via `providerPatients` table. Both admins and providers can establish links.
- **Authorization:** `src/lib/authorization.ts` — `canAccessPatientData(callerId, patientId)` checks if caller is the patient, an admin, or an assigned provider.
- **Admin seeded:** `aifurman@gmail.com` is the initial admin account.

## Email History & SendGrid Webhooks

- Every email sent (password reset, medication reminder, daily summary) is logged to the `emailSends` table with the full HTML body and SendGrid message ID.
- SendGrid Event Webhooks POST to `/api/webhooks/sendgrid` — events (delivered, open, click, bounce, etc.) are stored in `emailEvents`, deduped on `sgEventId`.
- `/api/emails` returns email history (admin sees all users, regular users see only their own). Supports `?id=xxx` for single email detail with events.
- The History tab shows a unified chronological timeline of both voice conversations and emails. Clicking an email shows the full HTML body rendered in an iframe and a delivery status timeline.
- **SendGrid setup required:** In SendGrid Dashboard, configure Event Webhook URL to `https://adherepod.com/api/webhooks/sendgrid`. Store verification key as `SENDGRID_WEBHOOK_KEY` env var.

## Homepage

- Sticky nav with smooth scrolling, logo links to top
- Hero section with embedded Loom demo video
- Voice-first callout with example phrases
- Features grid (6 cards)
- How It Works: Talk, Discuss, Get Notified (3 steps)
- Who It's For (6 audience cards)
- Team section with bios
- CTA and footer

## Environment Variables

Set in `.env.local` for local dev, and in Vercel project settings for production:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `AUTH_SECRET` — NextAuth session signing secret
- `AUTH_URL` — NextAuth base URL (localhost for dev, production URL for prod)
- `SENDGRID_API_KEY` — SendGrid email API key
- `SENDGRID_FROM_EMAIL` — From address for emails
- `NEXT_PUBLIC_APP_URL` — Public-facing app URL
- `OPENAI_API_KEY` — OpenAI API key (used for realtime voice sessions)
- `CRON_SECRET` — Secret for authenticating Vercel Cron requests
- `SENDGRID_WEBHOOK_KEY` — SendGrid Event Webhook verification key (for future signature verification)
- `TEST_USER_EMAIL` — Test user email for Playwright tests
- `TEST_USER_PASSWORD` — Test user password for Playwright tests

## Deployment

Vercel project is at `andrew-furmans-projects/adherepod`. Root directory is `app/`. GitHub auto-deploy is connected — pushing to `main` automatically triggers a production deployment to **AdherePod.com** via the Vercel GitHub integration. There is a single Vercel environment (production only, no preview/staging).

```bash
# Typical deploy workflow: just push to main
git push origin main    # Triggers automatic Vercel production deploy

# Manual deploy (if needed)
cd /path/to/AdherePod
vercel --prod
```

## Maintaining This File

Keep this CLAUDE.md up to date as the project evolves. When making changes to the project, update the relevant sections here:

- **New tables or schema changes** — update the Database section and project structure
- **New API routes or pages** — update the Project Structure tree
- **New dependencies or tools** — update the Tech Stack section
- **New commands or workflows** — update Common Commands
- **New test patterns or config changes** — update Testing section
- **Architecture decisions or conventions** — document them in the relevant section
