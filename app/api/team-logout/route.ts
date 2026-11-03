
import { NextResponse } from "next/server";
import { teamSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Team session closed.",
  });

  response.cookies.set({
    ...teamSessionCookie,
    value: "",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
