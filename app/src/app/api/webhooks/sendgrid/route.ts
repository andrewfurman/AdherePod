import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailSends, emailEvents } from "@/lib/db/schema";

interface SendGridEvent {
  sg_event_id?: string;
  sg_message_id?: string;
  event: string;
  timestamp: number;
  email?: string;
  ip?: string;
  useragent?: string;
  reason?: string;
  url?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const events: SendGridEvent[] = await req.json();

    for (const evt of events) {
      if (!evt.sg_message_id || !evt.event) continue;

      // SendGrid message IDs in webhooks have a ".filter..." suffix — strip it
      const cleanMsgId = evt.sg_message_id.split(".")[0];

      // Look up the email send
      const [send] = await db
        .select({ id: emailSends.id })
        .from(emailSends)
        .where(eq(emailSends.sgMessageId, cleanMsgId))
        .limit(1);

      if (!send) continue;

      // Build metadata object with event-specific fields
      const metadata: Record<string, unknown> = {};
      if (evt.ip) metadata.ip = evt.ip;
      if (evt.useragent) metadata.useragent = evt.useragent;
      if (evt.reason) metadata.reason = evt.reason;
      if (evt.url) metadata.url = evt.url;
      if (evt.email) metadata.email = evt.email;

      const sgEventId = evt.sg_event_id || `${cleanMsgId}_${evt.event}_${evt.timestamp}`;

      // Insert with dedup on sgEventId (ignore conflicts)
      await db
        .insert(emailEvents)
        .values({
          emailSendId: send.id,
          sgEventId,
          event: evt.event,
          timestamp: new Date(evt.timestamp * 1000),
          metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
        })
        .onConflictDoNothing({ target: emailEvents.sgEventId });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SendGrid webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to avoid retries
  }
}
