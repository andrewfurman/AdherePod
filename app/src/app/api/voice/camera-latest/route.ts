import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { imageCaptures } from "@/lib/db/schema";
import { getEffectiveUserId, ImpersonationError } from "@/lib/impersonation";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await getEffectiveUserId(session, req.url);

    const [latest] = await db
      .select({
        description: imageCaptures.description,
        imageUrl: imageCaptures.imageUrl,
        capturedAt: imageCaptures.createdAt,
      })
      .from(imageCaptures)
      .where(eq(imageCaptures.userId, userId))
      .orderBy(desc(imageCaptures.createdAt))
      .limit(1);

    if (!latest) {
      return NextResponse.json({
        description: "No camera captures available yet.",
        imageUrl: null,
        capturedAt: null,
      });
    }

    return NextResponse.json(latest);
  } catch (err) {
    if (err instanceof ImpersonationError) {
      return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("Camera latest error:", message);
    return NextResponse.json(
      { error: "Failed to fetch latest camera capture", detail: message },
      { status: 500 }
    );
  }
}
