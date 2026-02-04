/**
 * Generate seed images using Gemini API and upload to Vercel Blob.
 * Run with: npx tsx scripts/generate-seed-images.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { put } from "@vercel/blob";

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
    console.log("  Response parts:", JSON.stringify(parts.map(p => ({ hasText: !!p.text, hasImage: !!p.inlineData })), null, 2));
    throw new Error("No image data in Gemini response");
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

async function uploadToBlob(name: string, data: Buffer): Promise<string> {
  const blob = await put(`seed/${name}`, data, {
    access: "public",
    contentType: "image/png",
    allowOverwrite: true,
  });
  console.log(`  Uploaded: ${blob.url}`);
  return blob.url;
}

async function main() {
  console.log("Generating seed images with Gemini...\n");

  const prompts = [
    {
      name: "lisinopril-bottle.png",
      prompt:
        "A realistic photograph of an orange prescription medication bottle sitting on a kitchen counter. The white label reads 'Lisinopril 10mg Tablets' with prescription details. The bottle cap is white. Warm natural lighting, shallow depth of field. The photo looks like it was taken with a phone camera by an elderly person.",
    },
    {
      name: "weekly-pillbox.png",
      prompt:
        "A realistic photograph of a colorful weekly pill organizer box open on a table, with each day of the week labeled (Sun through Sat). The morning compartments contain small round tablets. The evening compartments have one small white pill each. The photo looks like it was taken with a phone camera, slightly overhead angle, natural lighting.",
    },
    {
      name: "prescription-label.png",
      prompt:
        "A realistic close-up photograph of a pharmacy prescription label on a white paper bag. The label shows 'Amlodipine Besylate 5mg', patient information, doctor name 'Dr. Michael Chen', and pharmacy details. The photo looks like it was taken with a phone camera, slightly blurry edges, natural lighting.",
    },
  ];

  const urls: Record<string, string> = {};

  for (const { name, prompt } of prompts) {
    try {
      const imageData = await generateImage(prompt);
      const url = await uploadToBlob(name, imageData);
      urls[name] = url;
      console.log(`  Done: ${name}\n`);
    } catch (err) {
      console.error(`  Failed for ${name}:`, err);
    }
  }

  console.log("\nGenerated image URLs:");
  for (const [name, url] of Object.entries(urls)) {
    console.log(`  ${name}: ${url}`);
  }

  console.log("\nUpdate scripts/seed-conversations.ts IMAGE_URLS with these URLs.");
}

main().catch(console.error);
