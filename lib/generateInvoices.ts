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

  const { data: properties, error: propertiesError } =
    await supabaseAdmin
      .from("properties")
      .select("id, name, address, owner_id")
      .not("owner_id", "is", null);

  if (propertiesError) throw propertiesError;

  const generated: GeneratedInvoice[] = [];

  for (const property of properties ?? []) {
    if (!property.owner_id) continue;

    const { data: existingInvoice, error: existingError } =
      await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("property_id", property.id)
        .eq("period_start", start)
        .eq("period_end", end)
        .maybeSingle();

    if (existingError) throw existingError;

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

    const { data: receipts, error: receiptsError } =
      await supabaseAdmin
        .from("receipts")
        .select("id, schedule_id, purchase_date, amount, office_notes")
        .eq("property_id", property.id)
        .eq("status", "Approved")
        .gte("purchase_date", start)
        .lte("purchase_date", end)
        .order("purchase_date", { ascending: true });

    if (receiptsError) throw receiptsError;

    // Don't zero an existing invoice if no source records are found.
    if (!(schedules?.length) && !(receipts?.length)) {
      if (existingInvoice) generated.push(existingInvoice);
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

    // Cleaning charges and extras are invoice details.
    // company_charge already represents the cleaning charge;
    // extras are not added a second time to the invoice total.
    for (const schedule of schedules ?? []) {
      const amount = toNumber(schedule.company_charge);

      items.push({
        item_type: "cleaning",
        schedule_id: schedule.id,
        receipt_id: null,
        item_date: schedule.cleaning_date,
        description: "Regular Cleaning",
        quantity: 1,
        unit_price: amount,
        amount,
      });

      const { data: scheduleExtras, error: extrasError } =
        await supabaseAdmin
          .from("schedule_extras")
          .select("id, extra_id, quantity")
          .eq("schedule_id", schedule.id);

      if (extrasError) throw extrasError;

      for (const scheduleExtra of scheduleExtras ?? []) {
        if (scheduleExtra.extra_id == null) continue;

        const { data: extra, error: extraError } =
          await supabaseAdmin
            .from("extras")
            .select("id, name, owner_price")
            .eq("id", Number(scheduleExtra.extra_id))
            .maybeSingle();

        if (extraError) throw extraError;
        if (!extra) continue;

        const quantity = toNumber(scheduleExtra.quantity ?? 1);
        const unitPrice = toNumber(extra.owner_price);

        items.push({
          item_type: "extra",
          schedule_id: schedule.id,
          receipt_id: null,
          item_date: schedule.cleaning_date,
          description: extra.name,
          quantity,
          unit_price: unitPrice,
          amount: unitPrice * quantity,
        });
      }
    }

    // Approved expenses.
    for (const receipt of receipts ?? []) {
      const amount = toNumber(receipt.amount);

      items.push({
        item_type: "expense",
        schedule_id: receipt.schedule_id ?? null,
        receipt_id: receipt.id,
        item_date: receipt.purchase_date,
        description: receipt.office_notes || "Property Expense",
        quantity: 1,
        unit_price: amount,
        amount,
      });
    }

    const propertyNumber = String(property.id).padStart(5, "0");
    const invoiceNumber =
      `PS-${end.replaceAll("-", "")}-${propertyNumber}`;

    // Preserve the existing invoice's tax setting when refreshing it.
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
