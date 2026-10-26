
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type GeneratePeriodInput = {
  start: string;
  end: string;
  hstEnabled?: boolean;
};

type GeneratedInvoice = {
  id: number;
  invoice_number: string;
  owner_id: number;
  property_id: number;
  period_start: string;
  period_end: string;
};

type InvoiceItemInput = {
  item_type: string;
  schedule_id: number | null;
  receipt_id: number | null;
  item_date: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function generateInvoicesForPeriod({
  start,
  end,
  hstEnabled = false,
}: GeneratePeriodInput): Promise<GeneratedInvoice[]> {
  if (start > end) {
    throw new Error("The invoice start date must be before the end date.");
  }

  const { data: properties, error: propertiesError } = await supabaseAdmin
    .from("properties")
    .select("id, name, address, owner_id")
    .not("owner_id", "is", null);

  if (propertiesError) throw propertiesError;

  const generated: GeneratedInvoice[] = [];

  for (const property of properties ?? []) {
    if (!property.owner_id) continue;

    const { data: existingInvoice, error: existingError } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("property_id", property.id)
      .eq("period_start", start)
      .eq("period_end", end)
      .maybeSingle();

    if (existingError) throw existingError;

    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from("schedule")
      .select("id, cleaning_date, company_charge, notes")
      .eq("property_id", property.id)
      .eq("status", "Completed")
      .gte("cleaning_date", start)
      .lte("cleaning_date", end)
      .order("cleaning_date", { ascending: true });

    if (schedulesError) throw schedulesError;

    const { data: receipts, error: receiptsError } = await supabaseAdmin
      .from("receipts")
      .select("id, schedule_id, purchase_date, amount, office_notes")
      .eq("property_id", property.id)
      .eq("status", "Approved")
      .gte("purchase_date", start)
      .lte("purchase_date", end)
      .order("purchase_date", { ascending: true });

    if (receiptsError) throw receiptsError;

    // Preserve existing invoices if source rows are temporarily absent.
    if (!(schedules?.length) && !(receipts?.length)) {
      if (existingInvoice) {
        generated.push(existingInvoice as GeneratedInvoice);
      }
      continue;
    }

    const totalCleaning = (schedules ?? []).reduce(
      (sum, schedule) => sum + toNumber(schedule.company_charge),
      0
    );

    const totalExpenses = (receipts ?? []).reduce(
      (sum, receipt) => sum + toNumber(receipt.amount),
      0
    );

    const items: InvoiceItemInput[] = [];
    const scheduleIds = (schedules ?? []).map((schedule) =>
      Number(schedule.id)
    );
    const extrasBySchedule = new Map<number, string[]>();

    if (scheduleIds.length > 0) {
      const { data: scheduleExtras, error: scheduleExtrasError } =
        await supabaseAdmin
          .from("schedule_extras")
          .select("schedule_id, extra_id, custom_name")
          .in("schedule_id", scheduleIds);

      if (scheduleExtrasError) throw scheduleExtrasError;

      const extraIds = Array.from(
        new Set(
          (scheduleExtras ?? [])
            .map((extra) => Number(extra.extra_id))
            .filter((id) => Number.isSafeInteger(id) && id > 0)
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
          extraNames.set(Number(extra.id), String(extra.name ?? ""));
        }
      }

      for (const scheduleExtra of scheduleExtras ?? []) {
        const scheduleId = Number(scheduleExtra.schedule_id);
        const name = String(
          scheduleExtra.custom_name ||
            extraNames.get(Number(scheduleExtra.extra_id)) ||
            ""
        ).trim();

        if (!name) continue;

        const current = extrasBySchedule.get(scheduleId) ?? [];

        if (!current.includes(name)) current.push(name);

        extrasBySchedule.set(scheduleId, current);
      }
    }

    // company_charge is authoritative; extras are descriptive only
    // to avoid charging for them twice.
    for (const schedule of schedules ?? []) {
      const amount = toNumber(schedule.company_charge);
      const extras = extrasBySchedule.get(Number(schedule.id)) ?? [];

      const descriptions = [
        "Regular Cleaning",
        ...(extras.length ? [`Extras: ${extras.join(", ")}`] : []),
        schedule.notes ? `Notes: ${String(schedule.notes).trim()}` : "",
      ].filter(Boolean);

      items.push({
        item_type: "cleaning",
        schedule_id: Number(schedule.id),
        receipt_id: null,
        item_date: schedule.cleaning_date,
        description: descriptions.join(" — "),
        quantity: 1,
        unit_price: amount,
        amount,
      });
    }

    for (const receipt of receipts ?? []) {
      const amount = toNumber(receipt.amount);

      items.push({
        item_type: "expense",
        schedule_id:
          receipt.schedule_id == null ? null : Number(receipt.schedule_id),
        receipt_id: Number(receipt.id),
        item_date: receipt.purchase_date,
        description: receipt.office_notes || "Property Expense",
        quantity: 1,
        unit_price: amount,
        amount,
      });
    }

    const propertyNumber = String(property.id).padStart(5, "0");
    const invoiceNumber = `PS-${end.replaceAll("-", "")}-${propertyNumber}`;

    const effectiveHstEnabled = existingInvoice
      ? Boolean(existingInvoice.hst_enabled)
      : hstEnabled;

    const { data: refreshedInvoice, error: refreshError } =
      await supabaseAdmin.rpc("refresh_period_invoice", {
        p_invoice: {
          invoice_number: existingInvoice?.invoice_number ?? invoiceNumber,
          owner_id: property.owner_id,
          property_id: property.id,
          period_start: start,
          period_end: end,
          property_name: property.name,
          property_address: property.address ?? null,
          total_cleaning: totalCleaning,
          total_expenses: totalExpenses,
          hst_enabled: effectiveHstEnabled,
        },
        p_items: items,
      });

    if (refreshError) throw refreshError;

    const invoice = Array.isArray(refreshedInvoice)
      ? refreshedInvoice[0]
      : refreshedInvoice;

    if (!invoice) {
      throw new Error(
        `Invoice refresh returned no invoice for property ${property.id}.`
      );
    }

    generated.push(invoice as GeneratedInvoice);
  }

  return generated;
}
