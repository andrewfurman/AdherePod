"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Phone, PhoneOff, Camera, SwitchCamera } from "lucide-react";
import {
  listMedications,
  addMedication,
  editMedication,
  deleteMedication,
  toggleReminder,
  setReminderTimes,
  checkCamera,
} from "@/lib/voice/tools";
import VoiceBot from "@/components/voice-bot";

interface TranscriptEntry {
  role: "user" | "agent" | "image" | "camera";
  text: string;
}

const agent = new RealtimeAgent({
  name: "AdherePod",
  instructions: `You are AdherePod. Think of yourself like a patient, easygoing neighbor who happens to know a lot about medications.

Greeting:
"Hey there! I'm AdherePod. I can help with your medications. What's on your mind?"
Keep the greeting to 1-2 sentences. Warm and casual.

Core capabilities:
- List and review the user's current medications
- Add new medications to their list
- Update existing medications (dosage changes, timing changes)
- Delete medications they no longer take
- Answer questions about medications, drug interactions, side effects
- Read prescriptions or pill bottles held up to the camera

Guidelines:
- Speak slowly and clearly, using simple everyday words
- Confirm what the user said before taking action
- After any change, briefly confirm what was done
- If unsure about a medication name, spell it out and ask for confirmation
- Use today's date as the start date unless the user specifies otherwise
- When listing medications, read each one clearly with dosage, frequency, and timing
- If the user pauses, wait. Don't rush them or fill silence.
- Keep responses concise. Don't ramble or over-explain.

Camera and vision:
- The user's camera is active. You may occasionally receive a [Camera: ...] message describing what the camera sees.
- These messages ONLY appear when something medically relevant is detected (pill bottle, prescription label, skin condition, etc.).
- When you receive a [Camera: ...] message: give a VERY brief acknowledgment (3-5 words max, like "I see the Lisinopril" or "Got that prescription"), then STOP and wait for the user. Do NOT launch into a long explanation unprompted.
- If the user then asks about what you saw, go into detail.
- If something is partially obscured, ask them to hold it closer.
- IMPORTANT — when the user asks "can you see me?", "what do you see?", "can you see this?", or anything about looking at them or their camera: ALWAYS call the check_camera tool FIRST. Say something casual like "One sec, let me take a look..." while calling the tool, then describe what you see based on the result. NEVER say "I can't see anything" without checking first.

Updating medications from prescriptions:
- When a prescription or camera capture mentions a medication the user ALREADY has on their list (even at a different dosage), use edit_medication to UPDATE the existing one. Do NOT add a duplicate.
- For example: if the user has "Metformin 500mg" and a prescription says "Metformin 1000mg (increased from 500mg)", update the existing Metformin entry to 1000mg. Don't add a second Metformin.
- Only use add_medication for medications that are completely new (not already on the list in any form).
- When processing a prescription with multiple items, first call list_medications to check what already exists, then update existing ones and add only truly new ones.

Drug interaction and health questions:
- Give clear, practical advice in plain language
- Mention common things to watch out for
- Remind them you're an assistant, not a replacement for their doctor

Email reminders:
- You can turn on/off email reminders for any medication using toggle_reminder
- You can set specific reminder times using set_reminder_times (use HH:mm format like "08:00")
- When a user says something like "remind me to take X at 8am", first list their meds to find the ID, then call toggle_reminder with enabled=true and the requested times
- If they say "turn off reminders for X", call toggle_reminder with enabled=false
- Default reminder times: 1x/day→08:00, 2x/day→08:00+20:00, 3x/day→08:00+14:00+20:00`,
  tools: [listMedications, addMedication, editMedication, deleteMedication, toggleReminder, setReminderTimes, checkCamera],
});

