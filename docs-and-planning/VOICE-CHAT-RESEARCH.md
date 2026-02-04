# Realtime Voice Chat Options for AdherePod

Research into enabling realtime voice conversations with AI for medication adherence.

**Key Requirements:**
- Real-time transcription of both sides (what the AI says and what the user says)
- Function calling (AI can add/edit/delete medications, mark doses taken, etc.)
- Low latency conversational feel for elderly users
- Web-first, with potential phone support later

---

## 1. OpenAI Realtime API vs. Alternatives

### 1.1 OpenAI Realtime API (GPT-4o)

**What it does:** Single speech-to-speech model -- audio goes in, audio comes out, with GPT-4o reasoning in between. No separate STT/TTS pipeline.

| Attribute | Details |
|---|---|
| **Pipeline** | Single model: audio-in, audio-out with built-in reasoning |
| **Pricing** | `gpt-4o-realtime`: ~$0.24/min. `gpt-4o-mini-realtime`: ~$0.06-$0.12/min |
| **Latency** | Best -- no inter-service hops, sub-second responses |
| **Real-time transcription** | Yes -- provides text transcripts of both user input and AI output alongside audio |
| **Function calling** | Yes -- native tool/function calling mid-conversation |
| **Free tier** | No dedicated free tier; standard API credits apply |
| **Phone support** | SIP-based calling added mid-2025 |
| **Next.js integration** | WebRTC or WebSocket. Multiple starter repos exist (e.g. `cameronking4/openai-realtime-api-nextjs`) |

**Strengths:**
- Lowest latency (single model, no orchestration overhead)
- Native function calling -- AI can call `addMedication()`, `markDoseTaken()`, etc. mid-conversation
- Real-time transcripts of both sides built into the API response
- Most natural conversational flow (preserves tone, pace, emotion)

**Weaknesses:**
- Most expensive option per minute ($0.24/min on full model)
- Audio tokens add up for long conversations
- Vendor lock-in to OpenAI

---

### 1.2 ElevenLabs Conversational AI

**What it does:** End-to-end platform: STT + LLM orchestration + TTS. You choose the LLM (Claude, GPT, Gemini, or custom).

| Attribute | Details |
|---|---|
| **Pipeline** | STT + LLM orchestration + TTS (bundled) |
| **Pricing** | $0.08-$0.10/min. Business: $1,320/mo for 13,750 min |
| **Latency** | Low -- fast streaming TTS |
| **Real-time transcription** | Yes -- STT provides user transcript; TTS text is available |
| **Function calling** | Yes -- supports tool calls via the LLM layer |
| **Free tier** | 15 free minutes of Conversational AI |
| **Phone support** | Via integration |
| **Next.js integration** | React SDK available, straightforward |

**Strengths:** Best voice quality in the market. BYO-LLM (use Claude for empathetic medication coaching). React SDK for fast integration.

**Weaknesses:** LLM costs "currently absorbed" but will eventually pass through. STT is less mature than Deepgram/AssemblyAI.

---

### 1.3 Deepgram Voice Agent API

**What it does:** Full pipeline: STT (Nova-3) + TTS (Aura-2) + LLM orchestration. Started as STT specialist.

| Attribute | Details |
|---|---|
| **Pipeline** | STT (Nova-3) + TTS (Aura-2) + LLM orchestration |
| **Pricing** | Voice Agent: $0.075/min. STT only: $0.0043/min |
| **Latency** | Sub-200ms for both STT and TTS |
| **Real-time transcription** | Yes -- streaming transcripts with sub-200ms latency |
| **Function calling** | Yes -- via BYO-LLM (Claude, GPT, etc.) with tool calling |
| **Free tier** | $200 in free credits |
| **Phone support** | Via telephony partners |
| **Next.js integration** | WebSocket API, JS SDK, official Next.js starters |

**Strengths:** Best price-performance ratio. #1 on Voice Agent Quality Index. $200 free credit. BYO-LLM for function calling.

**Weaknesses:** Voice quality (Aura-2) a step below ElevenLabs. Fewer pre-built voices.

---

### 1.4 Google Cloud STT + TTS

| Attribute | Details |
|---|---|
| **Pipeline** | Separate STT and TTS (manual LLM orchestration) |
| **STT pricing** | $0.016-$0.036/min |
| **Real-time transcription** | Yes -- streaming STT available |
| **Function calling** | Only via separate LLM integration you build yourself |
| **Free tier** | 60 min STT/month, $300 GCP credit |

**Verdict:** Too much orchestration complexity for a startup. No unified voice agent API.

---

### 1.5 Amazon Transcribe + Polly

