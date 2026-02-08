import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Logo Concepts | AdherePod",
  description: "AdherePod logo design concepts for team review.",
};

const logos = [
  {
    name: "Heart + Pill",
    description:
      "A heart shape with a horizontal pill capsule across the middle.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heart */}
        <path
          d="M60 100 C60 100 15 70 15 42 C15 25 28 15 42 15 C50 15 56 19 60 25 C64 19 70 15 78 15 C92 15 105 25 105 42 C105 70 60 100 60 100Z"
          fill="#ef4444"
        />
        {/* Pill capsule */}
        <rect x="30" y="50" width="60" height="20" rx="10" fill="#0f172a" />
        {/* Pill dividing line */}
        <line
          x1="60"
          y1="50"
          x2="60"
          y2="70"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    name: "Voice Wave Heart",
    description:
      "Heart outline formed by audio waveform bars on each side.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left waveform bars forming heart shape */}
        <rect x="20" y="45" width="6" height="30" rx="3" fill="#ef4444" />
        <rect x="30" y="30" width="6" height="50" rx="3" fill="#ef4444" />
        <rect x="40" y="20" width="6" height="55" rx="3" fill="#ef4444" />
        {/* Right waveform bars forming heart shape */}
        <rect x="74" y="20" width="6" height="55" rx="3" fill="#ef4444" />
        <rect x="84" y="30" width="6" height="50" rx="3" fill="#ef4444" />
        <rect x="94" y="45" width="6" height="30" rx="3" fill="#ef4444" />
        {/* Bottom point of heart */}
        <rect x="50" y="35" width="6" height="55" rx="3" fill="#ef4444" />
        <rect x="64" y="35" width="6" height="55" rx="3" fill="#ef4444" />
        {/* Center bottom converging bar */}
        <rect x="57" y="70" width="6" height="30" rx="3" fill="#ef4444" />
      </svg>
    ),
  },
  {
    name: "Shield + Heart",
    description:
      "A shield outline in dark with a small red heart centered inside.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield */}
        <path
          d="M60 10 L100 28 L100 60 C100 82 80 100 60 110 C40 100 20 82 20 60 L20 28 Z"
          stroke="#0f172a"
          strokeWidth="5"
          fill="none"
        />
        {/* Heart inside */}
        <path
          d="M60 78 C60 78 40 64 40 52 C40 45 45 40 51 40 C55 40 58 42 60 46 C62 42 65 40 69 40 C75 40 80 45 80 52 C80 64 60 78 60 78Z"
          fill="#ef4444"
        />
      </svg>
    ),
  },
  {
    name: "Pod Capsule",
    description:
      'A rounded capsule/pod shape in dark with "AP" monogram inside.',
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Capsule shape */}
        <rect x="20" y="30" width="80" height="60" rx="30" fill="#0f172a" />
        {/* AP monogram */}
        <text
          x="42"
          y="70"
          fontFamily="Arial, sans-serif"
          fontSize="28"
          fontWeight="bold"
          fill="white"
        >
          AP
        </text>
      </svg>
    ),
  },
  {
    name: "Chat Bubble + Pill",
    description:
      "A speech bubble outline with a small pill inside it.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chat bubble */}
        <path
          d="M20 25 H100 C100 25 105 25 105 30 V70 C105 75 100 75 100 75 H45 L30 95 L35 75 H20 C20 75 15 75 15 70 V30 C15 25 20 25 20 25Z"
          stroke="#0f172a"
          strokeWidth="4"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Pill inside */}
        <rect x="38" y="42" width="44" height="18" rx="9" fill="#ef4444" />
        {/* Pill dividing line */}
        <line
          x1="60"
          y1="42"
          x2="60"
          y2="60"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    name: "Sound Rings + Heart",
    description:
      "A small heart in center with concentric sound wave arcs emanating outward.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Concentric arcs */}
        <path
          d="M30 60 A30 30 0 0 1 30 60"
          stroke="none"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#0f172a"
          strokeWidth="3"
          fill="none"
          strokeDasharray="78.5 235.5"
          strokeDashoffset="-39.25"
        />
        <circle
          cx="60"
          cy="60"
          r="40"
          stroke="#0f172a"
          strokeWidth="3"
          fill="none"
          strokeDasharray="62.8 188.5"
          strokeDashoffset="-31.4"
        />
        <circle
          cx="60"
          cy="60"
          r="30"
          stroke="#0f172a"
          strokeWidth="3"
          fill="none"
          strokeDasharray="47.1 141.4"
          strokeDashoffset="-23.55"
        />
        {/* Center heart */}
        <path
          d="M60 72 C60 72 46 62 46 54 C46 49 49 46 53 46 C56 46 58 48 60 51 C62 48 64 46 67 46 C71 46 74 49 74 54 C74 62 60 72 60 72Z"
          fill="#ef4444"
        />
      </svg>
    ),
  },
  {
    name: "Stethoscope Heart",
    description:
      "A simplified stethoscope where the tubing forms a heart shape.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Earpieces */}
        <circle cx="35" cy="15" r="5" fill="#0f172a" />
        <circle cx="85" cy="15" r="5" fill="#0f172a" />
        {/* Tubing forming heart */}
        <path
          d="M35 20 L35 40 C35 55 25 60 25 70 C25 82 35 90 60 105 C85 90 95 82 95 70 C95 60 85 55 85 40 L85 20"
          stroke="#0f172a"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Heart fill at bottom */}
        <path
          d="M40 70 C40 62 45 58 52 58 C56 58 58 60 60 63 C62 60 64 58 68 58 C75 58 80 62 80 70 C80 80 60 92 60 92 C60 92 40 80 40 70Z"
          fill="#ef4444"
        />
        {/* Chest piece */}
        <circle cx="60" cy="105" r="7" stroke="#0f172a" strokeWidth="3" fill="white" />
      </svg>
    ),
  },
  {
    name: "AP Monogram",
    description:
      'Clean "AP" lettermark in a rounded square with a small red heart dot.',
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square background */}
        <rect x="15" y="20" width="90" height="90" rx="18" fill="#0f172a" />
        {/* AP letters */}
        <text
          x="60"
          y="82"
          fontFamily="Arial, sans-serif"
          fontSize="46"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          AP
        </text>
        {/* Red heart dot above */}
        <path
          d="M60 18 C60 18 53 12 53 8 C53 5 55 3 57.5 3 C59 3 59.8 4 60 5 C60.2 4 61 3 62.5 3 C65 3 67 5 67 8 C67 12 60 18 60 18Z"
          fill="#ef4444"
        />
      </svg>
    ),
  },
  {
    name: "Pill + Waveform",
    description:
      "Horizontal pill shape with voice waveform bars inside it.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pill outline */}
        <rect
          x="10"
          y="35"
          width="100"
          height="50"
          rx="25"
          stroke="#0f172a"
          strokeWidth="4"
          fill="none"
        />
        {/* Waveform bars */}
        <rect x="30" y="50" width="5" height="20" rx="2.5" fill="#ef4444" />
        <rect x="40" y="43" width="5" height="34" rx="2.5" fill="#ef4444" />
        <rect x="50" y="47" width="5" height="26" rx="2.5" fill="#ef4444" />
        <rect x="60" y="40" width="5" height="40" rx="2.5" fill="#ef4444" />
        <rect x="70" y="45" width="5" height="30" rx="2.5" fill="#ef4444" />
        <rect x="80" y="48" width="5" height="24" rx="2.5" fill="#ef4444" />
      </svg>
    ),
  },
  {
    name: "Pill + AP Waveform v1",
    description:
      'Pill shape with waveform bars shaped to subtly form "AP" letters. The A is a tall peak, the P a rounded bump.',
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pill outline */}
        <rect
          x="10"
          y="35"
          width="100"
          height="50"
          rx="25"
          stroke="#0f172a"
          strokeWidth="4"
          fill="none"
        />
        {/* "A" waveform — two rising bars with a crossbar bar */}
        <rect x="28" y="52" width="4" height="18" rx="2" fill="#ef4444" />
        <rect x="34" y="42" width="4" height="28" rx="2" fill="#ef4444" />
        <rect x="40" y="38" width="4" height="32" rx="2" fill="#ef4444" />
        <rect x="46" y="42" width="4" height="28" rx="2" fill="#ef4444" />
        <rect x="52" y="52" width="4" height="18" rx="2" fill="#ef4444" />
        {/* A crossbar — short middle bar */}
        <rect x="34" y="53" width="16" height="3" rx="1" fill="#ef4444" opacity="0.6" />
        {/* "P" waveform — tall bar then rounded bump */}
        <rect x="62" y="40" width="4" height="30" rx="2" fill="#ef4444" />
        <rect x="68" y="42" width="4" height="20" rx="2" fill="#ef4444" />
        <rect x="74" y="44" width="4" height="16" rx="2" fill="#ef4444" />
        <rect x="80" y="42" width="4" height="20" rx="2" fill="#ef4444" />
        <rect x="86" y="50" width="4" height="20" rx="2" fill="#ef4444" />
      </svg>
    ),
  },
  {
    name: "Pill + AP Waveform v2",
    description:
      'Pill with continuous waveform line that traces the shapes of "A" and "P" letters.',
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pill outline */}
        <rect
          x="10"
          y="35"
          width="100"
          height="50"
          rx="25"
          stroke="#0f172a"
          strokeWidth="4"
          fill="none"
        />
        {/* Continuous AP waveform line */}
        <polyline
          points="24,68 30,68 36,56 42,40 48,56 54,68 54,56 60,68 66,44 66,68 72,44 78,52 84,52 90,44 90,68 96,68"
          stroke="#ef4444"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Pill + AP Waveform v3",
    description:
      'Dark filled pill with white/red waveform bars forming a stylized "AP" — bold and punchy.',
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pill filled */}
        <rect
          x="10"
          y="35"
          width="100"
          height="50"
          rx="25"
          fill="#0f172a"
        />
        {/* "A" bars — peak shape */}
        <rect x="26" y="62" width="5" height="10" rx="2" fill="#ef4444" />
        <rect x="33" y="54" width="5" height="18" rx="2" fill="#ef4444" />
        <rect x="40" y="42" width="5" height="30" rx="2" fill="#ef4444" />
        <rect x="47" y="54" width="5" height="18" rx="2" fill="#ef4444" />
        <rect x="54" y="62" width="5" height="10" rx="2" fill="#ef4444" />
        {/* "P" bars — tall then rounded hump */}
        <rect x="64" y="42" width="5" height="30" rx="2" fill="white" />
        <rect x="71" y="44" width="5" height="18" rx="2" fill="white" />
        <rect x="78" y="48" width="5" height="14" rx="2" fill="white" />
        <rect x="85" y="44" width="5" height="18" rx="2" fill="white" />
        <rect x="92" y="55" width="5" height="17" rx="2" fill="white" />
      </svg>
    ),
  },
  {
    name: "Heart Pulse + Mic",
    description:
      "Heart shape with an ECG pulse line running through it, mic at the bottom.",
    svg: (
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heart */}
        <path
          d="M60 90 C60 90 20 62 20 38 C20 22 32 14 44 14 C52 14 57 18 60 24 C63 18 68 14 76 14 C88 14 100 22 100 38 C100 62 60 90 60 90Z"
          fill="#ef4444"
          opacity="0.2"
        />
        <path
          d="M60 90 C60 90 20 62 20 38 C20 22 32 14 44 14 C52 14 57 18 60 24 C63 18 68 14 76 14 C88 14 100 22 100 38 C100 62 60 90 60 90Z"
          stroke="#ef4444"
          strokeWidth="3"
          fill="none"
        />
        {/* ECG pulse line */}
        <polyline
          points="15,52 35,52 42,52 48,35 54,65 60,30 66,60 72,45 78,52 100,52"
          stroke="#0f172a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Microphone */}
        <rect x="55" y="96" width="10" height="14" rx="5" stroke="#0f172a" strokeWidth="2.5" fill="none" />
        <path
          d="M50 106 C50 112 54 116 60 116 C66 116 70 112 70 106"
          stroke="#0f172a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <line x1="60" y1="116" x2="60" y2="120" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function LogosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold">AdherePod</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-16 px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-4">Logo Concepts</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          13 logo design concepts for AdherePod. Each logo uses our brand colors
          and can be exported as SVG. Includes 3 variations of the Pill + AP Waveform concept.
        </p>
      </section>

      {/* Logo Grid */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="border border-border rounded-xl p-8 text-center bg-white"
            >
              <div className="flex justify-center mb-6">{logo.svg}</div>
              <h3 className="font-semibold text-lg mb-2">{logo.name}</h3>
              <p className="text-sm text-muted-foreground">
                {logo.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Home
        </Link>
        <p className="text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} AdherePod. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
