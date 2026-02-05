import { NextResponse } from "next/server";
import { eq, and, asc } from "drizzle-orm";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, conversationMessages } from "@/lib/db/schema";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});
const titleModel = google("gemini-3-flash-preview");

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, role, content, toolName, toolArgs } =
      await req.json();

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { error: "conversationId, role, and content are required" },
        { status: 400 }
      );
    }

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.id)
        )
      );

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const [message] = await db
      .insert(conversationMessages)
      .values({
        conversationId,
        role,
        content,
        toolName: toolName || null,
        toolArgs: toolArgs ? JSON.stringify(toolArgs) : null,
      })
      .returning();

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(conversations)
      .set({ status: "ended", endedAt: new Date() })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Generate a title from the conversation messages
    try {
      const messages = await db
        .select()
        .from(conversationMessages)
        .where(eq(conversationMessages.conversationId, conversationId))
        .orderBy(asc(conversationMessages.createdAt));

      const chatMessages = messages.filter(
        (m) => m.role === "user" || m.role === "agent"
      );

      if (chatMessages.length > 0) {
        const transcript = chatMessages
          .slice(0, 20)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")
          .slice(0, 2000);

        const result = await generateText({
          model: titleModel,
          prompt: `Summarize this voice conversation in a short title (30-40 characters max).
Focus on the main topic: medications added/changed/removed, questions asked, etc.
Return ONLY the title text, nothing else. No quotes.

${transcript}`,
        });

        const title = result.text.trim().slice(0, 60);
        if (title) {
          const [withTitle] = await db
            .update(conversations)
            .set({ title })
            .where(eq(conversations.id, conversationId))
            .returning();
          return NextResponse.json(withTitle);
        }
      }
    } catch (err) {
      console.error("Title generation failed:", err);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

