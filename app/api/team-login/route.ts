import { NextRequest, NextResponse } from "next/server";
import {
  createHash,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createSessionToken,
  sessionCookie,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const scrypt = promisify(scryptCallback);

async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const parts = storedHash.split("$");

    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }

    const salt = parts[1];
    const storedKey = Buffer.from(parts[2], "hex");

    if (
      !salt ||
      storedKey.length !== 64 ||
      !/^[a-f0-9]+$/i.test(parts[2])
    ) {
      return false;
    }

    const derivedKey = (await scrypt(
      password,
      salt,
      64
    )) as Buffer;

    return timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const teamId = Number(body.teamId);
    const password = body.password;

    if (
      !Number.isSafeInteger(teamId) ||
      teamId <= 0 ||
      typeof password !== "string" ||
      password.length < 1 ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: "Invalid login information." },
        { status: 400 }
      );
    }

    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .select("id, password_hash, is_active")
      .eq("id", teamId)
      .maybeSingle();

    if (error) {
      console.error("Team authentication error:", error);

      return NextResponse.json(
        { error: "Unable to verify team access." },
        { status: 500 }
      );
    }

    if (!team || !team.is_active) {
      return NextResponse.json(
        { error: "Invalid team or password." },
        { status: 401 }
      );
    }

    const validPassword = await verifyPassword(
      password,
      team.password_hash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid team or password." },
        { status: 401 }
      );
    }

   const teamAuthVersion = createHash("sha256")
  .update(team.password_hash)
  .digest("hex");
const token = createSessionToken("team", undefined, team.id, teamAuthVersion);
    const response = NextResponse.json({
      success: true,
      message: "Team access verified.",
    });

    response.cookies.set({
      ...sessionCookie,
      value: token,
    });

    return response;
  } catch (error) {
    console.error("Team login error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
