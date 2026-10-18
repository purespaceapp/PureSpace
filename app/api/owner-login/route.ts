
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createSessionToken,
  sessionCookie,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc("owner_login", {
      p_email: email.trim(),
      p_password: password,
    });

    if (error) {
      console.error("Owner login error:", error);

      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const owner = data?.[0] ?? null;
    const ownerId = Number(owner?.id);

    if (!owner || !Number.isSafeInteger(ownerId) || ownerId <= 0) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const token = createSessionToken("owner", ownerId);
    const response = NextResponse.json({
      success: true,
      owner,
    });

    response.cookies.set({
      ...sessionCookie,
      value: token,
    });

    return response;
  } catch (error) {
    console.error("Owner login request error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
