import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clinicalNotes, medications, users } from "@/lib/db/schema";
import { canAccessPatientData, getUserRole } from "@/lib/authorization";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;
    const allowed = await canAccessPatientData(session.user.id, patientId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const medicationId = searchParams.get("medicationId");

    if (!medicationId) {
      return NextResponse.json(
        { error: "medicationId query param is required" },
        { status: 400 }
      );
    }

    // Verify medication belongs to patient
    const [med] = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, patientId)));

    if (!med) {
      return NextResponse.json(
        { error: "Medication not found for this patient" },
        { status: 404 }
      );
    }

    const notes = await db
      .select({
        id: clinicalNotes.id,
        medicationId: clinicalNotes.medicationId,
        authorId: clinicalNotes.authorId,
        authorName: users.name,
        authorEmail: users.email,
        content: clinicalNotes.content,
        createdAt: clinicalNotes.createdAt,
        updatedAt: clinicalNotes.updatedAt,
      })
      .from(clinicalNotes)
      .innerJoin(users, eq(users.id, clinicalNotes.authorId))
      .where(eq(clinicalNotes.medicationId, medicationId))
      .orderBy(desc(clinicalNotes.createdAt));

    return NextResponse.json(notes);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;
    const allowed = await canAccessPatientData(session.user.id, patientId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { medicationId, content } = body;

    if (!medicationId || !content) {
      return NextResponse.json(
        { error: "medicationId and content are required" },
        { status: 400 }
      );
    }

    // Verify medication belongs to patient
    const [med] = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, patientId)));

    if (!med) {
      return NextResponse.json(
        { error: "Medication not found for this patient" },
        { status: 404 }
      );
    }

    const [note] = await db
      .insert(clinicalNotes)
      .values({
        medicationId,
        authorId: session.user.id,
        content,
      })
      .returning();

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const note = await db.query.clinicalNotes.findFirst({
      where: eq(clinicalNotes.id, id),
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Only author or admin can delete
    const role = await getUserRole(session.user.id);
    if (note.authorId !== session.user.id && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(clinicalNotes).where(eq(clinicalNotes.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
