import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      let query = supabaseAdmin
        .from("receipts")
        .select("*")
        .order("purchase_date", { ascending: false });

      if (body.employeeId) {
        query = query.eq("employee_id", Number(body.employeeId));
      }

      const { data, error } = await query;

      if (error) {
        console.error("Receipts list error:", error);
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
        .from("receipts")
        .insert([body.receipt])
        .select()
        .single();

      if (error) {
        console.error("Receipt create error:", error);
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

    if (action === "update-status") {
      const { data, error } = await supabaseAdmin
        .from("receipts")
        .update({
          status: body.status,
        })
        .eq("id", Number(body.id))
        .select();

      if (error) {
        console.error("Receipt status update error:", error);
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
        .from("receipts")
        .select("*")
        .eq("property_id", Number(body.propertyId))
        .eq("status", "Approved")
        .order("purchase_date", {
          ascending: false,
        });

      if (error) {
        console.error("Receipts by property error:", error);
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

    if (action === "approved-by-employee") {
      const { data, error } = await supabaseAdmin
        .from("receipts")
        .select("*")
        .eq("employee_id", Number(body.employeeId))
        .eq("status", "Approved")
        .order("purchase_date", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Approved cleaner receipts error:",
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
    console.error("Receipts API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
