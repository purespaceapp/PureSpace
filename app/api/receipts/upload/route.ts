import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabaseAdmin.storage
      .from("receipts")
      .upload(fileName, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("Receipt upload error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage
      .from("receipts")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      data: {
        publicUrl: data.publicUrl,
      },
    });
  } catch (error) {
    console.error("Receipt upload API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Receipt upload failed",
      },
      { status: 500 }
    );
  }
}
