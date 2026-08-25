import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .order("check_in", {
          ascending: true,
        });

      if (error) {
        console.error("Reservations list error:", error);

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

    if (action === "by-property") {
      const { data, error } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("property_id", body.propertyId)
        .order("check_in");

      if (error) {
        console.error(
          "Reservations by property error:",
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

    if (action === "create") {
      const { data, error } = await supabaseAdmin
        .from("reservations")
        .insert(body.reservation)
        .select()
        .single();

      if (error) {
        console.error(
          "Reservation create error:",
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

    if (action === "update") {
      const { data, error } = await supabaseAdmin
        .from("reservations")
        .update({
          ...body.reservation,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Reservation update error:",
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

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("reservations")
        .delete()
        .eq("id", body.id);

      if (error) {
        console.error(
          "Reservation delete error:",
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

    if (action === "complete") {
      const { error } = await supabaseAdmin
        .from("reservations")
        .update({
          cleaning_status: "Completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.id);

      if (error) {
        console.error(
          "Reservation complete error:",
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
    console.error(
      "Reservations API error:",
      error
    );

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
