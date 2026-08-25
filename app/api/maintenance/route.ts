import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("maintenance_issues")
        .select("*")
        .order("reported_at", { ascending: false });

      if (error) {
        console.error("Maintenance list error:", error);

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

    if (action === "create") {
      const { data, error } = await supabaseAdmin
        .from("maintenance_issues")
        .insert(body.issue)
        .select()
        .single();

      if (error) {
        console.error("Maintenance create error:", error);

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

    if (action === "resolve") {
      const { data, error } = await supabaseAdmin
        .from("maintenance_issues")
        .update({
          status: "Resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", Number(body.id))
        .select()
        .single();

      if (error) {
        console.error("Maintenance resolve error:", error);

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

    if (action === "reopen") {
      const { data, error } = await supabaseAdmin
        .from("maintenance_issues")
        .update({
          status: "Open",
          resolved_at: null,
        })
        .eq("id", Number(body.id))
        .select()
        .single();

      if (error) {
        console.error("Maintenance reopen error:", error);

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

    if (action === "by-property") {
      const { data, error } = await supabaseAdmin
        .from("maintenance_issues")
        .select("*")
        .eq("property_id", Number(body.propertyId))
        .order("reported_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Maintenance by property error:",
          error
        );

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

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Maintenance API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
