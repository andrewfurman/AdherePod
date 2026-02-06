import { NextResponse } from "next/server";
import { eq, and, lte, or, isNull, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { medications, users } from "@/lib/db/schema";
import { sendDailySummary } from "@/lib/email";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Get all users with daily summary enabled
    const summaryUsers = await db
      .select()
      .from(users)
      .where(eq(users.dailySummaryEnabled, true));

    let sent = 0;

    for (const user of summaryUsers) {
      const tz = user.timezone || "America/New_York";
      const summaryTime = user.dailySummaryTime || "08:00";

      // Get current time in user's timezone
      const userNow = new Date(
        now.toLocaleString("en-US", { timeZone: tz })
      );
      const userHour = userNow.getHours();
      const userMinute = userNow.getMinutes();
      const userCurrentMinutes = userHour * 60 + userMinute;

      const [h, m] = summaryTime.split(":").map(Number);
      const targetMinutes = h * 60 + m;

      // Check if we're within a 15-minute window after the target time
      const diff = userCurrentMinutes - targetMinutes;
      if (diff < 0 || diff >= 15) continue;

      // Check if already sent today
      if (user.lastDailySummarySentAt) {
        const lastSent = new Date(user.lastDailySummarySentAt);
        const lastSentInTz = new Date(
          lastSent.toLocaleString("en-US", { timeZone: tz })
        );
        if (
          lastSentInTz.getFullYear() === userNow.getFullYear() &&
          lastSentInTz.getMonth() === userNow.getMonth() &&
          lastSentInTz.getDate() === userNow.getDate()
        ) {
          continue;
        }
      }

      // Get user's active medications
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

      if (userMeds.length === 0) continue;

      await sendDailySummary(user.email, user.name, userMeds, user.id);

      await db
        .update(users)
        .set({ lastDailySummarySentAt: now })
        .where(eq(users.id, user.id));

      sent++;
    }

    return NextResponse.json({ sent, checked: summaryUsers.length });
  } catch (error) {
    console.error("Cron daily-summary error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
