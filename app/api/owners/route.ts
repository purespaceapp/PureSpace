import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import {
  requireOfficeSession,
  requireOwnerSession,
} from "@/lib/auth/authorization";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      const officeSession = await requireOfficeSession();
      const ownerSession = officeSession
        ? null
        : await requireOwnerSession();

      if (!officeSession && !ownerSession) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      let query = supabaseAdmin
        .from("owners")
        .select(`
          id,
          name,
          email,
          phone,
          terms_accepted,
          terms_accepted_at,
          terms_version
        `);

      if (ownerSession) {
        query = query.eq("id", ownerSession.ownerId);
      } else {
        query = query.order("name");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Owners list error:", error);
        return NextResponse.json(
          { success: false, error: "Unable to load owners" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "accept-terms") {
      const officeSession = await requireOfficeSession();
const ownerSession = officeSession
  ? null
  : await requireOwnerSession();

if (!officeSession && !ownerSession) {
  return NextResponse.json(
    { success: false },
    { status: 401 }
  );
}

const ownerId = ownerSession
  ? ownerSession.ownerId
  : Number(body.ownerId);

if (!Number.isSafeInteger(ownerId) || ownerId <= 0) {
  return NextResponse.json(
    { success: false },
    { status: 400 }
  );
}

if (
  typeof body.termsVersion !== "string" ||
  !body.termsVersion.trim()
) {
  return NextResponse.json(
    { success: false },
    { status: 400 }
  );
}
      const { data, error } = await supabaseAdmin
        .from("owners")
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: body.termsVersion,
        })
        .eq("id", ownerId)
        .select(`
          id,
          name,
          email,
          phone,
          terms_accepted,
          terms_accepted_at,
          terms_version
        `)
        .single();

      if (error) {
        console.error(
          "Owner terms update error:",
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

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Owners API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
