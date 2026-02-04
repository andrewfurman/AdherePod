# Voice Architecture: OpenAI Realtime vs LiveKit + Deepgram + Claude

Two architecture options for adding realtime voice chat to AdherePod.

---

## Option A: OpenAI Realtime API (Simple, Higher Cost)

Single API handles everything -- STT, reasoning, TTS, function calling, transcription.

```
+------------------------------------------------------------------+
|  BROWSER (Next.js Client)                                        |
|                                                                  |
|  +-------------------+     +-------------------------------+     |
|  |  Dashboard UI     |     |  Voice Chat Component         |     |
|  |  (medications,    |     |                               |     |
|  |   transcripts)    |<--->|  - Mic capture (getUserMedia)  |     |
|  |                   |     |  - Speaker playback            |     |
|  +-------------------+     |  - Live transcript display     |     |
|                            +---------------+---------------+     |
+-----------------------------------|------|-----------------------+
                                    |      |
                          WebRTC    |      |  fetch()
                       (audio I/O) |      |  (CRUD ops)
                                   |      |
                     +-------------|---+  |
                     |  OpenAI     v   |  |
                     |  Realtime API   |  |
                     |                 |  |
                     |  +----------+   |  |
                     |  | GPT-4o   |   |  |
                     |  | (single  |   |  |
                     |  |  model)  |   |  |
                     |  +----+-----+   |  |
                     |       |         |  |
                     +-------|--+------+  |
                             |  |         |
               function call |  | audio + |
               (tool_use)    |  | text    |
                             |  | events  |
                             v  v         |
            +----------------------------------+
            |  NEXT.JS SERVER (API Routes)     |
            |                                  |
            |  /api/medications  <--------------+
            |    GET  - list meds              |
            |    POST - add med                |
            |    PUT  - edit med               |
            |    DELETE - remove med           |
            |                                  |
            |  /api/voice/session              |
            |    POST - create ephemeral key   |
            +----------------+-----------------+
                             |
                             v
            +----------------------------------+
            |  NEON POSTGRES (via Drizzle)      |
            |                                  |
            |  users | medications | sessions  |
            +----------------------------------+
```

### Data Flow

1. User clicks "Talk to AdherePod" -- browser opens WebRTC connection to OpenAI
2. Next.js server creates an ephemeral API key (so the real key stays server-side)
3. User speaks -- audio streams directly to OpenAI Realtime API
4. GPT-4o processes audio, generates response audio + text transcript of both sides
5. If GPT-4o decides to call a function (e.g. `addMedication`), it emits a `tool_use` event
6. Browser or server executes the function against `/api/medications`
7. Result is sent back to GPT-4o, which continues the conversation
8. Transcript updates are pushed to the UI in real-time

### Files to Create

```
src/
  app/
    api/
      voice/
        session/
          route.ts        <-- POST: creates ephemeral OpenAI API key
  components/
    voice-chat.tsx        <-- WebRTC client, mic/speaker, transcript UI
  lib/
    voice/
      tools.ts            <-- function definitions for OpenAI tool calling
      use-webrtc.ts       <-- custom hook for OpenAI WebRTC connection
```

### How Function Calling Works

```
User speaks: "Add Lisinopril 10mg, twice a day"
                    |
                    v
           +----------------+
           |    GPT-4o      |
           | (understands   |
           |  intent)       |
           +-------+--------+
                   |
                   |  emits tool_use event
                   v
     +----------------------------+
     |  addMedication({           |
     |    name: "Lisinopril 10mg",|
     |    timesPerDay: 2,         |
     |    startDate: "2026-02-03" |
     |  })                        |
     +-------------+--------------+
                   |
                   |  browser/server calls API
                   v
     +----------------------------+
     |  POST /api/medications     |
     |  -> inserts into Neon DB   |
     |  -> returns { id, name }   |
     +-------------+--------------+
                   |
                   |  tool_result sent back
                   v
           +----------------+
           |    GPT-4o      |
           | "I've added    |
           |  Lisinopril    |
           |  10mg, twice   |
           |  a day."       |
           +----------------+
                   |
                   v
            (audio + transcript
             streamed to browser)
```

