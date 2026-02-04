"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Phone, PhoneOff, Camera } from "lucide-react";
import {
  listMedications,
  addMedication,
  editMedication,
  deleteMedication,
} from "@/lib/voice/tools";
import VoiceBot from "@/components/voice-bot";

interface TranscriptEntry {
  role: "user" | "agent" | "image";
  text: string;
}

const agent = new RealtimeAgent({
  name: "AdherePod",
  instructions: `You are AdherePod, a friendly and patient medication assistant.
You help elderly users manage their medications through voice conversation.
The user has a webcam active and the system is automatically scanning for medications every 10 seconds.

When you first connect, greet the user warmly and let them know:
- You can see them through their camera
- They can hold up any pill bottles, prescription labels, or pillboxes to the camera
- You'll automatically read and identify their medications from the image
- They can also just tell you about their medications by voice

Guidelines:
- Speak slowly and clearly
- Use simple, everyday words
- Confirm what the user said before taking action
- After adding, editing, or deleting a medication, confirm what was done
- If unsure about a medication name, spell it out and ask for confirmation
- Use today's date as the start date unless the user specifies otherwise
- Always offer to help with anything else after completing an action
- When listing medications, read each one clearly with its dosage and frequency
- When image analysis results appear in the conversation (marked with a camera icon), discuss what was found. Read back the medication name, dosage, and instructions to the user and ask if they'd like to add it to their list.
- Encourage the user to show you their pill bottles if they haven't already

Available actions:
- List all medications
- Add a new medication (name, times per day, timing, start date)
- Edit an existing medication
- Delete a medication`,
  tools: [listMedications, addMedication, editMedication, deleteMedication],
});

