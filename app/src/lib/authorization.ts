import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, providerPatients } from "@/lib/db/schema";

export async function getUserRole(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });
  // Treat legacy "user" role as "patient"
  if (user?.role === "user") return "patient";
  return user?.role ?? null;
}

export async function isProviderForPatient(
  providerId: string,
  patientId: string
): Promise<boolean> {
  const link = await db.query.providerPatients.findFirst({
    where: and(
      eq(providerPatients.providerId, providerId),
      eq(providerPatients.patientId, patientId)
    ),
  });
  return !!link;
}

/**
 * Returns true if the caller can access the patient's data.
 * Allowed if: caller IS the patient, caller is admin, or caller is an assigned provider.
 */
export async function canAccessPatientData(
  callerId: string,
  patientId: string
): Promise<boolean> {
  if (callerId === patientId) return true;

  const role = await getUserRole(callerId);
  if (role === "admin") return true;
  if (role === "provider") {
    return isProviderForPatient(callerId, patientId);
  }

  return false;
}