| Attribute | Details |
|---|---|
| **Pipeline** | Separate STT and TTS (manual LLM orchestration) |
| **STT pricing** | $0.024/min. Medical: $0.075/min |
| **Real-time transcription** | Yes -- streaming transcription available |
| **Function calling** | Only via separate LLM integration |
| **Free tier** | 60 min STT/month, 5M chars TTS/month (12 months) |

**Verdict:** Medical transcription model is notable for medication names. But building the full pipeline is complex.

---

### 1.6 AssemblyAI (STT Only)

| Attribute | Details |
|---|---|
| **Pipeline** | STT only |
| **Pricing** | $0.0025/min base. Add-ons extra (PII redaction +$0.08/hr) |
| **Real-time transcription** | Yes -- immutable transcripts in ~300ms |
| **Function calling** | N/A (STT only) |
| **Free tier** | Free to start, pay-as-you-go |

**Verdict:** Best-in-class STT accuracy and immutable transcripts. Would need separate TTS and LLM.

---

## 2. WebRTC / Audio Infrastructure

### 2.1 LiveKit (Recommended)

Open-source WebRTC platform with a dedicated Agents framework.

| Attribute | Details |
|---|---|
| **Type** | WebRTC + AI Agent framework |
| **Pricing** | Free: 5,000 min. Ship ($50/mo): 150K min. Scale ($500/mo): 1.5M min |
| **Real-time transcription** | Yes -- via agent framework STT plugins |
| **Function calling** | Yes -- Agents framework supports tool execution |
| **Phone** | Built-in SIP/PSTN telephony |
| **Next.js** | Official starter template, React components |

**Why LiveKit stands out:** Official Next.js starter, open-source (Apache 2.0), Agents framework handles turn detection + interruptions + echo cancellation. Connects to any STT/TTS/LLM provider.

### 2.2 Daily.co / Pipecat

| Attribute | Details |
|---|---|
| **Type** | WebRTC + Pipecat (open-source agent orchestration) |
| **Pricing** | 10,000 free min/month, then $0.004/min |
| **Real-time transcription** | Yes -- via Pipecat pipeline |
| **Function calling** | Yes -- Pipecat supports tool calls |
| **Compliance** | HIPAA, SOC-2, GDPR built-in |

**Strengths:** Most generous free tier. HIPAA compliance built-in (important for healthcare). Battle-tested since 2016.

### 2.3 Twilio ConversationRelay

| Attribute | Details |
|---|---|
| **Type** | Telephony + STT/TTS orchestration |
| **Pricing** | $0.07/min (STT+TTS) + telephony costs |
| **Function calling** | Via BYO-LLM WebSocket relay |

**Best for:** If phone calls become the primary interaction mode for elderly users.

### 2.4 Browser Native WebRTC

Free but requires building echo cancellation, noise suppression, turn detection from scratch. Not recommended for production.

---

## 3. End-to-End Voice Agent Platforms

### 3.1 Vapi

| Attribute | Details |
|---|---|
| **All-in cost** | $0.13-$0.33/min |
| **Real-time transcription** | Yes |
| **Function calling** | Yes -- configurable per agent |
| **HIPAA** | $1,000/mo add-on |
| **Free tier** | $10 credit |

Flexible provider swapping. No-code flow builder. But true costs are 3-6x the headline $0.05/min rate.

### 3.2 Retell AI

| Attribute | Details |
|---|---|
| **All-in cost** | $0.13-$0.31/min |
| **Real-time transcription** | Yes |
| **Function calling** | Yes -- webhook-based tool calls |
| **HIPAA** | Included (no extra charge) |
| **Free tier** | $10 credit |

HIPAA included at no extra cost. Drag-and-drop builder. 31+ languages. Best option if phone calls are critical.

### 3.3 Bland AI

Phone-call-only automation platform. $0.04-$0.09/min. Free 100 calls/day. Not ideal for web-based voice chat.

---

## 4. Comparison: Real-Time Transcription + Function Calling

| Solution | Transcription (User) | Transcription (AI) | Function Calling | Cost/Min |
|---|---|---|---|---|
| **OpenAI Realtime** | Yes (built-in) | Yes (built-in) | Yes (native) | $0.06-$0.30 |
| **ElevenLabs Conv AI** | Yes (STT layer) | Yes (TTS text) | Yes (via LLM) | $0.08-$0.10 |
| **Deepgram Voice Agent** | Yes (streaming) | Yes (TTS text) | Yes (via BYO-LLM) | $0.075 |
| **LiveKit + Deepgram** | Yes (agent plugins) | Yes (agent plugins) | Yes (agent framework) | $0.005 + provider |
| **Daily/Pipecat + Deepgram** | Yes (Pipecat) | Yes (Pipecat) | Yes (Pipecat) | $0.004 + provider |
| **Vapi** | Yes | Yes | Yes | $0.13-$0.33 |
| **Retell AI** | Yes | Yes | Yes (webhooks) | $0.13-$0.31 |

