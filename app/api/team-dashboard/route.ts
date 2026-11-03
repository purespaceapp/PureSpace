
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireTeamSession } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireTeamSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Team access required." },
      { status: 401 }
    );
  }

  try {
    const teamId = session.teamId;

    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("id, name, is_active")
      .eq("id", teamId)
      .eq("is_active", true)
      .maybeSingle();

    if (teamError) throw teamError;

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found or inactive." },
        { status: 404 }
      );
    }

    const [
      { data: propertyAssignments, error: propertyAssignmentError },
      { data: memberAssignments, error: memberAssignmentError },
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

    if (propertyAssignmentError) throw propertyAssignmentError;
    if (memberAssignmentError) throw memberAssignmentError;

    const propertyIds = (propertyAssignments ?? [])
      .map((item: any) => Number(item.property_id))
      .filter((id: number) => Number.isSafeInteger(id) && id > 0);

    const employeeIds = (memberAssignments ?? [])
      .map((item: any) => Number(item.employee_id))
      .filter((id: number) => Number.isSafeInteger(id) && id > 0);

    let properties: any[] = [];
    let schedule: any[] = [];
    let employees: any[] = [];

    if (propertyIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("properties")
        .select(`
          id,
          name,
          owner,
          address,
          phone,
          email,
          door_code,
          wifi_name,
          wifi_password,
          notes,
          property_images
        `)
        .in("id", propertyIds)
        .order("name", { ascending: true });

      if (error) throw error;
      properties = data ?? [];

      const { data: scheduleData, error: scheduleError } =
        await supabaseAdmin
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
          .in("property_id", propertyIds)
          .order("cleaning_date", { ascending: false })
          .limit(100);

      if (scheduleError) throw scheduleError;
      schedule = scheduleData ?? [];
    }

    if (employeeIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("employees")
        .select("id, name")
        .in("id", employeeIds)
        .order("name", { ascending: true });

      if (error) throw error;
      employees = data ?? [];
    }

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
      },
      properties,
      schedule,
      employees,
    });
  } catch (error) {
    console.error("Team dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load team workspace.",
      },
      { status: 500 }
    );
  }
}
