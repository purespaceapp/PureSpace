
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSessionToken, sessionCookie } from "@/lib/auth/session";
import { requireOfficeSession } from "@/lib/auth/authorization";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Cleaner login: remains public, but creates a signed server session.
    if (action === "cleaner-list") {
      const { data, error } = await supabaseAdmin
        .from("employees")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Cleaner list error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: data ?? [] });
    }

    if (action === "cleaner-login") {
      const employeeId = Number(body.employeeId);
      const pin = String(body.pin ?? "");

      if (!Number.isSafeInteger(employeeId) || employeeId <= 0 || !pin) {
        return NextResponse.json({ success: false }, { status: 401 });
      }

      const { data: employee, error } = await supabaseAdmin
        .from("employees")
        .select("id, name, phone, email, status, notes, pin")
        .eq("id", employeeId)
        .maybeSingle();

      if (error || !employee || employee.pin !== pin || employee.status === "Inactive") {
        return NextResponse.json({ success: false }, { status: 401 });
      }

      const token = createSessionToken(
        "cleaner",
        undefined,
        undefined,
        undefined,
        employee.id
      );

      const cookieStore = await cookies();
      cookieStore.set(sessionCookie.name, token, sessionCookie);

      const { pin: _pin, ...safeEmployee } = employee;

      return NextResponse.json({
        success: true,
        employee: safeEmployee,
      });
    }

    // All employee management actions require Office authentication.
    const officeSession = await requireOfficeSession();

    if (!officeSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("employees")
        .select("id, name, phone, email, status, notes")
        .order("name");

      if (error) {
        console.error("Employees list error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: data ?? [] });
    }

    if (action === "create") {
      const { data, error } = await supabaseAdmin
        .from("employees")
        .insert([body.employee])
        .select("id, name, phone, email, status, notes")
        .single();

      if (error) {
        console.error("Employee create error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === "update") {
      const employeeId = Number(body.id);

      if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
        return NextResponse.json({ success: false }, { status: 400 });
      }

      const { pin, ...employeeUpdates } = body.employee ?? {};
      const updates = {
        ...employeeUpdates,
        ...(typeof pin === "string" && pin.trim() ? { pin } : {}),
      };

      const { data, error } = await supabaseAdmin
        .from("employees")
        .update(updates)
        .eq("id", employeeId)
        .select("id, name, phone, email, status, notes")
        .single();

      if (error) {
        console.error("Employee update error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === "delete") {
      const employeeId = Number(body.id);

      if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
        return NextResponse.json({ success: false }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("employees")
        .delete()
        .eq("id", employeeId);

      if (error) {
        console.error("Employee delete error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Employees API error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
