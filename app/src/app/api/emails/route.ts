import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailSends, emailEvents, users } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");

    // Single email detail with events
    if (id) {
      const [send] = await db
        .select()
        .from(emailSends)
        .where(eq(emailSends.id, id))
        .limit(1);

      if (!send) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // Check access: admin can see all, regular user only their own
      const caller = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { role: true },
      });
      if (caller?.role !== "admin" && send.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const events = await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.emailSendId, id))
        .orderBy(desc(emailEvents.timestamp));

      return NextResponse.json({ ...send, events });
    }

    // List emails: admin sees all, regular user sees only theirs
    const caller = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { role: true },
    });

    const isAdmin = caller?.role === "admin";

    const sends = isAdmin
      ? await db
          .select({
            id: emailSends.id,
            userId: emailSends.userId,
            recipientEmail: emailSends.recipientEmail,
            messageType: emailSends.messageType,
            subject: emailSends.subject,
            sgMessageId: emailSends.sgMessageId,
            sentAt: emailSends.sentAt,
          })
          .from(emailSends)
          .orderBy(desc(emailSends.sentAt))
          .limit(100)
      : await db
          .select({
            id: emailSends.id,
            userId: emailSends.userId,
            recipientEmail: emailSends.recipientEmail,
            messageType: emailSends.messageType,
            subject: emailSends.subject,
            sgMessageId: emailSends.sgMessageId,
            sentAt: emailSends.sentAt,
          })
          .from(emailSends)
          .where(eq(emailSends.userId, session.user.id))
          .orderBy(desc(emailSends.sentAt))
          .limit(100);

    // For each send, get the latest event for delivery status
    const sendsWithStatus = await Promise.all(
      sends.map(async (send) => {
        const [latestEvent] = await db
          .select({ event: emailEvents.event })
          .from(emailEvents)
          .where(eq(emailEvents.emailSendId, send.id))
          .orderBy(desc(emailEvents.timestamp))
          .limit(1);
        return { ...send, latestEvent: latestEvent?.event || null };
      })
    );

    return NextResponse.json(sendsWithStatus);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
