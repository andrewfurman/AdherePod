# AdherePod

Medication adherence app for elderly and low-literacy users. Voice-native, device-based.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Auth:** NextAuth v5 (beta) with credentials provider, JWT sessions
- **Database:** PostgreSQL via Neon (serverless), Drizzle ORM
- **UI:** Radix UI, Tailwind CSS 4, Lucide icons
- **Email:** SendGrid (password reset flows)
- **Hosting:** Vercel (auto-deploys from `main`)

## Project Structure

The Next.js app lives in `app/`. All commands should be run from that directory.

```
app/
  src/
    app/              # Pages and API routes
      (auth)/         # Auth pages (sign-in, sign-up, forgot/reset password)
      api/            # API routes (auth, sign-up, medications, etc.)
      dashboard/      # Protected dashboard page
    components/ui/    # Radix-based UI components (button, card, input, badge, label)
    lib/
      auth.ts         # NextAuth config with DrizzleAdapter
      db/
        index.ts      # Neon/Drizzle database connection
        schema.ts     # Database schema (users, accounts, sessions, medications, etc.)
      tokens.ts       # Token generation/hashing utils
      email.ts        # SendGrid email integration
  tests/              # Playwright e2e tests
  drizzle.config.ts   # Drizzle Kit config
```

## Common Commands

```bash
cd app
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npx drizzle-kit push     # Push schema changes to Neon DB
npx playwright test      # Run e2e tests (needs dev server on port 3001)
```

## Database

Schema is in `app/src/lib/db/schema.ts`. After modifying, run `npx drizzle-kit push` from `app/` to sync with Neon. Env var `DATABASE_URL` must be set (in `.env.local`).

## Testing

Playwright config is at `app/playwright.config.ts`. Tests run against `localhost:3001` with `headless: false`. Start the dev server on port 3001 before running tests:

```bash
npx next dev -p 3001 &
npx playwright test
```

## Auth

- Credentials-based (email/password) via NextAuth v5
- Middleware (`src/middleware.ts`) protects routes and redirects
- Session user ID available via `auth()` in API routes

## Maintaining This File

Keep this CLAUDE.md up to date as the project evolves. When making changes to the project, update the relevant sections here:

- **New tables or schema changes** — update the Database section and project structure
- **New API routes or pages** — update the Project Structure tree
- **New dependencies or tools** — update the Tech Stack section
- **New commands or workflows** — update Common Commands
- **New test patterns or config changes** — update Testing section
- **Architecture decisions or conventions** — document them in the relevant section
