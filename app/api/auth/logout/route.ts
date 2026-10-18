import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({ ...sessionCookie, value: "", maxAge: 0, expires: new Date(0) });
  return response;
}
