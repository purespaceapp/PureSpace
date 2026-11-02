import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("extras")
        .select("*")
        .order("id");

      if (error) {
        console.error("Extras list error:", error);

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

    if (action === "save-schedule-extras") {
      const extras = body.extras ?? [];

      if (extras.length === 0) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }

      const rows = extras.map(
        (extra: { id: number; quantity: number }) => ({
          schedule_id: Number(body.scheduleId),
          extra_id: Number(extra.id),
          quantity: Number(extra.quantity),
        })
      );

      const { error } = await supabaseAdmin
        .from("schedule_extras")
        .insert(rows);

      if (error) {
        console.error(
          "Save schedule extras error:",
          error
        );

        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "schedule-extras") {
      const { data, error } = await supabaseAdmin
        .from("schedule_extras")
        .select("*")
        .eq("schedule_id", Number(body.scheduleId));

      if (error) {
        console.error(
          "Schedule extras list error:",
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

    if (action === "delete-schedule-extras") {
      const { error } = await supabaseAdmin
        .from("schedule_extras")
        .delete()
        .eq("schedule_id", Number(body.scheduleId));

      if (error) {
        console.error(
          "Delete schedule extras error:",
          error
        );

        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
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
    console.error("Extras API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
