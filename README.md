# AdherePod

A voice-native medication adherence platform for elderly and low-literacy users. Available today as a web app at [adherepod.com](https://adherepod.com) — works in any modern browser on desktop or mobile.

> **Hardware device coming soon.** We're building a dedicated, LTE-enabled AdherePod device that ships ready to use — no WiFi setup, no app downloads, no menus. Plug it in and start talking. The web app is the first surface; the device is next.

## What's available today (web + mobile browser)

### For patients
- **Voice-native medication management.** Talk naturally — "AdherePod, add lisinopril 10mg once a day in the morning" — and the assistant handles it. No forms to fill out unless you want to.
- **Camera support.** Hold up a prescription label or pill bottle and the assistant reads it for you. Works for skin conditions and other visual questions too.
- **Medication list.** Add, edit, and remove meds with dosage, frequency, timing notes, and start/end dates. Manual UI is there if you prefer it over voice.
- **Email reminders.** Per-medication reminders at the times you choose, in your timezone. Toggle on/off per medication.
- **Daily summary email.** Optional once-a-day digest at the time of your choice.
- **History timeline.** Every voice conversation and email reminder in one chronological view, with transcripts, images, and delivery status.
- **Settings.** Timezone auto-detection, reminder preferences, password management.

### For providers (nurses, doctors, care team members)
- **Patient dashboard.** Search for and assign patients you're caring for.
- **Manage their meds.** Add, edit, and remove medications on behalf of assigned patients.
- **Clinical notes.** Attach provider-authored notes to specific medications.
- **Voice conversation history.** Review every conversation an assigned patient has had with the assistant.

### For admins
- **User management.** Manage every account, change roles (patient / provider / admin), set provider sub-type (nurse / doctor / care team member / family member).
- **Password tools.** Send reset links or set passwords directly.
- **View As.** Impersonate any user in read-only mode to audit their experience and data.

## Coming soon: the AdherePod device

The phone form factor is too confusing for the people who need adherence support most. The dedicated device fixes that:

- **LTE-enabled out of the box** — no WiFi setup, no router config, no IT visit
- **Plug and play** — turn it on and start talking
- **Always listening for "AdherePod"** — no buttons, no menus, no screens to navigate
- **Pairs with medical devices** — blood pressure monitors, glucose meters, pulse oximeters, smart pill dispensers, wearables
- **Built for the home** — sits on a counter or nightstand and becomes the patient's personal health hub

Until the device ships, every patient feature works through the web app at adherepod.com on phones, tablets, and computers.

## Tech stack

Next.js 16 (App Router) with React 19, TypeScript, NextAuth v5, PostgreSQL via Neon + Drizzle ORM, OpenAI Agents SDK with `gpt-4o-mini-realtime-preview` over WebRTC, SendGrid for email, Vercel Cron for reminders, Tailwind CSS 4 + Radix UI, Playwright for end-to-end testing. Hosted on Vercel.

See [CLAUDE.md](CLAUDE.md) for project structure and developer setup.

## Target users

- Elderly patients managing multiple chronic conditions
- Low-literacy populations who struggle with app-based solutions
- Caregivers managing medications for family members
- Healthcare providers who need reliable adherence and conversation data
