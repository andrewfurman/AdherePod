# Voice Chat Implementation Reference

How the AdherePod voice chat system works, as implemented.

## Stack

| Component | Technology |
|---|---|
| Voice SDK | OpenAI Agents SDK (`@openai/agents/realtime`) |
| Model | `gpt-4o-mini-realtime-preview` |
| Transport | WebRTC (browser to OpenAI) |
| Tool schemas | Zod |
| Database | PostgreSQL (Neon) via Drizzle ORM |

## Architecture

```
Browser                         OpenAI Realtime API
  |                                    |
  |-- 1. POST /api/voice/session ----> |  (get ephemeral key)
  |<--- { value: "ek_..." } ---------- |
  |                                    |
  |-- 2. WebRTC connect (ephemeral) -> |
  |                                    |
  |======= audio streams both ways ====|
  |                                    |
  |  3. GPT-4o-mini processes speech,  |
  |     calls tools, generates audio   |
  |                                    |
  |<-- transport_event (user transcript)
  |<-- agent_end (agent response text)
  |<-- agent_tool_end (tool completed)
  |                                    |
  |-- 4. Tool calls hit /api/medications (browser-side fetch)
```

## Key Files

| File | Purpose |
|---|---|
| `src/components/voice-chat.tsx` | Client component — WebRTC connection, transcript display, message persistence |
| `src/lib/voice/tools.ts` | Tool definitions for the voice agent (list/add/edit/delete medications) |
| `src/app/api/voice/session/route.ts` | POST — generates ephemeral OpenAI API key |
| `src/app/api/voice/conversations/route.ts` | GET/POST — list or create conversation records |
| `src/app/api/voice/conversations/messages/route.ts` | POST (save message), PATCH (end conversation) |
| `src/app/api/medications/route.ts` | GET/POST/PUT/DELETE — medication CRUD |
| `src/lib/db/schema.ts` | Database schema (conversations, conversationMessages, medications) |

## Connection Flow

1. User clicks "Talk to AdherePod"
2. Browser calls `POST /api/voice/conversations` to create a conversation record
3. Browser calls `POST /api/voice/session` to get an ephemeral OpenAI API key
4. Browser creates a `RealtimeSession` with a `RealtimeAgent` configured with medication tools
5. `RealtimeSession.connect({ apiKey })` opens WebRTC connection to OpenAI

## Event Handling

Three event types on `RealtimeSession`:

- **`transport_event`** — Raw OpenAI transport events. We listen for `conversation.item.input_audio_transcription.completed` to get user speech transcripts.
- **`agent_end`** — Fires when the agent finishes a response. Provides the output text.
- **`agent_tool_end`** — Fires after any tool call completes. Used to trigger a medications list refresh.

## Voice Agent Tools

Defined in `src/lib/voice/tools.ts` using `tool()` from `@openai/agents` with Zod schemas:

| Tool | Description | Parameters |
|---|---|---|
| `list_medications` | List all user medications | (none) |
| `add_medication` | Add a new medication | `name`, `timesPerDay`, `timingDescription?`, `startDate`, `endDate?`, `notes?` |
| `edit_medication` | Update an existing medication | `id`, `name?`, `timesPerDay?`, `timingDescription?`, `endDate?`, `notes?` |
| `delete_medication` | Delete a medication | `id` |

Tools execute browser-side `fetch()` calls against `/api/medications`.

## Transcript Persistence

Each transcript event (user speech or agent response) is saved to the database via `POST /api/voice/conversations/messages`. When the user disconnects, `PATCH /api/voice/conversations/messages` marks the conversation as ended.

## Database Tables

**conversations** — One record per voice session:
- `id`, `userId`, `status` ("active" | "ended"), `startedAt`, `endedAt`

**conversationMessages** — Individual messages within a conversation:
- `id`, `conversationId`, `role` ("user" | "agent"), `content`, `toolName?`, `toolArgs?`, `createdAt`

## Agent System Prompt

The agent is configured as "AdherePod, a friendly and patient medication assistant" with instructions to speak slowly, use simple words, confirm actions before and after, and spell out medication names when unsure.

## Dashboard Layout

Side-by-side fixed-viewport layout:
- **Left column:** Medications list with add/edit/delete UI
- **Right column:** Voice assistant with transcript display
- Both columns scroll independently within the viewport
- Pulsating red "Live" indicator when connected

## Future Migration Path

The current implementation uses OpenAI Realtime (Option A) for simplicity. If cost or flexibility becomes an issue, the architecture can migrate to LiveKit + Deepgram + Claude (Option B) without changing the database, API routes, or medications CRUD — only the voice-chat component and transport layer would change.
