/**
 * Generate OG images for social sharing using Gemini API.
 * Run with: npx tsx scripts/generate-og-images.ts
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
  "Photorealistic photograph, warm golden morning light streaming through a kitchen window, shallow depth of field, soft bokeh background with plants on the windowsill, cozy home setting. 16:9 landscape aspect ratio.";

async function main() {
  console.log("Generating OG images with Gemini...\n");

  const outDir = path.resolve(__dirname, "../public/og");
  fs.mkdirSync(outDir, { recursive: true });

  const prompts = [
    {
      name: "og-privacy.png",
      prompt: `A smiling elderly woman with short white hair sitting at a wooden kitchen table, holding a cup of coffee. On the table in front of her is a small silver padlock next to her prescription medication bottles. She looks calm and reassured. ${BASE_STYLE}`,
    },
    {
      name: "og-security.png",
      prompt: `A smiling elderly man with gray hair sitting at a wooden kitchen table in a warm, sunlit kitchen, holding a coffee mug. On the table are his prescription medication bottles and a small laptop showing a green shield icon. He looks comfortable and safe. ${BASE_STYLE}`,
    },
    {
      name: "og-medicare.png",
      prompt: `A smiling elderly woman with short white hair sitting at a wooden kitchen table, looking at a friendly doctor in a white coat who is visiting her at home. On the table are prescription medication bottles and a coffee mug. The atmosphere is warm and caring. ${BASE_STYLE}`,
    },
    {
      name: "og-device.png",
      prompt: `A smiling elderly woman with short white hair sitting at a wooden kitchen table, reaching toward a white tablet device propped up on the table. Next to it are her prescription medication bottles and a glass of water. She looks happy and engaged. ${BASE_STYLE}`,
    },
    {
      name: "og-investors.png",
      prompt: `A smiling elderly woman with short white hair sitting at a wooden kitchen table, holding a coffee mug and looking content. On the table are her prescription medication bottles and a printed chart showing upward growth. Warm golden morning light. ${BASE_STYLE}`,
    },
    {
      name: "og-logos.png",
      prompt: `A smiling elderly woman with short white hair sitting at a wooden kitchen table, looking at colorful hand-drawn logo sketches spread on the table next to her prescription medication bottles and coffee mug. She looks amused and interested. ${BASE_STYLE}`,
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

  console.log("\nDone! Images saved to public/og/");
}

main().catch(console.error);
