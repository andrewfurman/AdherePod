import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { imageCaptures, conversations } from "@/lib/db/schema";

const model = google("gemini-2.5-flash");

const TRIAGE_PROMPT = `Look at this image. Is there a medication bottle, pill bottle, prescription label, pillbox, pill organizer, or any medication-related item clearly visible?

Answer with ONLY one word: YES or NO`;

const EXTRACT_PROMPT = `Analyze this image of a medication or prescription item. Extract all visible information:

1. Drug name and brand
2. Dosage/strength
3. Frequency/directions
4. Quantity and refills remaining
5. Prescriber name
6. Pharmacy name
7. Any warnings or special instructions

If you can't read something clearly, note what's unclear. Provide a brief natural-language description first, then the structured details.

Format your response as:
DESCRIPTION: [1-2 sentence description of what you see]
MEDICATIONS: [comma-separated list of medication names and dosages found]
DETAILS: [all extracted text and details]`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageBase64, conversationId, mode = "triage" } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    // Strip the data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    if (mode === "triage") {
      const result = await generateText({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: TRIAGE_PROMPT },
              { type: "image", image: base64Data },
            ],
          },
        ],
      });

      const answer = result.text.trim().toUpperCase();
      const hasMedication = answer.startsWith("YES");

      return NextResponse.json({ hasMedication });
    }

    // Full extraction mode
    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACT_PROMPT },
            { type: "image", image: base64Data },
          ],
        },
      ],
    });

    const responseText = result.text;

    // Parse the response
    const descriptionMatch = responseText.match(/DESCRIPTION:\s*([\s\S]+?)(?=\nMEDICATIONS:|\n\n|$)/);
    const medicationsMatch = responseText.match(/MEDICATIONS:\s*([\s\S]+?)(?=\nDETAILS:|\n\n|$)/);
    const detailsMatch = responseText.match(/DETAILS:\s*([\s\S]+)$/);

    const description = descriptionMatch?.[1]?.trim() || responseText.slice(0, 200);
    const medications = medicationsMatch?.[1]?.trim() || "";
    const extractedText = detailsMatch?.[1]?.trim() || responseText;

    // Upload image to Vercel Blob
    const imageBuffer = Buffer.from(base64Data, "base64");
    const filename = `captures/${session.user.id}/${Date.now()}.jpg`;
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    // Save to database
    if (conversationId) {
      // Verify conversation belongs to user
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
          extractedText,
          extractedMedications: medications,
        });
      }
    }

    return NextResponse.json({
      description,
      medications,
      extractedText,
      imageUrl: blob.url,
    });
  } catch (err) {
    console.error("Image capture error:", err);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
