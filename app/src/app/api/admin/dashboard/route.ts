import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, providerPatients, medications } from "@/lib/db/schema";
import { getUserRole } from "@/lib/authorization";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(session.user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        providerType: users.providerType,
        createdAt: users.createdAt,
      })
      .from(users);

    // Get all assignments
    const allAssignments = await db
      .select({
        id: providerPatients.id,
        providerId: providerPatients.providerId,
        patientId: providerPatients.patientId,
        createdAt: providerPatients.createdAt,
      })
      .from(providerPatients);

    // Get medication counts per user
    const medCounts = await db
      .select({
        userId: medications.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(medications)
      .groupBy(medications.userId);

    const medCountMap = new Map(medCounts.map((m) => [m.userId, m.count]));

    // Build provider list with their patients
    const providers = allUsers
      .filter((u) => u.role === "provider")
      .map((provider) => {
        const assignments = allAssignments.filter((a) => a.providerId === provider.id);
        const patients = assignments.map((a) => {
          const patient = allUsers.find((u) => u.id === a.patientId);
          return {
            assignmentId: a.id,
            id: patient?.id || a.patientId,
            name: patient?.name || null,
            email: patient?.email || "Unknown",
            medicationCount: medCountMap.get(a.patientId) || 0,
          };
        });
        return {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          providerType: provider.providerType,
          patientCount: patients.length,
          patients,
        };
      });

    // Find unassigned patients (patients with no provider)
    const assignedPatientIds = new Set(allAssignments.map((a) => a.patientId));
    const unassignedPatients = allUsers
      .filter(
        (u) =>
          (u.role === "patient" || u.role === "user") &&
          !assignedPatientIds.has(u.id)
      )
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        medicationCount: medCountMap.get(u.id) || 0,
        createdAt: u.createdAt,
      }));

    // Stats
    const totalPatients = allUsers.filter(
      (u) => u.role === "patient" || u.role === "user"
    ).length;
    const totalProviders = allUsers.filter((u) => u.role === "provider").length;
    const totalAssignments = allAssignments.length;

    return NextResponse.json({
      providers,
      unassignedPatients,
      stats: {
        totalPatients,
        totalProviders,
        totalAssignments,
        unassignedCount: unassignedPatients.length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
