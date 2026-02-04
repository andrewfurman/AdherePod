"use client";

type BotState = "idle" | "listening" | "speaking";

export default function VoiceBot({ state }: { state: BotState }) {
  return (
    <div className="flex items-center justify-center py-3">
      <div className={`relative ${state === "speaking" ? "animate-bot-bounce" : ""}`}>
        {/* Pulse ring when listening */}
        {state === "listening" && (
          <div className="absolute inset-0 -m-3 rounded-full border-2 border-primary/40 animate-ping" />
        )}

        {/* Glow behind bot */}
        <div
          className={`absolute inset-0 -m-1 rounded-full blur-md transition-colors duration-500 ${
            state === "speaking"
              ? "bg-primary/30"
              : state === "listening"
                ? "bg-blue-400/20"
                : "bg-muted/40"
          }`}
        />

        {/* Bot face */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          className="relative"
        >
          {/* Antenna */}
          <line
            x1="36"
            y1="8"
            x2="36"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          />
          <circle
            cx="36"
            cy="6"
            r="3"
            className={`transition-colors duration-300 ${
              state === "speaking"
                ? "fill-primary animate-pulse"
                : state === "listening"
                  ? "fill-blue-400 animate-pulse"
                  : "fill-muted-foreground"
            }`}
          />

          {/* Head */}
          <rect
            x="12"
            y="16"
            width="48"
            height="40"
            rx="12"
            className="fill-muted stroke-border"
            strokeWidth="1.5"
          />

          {/* Eyes */}
          <circle
            cx="27"
            cy="34"
            r={state === "listening" ? 6 : 5}
            className={`transition-all duration-300 ${
              state === "speaking" ? "fill-primary" : "fill-foreground"
            }`}
          />
          <circle
            cx="45"
            cy="34"
            r={state === "listening" ? 6 : 5}
            className={`transition-all duration-300 ${
              state === "speaking" ? "fill-primary" : "fill-foreground"
            }`}
          />

          {/* Eye highlights */}
          <circle cx="29" cy="32" r="1.5" className="fill-background" />
          <circle cx="47" cy="32" r="1.5" className="fill-background" />

          {/* Mouth */}
          {state === "speaking" ? (
            <rect
              x="28"
              y="44"
              width="16"
              height="6"
              rx="3"
              className="fill-primary animate-mouth"
            />
          ) : state === "listening" ? (
            <circle cx="36" cy="47" r="3" className="fill-foreground/60" />
          ) : (
            <line
              x1="28"
              y1="47"
              x2="44"
              y2="47"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-foreground/60"
            />
          )}

          {/* Ears */}
          <rect
            x="6"
            y="28"
            width="6"
            height="12"
            rx="3"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
          <rect
            x="60"
            y="28"
            width="6"
            height="12"
            rx="3"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Status text */}
      <div className="ml-3">
        <p className="text-sm font-medium">
          {state === "speaking"
            ? "AdherePod is talking..."
            : state === "listening"
              ? "Listening..."
              : "Ready to chat"}
        </p>
        <p className="text-xs text-muted-foreground">
          {state === "speaking"
            ? "I'm responding to you"
            : state === "listening"
              ? "Go ahead, I'm here"
              : "Press the button to start"}
        </p>
      </div>

      <style jsx>{`
        @keyframes bot-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes mouth-move {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
        .animate-bot-bounce {
          animation: bot-bounce 0.6s ease-in-out infinite;
        }
        .animate-mouth {
          animation: mouth-move 0.3s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
