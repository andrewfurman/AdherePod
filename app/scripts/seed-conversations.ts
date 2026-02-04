/**
 * Seed script: creates sample conversations and image captures for testing.
 * Run with: npx tsx scripts/seed-conversations.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import {
  users,
  conversations,
  conversationMessages,
  imageCaptures,
} from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function uploadPlaceholderImage(
  name: string,
  color: string
): Promise<string> {
  // Create a simple SVG placeholder image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${color}" rx="16"/>
    <text x="200" y="140" text-anchor="middle" font-family="sans-serif" font-size="18" fill="white" font-weight="bold">${name}</text>
    <text x="200" y="170" text-anchor="middle" font-family="sans-serif" font-size="14" fill="white" opacity="0.8">Sample Image Capture</text>
  </svg>`;

  const blob = await put(`seed/${name.replace(/\s+/g, "-").toLowerCase()}.svg`, svg, {
    access: "public",
    contentType: "image/svg+xml",
  });
  return blob.url;
}

async function main() {
  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, "aifurman@gmail.com"));

  if (!user) {
    console.error("User aifurman@gmail.com not found");
    process.exit(1);
  }

  console.log(`Found user: ${user.id} (${user.email})`);

  // Upload placeholder images to Vercel Blob
  console.log("Uploading images to Vercel Blob...");
  const image1Url = await uploadPlaceholderImage("Lisinopril Bottle", "#2563eb");
  const image2Url = await uploadPlaceholderImage("Weekly Pillbox", "#059669");
  const image3Url = await uploadPlaceholderImage("Metformin Label", "#7c3aed");
  console.log("Images uploaded.");

  // --- Conversation 1: Morning medication check-in ---
  const conv1StartedAt = new Date("2026-02-03T14:30:00Z");
  const conv1EndedAt = new Date("2026-02-03T14:35:22Z");

  const [conv1] = await db
    .insert(conversations)
    .values({
      userId: user.id,
      status: "ended",
      title: "Morning medication check-in",
      summary:
        "Reviewed current medications (Lisinopril 10mg, Metformin 500mg). User asked about timing for Lisinopril and was advised to take it in the morning before breakfast. User captured an image of their pill bottle to confirm the correct medication.",
      transcript: `You: What medications do I take in the morning?\n\nAdherePod: You currently have two medications. Lisinopril 10mg, which you take once daily, and Metformin 500mg, which you take three times daily before meals.\n\nYou: When should I take the Lisinopril?\n\nAdherePod: Lisinopril is best taken in the morning, before breakfast. Try to take it at the same time each day for the best results.\n\nYou: Can you see this bottle? Is this the right one?\n\nAdherePod: Yes, I can see your pill bottle. That is Lisinopril 10mg tablets, which matches your prescription. You're all set.\n\nYou: Thanks, that's all for now.\n\nAdherePod: You're welcome! Remember to take your Metformin before each meal today. Have a great morning!`,
      startedAt: conv1StartedAt,
      endedAt: conv1EndedAt,
    })
    .returning();

  console.log(`Created conversation 1: ${conv1.id}`);

  // Messages for conversation 1
  const conv1Messages = [
    { role: "user", content: "What medications do I take in the morning?", offset: 0 },
    {
      role: "agent",
      content:
        "You currently have two medications. Lisinopril 10mg, which you take once daily, and Metformin 500mg, which you take three times daily before meals.",
      offset: 5000,
    },
    { role: "user", content: "When should I take the Lisinopril?", offset: 15000 },
    {
      role: "agent",
      content:
        "Lisinopril is best taken in the morning, before breakfast. Try to take it at the same time each day for the best results.",
      offset: 20000,
    },
    { role: "user", content: "Can you see this bottle? Is this the right one?", offset: 35000 },
    {
      role: "agent",
      content:
        "Yes, I can see your pill bottle. That is Lisinopril 10mg tablets, which matches your prescription. You're all set.",
      offset: 45000,
    },
    { role: "user", content: "Thanks, that's all for now.", offset: 60000 },
    {
      role: "agent",
      content:
        "You're welcome! Remember to take your Metformin before each meal today. Have a great morning!",
      offset: 65000,
    },
  ];

  for (const msg of conv1Messages) {
    await db.insert(conversationMessages).values({
      conversationId: conv1.id,
      role: msg.role,
      content: msg.content,
      createdAt: new Date(conv1StartedAt.getTime() + msg.offset),
    });
  }

  // Image capture for conversation 1
  await db.insert(imageCaptures).values({
    userId: user.id,
    conversationId: conv1.id,
    imageUrl: image1Url,
    description: "Prescription bottle of Lisinopril 10mg tablets",
    extractedText:
      "Lisinopril 10mg Tablets\nRx# 4821903\nDr. Sarah Johnson\nTake one tablet by mouth once daily\nQty: 30 | Refills: 3\nCVS Pharmacy #7821\nFilled: 01/15/2026\nRefill by: 02/15/2026",
    extractedMedications: JSON.stringify([
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        instructions: "Take one tablet by mouth once daily",
        prescriber: "Dr. Sarah Johnson",
        pharmacy: "CVS Pharmacy #7821",
        quantity: 30,
        refillsRemaining: 3,
      },
    ]),
    createdAt: new Date("2026-02-03T14:33:15Z"),
  });

  console.log("Added messages and image for conversation 1");

  // --- Conversation 2: Adding a new medication ---
  const conv2StartedAt = new Date("2026-02-02T20:15:00Z");
  const conv2EndedAt = new Date("2026-02-02T20:21:45Z");

  const [conv2] = await db
    .insert(conversations)
    .values({
      userId: user.id,
      status: "ended",
      title: "Added Amlodipine prescription",
      summary:
        "User received a new prescription for Amlodipine 5mg from their doctor visit. Added the medication to their list with once-daily dosing at bedtime. User showed their pillbox and the new prescription label for verification.",
      transcript: `You: I just got back from the doctor and I have a new medication to add.\n\nAdherePod: Of course! I'd be happy to help you add a new medication. What's the name of the medication?\n\nYou: It's called Amlodipine, 5 milligrams.\n\nAdherePod: Got it. Amlodipine 5mg. How many times a day do you need to take it?\n\nYou: Once a day, at bedtime.\n\nAdherePod: I've added Amlodipine 5mg, once daily at bedtime, starting today. Would you like me to read back your full medication list?\n\nYou: Yes please.\n\nAdherePod: You now have three medications: Lisinopril 10mg once daily before breakfast, Metformin 500mg three times daily before meals, and the new one, Amlodipine 5mg once daily at bedtime.\n\nYou: Can you see my pillbox? I want to make sure I set it up right.\n\nAdherePod: I can see your weekly pillbox. It looks like you have pills sorted for each day. The morning compartments have two types of pills which would be your Lisinopril and Metformin, and I can see you've added a pill to the evening compartments for the Amlodipine. That looks correct!\n\nYou: Great, thank you.\n\nAdherePod: You're welcome! Don't forget your evening dose of Amlodipine tonight. Is there anything else I can help with?`,
      startedAt: conv2StartedAt,
      endedAt: conv2EndedAt,
    })
    .returning();

  console.log(`Created conversation 2: ${conv2.id}`);

  const conv2Messages = [
    {
      role: "user",
      content: "I just got back from the doctor and I have a new medication to add.",
      offset: 0,
    },
    {
      role: "agent",
      content:
        "Of course! I'd be happy to help you add a new medication. What's the name of the medication?",
      offset: 5000,
    },
    { role: "user", content: "It's called Amlodipine, 5 milligrams.", offset: 15000 },
    {
      role: "agent",
      content:
        "Got it. Amlodipine 5mg. How many times a day do you need to take it?",
      offset: 20000,
    },
    { role: "user", content: "Once a day, at bedtime.", offset: 30000 },
    {
      role: "agent",
      content:
        "I've added Amlodipine 5mg, once daily at bedtime, starting today. Would you like me to read back your full medication list?",
      offset: 35000,
      toolName: "add_medication",
    },
    { role: "user", content: "Yes please.", offset: 50000 },
    {
      role: "agent",
      content:
        "You now have three medications: Lisinopril 10mg once daily before breakfast, Metformin 500mg three times daily before meals, and the new one, Amlodipine 5mg once daily at bedtime.",
      offset: 55000,
    },
    {
      role: "user",
      content: "Can you see my pillbox? I want to make sure I set it up right.",
      offset: 75000,
    },
    {
      role: "agent",
      content:
        "I can see your weekly pillbox. It looks like you have pills sorted for each day. The morning compartments have two types of pills which would be your Lisinopril and Metformin, and I can see you've added a pill to the evening compartments for the Amlodipine. That looks correct!",
      offset: 85000,
    },
    { role: "user", content: "Great, thank you.", offset: 100000 },
    {
      role: "agent",
      content:
        "You're welcome! Don't forget your evening dose of Amlodipine tonight. Is there anything else I can help with?",
      offset: 105000,
    },
  ];

  for (const msg of conv2Messages) {
    await db.insert(conversationMessages).values({
      conversationId: conv2.id,
      role: msg.role,
      content: msg.content,
      toolName: (msg as { toolName?: string }).toolName || null,
      createdAt: new Date(conv2StartedAt.getTime() + msg.offset),
    });
  }

  // Image captures for conversation 2
  await db.insert(imageCaptures).values({
    userId: user.id,
    conversationId: conv2.id,
    imageUrl: image2Url,
    description: "Weekly pillbox with morning and evening compartments",
    extractedText:
      "Weekly pill organizer (Sun-Sat). Morning compartments contain 2 types of tablets. Evening compartments each contain 1 small white tablet (newly added). All compartments appear to be correctly filled.",
    createdAt: new Date("2026-02-02T20:18:30Z"),
  });

  await db.insert(imageCaptures).values({
    userId: user.id,
    conversationId: conv2.id,
    imageUrl: image3Url,
    description: "Prescription label for Amlodipine 5mg",
    extractedText:
      "Amlodipine Besylate 5mg Tablets\nRx# 5930182\nDr. Michael Chen\nTake one tablet by mouth at bedtime\nQty: 30 | Refills: 5\nWalgreens Pharmacy\nFilled: 02/02/2026",
    extractedMedications: JSON.stringify([
      {
        name: "Amlodipine Besylate",
        dosage: "5mg",
        frequency: "Once daily at bedtime",
        instructions: "Take one tablet by mouth at bedtime",
        prescriber: "Dr. Michael Chen",
        pharmacy: "Walgreens Pharmacy",
        quantity: 30,
        refillsRemaining: 5,
      },
    ]),
    createdAt: new Date("2026-02-02T20:19:00Z"),
  });

  console.log("Added messages and images for conversation 2");
  console.log("\nSeeding complete!");
  console.log(`  - 2 conversations`);
  console.log(`  - ${conv1Messages.length + conv2Messages.length} messages`);
  console.log(`  - 3 image captures`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
