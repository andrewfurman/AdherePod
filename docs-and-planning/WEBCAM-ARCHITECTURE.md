# Webcam Image Capture Architecture

Research and architecture options for adding image capture during live voice conversations. Users can hold up items (pill bottles, pillboxes, prescription labels) to their webcam while on a voice call, and the system processes the image to extract medication information.

## Use Cases

1. **Pill bottle identification** — User holds up a pill bottle; system reads the label and extracts drug name, dosage, frequency
2. **Pillbox verification** — User shows their weekly pillbox; system confirms which compartments have pills
3. **Prescription label reading** — User holds up a pharmacy label; system extracts all medication details
4. **Visual confirmation** — User asks "Can you see this?" and the system describes what it sees

## Core Concept

During an active voice conversation, the user can trigger an image capture. The browser grabs a frame from the webcam video stream, sends it to a vision LLM, and converts the visual information to text. That text is then fed into the voice conversation context so the agent can discuss what it saw.

---

## Option A: Client-Side Capture + Server Vision API

The simplest approach. The browser captures a frame and sends it to a server endpoint that calls a vision LLM.

```
Browser (voice call active)
  |
  |-- getUserMedia({ video: true })  --> webcam stream
  |
  |-- User says "Can you see this?" or clicks camera button
  |
  |-- canvas.drawImage(videoEl) --> capture frame as JPEG/PNG
  |
  |-- POST /api/voice/image-capture
  |     Body: { conversationId, imageBase64 }
  |
  v
Server (/api/voice/image-capture)
  |
  |-- Send image to vision LLM (GPT-4o / Claude / Gemini)
  |     Prompt: "Extract all medication information from this image.
  |              Return structured data: drug name, dosage, frequency,
  |              instructions, prescriber, pharmacy, refill date."
  |
  |-- Store result in conversationMessages (role: "system", toolName: "image_capture")
  |
  |-- Return { description, medications: [...] }
  |
  v
Browser
  |
  |-- Display extracted info in transcript
  |-- Inject text into voice agent context
  |-- Agent discusses findings with user
```

### Pros
- Simplest to implement — just a canvas capture + API call
- No video streaming infrastructure needed
- Single frame is cheap to process (~$0.01-0.03 per image)
- Works with any vision LLM

### Cons
- Single frame may miss info (user needs to hold still)
- Can't do real-time video processing
- Requires user to trigger capture manually or via voice command

### New Files
- `src/app/api/voice/image-capture/route.ts` — processes image with vision LLM
- Update `src/components/voice-chat.tsx` — add camera button, canvas capture logic

### New API Endpoint

**`POST /api/voice/image-capture`**

```json
// Request
{
  "conversationId": "uuid",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}

// Response
{
  "description": "I can see a prescription bottle for Lisinopril 10mg...",
  "medications": [
    {
      "name": "Lisinopril 10mg",
      "dosage": "10mg",
      "frequency": "Once daily",
      "instructions": "Take by mouth once daily",
      "prescriber": "Dr. Smith",
      "pharmacy": "CVS Pharmacy",
      "refillDate": "2026-03-15"
    }
  ]
}
```

### Database Changes
None required — use existing `conversationMessages` table with `toolName: "image_capture"` and `toolArgs` storing the extracted data as JSON.

---

## Option B: Client-Side Capture + Client-Side Vision (Via Voice Agent Tool)

Instead of a separate API endpoint, define a new voice agent tool that accepts image data. The agent itself decides when to process an image based on conversation context.

```
Browser (voice call active)
  |
  |-- User says "Can you see this?"
  |
  |-- Voice agent calls capture_image tool
  |
  |-- Tool implementation:
  |     1. Grab frame from webcam via canvas
  |     2. POST /api/voice/image-capture { imageBase64 }
  |     3. Return description to agent
  |
  |-- Agent responds: "I can see a bottle of Lisinopril 10mg..."
```

### New Voice Agent Tool

```typescript
export const captureImage = tool({
  name: "capture_image",
  description: "Capture an image from the user's webcam and analyze it for medication information. Call this when the user asks you to look at something.",
  parameters: z.object({
    prompt: z.string().optional().describe("What to look for in the image"),
  }),
  execute: async ({ prompt }) => {
    // This runs in the browser — grab webcam frame
    const canvas = document.createElement("canvas");
    const video = document.querySelector("video#webcam");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

    const res = await fetch("/api/voice/image-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, prompt }),
    });
    return res.json();
  },
});
```

### Pros
- Agent-driven — the LLM decides when to capture based on conversation
- Natural flow: "Can you see this?" triggers tool call automatically
- No extra UI button needed (though one could be added)

### Cons
- OpenAI Realtime tool calls run in the browser — need to handle async webcam capture
- Agent may not always correctly detect when to trigger capture
- Same single-frame limitation as Option A

### Database Changes
Same as Option A — no schema changes needed.

---

## Option C: Multi-Frame Capture with Best-Frame Selection

Captures several frames over a short window and picks the sharpest one, reducing the chance of a blurry or poorly-framed image.

```
Browser
  |
  |-- Capture 5 frames over 2 seconds
  |-- Score each frame (focus, brightness, contrast)
  |-- Send best frame to /api/voice/image-capture
```

### Frame Scoring (Client-Side)

```typescript
function scoreFrame(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Laplacian variance (focus measure)
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum += gray;
    sumSq += gray * gray;
  }
  const n = data.length / 4;
  const variance = sumSq / n - (sum / n) ** 2;
  return variance; // higher = sharper
}
```

### Pros
- Better image quality — reduces blurry captures
- Still uses single API call for vision processing

### Cons
- More client-side complexity
- 2-second delay before processing

---

## Option D: Live Video Preview (No Streaming)

