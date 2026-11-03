import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireTeamSession } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

type ScheduleAction = "list" | "create" | "update" | "delete";

function validId(value: unknown): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function getTeamAssignments(teamId: number) {
  const [
    { data: propertyRows, error: propertyError },
    { data: memberRows, error: memberError },
  ] = await Promise.all([
    supabaseAdmin
      .from("team_properties")
      .select("property_id")
      .eq("team_id", teamId),
    supabaseAdmin
      .from("team_members")
      .select("employee_id")
      .eq("team_id", teamId),
  ]);

  if (propertyError) throw propertyError;
  if (memberError) throw memberError;

  return {
    propertyIds: (propertyRows ?? [])
      .map((row: any) => validId(row.property_id))
      .filter((id): id is number => id !== null),
    employeeIds: (memberRows ?? [])
      .map((row: any) => validId(row.employee_id))
      .filter((id): id is number => id !== null),
  };
}

async function validateAssignments(
  teamId: number,
  propertyId: number,
  employeeId: number
) {
  const assignments = await getTeamAssignments(teamId);

  if (!assignments.propertyIds.includes(propertyId)) {
    return { error: "This property is not assigned to your team." };
  }

  if (!assignments.employeeIds.includes(employeeId)) {
    return { error: "This cleaner is not assigned to your team." };
  }

  const [
    { data: property, error: propertyError },
    { data: employee, error: employeeError },
  ] = await Promise.all([
    supabaseAdmin
      .from("properties")
      .select("id, cleaner_price, company_price")
      .eq("id", propertyId)
      .maybeSingle(),
    supabaseAdmin
      .from("employees")
      .select("id")
      .eq("id", employeeId)
      .maybeSingle(),
  ]);

  if (propertyError) throw propertyError;
  if (employeeError) throw employeeError;

  if (!property) return { error: "Property not found." };
  if (!employee) return { error: "Cleaner not found." };

  return { property };
}

export async function POST(request: Request) {
  const session = await requireTeamSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Team access required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action as ScheduleAction;
    const teamId = session.teamId;

    if (!["list", "create", "update", "delete"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action." },
        { status: 400 }
      );
    }

    const assignments = await getTeamAssignments(teamId);

    if (action === "list") {
      if (
        assignments.propertyIds.length === 0 ||
        assignments.employeeIds.length === 0
      ) {
        return NextResponse.json({ success: true, schedule: [] });
      }

      const { data, error } = await supabaseAdmin
        .from("schedule")
        .select(`
          id,
          property_id,
          employee_id,
          cleaning_date,
          checkout_time,
          checkin_time,
          status,
          notes
        `)
        .in("property_id", assignments.propertyIds)
        .in("employee_id", assignments.employeeIds)
        .order("cleaning_date", { ascending: true });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        schedule: data ?? [],
      });
    }

    if (action === "create") {
      const propertyId = validId(body.property_id);
      const employeeId = validId(body.employee_id);
      const cleaningDate = validText(body.cleaning_date);

      if (!propertyId || !employeeId || !cleaningDate) {
        return NextResponse.json(
          {
            success: false,
            error: "Property, cleaner and date are required.",
          },
          { status: 400 }
        );
      }

      const validation = await validateAssignments(
        teamId,
        propertyId,
        employeeId
      );

      if (validation.error || !validation.property) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 403 }
        );
      }

      const scheduleData = {
        property_id: propertyId,
        employee_id: employeeId,
        cleaning_date: cleaningDate,
        checkout_time: validText(body.checkout_time) || null,
        checkin_time: validText(body.checkin_time) || null,
        notes: validText(body.notes),
        status: "Scheduled",
        cleaner_pay: Number(validation.property.cleaner_price) || 0,
        company_charge: Number(validation.property.company_price) || 0,
      };

      const { data, error } = await supabaseAdmin
        .from("schedule")
        .insert(scheduleData)
        .select(`
          id,
          property_id,
          employee_id,
          cleaning_date,
          checkout_time,
          checkin_time,
          status,
          notes
        `)
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, schedule: data });
    }

    const scheduleId = validId(body.id);

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: "A valid cleaning ID is required." },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("schedule")
      .select("id, property_id, employee_id")
      .eq("id", scheduleId)
      .maybeSingle();

    if (existingError) throw existingError;

    const existingPropertyId = validId(existing?.property_id);
    const existingEmployeeId = validId(existing?.employee_id);

    if (
      !existing ||
      !existingPropertyId ||
      !existingEmployeeId ||
      !assignments.propertyIds.includes(existingPropertyId) ||
      !assignments.employeeIds.includes(existingEmployeeId)
    ) {
      return NextResponse.json(
        { success: false, error: "Cleaning not found for your team." },
        { status: 404 }
      );
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("schedule")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    if (action === "update") {
      const propertyId = validId(body.property_id);
      const employeeId = validId(body.employee_id);
      const cleaningDate = validText(body.cleaning_date);

      if (!propertyId || !employeeId || !cleaningDate) {
        return NextResponse.json(
          {
            success: false,
            error: "Property, cleaner and date are required.",
          },
          { status: 400 }
        );
      }

      const validation = await validateAssignments(
        teamId,
        propertyId,
        employeeId
      );

      if (validation.error || !validation.property) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 403 }
        );
      }

      const allowedStatuses = ["Scheduled", "Completed", "Cancelled"];
      const requestedStatus = validText(body.status);
      const status = allowedStatuses.includes(requestedStatus)
        ? requestedStatus
        : "Scheduled";

      const scheduleData = {
        property_id: propertyId,
        employee_id: employeeId,
        cleaning_date: cleaningDate,
        checkout_time: validText(body.checkout_time) || null,
        checkin_time: validText(body.checkin_time) || null,
        notes: validText(body.notes),
        status,
      };

      const { data, error } = await supabaseAdmin
        .from("schedule")
        .update(scheduleData)
        .eq("id", scheduleId)
        .select(`
          id,
          property_id,
          employee_id,
          cleaning_date,
          checkout_time,
          checkin_time,
          status,
          notes
        `)
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, schedule: data });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Team schedule error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to process team cleaning." },
      { status: 500 }
    );
  }
}
