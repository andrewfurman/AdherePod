# AdherePod

Medication adherence app for elderly and low-literacy users. Voice-native, device-based.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Auth:** NextAuth v5 (beta) with credentials provider, JWT sessions
- **Database:** PostgreSQL via Neon (serverless), Drizzle ORM
- **UI:** Radix UI, Tailwind CSS 4, Lucide icons
- **Email:** SendGrid (password reset flows)
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
        medications/  # CRUD for medications (GET, POST, PUT, DELETE)
        sign-up/      # User registration
        forgot-password/
        reset-password/
        voice/
          session/          # Generates ephemeral OpenAI realtime API keys
          conversations/    # GET (list/detail) and POST (create) conversations
            messages/       # POST (save message) and PATCH (end conversation)
      dashboard/      # Protected dashboard — medications list + voice chat side by side
    components/
      ui/             # Radix-based UI components (button, card, input, badge, label)
      voice-chat.tsx  # Voice chat component with RealtimeAgent, transcript display
    lib/
      auth.ts         # NextAuth config with DrizzleAdapter
      db/
        index.ts      # Neon/Drizzle database connection
        schema.ts     # Database schema (users, accounts, sessions, medications, conversations, conversationMessages)
      voice/
        tools.ts      # Voice agent tools (listMedications, addMedication, editMedication, deleteMedication)
      tokens.ts       # Token generation/hashing utils
      email.ts        # SendGrid email integration
  public/
    hero-image.png    # Homepage hero image (generated via Imagen 4.0)
    gage-clifton.jpg  # Team photo
    andrew-furman.jpg # Team photo
  tests/              # Playwright e2e tests
  drizzle.config.ts   # Drizzle Kit config
  playwright.config.ts # Supports TEST_BASE_URL env var for production testing
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

- **users** — NextAuth user accounts
- **accounts**, **sessions**, **verificationTokens** — NextAuth internals
- **medications** — User medications (name, timesPerDay, timingDescription, startDate, endDate, notes)
- **conversations** — Voice chat conversation records (userId, status, startedAt, endedAt)
- **conversationMessages** — Individual messages in a conversation (role, content, toolName, toolArgs)

## Voice Chat Architecture

The voice assistant uses OpenAI's Agents SDK with WebRTC:

1. **Client** calls `/api/voice/session` to get an ephemeral OpenAI API key
2. **Client** creates a `RealtimeSession` with a `RealtimeAgent` configured with medication tools
3. **Agent** can call tools (`list_medications`, `add_medication`, `edit_medication`, `delete_medication`) which hit `/api/medications`
4. **Transcript** events are captured via `transport_event` (user speech) and `agent_end` (agent response)
5. **Messages** are saved to the database via `/api/voice/conversations/messages`
6. **Medications list** auto-refreshes via `agent_tool_end` callback

## Testing

Playwright config is at `app/playwright.config.ts`. Tests run against `localhost:3001` by default, or against a production URL via `TEST_BASE_URL` env var.

```bash
# Local testing
npx next dev -p 3001 &
npx playwright test

# Production testing
TEST_BASE_URL=https://adherepod.com npx playwright test
```

### Current Tests (6)
- Homepage has Sign In button and hero image
- Sign-in page loads with email/password fields
- Sign-in with valid credentials redirects to dashboard (checks medications list + Talk to AdherePod button)
- Sign-in with wrong password shows error
- Sign-out returns to homepage
- Dashboard redirects to sign-in when not authenticated

## Auth

- Credentials-based (email/password) via NextAuth v5
- Middleware (`src/middleware.ts`) protects routes and redirects
- Session user ID available via `auth()` in API routes

## Homepage

- Sticky nav with smooth scrolling, logo links to top
- Hero section with Imagen 4.0 generated image
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
- `TEST_USER_EMAIL` — Test user email for Playwright tests
- `TEST_USER_PASSWORD` — Test user password for Playwright tests

## Deployment

Vercel project is at `andrew-furmans-projects/adherepod`. Root directory is `app/`. Deploy from the repo root:

```bash
cd /path/to/AdherePod
vercel --prod
```

GitHub auto-deploy is not yet connected — requires installing the Vercel GitHub App at https://vercel.com/andrew-furmans-projects/adherepod/settings/git.

## Maintaining This File

Keep this CLAUDE.md up to date as the project evolves. When making changes to the project, update the relevant sections here:

- **New tables or schema changes** — update the Database section and project structure
- **New API routes or pages** — update the Project Structure tree
- **New dependencies or tools** — update the Tech Stack section
- **New commands or workflows** — update Common Commands
- **New test patterns or config changes** — update Testing section
- **Architecture decisions or conventions** — document them in the relevant section
