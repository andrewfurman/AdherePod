import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailSends, emailEvents, users } from "@/lib/db/schema";
import { getEffectiveUserId, ImpersonationError } from "@/lib/impersonation";
import { canAccessPatientData } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for patientId query param (provider context)
    const patientId = req.nextUrl.searchParams.get("patientId");
    if (patientId) {
      const allowed = await canAccessPatientData(session.user.id, patientId);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Return emails for this patient
      const sends = await db
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
        .where(eq(emailSends.userId, patientId))
        .orderBy(desc(emailSends.sentAt))
        .limit(100);

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
    }

    const { userId: effectiveUserId, isImpersonating } = await getEffectiveUserId(session, req.url);

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

      // When impersonating, only show target user's emails
      if (isImpersonating) {
        if (send.userId !== effectiveUserId) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
      } else {
        // Normal access: admin can see all, regular user only their own
        const caller = await db.query.users.findFirst({
          where: eq(users.id, session.user.id),
          columns: { role: true },
        });
        if (caller?.role !== "admin" && send.userId !== session.user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      const events = await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.emailSendId, id))
        .orderBy(desc(emailEvents.timestamp));

      return NextResponse.json({ ...send, events });
    }

    // When impersonating, always scope to target user
    if (isImpersonating) {
      const sends = await db
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
        .where(eq(emailSends.userId, effectiveUserId))
        .orderBy(desc(emailSends.sentAt))
        .limit(100);

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
