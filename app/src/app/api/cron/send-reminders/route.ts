import { NextResponse } from "next/server";
import { eq, and, lte, or, isNull, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { medications, users } from "@/lib/db/schema";
import { sendMedicationReminder } from "@/lib/email";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Get all medications with reminders enabled that are currently active
    const meds = await db
      .select({
        medId: medications.id,
        medName: medications.name,
        timingDescription: medications.timingDescription,
        notes: medications.notes,
        reminderTimes: medications.reminderTimes,
        lastReminderSentAt: medications.lastReminderSentAt,
        userId: users.id,
        userEmail: users.email,
        userTimezone: users.timezone,
      })
      .from(medications)
      .innerJoin(users, eq(medications.userId, users.id))
      .where(
        and(
          eq(medications.reminderEnabled, true),
          lte(medications.startDate, now),
          or(isNull(medications.endDate), gte(medications.endDate, now))
        )
      );

    let sent = 0;

    for (const med of meds) {
      if (!med.reminderTimes) continue;

      let times: string[];
      try {
        times = JSON.parse(med.reminderTimes);
      } catch {
        continue;
      }

      const tz = med.userTimezone || "America/New_York";

      // Get current time in user's timezone
      const userNow = new Date(
        now.toLocaleString("en-US", { timeZone: tz })
      );
      const userHour = userNow.getHours();
      const userMinute = userNow.getMinutes();
      const userCurrentMinutes = userHour * 60 + userMinute;

      for (const time of times) {
        const [h, m] = time.split(":").map(Number);
        const targetMinutes = h * 60 + m;

        // Check if we're within a 15-minute window after the target time
        const diff = userCurrentMinutes - targetMinutes;
        if (diff < 0 || diff >= 15) continue;

        // Check if we already sent a reminder in this window
        if (med.lastReminderSentAt) {
          const lastSent = new Date(med.lastReminderSentAt);
          const minutesSinceLastSent =
            (now.getTime() - lastSent.getTime()) / (1000 * 60);
          if (minutesSinceLastSent < 15) continue;
        }

        // Send the reminder
        await sendMedicationReminder(
          med.userEmail,
          med.medName,
          med.timingDescription,
          med.notes,
          med.userId
        );

        // Update last sent timestamp
        await db
          .update(medications)
          .set({ lastReminderSentAt: now })
          .where(eq(medications.id, med.medId));

        sent++;
        break; // Only one reminder per medication per cron run
      }
    }

    return NextResponse.json({ sent, checked: meds.length });
  } catch (error) {
    console.error("Cron send-reminders error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
