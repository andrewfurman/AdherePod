import { NextResponse } from "next/server";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, providerPatients, medications } from "@/lib/db/schema";
import { getUserRole } from "@/lib/authorization";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(session.user.id);

    if (role === "admin") {
      // Admin can optionally filter by providerId
      const { searchParams } = new URL(req.url);
      const providerId = searchParams.get("providerId");

      if (providerId) {
        const links = await db
          .select({
            id: providerPatients.id,
            patientId: providerPatients.patientId,
            patientName: users.name,
            patientEmail: users.email,
            createdAt: providerPatients.createdAt,
          })
          .from(providerPatients)
          .innerJoin(users, eq(users.id, providerPatients.patientId))
          .where(eq(providerPatients.providerId, providerId))
          .orderBy(asc(users.name));

        // Add medication count for each patient
        const patientsWithCounts = await Promise.all(
          links.map(async (link) => {
            const meds = await db
              .select({ id: medications.id })
              .from(medications)
              .where(eq(medications.userId, link.patientId));
            return { ...link, medicationCount: meds.length };
          })
        );

        return NextResponse.json(patientsWithCounts);
      }

      // Admin without filter: return all assignments
      const allLinks = await db
        .select({
          id: providerPatients.id,
          providerId: providerPatients.providerId,
          patientId: providerPatients.patientId,
          patientName: users.name,
          patientEmail: users.email,
          createdAt: providerPatients.createdAt,
        })
        .from(providerPatients)
        .innerJoin(users, eq(users.id, providerPatients.patientId))
        .orderBy(asc(providerPatients.createdAt));

      return NextResponse.json(allLinks);
    }

    if (role === "provider") {
      // Provider gets their own assigned patients
      const links = await db
        .select({
          id: providerPatients.id,
          patientId: providerPatients.patientId,
          patientName: users.name,
          patientEmail: users.email,
          createdAt: providerPatients.createdAt,
        })
        .from(providerPatients)
        .innerJoin(users, eq(users.id, providerPatients.patientId))
        .where(eq(providerPatients.providerId, session.user.id))
        .orderBy(asc(users.name));

      const patientsWithCounts = await Promise.all(
        links.map(async (link) => {
          const meds = await db
            .select({ id: medications.id })
            .from(medications)
            .where(eq(medications.userId, link.patientId));
          return { ...link, medicationCount: meds.length };
        })
      );

      return NextResponse.json(patientsWithCounts);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch {
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

    const role = await getUserRole(session.user.id);
    const body = await req.json();
    const { providerId, patientId } = body;

    if (!providerId || !patientId) {
      return NextResponse.json(
        { error: "providerId and patientId are required" },
        { status: 400 }
      );
    }

    // Providers can only assign to themselves; admins can assign to any provider
    if (role === "provider" && providerId !== session.user.id) {
      return NextResponse.json(
        { error: "Providers can only assign patients to themselves" },
        { status: 403 }
      );
    }

    if (role !== "provider" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify provider exists with correct role
    const provider = await db.query.users.findFirst({
      where: eq(users.id, providerId),
      columns: { id: true, role: true },
    });
    if (!provider || provider.role !== "provider") {
      return NextResponse.json(
        { error: "Provider not found or not a provider" },
        { status: 400 }
      );
    }

    // Verify patient exists with correct role
    const patient = await db.query.users.findFirst({
      where: eq(users.id, patientId),
      columns: { id: true, role: true },
    });
    if (!patient || (patient.role !== "patient" && patient.role !== "user")) {
      return NextResponse.json(
        { error: "Patient not found or not a patient" },
        { status: 400 }
      );
    }

    // Check for existing link
    const existing = await db.query.providerPatients.findFirst({
      where: and(
        eq(providerPatients.providerId, providerId),
        eq(providerPatients.patientId, patientId)
      ),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Assignment already exists" },
        { status: 409 }
      );
    }

    const [link] = await db
      .insert(providerPatients)
      .values({
        providerId,
        patientId,
        assignedBy: session.user.id,
      })
      .returning();

    return NextResponse.json(link, { status: 201 });
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

    const role = await getUserRole(session.user.id);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    const link = await db.query.providerPatients.findFirst({
      where: eq(providerPatients.id, id),
    });

    if (!link) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Provider can only remove their own; admin can remove any
    if (role === "provider" && link.providerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role !== "provider" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(providerPatients).where(eq(providerPatients.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