const AUTO_CAPTURE_INTERVAL_MS = 10_000;

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
  const [botState, setBotState] = useState<"idle" | "listening" | "speaking">("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastExtractionRef = useRef<string>("");

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    };
  }, []);

  // Attach stream to video element when it becomes available
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      // Camera not available — continue without it
      console.warn("Camera not available");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  const processCapture = useCallback(async () => {
    if (isCapturing || !conversationIdRef.current) return;

    const imageBase64 = captureFrame();
    if (!imageBase64) return;

    setIsCapturing(true);

    try {
      // Step 1: Triage — is there anything medically relevant?
      const triageRes = await fetch("/api/voice/image-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          conversationId: conversationIdRef.current,
          mode: "triage",
        }),
      });

      if (!triageRes.ok) return;
      const { hasMedication } = await triageRes.json();

      if (!hasMedication) return;

      // Step 2: Full extraction
      const extractRes = await fetch("/api/voice/image-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          conversationId: conversationIdRef.current,
          mode: "extract",
        }),
      });

      if (!extractRes.ok) return;
      const result = await extractRes.json();

      // Step 3: Deduplication — skip if same as last extraction
      const extractionKey = result.medications || result.description;
      if (extractionKey === lastExtractionRef.current) return;
      lastExtractionRef.current = extractionKey;

      // Step 4: Add to transcript
      setTranscript((prev) => [
        ...prev,
        {
          role: "image",
          text: `📷 ${result.description}${result.medications ? `\nMedications: ${result.medications}` : ""}`,
        },
      ]);
    } catch {
      // Don't interrupt the conversation for a failed capture
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, captureFrame]);

  const startAutoCapture = useCallback(() => {
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    captureIntervalRef.current = setInterval(() => {
      processCapture();
    }, AUTO_CAPTURE_INTERVAL_MS);
  }, [processCapture]);

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
    setBotState("idle");

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
            setBotState("listening");
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
          setBotState("listening");
        }
      });

      // Track when agent is speaking
      newSession.on("transport_event", (event) => {
        if (event.type === "response.audio.delta") {
          setBotState("speaking");
        }
        if (event.type === "response.audio.done") {
          setBotState("listening");
        }
      });

      // Refresh medications after any tool call
      newSession.on("agent_tool_end", () => {
        onMedicationsChanged?.();
      });

      await newSession.connect({ apiKey: keyData.value });
      setSession(newSession);
      setIsConnected(true);
      setBotState("listening");

      // Start camera automatically
      await startCamera();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect"
      );
    } finally {
      setIsConnecting(false);
    }
  }, [saveMessage, onMedicationsChanged, startCamera]);

  // Start auto-capture when camera becomes active during a connected session
  useEffect(() => {
    if (isConnected && cameraActive) {
      startAutoCapture();
    }
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [isConnected, cameraActive, startAutoCapture]);

  const disconnect = useCallback(async () => {
    session?.close();
    setSession(null);
    setIsConnected(false);
    setBotState("idle");
    stopCamera();
    lastExtractionRef.current = "";

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
  }, [session, stopCamera]);

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
      <CardContent className="flex-1 min-h-0 flex flex-col gap-3">
        {/* Bot + Camera side by side */}
        <div className="shrink-0 flex items-stretch gap-4">
          {/* Bot on left */}
          <div className="flex-1 flex items-center justify-center rounded-lg border border-border bg-muted/30 py-3">
            <VoiceBot state={botState} />
          </div>

          {/* Camera preview on right */}
          <div className="flex-1 flex flex-col rounded-lg overflow-hidden border border-border bg-muted/30">
            {isConnected && cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="flex-1 w-full object-cover"
                />
                <div className="shrink-0 px-2 py-1 flex items-center justify-center gap-1.5 bg-muted/50">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Camera Live
                    {isCapturing && (
                      <span className="text-amber-600 dark:text-amber-400 ml-1">analyzing...</span>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Placeholder: person silhouette + pill bottle */}
                <div className="flex-1 flex items-center justify-center bg-muted">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    className="text-muted-foreground/30"
                    fill="currentColor"
                  >
                    {/* Person silhouette (head + shoulders) */}
                    <circle cx="26" cy="18" r="8" />
                    <path d="M10 52 C10 38 14 32 26 32 C38 32 42 38 42 52 Z" />
                    {/* Pill bottle */}
                    <rect x="46" y="24" width="10" height="18" rx="2" opacity="0.6" />
                    <rect x="44" y="22" width="14" height="5" rx="1.5" opacity="0.4" />
                    {/* Pill cap highlight */}
                    <rect x="48" y="30" width="6" height="1.5" rx="0.75" className="fill-background" opacity="0.4" />
                    <rect x="48" y="34" width="6" height="1.5" rx="0.75" className="fill-background" opacity="0.4" />
                  </svg>
                </div>
                <div className="shrink-0 px-2 py-1 bg-muted/50">
                  <p className="text-[10px] text-muted-foreground text-center">
                    {isConnected ? "Starting camera..." : "Camera starts on call"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transcript box */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3 bg-muted/50 rounded-lg">
          {!isConnected && transcript.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Press &quot;Talk to AdherePod&quot; to start a voice conversation.
            </p>
          )}
          {isConnected && transcript.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Listening... Say something to get started.
            </p>
          )}
          {transcript.map((entry, i) => {
            if (entry.role === "image") {
              return (
                <div key={i} className="flex justify-center">
                  <div className="max-w-[90%] rounded-lg px-2.5 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <p className="font-medium text-xs mb-1 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      Image Detected
                    </p>
                    <span className="whitespace-pre-line">{entry.text}</span>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={i}
                className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs ${
                    entry.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border"
                  }`}
                >
                  <p className="font-medium text-[10px] mb-0.5 opacity-70">
                    {entry.role === "user" ? "You" : "AdherePod"}
                  </p>
                  {entry.text}
                </div>
              </div>
            );
          })}
          <div ref={transcriptEndRef} />
        </div>

        {/* Status bar */}
        {error && (
          <p className="shrink-0 text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