const AUTO_CAPTURE_INTERVAL_MS = 5_000;

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
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const conversationIdRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastDescriptionRef = useRef<string>("");
  const sessionRef = useRef<RealtimeSession | null>(null);
  const facingModeRef = useRef<"environment" | "user">("environment");

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

  const startCamera = useCallback(async (mode?: "environment" | "user") => {
    const useFacing = mode ?? facingModeRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: useFacing, width: 640, height: 480 },
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

  const flipCamera = useCallback(async () => {
    const newMode = facingModeRef.current === "environment" ? "user" : "environment";
    facingModeRef.current = newMode;
    setFacingMode(newMode);
    // Stop current stream and restart with new facing mode
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    await startCamera(newMode);
  }, [startCamera]);

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

  const processCapture = useCallback(async () => {
    if (isCapturing || !conversationIdRef.current) return;

    const imageBase64 = captureFrame();
    if (!imageBase64) return;

    setIsCapturing(true);

    try {
      // Single call: describe + upload + save to DB
      console.log("[Camera] Capturing frame...");
      const res = await fetch("/api/voice/image-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          conversationId: conversationIdRef.current,
          mode: "describe",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("[Camera] API error:", res.status, body.error, body.detail);
        return;
      }
      const { description, hasMedicalContent } = await res.json();
      console.log("[Camera] Description:", description, "| Medical:", hasMedicalContent);

      // Deduplicate — skip if description is exactly the same as last one
      if (description === lastDescriptionRef.current) {
        console.log("[Camera] Skipped (duplicate)");
        return;
      }
      lastDescriptionRef.current = description;

      // Always save to DB (for check_camera tool to query)
      saveMessage("camera", `[Camera: ${description}]`);

      // Only inject medical content into agent — routine frames stay silent
      if (hasMedicalContent) {
        const currentSession = sessionRef.current;
        if (currentSession) {
          currentSession.sendMessage(`[Camera: ${description}]`);
        }
      }

      // Always show description in transcript for debugging
      // Medical content gets the prominent yellow card; routine gets tiny text
      if (hasMedicalContent) {
        setTranscript((prev) => [
          ...prev,
          {
            role: "image",
            text: `📷 ${description}`,
          },
        ]);
      } else {
        setTranscript((prev) => [
          ...prev,
          {
            role: "camera",
            text: description,
          },
        ]);
      }
    } catch {
      // Don't interrupt the conversation for a failed capture
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, captureFrame, saveMessage]);

  const startAutoCapture = useCallback(() => {
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    captureIntervalRef.current = setInterval(() => {
      processCapture();
    }, AUTO_CAPTURE_INTERVAL_MS);
  }, [processCapture]);

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
      sessionRef.current = newSession;
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
    sessionRef.current = null;
    setIsConnected(false);
    setBotState("idle");
    stopCamera();
    lastDescriptionRef.current = "";

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
              className="w-auto sm:w-44 justify-start"
            >
              <Phone className="h-4 w-4 mr-2 shrink-0" />
              <span className="hidden sm:inline">{isConnecting ? "Connecting..." : "Talk to AdherePod"}</span>
              <span className="sm:hidden">{isConnecting ? "..." : "Talk"}</span>
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={disconnect} className="w-auto sm:w-44 justify-start">
              <PhoneOff className="h-4 w-4 mr-2 shrink-0" />
              <span className="hidden sm:inline">End Call</span>
              <span className="sm:hidden">End</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col gap-3">
        {/* Bot + Camera side by side — responsive height */}
        <div className="shrink-0 h-32 sm:h-40 flex items-stretch gap-4">
          {/* Bot on left */}
          <div className="flex-1 flex items-center justify-center rounded-lg border border-border bg-muted/30">
            <VoiceBot state={botState} />
          </div>

          {/* Camera preview on right */}
          <div className="flex-1 flex flex-col rounded-lg overflow-hidden border border-border bg-muted/30">
            {isConnected && cameraActive ? (
              <>
                <div className="relative flex-1 min-h-0">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Flip camera button */}
                  <button
                    onClick={flipCamera}
                    className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                    aria-label="Flip camera"
                  >
                    <SwitchCamera className="h-4 w-4" />
                  </button>
                </div>
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
            if (entry.role === "camera") {
              return (
                <div key={i} className="flex justify-center">
                  <p className="text-[9px] text-muted-foreground/50 leading-tight truncate max-w-[90%]">
                    👁 {entry.text}
                  </p>
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
