import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
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

      const fileBuffer = Buffer.from(
        await file.arrayBuffer()
      );

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from("property-images")
          .upload(filePath, fileBuffer, {
            contentType: file.type || "application/octet-stream",
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

      const {
        data: publicUrlData,
      } = supabaseAdmin.storage
        .from("property-images")
        .getPublicUrl(filePath);

      return NextResponse.json({
        success: true,
        data: {
          imageUrl: publicUrlData.publicUrl,
        },
      });
    }

    const body = await request.json();
    const { action } = body;
  

    if (action === "list") {
      let query = supabaseAdmin
        .from("properties")
        .select("*")
        .order("name");

      if (body.ownerId) {
        query = query.eq("owner_id", Number(body.ownerId));
      }

      const { data, error } = await query;

      if (error) {
        console.error("Properties list error:", error);
        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    if (action === "create") {
      const { data, error } = await supabaseAdmin
        .from("properties")
        .insert([body.property])
        .select()
        .single();

      if (error) {
        console.error("Property create error:", error);
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

    if (action === "update") {
      const { data, error } = await supabaseAdmin
        .from("properties")
        .update(body.property)
        .eq("id", Number(body.id))
        .select()
        .single();

      if (error) {
        console.error("Property update error:", error);
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

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("properties")
        .delete()
        .eq("id", Number(body.id));

      if (error) {
        console.error("Property delete error:", error);
        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "airbnb") {
      const { error } = await supabaseAdmin
        .from("properties")
        .update({
          airbnb_listing_url: body.airbnb_listing_url,
          airbnb_calendar_url: body.airbnb_calendar_url,
          airbnb_connected: body.airbnb_connected,
          last_airbnb_sync: new Date().toISOString(),
        })
        .eq("id", Number(body.id));

      if (error) {
        console.error("Airbnb update error:", error);
        return NextResponse.json(
          { success: false },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Properties API error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
