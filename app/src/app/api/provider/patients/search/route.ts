import { NextResponse } from "next/server";
import { eq, or, ilike, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, providerPatients } from "@/lib/db/schema";
import { getUserRole } from "@/lib/authorization";

// GET /api/provider/patients/search?q=... — search for patients to assign
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(session.user.id);
    if (role !== "provider" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 1) {
      return NextResponse.json([]);
    }

    // Get already-assigned patient IDs for this provider
    const assigned = await db
      .select({ patientId: providerPatients.patientId })
      .from(providerPatients)
      .where(eq(providerPatients.providerId, session.user.id));

    const assignedSet = new Set(assigned.map((a) => a.patientId));

    // Search patients by name or email
    const pattern = `%${q}%`;
    const conditions = and(
      or(eq(users.role, "patient"), eq(users.role, "user")),
      or(ilike(users.name, pattern), ilike(users.email, pattern), ilike(users.phone, pattern))
    );

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(conditions!)
      .limit(10);

    // Mark which patients are already assigned
    const resultsWithStatus = results.map((r) => ({
      ...r,
      alreadyAssigned: assignedSet.has(r.id),
    }));

    return NextResponse.json(resultsWithStatus);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