Show the webcam feed locally in the browser during the voice call but don't stream it anywhere. The user can see themselves and position items correctly before capture.

```
+------------------------------------------+
|  Voice Assistant              [End Call]  |
|                                          |
|  +------------------------------------+ |
|  |  Live Transcript                    | |
|  |  ...                                | |
|  +------------------------------------+ |
|                                          |
|  +------------------------------------+ |
|  |  [Camera Preview]                   | |
|  |  /----\                             | |
|  |  | 📷 |  "Hold item in frame"      | |
|  |  \----/                             | |
|  |        [📸 Capture]                 | |
|  +------------------------------------+ |
+------------------------------------------+
```

### Implementation

```typescript
// Add video preview to voice-chat.tsx
const videoRef = useRef<HTMLVideoElement>(null);
const [cameraActive, setCameraActive] = useState(false);

const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: 1280, height: 720 }
  });
  videoRef.current.srcObject = stream;
  setCameraActive(true);
};

// Prefer rear camera on mobile ("environment"), front camera on desktop ("user")
```

### Pros
- User can position items correctly before capture
- No video streaming costs
- Works well on both mobile and desktop

### Cons
- Takes up UI space
- Needs permission prompt for camera (in addition to mic)
- Two separate permission prompts may confuse elderly users

---

## Recommended Approach

**Start with Option A + Option D combined:**

1. Add a camera preview panel to the voice chat UI
2. User can toggle camera on/off with a button
3. When camera is active, user can click "Capture" or say "Can you see this?"
4. Browser captures a single frame from the preview
5. Frame is sent to `POST /api/voice/image-capture` for vision LLM analysis
6. Result text is injected into the voice conversation and saved to the database

**Later, add Option B** (agent tool) so the voice agent can trigger captures automatically based on conversation context.

---

## Vision LLM Options

| Provider | Model | Cost per Image | Best For |
|---|---|---|---|
| **OpenAI** | GPT-4o | ~$0.01-0.03 | General vision, already integrated |
| **Google** | Gemini 2.0 Flash | ~$0.005-0.01 | Cheapest, good quality |
| **Anthropic** | Claude Sonnet 4 | ~$0.01-0.03 | Best at structured extraction |

**Recommended:** GPT-4o for MVP since OpenAI is already integrated. Gemini for cost optimization at scale.

## Vision Prompt

```
Analyze this image of a medication. Extract all visible information:

1. Drug name and brand
2. Dosage/strength
3. Frequency/directions
4. Quantity and refills remaining
5. Prescriber name
6. Pharmacy name
7. Any warnings or special instructions

Return the information as structured JSON. If you can't read something clearly, note what's unclear. If this is not a medication-related image, describe what you see.
```

---

## API Endpoint Detail

### `POST /api/voice/image-capture`

**Auth:** Yes

**Request:**
```json
{
  "conversationId": "uuid (optional — to save result to conversation)",
  "imageBase64": "data:image/jpeg;base64,...",
  "prompt": "string (optional — specific question about the image)"
}
```

**Response:**
```json
{
  "description": "Human-readable description of what was seen",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "instructions": "Take by mouth",
      "prescriber": "Dr. Smith",
      "pharmacy": "CVS #1234",
      "refillDate": "2026-03-15",
      "quantity": 30,
      "refillsRemaining": 2
    }
  ],
  "raw": "Full text extracted from the image"
}
```

**Server Implementation:**
```typescript
// 1. Decode base64 image
// 2. Send to vision LLM with extraction prompt
// 3. Parse structured response
// 4. If conversationId provided, save to conversationMessages
// 5. Return structured data
```

---

## Database Changes

**No schema changes required** for basic implementation. The existing `conversationMessages` table can store image analysis results:

```
conversationMessages:
  role: "system"
  content: "Image analysis: I can see a bottle of Lisinopril 10mg..."
  toolName: "image_capture"
  toolArgs: '{"medications": [...]}'  // JSON string
```

**Optional future addition** — if you want to store images or link captured medications directly:

```sql
-- Store captured images
ALTER TABLE conversation_messages ADD COLUMN image_url TEXT;

-- Or create a dedicated table
CREATE TABLE image_captures (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id),
  image_url TEXT NOT NULL,         -- S3/Vercel Blob URL
  description TEXT,
  extracted_medications JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## New Voice Agent Tool (for Option B)

Add to `src/lib/voice/tools.ts`:

```typescript
export const captureImage = tool({
  name: "capture_image",
  description: "Capture and analyze an image from the user's webcam. Call this when the user asks you to look at something they're showing to the camera.",
  parameters: z.object({
    prompt: z.string().optional().describe("What specifically to look for in the image"),
  }),
  execute: async ({ prompt }) => {
    // Dispatches a custom event that voice-chat.tsx listens for
    const event = new CustomEvent("adherepod:capture", { detail: { prompt } });
    window.dispatchEvent(event);

    // Wait for capture result (voice-chat.tsx resolves this)
    return new Promise((resolve) => {
      window.addEventListener("adherepod:capture-result", ((e: CustomEvent) => {
        resolve(e.detail);
      }) as EventListener, { once: true });
    });
  },
});
```

---

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `src/app/api/voice/image-capture/route.ts` | Create | Vision LLM endpoint |
| `src/components/voice-chat.tsx` | Modify | Add camera preview, capture button, event handlers |
| `src/lib/voice/tools.ts` | Modify | Add `capture_image` tool (Option B) |

## Implementation Order

1. Create `/api/voice/image-capture` endpoint with GPT-4o vision
2. Add camera toggle and preview to voice-chat.tsx
3. Add capture button that grabs a frame and sends to endpoint
4. Display extracted info in the transcript
5. Test with various pill bottles and labels
6. Add `capture_image` voice agent tool (Option B)
7. Test agent-driven capture via "Can you see this?"
