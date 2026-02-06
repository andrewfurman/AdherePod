import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

async function getCallerRole(userId: string): Promise<string | null> {
  const caller = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });
  return caller?.role ?? null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getCallerRole(session.user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        timezone: users.timezone,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .orderBy(asc(users.createdAt));

    return NextResponse.json(allUsers);
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

    const callerRole = await getCallerRole(session.user.id);
    if (callerRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Build update object from allowed fields
    const updates: Record<string, string> = {};

    if (body.role !== undefined) {
      if (!["user", "admin"].includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      if (userId === session.user.id && body.role !== "admin") {
        return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
      }
      updates.role = body.role;
    }

    if (body.name !== undefined) {
      updates.name = body.name;
    }

    if (body.email !== undefined) {
      if (!body.email || !body.email.includes("@")) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }
      updates.email = body.email;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST: Admin triggers password reset email for a user
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callerRole = await getCallerRole(session.user.id);
    if (callerRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (action !== "reset-password" || !userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await sendPasswordResetEmail(user.email, token, user.id);

    return NextResponse.json({ success: true, email: user.email });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