### Pros and Cons

**Pros:**
- Simplest architecture -- single API, single vendor
- Fastest to build -- working prototype in a day
- Best latency -- no inter-service hops, sub-second responses
- Transcription + function calling built into the API
- No separate backend process to deploy

**Cons:**
- Most expensive (~$0.10/min mini, ~$0.30/min full)
- Vendor lock-in to OpenAI
- Limited voice options (OpenAI voices only)
- No built-in phone support (SIP added but less mature)
- Can't swap LLM (stuck with GPT-4o)

---

## Option B: LiveKit + Deepgram + Claude (Flexible, Lower Cost)

Modular stack -- separate services for audio transport, STT, LLM, and TTS.

```
+------------------------------------------------------------------+
|  BROWSER (Next.js Client)                                        |
|                                                                  |
|  +-------------------+     +-------------------------------+     |
|  |  Dashboard UI     |     |  Voice Chat Component         |     |
|  |  (medications,    |     |  (LiveKit React SDK)          |     |
|  |   transcripts)    |<--->|                               |     |
|  |                   |     |  - Auto mic/speaker via SDK    |     |
|  +-------------------+     |  - Live transcript display     |     |
|                            +---------------+---------------+     |
+-----------------------------------|------|-----------------------+
                                    |      |
                          WebRTC    |      |  fetch()
                     (via LiveKit)  |      |  (CRUD ops)
                                    |      |
                     +--------------v-+    |
                     |  LIVEKIT CLOUD  |   |
                     |  (WebRTC SFU)   |   |
                     |                 |   |
                     |  - Audio room   |   |
                     |  - Turn detect  |   |
                     |  - Echo cancel  |   |
                     +--------+--------+   |
                              |            |
                    audio     |            |
                    stream    |            |
                              v            |
            +----------------------------------+
            |  LIVEKIT AGENT (Python or Node)   |
            |  (runs as a participant in room)  |
            |                                  |
            |  +----------+    +-----------+   |
            |  | Deepgram  |   | Deepgram  |   |
            |  | STT       |   | TTS       |   |
            |  | (Nova-3)  |   | (Aura-2)  |   |
            |  +-----+-----+  +-----^-----+   |
            |        |              |          |
            |     text           text          |
            |        |              |          |
            |        v              |          |
            |  +-----+--------------+-----+    |
            |  |     Claude (Anthropic)    |   |
            |  |                          |   |
            |  |  - System prompt         |   |
            |  |  - Conversation history  |   |
            |  |  - Tool definitions      |   |
            |  |  - Function calling -----+---+---> /api/medications
            |  +--------------------------+    |
            |                                  |
            |  Emits events:                   |
            |  - user_transcript (from STT)    |
            |  - agent_transcript (to TTS)     |
            |  - function_call_result          |
            +----------------------------------+
                              |
            +----------------------------------+
            |  NEXT.JS SERVER (API Routes)     |
            |                                  |
            |  /api/medications                |
            |    GET | POST | PUT | DELETE     |
            |                                  |
            |  /api/voice/token                |
            |    POST - issue LiveKit room JWT |
            +----------------+-----------------+
                             |
                             v
            +----------------------------------+
            |  NEON POSTGRES (via Drizzle)      |
            |                                  |
            |  users | medications | sessions  |
            +----------------------------------+
```

### Data Flow

