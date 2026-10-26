
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOfficeSession } from "@/lib/auth/authorization";

export const runtime = "nodejs";

type ManualInvoiceItem = {
  property_id: number;
  property_name: string;
  property_address: string | null;
  item_type: "cleaning" | "expense";
  item_date: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function POST(request: Request) {
  try {
    const officeSession = await requireOfficeSession();

    if (!officeSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const ownerId = Number(body.ownerId);
    const start = body.start;
    const end = body.end;

    if (
      !Number.isSafeInteger(ownerId) ||
      ownerId <= 0 ||
      !isValidDate(start) ||
      !isValidDate(end) ||
      start > end
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Select a valid client and date range.",
        },
        { status: 400 }
      );
    }

    const { data: owner, error: ownerError } = await supabaseAdmin
      .from("owners")
      .select("id, name, email, phone")
      .eq("id", ownerId)
      .maybeSingle();

    if (ownerError) throw ownerError;

    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Client not found." },
        { status: 404 }
      );
    }

    const { data: properties, error: propertiesError } =
      await supabaseAdmin
        .from("properties")
        .select("id, name, address, owner_id")
        .eq("owner_id", ownerId)
        .order("name", { ascending: true });

    if (propertiesError) throw propertiesError;

    const items: ManualInvoiceItem[] = [];
    let totalCleaning = 0;
    let totalExpenses = 0;

    for (const property of properties ?? []) {
      const { data: schedules, error: schedulesError } =
        await supabaseAdmin
          .from("schedule")
          .select("id, cleaning_date, company_charge, notes")
          .eq("property_id", property.id)
          .eq("status", "Completed")
          .gte("cleaning_date", start)
          .lte("cleaning_date", end)
          .order("cleaning_date", { ascending: true });

      if (schedulesError) throw schedulesError;

      const scheduleIds = (schedules ?? []).map((schedule) =>
        Number(schedule.id)
      );

      const extrasBySchedule = new Map<number, string[]>();

      if (scheduleIds.length > 0) {
        const { data: scheduleExtras, error: scheduleExtrasError } =
          await supabaseAdmin
            .from("schedule_extras")
            .select("schedule_id, extra_id")
            .in("schedule_id", scheduleIds);

        if (scheduleExtrasError) throw scheduleExtrasError;

        const extraIds = Array.from(
          new Set(
            (scheduleExtras ?? [])
              .map((extra) => Number(extra.extra_id))
              .filter(
                (id) => Number.isSafeInteger(id) && id > 0
              )
          )
        );

        const extraNames = new Map<number, string>();

        if (extraIds.length > 0) {
          const { data: catalog, error: catalogError } =
            await supabaseAdmin
              .from("extras")
              .select("id, name")
              .in("id", extraIds);

          if (catalogError) throw catalogError;

          for (const extra of catalog ?? []) {
            extraNames.set(
              Number(extra.id),
              String(extra.name ?? "")
            );
          }
        }

        for (const scheduleExtra of scheduleExtras ?? []) {
          const scheduleId = Number(scheduleExtra.schedule_id);
          const name = String(
            extraNames.get(Number(scheduleExtra.extra_id)) ?? ""
          ).trim();

          if (!name) continue;

          const current = extrasBySchedule.get(scheduleId) ?? [];

          if (!current.includes(name)) {
            current.push(name);
          }

          extrasBySchedule.set(scheduleId, current);
        }
      }

      for (const schedule of schedules ?? []) {
        const amount = toNumber(schedule.company_charge);
        totalCleaning += amount;

        const extraNames =
          extrasBySchedule.get(Number(schedule.id)) ?? [];

        const details = [
          "Regular Cleaning",
          ...(extraNames.length
            ? [`Extras: ${extraNames.join(", ")}`]
            : []),
          schedule.notes
            ? `Notes: ${String(schedule.notes).trim()}`
            : "",
        ].filter(Boolean);

        items.push({
          property_id: Number(property.id),
          property_name: String(property.name ?? "Property"),
          property_address: property.address ?? null,
          item_type: "cleaning",
          item_date: String(schedule.cleaning_date),
          description: details.join(" — "),
          quantity: 1,
          unit_price: amount,
          amount,
        });
      }

      const { data: receipts, error: receiptsError } =
        await supabaseAdmin
          .from("receipts")
          .select(
            "id, schedule_id, purchase_date, amount, office_notes"
          )
          .eq("property_id", property.id)
          .eq("status", "Approved")
          .gte("purchase_date", start)
          .lte("purchase_date", end)
          .order("purchase_date", { ascending: true });

      if (receiptsError) throw receiptsError;

      for (const receipt of receipts ?? []) {
        const amount = toNumber(receipt.amount);
        totalExpenses += amount;

        items.push({
          property_id: Number(property.id),
          property_name: String(property.name ?? "Property"),
          property_address: property.address ?? null,
          item_type: "expense",
          item_date: String(receipt.purchase_date),
          description: String(
            receipt.office_notes || "Property Expense"
          ),
          quantity: 1,
          unit_price: amount,
          amount,
        });
      }
    }

    items.sort(
      (a, b) =>
        a.item_date.localeCompare(b.item_date) ||
        a.property_name.localeCompare(b.property_name)
    );

    const { data: hstSetting, error: hstError } =
      await supabaseAdmin
        .from("app_settings")
        .select("value")
        .eq("key", "hst_enabled")
        .maybeSingle();

    if (hstError) throw hstError;

    const globalHstEnabled = hstSetting?.value === "true";

    const hstEnabled =
      typeof body.hstEnabled === "boolean"
        ? body.hstEnabled
        : globalHstEnabled;

    const subtotal = totalCleaning + totalExpenses;
    const hstAmount = hstEnabled ? subtotal * 0.13 : 0;

    return NextResponse.json({
      success: true,
      data: {
        owner,
        period_start: start,
        period_end: end,
        hst_enabled: hstEnabled,
        total_cleaning: totalCleaning,
        total_expenses: totalExpenses,
        subtotal,
        hst_amount: hstAmount,
        total_due: subtotal + hstAmount,
        items,
      },
    });
  } catch (error) {
    console.error("Manual invoice preview error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare manual invoice.",
      },
      { status: 500 }
    );
  }
}
