import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { medications } from "@/lib/db/schema";
import { getEffectiveUserId, ImpersonationError } from "@/lib/impersonation";
import { canAccessPatientData } from "@/lib/authorization";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    let userId: string;
    if (patientId) {
      // Provider context: verify access
      const allowed = await canAccessPatientData(session.user.id, patientId);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      userId = patientId;
    } else {
      const effective = await getEffectiveUserId(session, req.url);
      userId = effective.userId;
    }

    const userMedications = await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .orderBy(desc(medications.createdAt));

    return NextResponse.json(userMedications);
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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, timesPerDay, timingDescription, startDate, endDate, notes, patientId } =
      body;

    if (!name || !timesPerDay || !startDate) {
      return NextResponse.json(
        { error: "Name, times per day, and start date are required" },
        { status: 400 }
      );
    }

    // If patientId is provided, verify caller can access that patient's data
    const targetUserId = patientId || session.user.id;
    if (patientId && patientId !== session.user.id) {
      const allowed = await canAccessPatientData(session.user.id, patientId);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const [medication] = await db
      .insert(medications)
      .values({
        userId: targetUserId,
        name,
        timesPerDay: Number(timesPerDay),
        timingDescription: timingDescription || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(medication, { status: 201 });
  } catch {
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
    const { id, name, timesPerDay, timingDescription, startDate, endDate, notes, reminderEnabled, reminderTimes } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Medication ID is required" },
        { status: 400 }
      );
    }

    // Find the medication first (without userId filter)
    const [existing] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const allowed = await canAccessPatientData(session.user.id, existing.userId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [updated] = await db
      .update(medications)
      .set({
        name: name ?? existing.name,
        timesPerDay: timesPerDay != null ? Number(timesPerDay) : existing.timesPerDay,
        timingDescription: timingDescription !== undefined ? timingDescription : existing.timingDescription,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        notes: notes !== undefined ? notes : existing.notes,
        reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : existing.reminderEnabled,
        reminderTimes: reminderTimes !== undefined ? (typeof reminderTimes === "string" ? reminderTimes : JSON.stringify(reminderTimes)) : existing.reminderTimes,
        updatedAt: new Date(),
      })
      .where(eq(medications.id, id))
      .returning();

    return NextResponse.json(updated);
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
      return NextResponse.json(
        { error: "Medication ID is required" },
        { status: 400 }
      );
    }

    // Find medication first
    const [existing] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const allowed = await canAccessPatientData(session.user.id, existing.userId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .delete(medications)
      .where(eq(medications.id, id));

    return NextResponse.json({ message: "Medication deleted" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