1. User clicks "Talk to AdherePod" -- browser connects to LiveKit room via WebRTC
2. Next.js server issues a LiveKit JWT token for auth
3. LiveKit Agent (separate process) joins the same room as a participant
4. User speaks -- audio goes Browser -> LiveKit Cloud -> Agent
5. Agent sends audio to Deepgram STT -- gets text transcript back (~200ms)
6. Agent sends transcript to Claude with conversation history + tool definitions
7. Claude reasons and either responds with text or calls a function
8. If function call: Agent calls `/api/medications`, sends result back to Claude
9. Claude's text response goes to Deepgram TTS -- gets audio back (~200ms)
10. Audio goes Agent -> LiveKit Cloud -> Browser (user hears response)
11. Both transcripts (user + agent) are emitted as events to the browser for display

### Files to Create

```
app/                              (existing Next.js app)
  src/
    app/
      api/
        voice/
          token/
            route.ts              <-- POST: issues LiveKit room JWT
    components/
      voice-chat.tsx              <-- LiveKit React SDK component

agent/                            (NEW -- separate process)
  main.py                         <-- LiveKit Agent entrypoint
  tools.py                        <-- function defs for Claude tool calling
  requirements.txt                <-- livekit-agents, deepgram, anthropic
  Dockerfile                      <-- for deployment
```

### How Function Calling Works

```
User speaks: "Add Lisinopril 10mg, twice a day"
                    |
                    v
           +----------------+
           | Deepgram STT   |
           | (Nova-3)       |
           +-------+--------+
                   |
                   |  text: "Add Lisinopril 10mg, twice a day"
                   v
           +----------------+
           |    Claude      |
           | (understands   |
           |  intent)       |
           +-------+--------+
                   |
                   |  emits tool_use
                   v
     +----------------------------+
     |  addMedication({           |
     |    name: "Lisinopril 10mg",|
     |    timesPerDay: 2,         |
     |    startDate: "2026-02-03" |
     |  })                        |
     +-------------+--------------+
                   |
                   |  agent calls API
                   v
     +----------------------------+
     |  POST /api/medications     |
     |  -> inserts into Neon DB   |
     |  -> returns { id, name }   |
     +-------------+--------------+
                   |
                   |  tool_result sent back
                   v
           +----------------+
           |    Claude      |
           | "I've added    |
           |  Lisinopril    |
           |  10mg, twice   |
           |  a day."       |
           +-------+--------+
                   |
                   |  text response
                   v
           +----------------+
           | Deepgram TTS   |
           | (Aura-2)       |
           +-------+--------+
                   |
                   v
            (audio streamed to
             browser via LiveKit)
```

### Pros and Cons

**Pros:**
- 40-70% cheaper per minute than OpenAI Realtime
- Swap any component (different STT, TTS, or LLM)
- Open-source infrastructure (no vendor lock-in)
- Built-in phone support (LiveKit SIP/PSTN)
- Choose your LLM (Claude for empathy, GPT for speed, etc.)
- Self-host option for cost optimization at scale

**Cons:**
- More moving parts (4 services vs 1)
- Separate agent process to deploy and maintain
- Slightly higher latency (~400ms total vs ~200ms)
- More complex debugging (distributed system)

---

## Side-by-Side Summary

```
  OPTION A: OpenAI Realtime             OPTION B: LiveKit + Deepgram + Claude
  ========================             ======================================

  Browser                               Browser
    |                                     |
    | WebRTC                              | WebRTC
    v                                     v
  +-------------+                       +-------------+
  | OpenAI      |                       | LiveKit     |
  | Realtime    |                       | Cloud       |
  | API         |                       | (WebRTC SFU)|
  |             |                       +------+------+
  | GPT-4o does |                              |
  | EVERYTHING: |                              v
  | - STT       |                       +------+------+
  | - Reasoning |                       | LiveKit     |
  | - TTS       |                       | Agent       |
  | - Tools     |                       |             |
  +------+------+                       | Deepgram ---+--> STT
         |                              | Claude  ---+--> Reasoning + Tools
         v                              | Deepgram ---+--> TTS
  Next.js API                           +------+------+
  (function                                    |
   execution)                                  v
                                        Next.js API
                                        (function
                                         execution)
```

