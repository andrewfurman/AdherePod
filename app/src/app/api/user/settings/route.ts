import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getEffectiveUserId, ImpersonationError } from "@/lib/impersonation";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await getEffectiveUserId(session, req.url);

    const [user] = await db
      .select({
        role: users.role,
        timezone: users.timezone,
        dailySummaryEnabled: users.dailySummaryEnabled,
        dailySummaryTime: users.dailySummaryTime,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
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

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { timezone, dailySummaryEnabled, dailySummaryTime } = body;

    const updates: Record<string, unknown> = {};
    if (timezone !== undefined) updates.timezone = timezone;
    if (dailySummaryEnabled !== undefined) updates.dailySummaryEnabled = dailySummaryEnabled;
    if (dailySummaryTime !== undefined) updates.dailySummaryTime = dailySummaryTime;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id))
      .returning({
        timezone: users.timezone,
        dailySummaryEnabled: users.dailySummaryEnabled,
        dailySummaryTime: users.dailySummaryTime,
      });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
