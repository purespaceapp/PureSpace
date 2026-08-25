import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "cleaner-list") {
      const { data, error } = await supabaseAdmin
        .from("employees")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Cleaner list error:", error);
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

    if (action === "cleaner-login") {
      const { data, error } = await supabaseAdmin
        .from("employees")
        .select("id, name, phone, email, status, notes")
        .eq("id", Number(body.employeeId))
        .eq("pin", body.pin)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { success: false },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        employee: data,
      });
    }

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("employees")
        .select("id, name, phone, email, status, notes")
        .order("name");

      if (error) {
        console.error("Employees list error:", error);
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
        .from("employees")
        .insert([body.employee])
        .select("id, name, phone, email, status, notes")
        .single();

      if (error) {
        console.error("Employee create error:", error);
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
        .from("employees")
        .update(body.employee)
        .eq("id", Number(body.id))
        .select("id, name, phone, email, status, notes")
        .single();

      if (error) {
        console.error("Employee update error:", error);
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
        .from("employees")
        .delete()
        .eq("id", Number(body.id));

      if (error) {
        console.error("Employee delete error:", error);
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
    console.error("Employees API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
