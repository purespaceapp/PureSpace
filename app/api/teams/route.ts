
import { NextRequest, NextResponse } from "next/server";
import {
  randomBytes,
  scrypt as scryptCallback,
} from "node:crypto";
import { promisify } from "node:util";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOfficeSession } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  const key = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${key.toString("hex")}`;
}

// GET: List active teams (used by the team login screen)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("teams")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Teams loading error:", error);

      return NextResponse.json(
        { error: "Unable to load teams." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teams: data ?? [],
    });
  } catch (error) {
    console.error("Teams API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST: Create a team (Office only)
export async function POST(request: NextRequest) {
  const session = await requireOfficeSession();

  if (!session) {
    return NextResponse.json(
      { error: "Office access required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const password = body.password;

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Team name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: "Team password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { data, error } = await supabaseAdmin
      .from("teams")
      .insert({
        name,
        password_hash: passwordHash,
        is_active: true,
      })
      .select("id, name, is_active, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A team with this name already exists." },
          { status: 409 }
        );
      }

      console.error("Team creation error:", error);

      return NextResponse.json(
        { error: "Unable to create team." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        team: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Team creation API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// PATCH: Update team name, password or active status (Office only)
export async function PATCH(request: NextRequest) {
  const session = await requireOfficeSession();

  if (!session) {
    return NextResponse.json(
      { error: "Office access required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const teamId = Number(body.id);

    if (!Number.isSafeInteger(teamId) || teamId <= 0) {
      return NextResponse.json(
        { error: "Invalid team ID." },
        { status: 400 }
      );
    }

    const updates: {
      name?: string;
      password_hash?: string;
      is_active?: boolean;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 100
      ) {
        return NextResponse.json(
          { error: "Invalid team name." },
          { status: 400 }
        );
      }

      updates.name = body.name.trim();
    }

    if (body.password !== undefined) {
      if (
        typeof body.password !== "string" ||
        body.password.length < 8 ||
        body.password.length > 256
      ) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters." },
          { status: 400 }
        );
      }

      updates.password_hash = await hashPassword(body.password);
    }

    if (body.is_active !== undefined) {
      if (typeof body.is_active !== "boolean") {
        return NextResponse.json(
          { error: "Invalid active status." },
          { status: 400 }
        );
      }

      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json(
        { error: "No changes provided." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("teams")
      .update(updates)
      .eq("id", teamId)
      .select("id, name, is_active, updated_at")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A team with this name already exists." },
          { status: 409 }
        );
      }

      console.error("Team update error:", error);

      return NextResponse.json(
        { error: "Unable to update team." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Team not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: data,
    });
  } catch (error) {
    console.error("Team update API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
