
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

      const name =
        typeof body.name === "string" ? body.name.trim() : "";
      const ownerPrice = Number(body.owner_price);
      const cleanerPrice = Number(body.cleaner_price);

      if (
        !name ||
        body.owner_price === undefined ||
        body.cleaner_price === undefined ||
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
          per_hour: false,
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
      const name =
        typeof body.name === "string" ? body.name.trim() : "";
      const ownerPrice = Number(body.owner_price);
      const cleanerPrice = Number(body.cleaner_price);

      if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        !name ||
        body.owner_price === undefined ||
        body.cleaner_price === undefined ||
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
        .update({
          name,
          owner_price: ownerPrice,
          cleaner_price: cleanerPrice,
          per_hour: false,
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
          { success: false, error: "Unable to list extras" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "save-schedule-extras") {
      const officeSession = await requireOfficeSession();

      if (!officeSession) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const scheduleId = Number(body.scheduleId);
      const extras = body.extras;

      if (!Number.isSafeInteger(scheduleId) || scheduleId <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid schedule ID" },
          { status: 400 }
        );
      }

      if (!Array.isArray(extras)) {
        return NextResponse.json(
          { success: false, error: "Extras must be an array" },
          { status: 400 }
        );
      }

      const normalizedExtras: {
        id: number;
        quantity: number;
      }[] = [];

      for (const extra of extras) {
        const id = Number(extra?.id);
        const quantity = Number(extra?.quantity);

        if (
          !Number.isSafeInteger(id) ||
          id <= 0 ||
          !Number.isSafeInteger(quantity) ||
          quantity < 1
        ) {
          return NextResponse.json(
            { success: false, error: "Invalid extra details" },
            { status: 400 }
          );
        }

        normalizedExtras.push({ id, quantity });
      }

      const { data: schedule, error: scheduleError } =
        await supabaseAdmin
          .from("schedules")
          .select("id")
          .eq("id", scheduleId)
          .maybeSingle();

      if (scheduleError) {
        console.error("Schedule lookup error:", scheduleError);

        return NextResponse.json(
          { success: false, error: "Unable to verify schedule" },
          { status: 500 }
        );
      }

      if (!schedule) {
        return NextResponse.json(
          { success: false, error: "Schedule not found" },
          { status: 404 }
        );
      }

      if (normalizedExtras.length > 0) {
        const extraIds = normalizedExtras.map((extra) => extra.id);

        const { data: catalogExtras, error: catalogError } =
          await supabaseAdmin
            .from("extras")
            .select("id")
            .in("id", extraIds);

        if (catalogError) {
          console.error("Catalog validation error:", catalogError);

          return NextResponse.json(
            { success: false, error: "Unable to validate extras" },
            { status: 500 }
          );
        }

        const validIds = new Set(
          (catalogExtras ?? []).map((extra) => Number(extra.id))
        );

        if (normalizedExtras.some((extra) => !validIds.has(extra.id))) {
          return NextResponse.json(
            { success: false, error: "An extra does not exist" },
            { status: 400 }
          );
        }
      }

      const { error: deleteError } = await supabaseAdmin
        .from("schedule_extras")
        .delete()
        .eq("schedule_id", scheduleId);

      if (deleteError) {
        console.error("Delete existing schedule extras error:", deleteError);

        return NextResponse.json(
          { success: false, error: "Unable to replace existing extras" },
          { status: 500 }
        );
      }

      if (normalizedExtras.length > 0) {
        const rows = normalizedExtras.map((extra) => ({
          schedule_id: scheduleId,
          extra_id: extra.id,
          quantity: extra.quantity,
        }));

        const { error: insertError } = await supabaseAdmin
          .from("schedule_extras")
          .insert(rows);

        if (insertError) {
          console.error("Insert schedule extras error:", insertError);

          return NextResponse.json(
            { success: false, error: "Unable to save extras" },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    if (action === "schedule-extras") {
      const scheduleId = Number(body.scheduleId);

      if (!Number.isSafeInteger(scheduleId) || scheduleId <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid schedule ID" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("schedule_extras")
        .select("*")
        .eq("schedule_id", scheduleId);

      if (error) {
        console.error("Schedule extras list error:", error);

        return NextResponse.json(
          { success: false, error: "Unable to list schedule extras" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "delete-schedule-extras") {
      const officeSession = await requireOfficeSession();

      if (!officeSession) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const scheduleId = Number(body.scheduleId);

      if (!Number.isSafeInteger(scheduleId) || scheduleId <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid schedule ID" },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("schedule_extras")
        .delete()
        .eq("schedule_id", scheduleId);

      if (error) {
        console.error("Delete schedule extras error:", error);

        return NextResponse.json(
          { success: false, error: "Unable to delete schedule extras" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Extras API error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
