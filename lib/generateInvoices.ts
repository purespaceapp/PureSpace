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

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function generateInvoicesForPeriod({
  start,
  end,
  hstEnabled = false,
}: GeneratePeriodInput): Promise<GeneratedInvoice[]> {
  /*
   * IMPORTANT:
   * Invoices are immutable.
   * If an invoice already exists for a property + period,
   * we leave it exactly as it is.
   */

  const { data: properties, error: propertiesError } =
    await supabaseAdmin
      .from("properties")
      .select(`
        id,
        name,
        address,
        owner_id
      `)
      .not("owner_id", "is", null);

  if (propertiesError) {
    throw propertiesError;
  }

  const generated: GeneratedInvoice[] = [];

  for (const property of properties ?? []) {
    if (!property.owner_id) {
      continue;
    }

    /*
     * Check whether this property already has
     * a finalized invoice for this billing period.
     */
    const { data: existingInvoice, error: existingError } =
      await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("property_id", property.id)
        .eq("period_start", start)
        .eq("period_end", end)
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingInvoice) {
      generated.push(existingInvoice);
      continue;
    }

    /*
     * Completed cleanings for this property
     * inside the billing period.
     */
    const { data: schedules, error: schedulesError } =
      await supabaseAdmin
        .from("schedule")
        .select(`
          id,
          cleaning_date,
          company_charge,
          notes
        `)
        .eq("property_id", property.id)
        .eq("status", "Completed")
        .gte("cleaning_date", start)
        .lte("cleaning_date", end)
        .order("cleaning_date", {
          ascending: true,
        });

    if (schedulesError) {
      throw schedulesError;
    }

    /*
     * Approved property expenses inside the period.
     */
    const { data: receipts, error: receiptsError } =
      await supabaseAdmin
        .from("receipts")
        .select(`
          id,
          schedule_id,
          purchase_date,
          amount,
          office_notes
        `)
        .eq("property_id", property.id)
        .eq("status", "Approved")
        .gte("purchase_date", start)
        .lte("purchase_date", end)
        .order("purchase_date", {
          ascending: true,
        });

    if (receiptsError) {
      throw receiptsError;
    }

    /*
     * We intentionally use schedule.company_charge
     * as the cleaning amount because that is the amount
     * currently used by the Owner Statement.
     *
     * Extras are stored as invoice detail below,
     * but are NOT added again to the total here.
     * This prevents accidentally double-charging if
     * company_charge already includes them.
     */
    const totalCleaning = (schedules ?? []).reduce(
      (sum, schedule) =>
        sum + toNumber(schedule.company_charge),
      0
    );

    const totalExpenses = (receipts ?? []).reduce(
      (sum, receipt) => sum + toNumber(receipt.amount),
      0
    );

        if (
      (schedules ?? []).length === 0 &&
      (receipts ?? []).length === 0
    ) {
      continue;
    }
    
   const subtotal = totalCleaning + totalExpenses;

const hstAmount = hstEnabled
  ? subtotal * 0.13
  : 0;

const totalDue = subtotal + hstAmount;

    /*
     * Invoice number:
     * PS-YYYYMMDD-PROPERTYID
     *
     * Example:
     * PS-20260831-00012
     */
    const propertyNumber = String(property.id).padStart(
      5,
      "0"
    );

    const invoiceNumber = `PS-${end.replaceAll(
      "-",
      ""
    )}-${propertyNumber}`;

    /*
     * Create the permanent invoice snapshot.
     */
    const { data: invoice, error: invoiceError } =
      await supabaseAdmin
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          owner_id: property.owner_id,
          property_id: property.id,
          period_start: start,
          period_end: end,
          property_name: property.name,
          property_address: property.address ?? null,
         total_cleaning: totalCleaning,
total_expenses: totalExpenses,
total_due: totalDue,
hst_enabled: hstEnabled,
status: "Finalized",
        })
        .select()
        .single();

    if (invoiceError) {
      /*
       * If another request created the same invoice
       * at the same time, retrieve it instead of failing.
       */
      if (invoiceError.code === "23505") {
        const { data: concurrentInvoice, error: concurrentError } =
          await supabaseAdmin
            .from("invoices")
            .select("*")
            .eq("property_id", property.id)
            .eq("period_start", start)
            .eq("period_end", end)
            .single();

        if (concurrentError) {
          throw concurrentError;
        }

        generated.push(concurrentInvoice);
        continue;
      }

      throw invoiceError;
    }

    const items: Array<{
      invoice_id: number;
      item_type: string;
      schedule_id: number | null;
      receipt_id: number | null;
      item_date: string | null;
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
    }> = [];

    /*
     * Cleaning items.
     */
    for (const schedule of schedules ?? []) {
      const amount = toNumber(schedule.company_charge);

      items.push({
        invoice_id: invoice.id,
        item_type: "cleaning",
        schedule_id: schedule.id,
        receipt_id: null,
        item_date: schedule.cleaning_date,
        description: "Regular Cleaning",
        quantity: 1,
        unit_price: amount,
        amount,
      });

      /*
       * Store extras as detail.
       * They do not change total_due.
       */
           const { data: scheduleExtras, error: extrasError } =
        await supabaseAdmin
          .from("schedule_extras")
          .select(`
            id,
            extra_id,
            quantity
          `)
          .eq("schedule_id", schedule.id);

      if (extrasError) {
        throw extrasError;
      }

      for (const scheduleExtra of scheduleExtras ?? []) {
        if (!scheduleExtra.extra_id) {
          continue;
        }

        const { data: extra, error: extraError } =
          await supabaseAdmin
            .from("extras")
            .select(`
              id,
              name,
              owner_price
            `)
            .eq("id", Number(scheduleExtra.extra_id))
            .maybeSingle();

        if (extraError) {
          throw extraError;
        }

        if (!extra) {
          continue;
        }

        const quantity = toNumber(
          scheduleExtra.quantity ?? 1
        );

        const unitPrice = toNumber(extra.owner_price);

        items.push({
          invoice_id: invoice.id,
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

    /*
     * Property expense items.
     */
    for (const receipt of receipts ?? []) {
      const amount = toNumber(receipt.amount);

      items.push({
        invoice_id: invoice.id,
        item_type: "expense",
        schedule_id: receipt.schedule_id ?? null,
        receipt_id: receipt.id,
        item_date: receipt.purchase_date,
        description:
          receipt.office_notes || "Property Expense",
        quantity: 1,
        unit_price: amount,
        amount,
      });
    }

    /*
     * Save all invoice line items.
     */
    if (items.length > 0) {
      const { error: itemsError } =
        await supabaseAdmin
          .from("invoice_items")
          .insert(items);

      if (itemsError) {
        /*
         * Do not leave a half-created invoice.
         */
        await supabaseAdmin
          .from("invoices")
          .delete()
          .eq("id", invoice.id);

        throw itemsError;
      }
    }

    generated.push(invoice);
  }

  return generated;
}