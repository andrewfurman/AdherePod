/**
 * Generate AdherePod logo images using Gemini API.
 * Run with: npx tsx scripts/generate-logos.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent`;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: { message: string };
}

async function generateImage(prompt: string): Promise<Buffer> {
  console.log(`  Generating: "${prompt.slice(0, 80)}..."`);

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }

  const json: GeminiResponse = await res.json();

  if (json.error) {
    throw new Error(`Gemini error: ${json.error.message}`);
  }

  const parts = json.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart?.inlineData) {
    console.log(
      "  Response parts:",
      JSON.stringify(
        parts.map((p) => ({ hasText: !!p.text, hasImage: !!p.inlineData })),
        null,
        2
      )
    );
    throw new Error("No image data in Gemini response");
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

const BASE_STYLE =
  "Minimal vector logo design on a pure white background. Clean, modern, professional. Square 1:1 aspect ratio. No text other than what is described. No gradients unless specified.";

async function main() {
  console.log("Generating AdherePod logo images with Gemini...\n");

  const outDir = path.resolve(__dirname, "../public/logos");
  fs.mkdirSync(outDir, { recursive: true });

  const prompts = [
    {
      name: "ap-waveform-pill-1.png",
      prompt: `A horizontal pill capsule shape (rounded rectangle) outlined in dark navy blue. Inside the pill are vertical audio waveform bars in red. The bars on the left side form the shape of the letter "A" — rising to a peak in the center then descending symmetrically, like a mountain. The bars on the right side form the letter "P" — one tall bar on the left as the stem, with shorter bars curving out and back forming the bowl of the P. The letters AP are subtly formed by the waveform pattern. ${BASE_STYLE}`,
    },
    {
      name: "ap-waveform-pill-2.png",
      prompt: `A horizontal pill capsule shape filled with dark navy blue (#0f172a). Inside are audio equalizer bars. The left half has white bars arranged in an ascending-then-descending peak pattern forming the letter "A" with a subtle horizontal crossbar. The right half has red (#ef4444) bars forming the letter "P" — a tall vertical bar with shorter bars making a rounded bump at the top half only. The overall effect is the letters "AP" made from audio waveform bars inside a dark pill shape. ${BASE_STYLE}`,
    },
    {
      name: "ap-waveform-pill-3.png",
      prompt: `A horizontal pill capsule shape filled with red (#ef4444). Inside the pill, white vertical bars on the left form the letter "A" (bars rising to a triangular peak and descending), and dark navy blue vertical bars on the right form the letter "P" (tall stem bar with shorter bars making a bump in the upper half). The waveform bars look like an audio equalizer that spells "AP". Bold, modern medical tech logo. ${BASE_STYLE}`,
    },
  ];

  for (const { name, prompt } of prompts) {
    try {
      const imageData = await generateImage(prompt);
      const filePath = path.join(outDir, name);
      fs.writeFileSync(filePath, imageData);
      console.log(`  Saved: ${filePath}\n`);
    } catch (err) {
      console.error(`  Failed for ${name}:`, err);
    }
  }

  console.log("\nDone! Logo images saved to public/logos/");
}

main().catch(console.error);
