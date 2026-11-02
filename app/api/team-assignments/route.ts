import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOfficeSession } from "@/lib/auth/authorization";

function isValidId(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

export async function GET() {
  const session = await requireOfficeSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [
      teamsResult,
      employeesResult,
      propertiesResult,
      membersResult,
      assignmentsResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("teams")
        .select("id, name, is_active")
        .order("name"),

      supabaseAdmin
        .from("employees")
        .select("id, name, phone, email, status")
        .order("name"),

      supabaseAdmin
        .from("properties")
        .select("id, name, address")
        .order("name"),

      supabaseAdmin
        .from("team_members")
        .select("team_id, employee_id"),

      supabaseAdmin
        .from("team_properties")
        .select("team_id, property_id"),
    ]);

    const error =
      teamsResult.error ||
      employeesResult.error ||
      propertiesResult.error ||
      membersResult.error ||
      assignmentsResult.error;

    if (error) {
      console.error("Team assignments GET error:", error);

      return NextResponse.json(
        { success: false, error: "Could not load team assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teams: teamsResult.data ?? [],
      employees: employeesResult.data ?? [],
      properties: propertiesResult.data ?? [],
      members: membersResult.data ?? [],
      propertyAssignments: assignmentsResult.data ?? [],
    });
  } catch (error) {
    console.error("Team assignments GET exception:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await requireOfficeSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, teamId, employeeId, propertyId } = body;

    if (!isValidId(teamId)) {
      return NextResponse.json(
        { success: false, error: "Invalid team ID" },
        { status: 400 }
      );
    }

    if (action === "assign_employee") {
      if (!isValidId(employeeId)) {
        return NextResponse.json(
          { success: false, error: "Invalid employee ID" },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("team_members")
        .upsert(
          { team_id: teamId, employee_id: employeeId },
          { onConflict: "team_id,employee_id", ignoreDuplicates: true }
        );

      if (error) {
        console.error("Assign employee error:", error);

        return NextResponse.json(
          { success: false, error: "Could not assign employee" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === "assign_property") {
      if (!isValidId(propertyId)) {
        return NextResponse.json(
          { success: false, error: "Invalid property ID" },
          { status: 400 }
        );
      }

      // Each property can belong to only one team.
      // Assigning it again moves it to the selected team.
      const { error } = await supabaseAdmin
        .from("team_properties")
        .upsert(
          { team_id: teamId, property_id: propertyId },
          { onConflict: "property_id" }
        );

      if (error) {
        console.error("Assign property error:", error);

        return NextResponse.json(
          { success: false, error: "Could not assign property" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Team assignments POST exception:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireOfficeSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, teamId, employeeId, propertyId } = body;

    if (!isValidId(teamId)) {
      return NextResponse.json(
        { success: false, error: "Invalid team ID" },
        { status: 400 }
      );
    }

    if (action === "remove_employee") {
      if (!isValidId(employeeId)) {
        return NextResponse.json(
          { success: false, error: "Invalid employee ID" },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("employee_id", employeeId);

      if (error) {
        console.error("Remove employee error:", error);

        return NextResponse.json(
          { success: false, error: "Could not remove employee" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === "remove_property") {
      if (!isValidId(propertyId)) {
        return NextResponse.json(
          { success: false, error: "Invalid property ID" },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("team_properties")
        .delete()
        .eq("team_id", teamId)
        .eq("property_id", propertyId);

      if (error) {
        console.error("Remove property error:", error);

        return NextResponse.json(
          { success: false, error: "Could not remove property" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Team assignments DELETE exception:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
