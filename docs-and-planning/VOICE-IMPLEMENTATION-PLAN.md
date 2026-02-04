# Voice Agent Implementation Plan

Implement OpenAI Realtime voice chat using the OpenAI Agents SDK (`@openai/agents`).

## Approach

Use `RealtimeAgent` and `RealtimeSession` from `@openai/agents/realtime`. The browser connects to OpenAI via WebRTC. A server-side API route generates ephemeral keys so the real API key stays secret.

## Files to Create

### 1. `src/app/api/voice/session/route.ts` -- Ephemeral Key Endpoint

Authenticated POST route that generates a short-lived OpenAI client secret.

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: "gpt-4o-mini-realtime-preview",
      },
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

### 2. `src/lib/voice/tools.ts` -- Tool Definitions

Define tools that the voice agent can call mid-conversation. These call the existing `/api/medications` endpoints.

```typescript
import { tool } from "@openai/agents";
import { z } from "zod";

export const listMedications = tool({
  name: "list_medications",
  description: "List all of the user's current medications",
  parameters: z.object({}),
  execute: async () => {
    const res = await fetch("/api/medications");
    return res.json();
  },
});

export const addMedication = tool({
  name: "add_medication",
  description: "Add a new medication for the user",
  parameters: z.object({
    name: z.string().describe("Medication name and dosage, e.g. 'Lisinopril 10mg'"),
    timesPerDay: z.number().describe("How many times per day to take it"),
    timingDescription: z.string().optional().describe("When to take it, e.g. 'before meals'"),
    startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().optional().describe("End date in YYYY-MM-DD format, omit if ongoing"),
    notes: z.string().optional().describe("Any additional notes"),
  }),
  execute: async (params) => {
    const res = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return res.json();
  },
});

export const editMedication = tool({
  name: "edit_medication",
  description: "Update an existing medication",
  parameters: z.object({
    id: z.string().describe("The medication ID to update"),
    name: z.string().optional(),
    timesPerDay: z.number().optional(),
    timingDescription: z.string().optional(),
    endDate: z.string().optional(),
    notes: z.string().optional(),
  }),
  execute: async (params) => {
    const res = await fetch("/api/medications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return res.json();
  },
});

export const deleteMedication = tool({
  name: "delete_medication",
  description: "Delete a medication from the user's list",
  parameters: z.object({
    id: z.string().describe("The medication ID to delete"),
  }),
  execute: async ({ id }) => {
    const res = await fetch(`/api/medications?id=${id}`, { method: "DELETE" });
    return res.json();
  },
});
```

### 3. `src/components/voice-chat.tsx` -- Voice Chat Component

Client component using `RealtimeAgent` and `RealtimeSession`.

```typescript
"use client";

import { useState, useCallback } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
import { listMedications, addMedication, editMedication, deleteMedication } from "@/lib/voice/tools";

// Create the agent (defined once, outside the component)
const agent = new RealtimeAgent({
  name: "AdherePod",
  instructions: `You are AdherePod, a friendly medication assistant for elderly users.
Speak slowly and clearly. Use simple words. Confirm actions before and after.
You can list, add, edit, and delete medications using your tools.
Always start by asking how you can help with their medications today.
When adding a medication, use today's date as the start date unless told otherwise.`,
  tools: [listMedications, addMedication, editMedication, deleteMedication],
});

export default function VoiceChat() {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // 1. Get ephemeral key from server
      const res = await fetch("/api/voice/session", { method: "POST" });
      const data = await res.json();

      // 2. Create session and connect
      const newSession = new RealtimeSession(agent, {
        model: "gpt-4o-mini-realtime-preview",
      });

      // 3. Listen for transcript events
      newSession.on("event", (event) => {
        // User's speech transcribed
        if (event.type === "conversation.item.input_audio_transcription.completed") {
          setTranscript(prev => [...prev, { role: "user", text: event.transcript }]);
        }
        // Agent's response text
        if (event.type === "response.output_audio_transcript.done") {
          setTranscript(prev => [...prev, { role: "agent", text: event.transcript }]);
        }
      });

      await newSession.connect({ apiKey: data.value });
      setSession(newSession);
      setIsConnected(true);
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    session?.close();
    setSession(null);
    setIsConnected(false);
  }, [session]);

  return (
    <div>
      {/* Connect/Disconnect button */}
      {/* Transcript display */}
      {/* Status indicator */}
    </div>
  );
}
```

### 4. Update `src/app/dashboard/page.tsx`

Add a "Talk to AdherePod" button that shows the `VoiceChat` component.

## Files to Modify

| File | Change |
|---|---|
| `src/app/dashboard/page.tsx` | Add voice chat button and embed `<VoiceChat />` component |
| `src/middleware.ts` | No change needed -- `/api/voice/session` is already protected |
| `package.json` | Add `@openai/agents` and `zod` dependencies |

## Dependencies to Install

```bash
cd app
npm install @openai/agents zod
```

## Environment Variables

Add to `.env.local`:

```
OPENAI_API_KEY=sk-proj-...
```

## Implementation Order

1. Install `@openai/agents` and `zod`
2. Add `OPENAI_API_KEY` to `.env.local` (if not already there)
3. Create `/api/voice/session/route.ts` (ephemeral key endpoint)
4. Create `/lib/voice/tools.ts` (tool definitions)
5. Create `/components/voice-chat.tsx` (voice chat UI component)
6. Update dashboard page to include voice chat
7. Test locally -- verify mic access, transcription, and function calling
8. Run Playwright tests to ensure nothing is broken
9. Commit and push to deploy

## Voice Agent System Prompt

```
You are AdherePod, a friendly and patient medication assistant.
You help elderly users manage their medications through voice conversation.

Guidelines:
- Speak slowly and clearly
- Use simple, everyday words
- Confirm what the user said before taking action
- After adding/editing/deleting, confirm what was done
- If unsure about a medication name, spell it out and ask for confirmation
- Use today's date as the start date unless the user specifies otherwise
- Always offer to help with anything else after completing an action

Available actions:
- List all medications
- Add a new medication (name, times per day, timing, start date)
- Edit an existing medication
- Delete a medication
```

## Verification

1. Click "Talk to AdherePod" on dashboard -- should request mic access
2. Say "What medications do I have?" -- should call `list_medications` tool and read them back
3. Say "Add Lisinopril 10mg, twice a day" -- should call `add_medication` and confirm
4. Check dashboard medications list -- new med should appear
5. Say "Delete Lisinopril" -- should call `delete_medication` and confirm
6. Verify transcript shows both sides of the conversation in real-time
7. Run Playwright tests to ensure existing auth/dashboard tests still pass
8. Deploy and test on production
