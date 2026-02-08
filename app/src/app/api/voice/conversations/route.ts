import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, conversationMessages, imageCaptures } from "@/lib/db/schema";
import { getEffectiveUserId, ImpersonationError } from "@/lib/impersonation";
import { canAccessPatientData } from "@/lib/authorization";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams: params } = new URL(req.url);
    const patientId = params.get("patientId");

    // If patientId is provided (provider context), use that instead of impersonation
    let userId: string;
    if (patientId) {
      const allowed = await canAccessPatientData(session.user.id, patientId);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      userId = patientId;
    } else {
      const effective = await getEffectiveUserId(session, req.url);
      userId = effective.userId;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, id));

      if (!conversation || conversation.userId !== userId) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      const messages = await db
        .select()
        .from(conversationMessages)
        .where(eq(conversationMessages.conversationId, id))
        .orderBy(conversationMessages.createdAt);

      const images = await db
        .select()
        .from(imageCaptures)
        .where(eq(imageCaptures.conversationId, id))
        .orderBy(imageCaptures.createdAt);

      return NextResponse.json({ ...conversation, messages, images });
    }

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt));

    return NextResponse.json(userConversations);
  } catch (err) {
    if (err instanceof ImpersonationError) {
      return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [conversation] = await db
      .insert(conversations)
      .values({ userId: session.user.id })
      .returning();

    return NextResponse.json(conversation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id)));

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await db.delete(imageCaptures).where(eq(imageCaptures.conversationId, id));
    await db.delete(conversationMessages).where(eq(conversationMessages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
