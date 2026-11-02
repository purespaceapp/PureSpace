
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireTeamSession } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only an authenticated team manager can access this endpoint.
    const session = await requireTeamSession();

    if (!session) {
      return NextResponse.json(
        { error: "Team access required." },
        { status: 401 }
      );
    }

    const teamId = session.teamId;

    // Confirm that the team still exists and is active.
    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("id, name, is_active")
      .eq("id", teamId)
      .maybeSingle();

    if (teamError) {
      console.error("Team verification error:", teamError);

      return NextResponse.json(
        { error: "Unable to verify team." },
        { status: 500 }
      );
    }

    if (!team || !team.is_active) {
      return NextResponse.json(
        { error: "This team is inactive or no longer available." },
        { status: 403 }
      );
    }

    // Get only properties assigned to this team.
    const { data: assignments, error: assignmentError } =
      await supabaseAdmin
        .from("team_properties")
        .select("property_id")
        .eq("team_id", teamId);

    if (assignmentError) {
      console.error("Team property assignments error:", assignmentError);

      return NextResponse.json(
        { error: "Unable to load assigned properties." },
        { status: 500 }
      );
    }

    const propertyIds = (assignments ?? []).map(
      (assignment) => assignment.property_id
    );

    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        team: {
          id: team.id,
          name: team.name,
        },
        properties: [],
        schedule: [],
        employees: [],
      });
    }

    // Load only the properties assigned to this team.
    const { data: properties, error: propertiesError } =
      await supabaseAdmin
        .from("properties")
        .select(
          "id, name, owner, address, phone, email, door_code, wifi_name, wifi_password, notes, property_images"
        )
        .in("id", propertyIds)
        .order("name", { ascending: true });

    if (propertiesError) {
      console.error("Team properties error:", propertiesError);

      return NextResponse.json(
        { error: "Unable to load team properties." },
        { status: 500 }
      );
    }

    // Load schedules only for this team's properties.
    const { data: schedule, error: scheduleError } =
      await supabaseAdmin
        .from("schedule")
        .select(
          "id, property_id, employee_id, cleaning_date, checkout_time, checkin_time, status, notes"
        )
        .in("property_id", propertyIds)
        .order("cleaning_date", { ascending: false })
        .limit(100);

    if (scheduleError) {
      console.error("Team schedule error:", scheduleError);

      return NextResponse.json(
        { error: "Unable to load team schedule." },
        { status: 500 }
      );
    }

    // Load cleaner names for employees assigned to this team's schedules.
    const employeeIds = [
      ...new Set(
        (schedule ?? [])
          .map((item) => item.employee_id)
          .filter((id): id is number => id !== null)
      ),
    ];

    let employees: { id: number; name: string }[] = [];

    if (employeeIds.length > 0) {
      const { data: employeeData, error: employeeError } =
        await supabaseAdmin
          .from("employees")
          .select("id, name")
          .in("id", employeeIds);

      if (employeeError) {
        console.error("Team employees error:", employeeError);

        return NextResponse.json(
          { error: "Unable to load assigned cleaners." },
          { status: 500 }
        );
      }

      employees = employeeData ?? [];
    }

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
      },
      properties: properties ?? [],
      schedule: schedule ?? [],
      employees,
    });
  } catch (error) {
    console.error("Team dashboard API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

