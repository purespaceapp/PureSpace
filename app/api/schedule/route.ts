import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .select("*")
        .order("cleaning_date");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "by-property") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .select("*")
        .eq("property_id", Number(body.propertyId))
        .order("cleaning_date", {
          ascending: true,
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "create") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .insert([body.schedule])
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
      });
    }

    if (action === "update") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .update(body.schedule)
        .eq("id", Number(body.id))
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
      });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("schedule")
        .delete()
        .eq("id", Number(body.id));

      if (error) throw error;

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "complete") {
      const ids = Array.isArray(body.ids)
        ? body.ids.map(Number)
        : [];

      if (!ids.length) {
        return NextResponse.json(
          {
            success: false,
            error: "No schedule IDs provided",
          },
          { status: 400 }
        );
      }

      const { data: schedules, error: readError } =
        await supabaseAdmin
          .from("schedule")
          .select("*")
          .in("id", ids);

      if (readError) throw readError;

      const { error: updateError } = await supabaseAdmin
        .from("schedule")
        .update({
          status: "Completed",
        })
        .in("id", ids);

      if (updateError) throw updateError;

      for (const schedule of schedules ?? []) {
        const { data: reservation } = await supabaseAdmin
          .from("reservations")
          .select("*")
          .eq("property_id", schedule.property_id)
          .eq("check_out", schedule.cleaning_date)
          .maybeSingle();

        if (reservation) {
          const { error: reservationError } =
            await supabaseAdmin
              .from("reservations")
              .update({
                cleaning_status: "Completed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", reservation.id);

          if (reservationError) {
            throw reservationError;
          }
        }
      }

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "reassign") {
      const ids = Array.isArray(body.ids)
        ? body.ids.map(Number)
        : [];

      if (!ids.length || !body.employeeId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing schedule IDs or employee ID",
          },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("schedule")
        .update({
          employee_id: Number(body.employeeId),
        })
        .in("id", ids);

      if (error) throw error;

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "by-date") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .select("*")
        .eq("cleaning_date", body.date)
        .order("employee_id");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "completed-by-owner") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .select(`
          *,
          properties!inner(
            id,
            name,
            address,
            company_price,
            owner_id
          )
        `)
        .eq("status", "Completed")
        .eq("properties.owner_id", Number(body.ownerId))
        .order("cleaning_date", {
          ascending: false,
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "completed-by-property") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .select("*")
        .eq("property_id", Number(body.propertyId))
        .eq("status", "Completed")
        .order("cleaning_date", {
          ascending: false,
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "extras") {
      const { data, error } = await supabaseAdmin
        .from("schedule_extras")
        .select(`
          quantity,
          extras (
            id,
            name,
            owner_price
          )
        `)
        .eq("schedule_id", Number(body.scheduleId));

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "by-reservation") {
      const { data, error } = await supabaseAdmin
        .from("schedule")
        .select(`
          *,
          employees(
            id,
            name
          )
        `)
        .eq("reservation_id", body.reservationId)
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? null,
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
    console.error("Schedule API error:", error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}
