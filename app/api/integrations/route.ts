import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "get") {
      const { data, error } = await supabaseAdmin
        .from("integrations")
        .select("*")
        .eq("owner_id", Number(body.ownerId))
        .eq("provider", "Guesty")
        .maybeSingle();

      if (error) {
        console.error("Integration get error:", error);

        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    if (action === "save") {
      const { data, error } = await supabaseAdmin
        .from("integrations")
        .upsert([body.integration])
        .select()
        .single();

      if (error) {
        console.error("Integration save error:", error);

        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Integrations API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
