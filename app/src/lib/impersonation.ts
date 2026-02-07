import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

interface Session {
  user?: { id: string; role?: string };
}

/**
 * Returns the effective user ID for read-only impersonation.
 * If `viewAs` query param is present and caller is admin, returns target user ID.
 * Otherwise returns the session user's own ID.
 */
export async function getEffectiveUserId(
  session: Session,
  reqUrl: string
): Promise<{ userId: string; isImpersonating: boolean }> {
  const sessionUserId = session.user?.id;
  if (!sessionUserId) {
    throw new ImpersonationError("UNAUTHORIZED", "No session");
  }

  const { searchParams } = new URL(reqUrl);
  const viewAs = searchParams.get("viewAs");

  if (!viewAs) {
    return { userId: sessionUserId, isImpersonating: false };
  }

  // Verify caller is admin via DB lookup (not JWT)
  const caller = await db.query.users.findFirst({
    where: eq(users.id, sessionUserId),
    columns: { role: true },
  });

  if (caller?.role !== "admin") {
    throw new ImpersonationError("FORBIDDEN", "Only admins can impersonate");
  }

  // Verify target user exists
  const target = await db.query.users.findFirst({
    where: eq(users.id, viewAs),
    columns: { id: true },
  });

  if (!target) {
    throw new ImpersonationError("TARGET_NOT_FOUND", "Target user not found");
  }

  return { userId: viewAs, isImpersonating: true };
}

export type ImpersonationErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "TARGET_NOT_FOUND";

export class ImpersonationError extends Error {
  code: ImpersonationErrorCode;

  constructor(code: ImpersonationErrorCode, message: string) {
    super(message);
    this.code = code;
  }

  get httpStatus(): number {
    switch (this.code) {
      case "UNAUTHORIZED": return 401;
      case "FORBIDDEN": return 403;
      case "TARGET_NOT_FOUND": return 404;
    }
  }
}
