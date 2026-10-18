
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      role: session.role,
      ...(session.role === "owner"
        ? { ownerId: session.ownerId }
        : {}),
      expiresAt: session.exp,
    });
  } catch (error) {
    console.error("Session verification failed");

    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
