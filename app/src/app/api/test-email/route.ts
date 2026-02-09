import { NextResponse } from "next/server";
import { eq, and, lte, or, isNull, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { medications, users } from "@/lib/db/schema";
import { sendDailySummary } from "@/lib/email";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin only
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();

  const userMeds = await db
    .select({
      name: medications.name,
      timesPerDay: medications.timesPerDay,
      timingDescription: medications.timingDescription,
    })
    .from(medications)
    .where(
      and(
        eq(medications.userId, user.id),
        lte(medications.startDate, now),
        or(isNull(medications.endDate), gte(medications.endDate, now))
      )
    );

  await sendDailySummary(user.email, user.name, userMeds, user.id);

  return NextResponse.json({ success: true, medicationCount: userMeds.length });
}
