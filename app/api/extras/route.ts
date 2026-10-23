import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOfficeSession } from "@/lib/auth/authorization";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const officeSession = await requireOfficeSession();

      if (!officeSession) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const name = typeof body.name === "string" ? body.name.trim() : "";
      const ownerPrice = Number(body.owner_price);
      const cleanerPrice = Number(body.cleaner_price);

      if (
        !name ||
        !Number.isFinite(ownerPrice) ||
        ownerPrice < 0 ||
        !Number.isFinite(cleanerPrice) ||
        cleanerPrice < 0
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid extra details" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("extras")
        .insert({
          name,
          owner_price: ownerPrice,
          cleaner_price: cleanerPrice,
          per_hour: Boolean(body.per_hour),
        })
        .select("*")
        .single();

      if (error) {
        console.error("Create extra error:", error);
        return NextResponse.json(
          { success: false, error: "Unable to create extra" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === "update") {
      const officeSession = await requireOfficeSession();

      if (!officeSession) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const id = Number(body.id);
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const ownerPrice = Number(body.owner_price);
      const cleanerPrice = Number(body.cleaner_price);

      if (
        !Number.isSafeInteger(id) || id <= 0 ||
        !name ||
        !Number.isFinite(ownerPrice) || ownerPrice < 0 ||
        !Number.isFinite(cleanerPrice) || cleanerPrice < 0 ||
        typeof body.per_hour !== "boolean"
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid extra details" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("extras")
        .update({
          name,
          owner_price: ownerPrice,
          cleaner_price: cleanerPrice,
          per_hour: body.per_hour,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Update extra error:", error);
        return NextResponse.json(
          { success: false, error: "Unable to update extra" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

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
