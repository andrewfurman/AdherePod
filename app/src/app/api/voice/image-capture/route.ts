import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { imageCaptures, conversations } from "@/lib/db/schema";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});
const model = google("gemini-3-flash-preview");

const DESCRIBE_PROMPT = `You are the eyes of a medication assistant during a live video call with a patient.
Describe what you see in the image. Adjust your detail level:

- If the person is just talking/sitting normally: describe in under 50 characters
  (e.g. "Person facing camera, talking" or "Person looking to the side")

- If they are holding up a prescription, pill bottle, medication label, or any
  document with text: transcribe EVERY piece of readable text you can see.
  Include drug names, dosages, directions, quantities, refills, prescriber name,
  pharmacy, dates, and any warnings. Be exhaustive.

- If they are showing a part of their body (rash, swelling, bruise, wound, skin
  condition, etc.): describe in clinical detail — location on body, color, size,
  texture, pattern, and any characteristics relevant to a medical assessment.

- If something is partially visible or hard to read, say so:
  "The label is partially obscured but appears to read..."
  "I can't make out the dosage clearly, but it looks like..."

Be factual and concise. No pleasantries or preamble.`;

const MEDICAL_KEYWORDS = [
  "prescription", "medication", "pill", "tablet", "capsule", "bottle",
  "mg", "mcg", "ml", "dosage", "dose", "refill", "pharmacy", "rx",
  "drug", "medicine", "ointment", "cream", "inhaler", "syringe",
  "rash", "swelling", "bruise", "wound", "injury", "lesion",
  "redness", "irritation", "blister", "bump", "skin condition",
  "atorvastatin", "lisinopril", "metformin", "amlodipine", "omeprazole",
  "label", "directions", "warnings", "prescriber",
];

function hasMedicalKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageBase64, conversationId, mode = "describe" } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    // Strip the data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Legacy triage mode — kept for backwards compatibility but not used by new flow
    if (mode === "triage") {
      const result = await generateText({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Look at this image. Is there a medication bottle, pill bottle, prescription label, pillbox, pill organizer, or any medication-related item clearly visible?\n\nAnswer with ONLY one word: YES or NO" },
              { type: "image", image: base64Data },
            ],
          },
        ],
      });

      const answer = result.text.trim().toUpperCase();
      const hasMedication = answer.startsWith("YES");
      return NextResponse.json({ hasMedication });
    }

    // Describe mode: single call that always describes, always stores, flags medical content
    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: DESCRIBE_PROMPT },
            { type: "image", image: base64Data },
          ],
        },
      ],
    });

    const description = result.text.trim();
    const hasMedicalContent = hasMedicalKeywords(description);

    // Upload image to Vercel Blob
    const imageBuffer = Buffer.from(base64Data, "base64");
    const filename = `captures/${session.user.id}/${Date.now()}.jpg`;
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    // Save to database
    if (conversationId) {
      const [conv] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId));

      if (conv && conv.userId === session.user.id) {
        await db.insert(imageCaptures).values({
          userId: session.user.id,
          conversationId,
          imageUrl: blob.url,
          description,
          extractedText: hasMedicalContent ? description : null,
          extractedMedications: null,
        });
      }
    }

    return NextResponse.json({
      description,
      hasMedicalContent,
      imageUrl: blob.url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("Image capture error:", message, "\n", stack);
    return NextResponse.json(
      { error: "Failed to process image", detail: message },
      { status: 500 }
    );
  }
}
