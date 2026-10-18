
import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookie,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (
      typeof password !== "string" ||
      !process.env.OFFICE_PASSWORD ||
      password !== process.env.OFFICE_PASSWORD
    ) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const token = createSessionToken("office");
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      ...sessionCookie,
      value: token,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }
}
