import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const propertyId = formData.get("propertyId");

    if (!(file instanceof File) || !propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing file or property ID",
        },
        { status: 400 }
      );
    }

    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "-"
    );

    const filePath = `${Number(propertyId)}/${Date.now()}-${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("property-images")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Property image upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          success: false,
          error: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data } =
      supabaseAdmin.storage
        .from("property-images")
        .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
    });
  } catch (error) {
    console.error(
      "Property image upload API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Image upload failed",
      },
      { status: 500 }
    );
  }
}
