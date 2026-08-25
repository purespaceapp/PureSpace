import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("owners")
        .select(`
          id,
          name,
          email,
          phone,
          terms_accepted,
          terms_accepted_at,
          terms_version
        `)
        .order("name");

      if (error) {
        console.error("Owners list error:", error);

        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "accept-terms") {
      const { data, error } = await supabaseAdmin
        .from("owners")
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: body.termsVersion,
        })
        .eq("id", Number(body.ownerId))
        .select(`
          id,
          name,
          email,
          phone,
          terms_accepted,
          terms_accepted_at,
          terms_version
        `)
        .single();

      if (error) {
        console.error(
          "Owner terms update error:",
          error
        );

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
    console.error("Owners API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
