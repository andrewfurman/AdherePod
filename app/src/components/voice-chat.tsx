"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import {
  listMedications,
  addMedication,
  editMedication,
  deleteMedication,
} from "@/lib/voice/tools";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
}

const agent = new RealtimeAgent({
  name: "AdherePod",
  instructions: `You are AdherePod, a friendly and patient medication assistant.
You help elderly users manage their medications through voice conversation.

Guidelines:
- Speak slowly and clearly
- Use simple, everyday words
- Confirm what the user said before taking action
- After adding, editing, or deleting a medication, confirm what was done
- If unsure about a medication name, spell it out and ask for confirmation
- Use today's date as the start date unless the user specifies otherwise
- Always offer to help with anything else after completing an action
- When listing medications, read each one clearly with its dosage and frequency

Available actions:
- List all medications
- Add a new medication (name, times per day, timing, start date)
- Edit an existing medication
- Delete a medication`,
  tools: [listMedications, addMedication, editMedication, deleteMedication],
});

export default function VoiceChat({
  onMedicationsChanged,
}: {
  onMedicationsChanged?: () => void;
}) {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState("");
  const conversationIdRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const saveMessage = useCallback(
    async (role: string, content: string) => {
      if (!conversationIdRef.current) return;
      try {
        await fetch("/api/voice/conversations/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationIdRef.current,
            role,
            content,
          }),
        });
      } catch {
        // don't block the conversation for a failed save
      }
    },
    []
  );

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError("");
    setTranscript([]);

    try {
      // Create conversation record
      const convRes = await fetch("/api/voice/conversations", {
        method: "POST",
      });
      if (!convRes.ok) throw new Error("Failed to create conversation");
      const conv = await convRes.json();
      conversationIdRef.current = conv.id;

      // Get ephemeral key
      const keyRes = await fetch("/api/voice/session", { method: "POST" });
      if (!keyRes.ok) throw new Error("Failed to get voice session");
      const keyData = await keyRes.json();

      // Create session
      const newSession = new RealtimeSession(agent, {
        model: "gpt-4o-mini-realtime-preview",
      });

      // User's speech transcribed via transport events
      newSession.on("transport_event", (event) => {
        if (
          event.type ===
          "conversation.item.input_audio_transcription.completed"
        ) {
          const text = event.transcript as string;
          if (text?.trim()) {
            setTranscript((prev) => [...prev, { role: "user", text }]);
            saveMessage("user", text);
          }
        }
      });

      // Agent's response text
      newSession.on("agent_end", (_ctx, _agent, output) => {
        if (output?.trim()) {
          setTranscript((prev) => [
            ...prev,
            { role: "agent", text: output },
          ]);
          saveMessage("agent", output);
        }
      });

      // Refresh medications after any tool call
      newSession.on("agent_tool_end", () => {
        onMedicationsChanged?.();
      });

      await newSession.connect({ apiKey: keyData.value });
      setSession(newSession);
      setIsConnected(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect"
      );
    } finally {
      setIsConnecting(false);
    }
  }, [saveMessage, onMedicationsChanged]);

  const disconnect = useCallback(async () => {
    session?.close();
    setSession(null);
    setIsConnected(false);

    // Mark conversation as ended
    if (conversationIdRef.current) {
      try {
        await fetch("/api/voice/conversations/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationIdRef.current,
          }),
        });
      } catch {
        // silently fail
      }
      conversationIdRef.current = null;
    }
  }, [session]);

  return (
    <Card className="flex flex-col min-h-0">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="h-6 w-6 text-primary" />
            <CardTitle>Voice Assistant</CardTitle>
            {isConnected && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live
              </span>
            )}
          </div>
          {!isConnected ? (
            <Button
              size="sm"
              onClick={connect}
              disabled={isConnecting}
              className="w-44 justify-start"
            >
              <Phone className="h-4 w-4 mr-2 shrink-0" />
              {isConnecting ? "Connecting..." : "Talk to AdherePod"}
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={disconnect} className="w-44 justify-start">
              <PhoneOff className="h-4 w-4 mr-2 shrink-0" />
              End Call
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col">
        {/* Transcript box — fills available space, scrolls internally */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3 bg-muted/50 rounded-lg">
          {!isConnected && transcript.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Press &quot;Talk to AdherePod&quot; to start a voice conversation.
            </p>
          )}
          {isConnected && transcript.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Listening... Say something to get started.
            </p>
          )}
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  entry.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border"
                }`}
              >
                <p className="font-medium text-xs mb-1 opacity-70">
                  {entry.role === "user" ? "You" : "AdherePod"}
                </p>
                {entry.text}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Status bar */}
        {error && (
          <p className="shrink-0 pt-2 text-sm text-destructive">{error}</p>
        )}
        {isConnected && (
          <div className="shrink-0 pt-3 flex items-center justify-center gap-2">
            <MicOff className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Microphone is active. Speak naturally.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
