import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc("owner_login", {
      p_email: email,
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

    if (!owner) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      owner,
    });
  } catch (error) {
    console.error("Owner login request error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