| | Option A (OpenAI Realtime) | Option B (LiveKit Stack) |
|---|---|---|
| **Services** | 1 (OpenAI) | 4 (LiveKit + Deepgram + Claude + your agent) |
| **Deploy** | Just Next.js | Next.js + Agent process |
| **Transcription** | Built-in (both sides) | Via Deepgram STT + TTS text events |
| **Function calling** | Native GPT-4o tools | Claude tool_use via agent |
| **Latency** | ~200ms (best) | ~400ms (good) |
| **Voice quality** | OpenAI voices (decent) | Deepgram Aura-2 (decent) or swap to ElevenLabs |
| **LLM choice** | GPT-4o only | Any (Claude, GPT, Gemini, open-source) |
| **Phone support** | SIP (newer) | SIP/PSTN (mature) |
| **Vendor lock-in** | High | Low |
| **HIPAA** | Via OpenAI BAA | Via Daily.co/Pipecat (built-in) |

---

## Real-Time Transcription UI

Both options feed the same UI. The transcript displays in real-time as the conversation happens:

```
+------------------------------------------+
|  Voice Chat                    [End Call] |
|                                          |
|  +------------------------------------+  |
|  |  Live Transcript                   |  |
|  |                                    |  |
|  |  You: "What medications do I have?"|  |
|  |                                    |  |
|  |  AdherePod: "You currently have    |  |
|  |  two medications: Lisinopril 10mg  |  |
|  |  twice daily, and Metformin 500mg  |  |
|  |  three times daily before meals."  |  |
|  |                                    |  |
|  |  You: "Add a new one, Amlodipine   |  |
|  |  5mg, once a day"                  |  |
|  |                                    |  |
|  |  [Adding medication...]            |  |
|  |                                    |  |
|  |  AdherePod: "Done! I've added      |  |
|  |  Amlodipine 5mg, once daily,       |  |
|  |  starting today. Anything else?"   |  |
|  |                                    |  |
|  |  > Listening...                    |  |
|  +------------------------------------+  |
|                                          |
|  [Mute]              [Speaker: On]       |
+------------------------------------------+
```

---

## Cost Comparison

| Scenario | Option A (OpenAI mini) | Option A (OpenAI full) | Option B (LiveKit stack) |
|---|---|---|---|
| **Per minute** | ~$0.10/min | ~$0.30/min | ~$0.13-$0.18/min |
| **5-min check-in** | $0.50 | $1.50 | $0.65-$0.90 |
| **100 users/day** | $50/day ($1.5K/mo) | $150/day ($4.5K/mo) | $65-90/day ($2-2.7K/mo) |
| **1,000 users/day** | $500/day ($15K/mo) | $1,500/day ($45K/mo) | $650-900/day ($20-27K/mo) |
| **10,000 users/day** | $5K/day ($150K/mo) | $15K/day ($450K/mo) | $6.5-9K/day ($200-270K/mo) |

At low scale (<500 users), OpenAI mini is comparable in cost and much simpler.
At high scale, Option B saves 30-50%.

---

## Recommendation

**Start with Option A (OpenAI Realtime mini) for the MVP:**
- Fastest to build -- single API, no agent process to deploy
- Transcription + function calling work out of the box
- `gpt-4o-mini-realtime` keeps costs reasonable (~$0.10/min)
- Validate the product before optimizing infrastructure

**Migrate to Option B (LiveKit + Deepgram + Claude) when:**
- You hit 500+ daily active users and cost matters
- You want phone dial-in for elderly users (LiveKit SIP)
- You want to customize voice quality or swap LLMs
- You need HIPAA compliance (Daily.co/Pipecat has it built-in)

**Migration is straightforward** -- the Next.js app and `/api/medications` routes stay the same. You replace the voice-chat component and add the agent process. The database and API layer don't change.