All of the above support both transcription requirements and function calling.

---

## 5. Recommended Approach for AdherePod

### Primary Recommendation: LiveKit + Deepgram + Claude

| Component | Role | Cost |
|---|---|---|
| **LiveKit** | WebRTC audio transport, agent framework, turn detection | Free tier / $0.005/min |
| **Deepgram** | STT (Nova-3) + TTS (Aura-2) | ~$0.075/min |
| **Claude (Anthropic)** | LLM reasoning, function calling, empathetic conversation | ~$0.05-$0.10/min |

**Why this stack:**
- **Real-time transcription:** Deepgram streams transcripts of user speech. TTS text provides AI-side transcript. Both available in real-time via LiveKit agent events.
- **Function calling:** Claude supports tool use. The agent can call `addMedication()`, `editMedication()`, `deleteMedication()`, `markDoseTaken()` against the AdherePod API.
- **Latency:** Sub-200ms STT + sub-200ms TTS + WebRTC transport = conversational feel.
- **Elderly-friendly:** Claude can be prompted to speak slowly, clearly, confirm understanding, repeat information.
- **Cost:** ~$0.13-$0.18/min total. A 5-minute daily check-in = ~$0.65-$0.90/user/day.
- **Phone later:** LiveKit has built-in SIP/PSTN for when elderly users need to dial in.
- **Open-source:** No vendor lock-in on the infrastructure layer.

### Estimated Monthly Cost at Scale

| Users | Daily 5-min check-in | Monthly Cost |
|---|---|---|
| 100 | $65-90/day | $1,950-$2,700 |
| 1,000 | $650-900/day | $19,500-$27,000 |

### Budget Alternative: OpenAI Realtime (Mini)

If simplicity matters more than cost optimization:
- `gpt-4o-mini-realtime-preview` at ~$0.06-$0.12/min
- Single API, zero orchestration, transcription + function calling built-in
- Trade-off: vendor lock-in, less control over voice quality, no open-source fallback

### If Phone Calls Are Priority: Retell AI

- HIPAA included, $0.07/min base
- Function calling via webhooks to your `/api/medications` endpoints
- Built-in telephony -- elderly users call a phone number
- Trade-off: higher per-minute cost, less control

### Implementation Priority

1. Start with **OpenAI Realtime (mini)** for fastest MVP -- transcription + function calling work out of the box
2. If cost or voice quality becomes an issue, migrate to **LiveKit + Deepgram + Claude**
3. Add phone support via LiveKit SIP or Retell AI when needed

---

## Sources

- [OpenAI Realtime API Pricing](https://skywork.ai/blog/agent/openai-realtime-api-pricing-2025-cost-calculator/)
- [OpenAI Realtime GA Announcement](https://openai.com/index/introducing-gpt-realtime/)
- [OpenAI API Pricing](https://platform.openai.com/docs/pricing)
- [ElevenLabs Conversational AI Pricing](https://elevenlabs.io/pricing/api)
- [Deepgram Voice Agent API](https://deepgram.com/learn/voice-agent-api-generally-available)
- [Deepgram Pricing](https://deepgram.com/pricing)
- [Google Cloud STT Pricing](https://cloud.google.com/speech-to-text/pricing)
- [Amazon Transcribe Pricing](https://aws.amazon.com/transcribe/pricing/)
- [AssemblyAI Pricing](https://www.assemblyai.com/pricing)
- [LiveKit Pricing](https://livekit.io/pricing)
- [LiveKit Agents Framework](https://github.com/livekit/agents)
- [Daily.co Pricing](https://www.daily.co/pricing/)
- [Pipecat Cloud](https://www.daily.co/pricing/pipecat-cloud/)
- [Twilio ConversationRelay](https://www.twilio.com/en-us/products/conversational-ai/conversationrelay)
- [Vapi Pricing](https://vapi.ai/pricing)
- [Retell AI Pricing](https://www.retellai.com/pricing)
- [Bland AI Pricing](https://docs.bland.ai/platform/billing)
- [PlayHT Pricing](https://play.ht/pricing/)
- [Vocode GitHub](https://github.com/vocodedev/vocode-core)
- [Voice AI in Healthcare (Frontiers)](https://www.frontiersin.org/journals/digital-health/articles/10.3389/fdgth.2025.1523070/full)
- [LiveKit Review (Neuphonic)](https://www.neuphonic.com/blog/livekit-review-open-source-webrtc-ai-voice-tool)
