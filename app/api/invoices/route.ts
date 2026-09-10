import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateInvoicesForPeriod } from "@/lib/generateInvoices";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
        // ==========================================
    // HST SETTING
    // ==========================================

    if (action === "get-hst") {
      const { data, error } = await supabaseAdmin
        .from("app_settings")
        .select("value")
        .eq("key", "hst_enabled")
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data?.value === "true",
      });
    }

    if (action === "set-hst") {
      const enabled = Boolean(body.enabled);

      const { error } = await supabaseAdmin
        .from("app_settings")
        .upsert(
          {
            key: "hst_enabled",
            value: String(enabled),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "key",
          }
        );

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: enabled,
      });
    }
        // ==========================================
    // UPDATE HST FOR A SINGLE INVOICE
    // ==========================================

    if (action === "set-invoice-hst") {
      const invoiceId = Number(body.invoiceId);
      const enabled = Boolean(body.enabled);

      if (!invoiceId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing invoice ID",
          },
          { status: 400 }
        );
      }

      const { data: invoice, error: invoiceError } =
        await supabaseAdmin
          .from("invoices")
          .select(
            "id, total_cleaning, total_expenses"
          )
          .eq("id", invoiceId)
          .maybeSingle();

      if (invoiceError) throw invoiceError;

      if (!invoice) {
        return NextResponse.json(
          {
            success: false,
            error: "Invoice not found",
          },
          { status: 404 }
        );
      }

      const subtotal =
        Number(invoice.total_cleaning || 0) +
        Number(invoice.total_expenses || 0);

      const hstAmount = enabled
        ? subtotal * 0.13
        : 0;

      const totalDue = subtotal + hstAmount;

      const { data: updatedInvoice, error: updateError } =
        await supabaseAdmin
          .from("invoices")
          .update({
            hst_enabled: enabled,
            total_due: totalDue,
          })
          .eq("id", invoiceId)
          .select()
          .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: updatedInvoice,
      });
    }
        if (action === "create-period") {
      if (!body.start || !body.end) {
        return NextResponse.json(
          {
            success: false,
            error: "Billing period start and end are required",
          },
          { status: 400 }
        );
      }
const { data: hstSetting, error: hstError } =
  await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "hst_enabled")
    .single();

if (hstError) throw hstError;

const hstEnabled =
  hstSetting?.value === "true";

const invoices = await generateInvoicesForPeriod({
  start: body.start,
  end: body.end,
  hstEnabled,
});

      return NextResponse.json({
        success: true,
        data: invoices,
      });
    }
    // ==========================================
    // CURRENT OWNER STATEMENT BY PROPERTY
    // ==========================================

    if (action === "current-property-statement") {
      const propertyId = Number(body.propertyId);

      if (!propertyId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing property ID",
          },
          { status: 400 }
        );
      }

      // ------------------------------------------
      // Property + owner
      // ------------------------------------------

      const { data: property, error: propertyError } =
        await supabaseAdmin
          .from("properties")
          .select(`
            id,
            name,
            address,
            owner_id
          `)
          .eq("id", propertyId)
          .maybeSingle();

      if (propertyError) throw propertyError;

      if (!property) {
        return NextResponse.json(
          {
            success: false,
            error: "Property not found",
          },
          { status: 404 }
        );
      }

      // ------------------------------------------
      // Determine current billing period
      // ------------------------------------------

      const now = new Date();

      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const day = now.getUTCDate();

      let periodStart: string;
      let periodEnd: string;

      if (day <= 15) {
        periodStart = `${year}-${String(
          month + 1
        ).padStart(2, "0")}-01`;

        periodEnd = `${year}-${String(
          month + 1
        ).padStart(2, "0")}-15`;
      } else {
        const lastDay = new Date(
          Date.UTC(year, month + 1, 0)
        ).getUTCDate();

        periodStart = `${year}-${String(
          month + 1
        ).padStart(2, "0")}-16`;

        periodEnd = `${year}-${String(
          month + 1
        ).padStart(2, "0")}-${String(lastDay).padStart(
          2,
          "0"
        )}`;
      }

      // ------------------------------------------
      // Completed cleanings
      // ------------------------------------------

      const { data: schedules, error: schedulesError } =
        await supabaseAdmin
          .from("schedule")
          .select(`
            id,
            cleaning_date,
            company_charge,
            notes
          `)
          .eq("property_id", propertyId)
          .eq("status", "Completed")
          .gte("cleaning_date", periodStart)
          .lte("cleaning_date", periodEnd)
          .order("cleaning_date", {
            ascending: true,
          });

      if (schedulesError) throw schedulesError;

      // ------------------------------------------
      // Approved property expenses
      // ------------------------------------------

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
          .eq("property_id", propertyId)
          .eq("status", "Approved")
          .gte("purchase_date", periodStart)
          .lte("purchase_date", periodEnd)
          .order("purchase_date", {
            ascending: true,
          });

      if (receiptsError) throw receiptsError;

      // ------------------------------------------
      // Cleaning total
      // ------------------------------------------

      const totalCleaning = (schedules ?? []).reduce(
        (total: number, schedule: any) =>
          total + Number(schedule.company_charge || 0),
        0
      );

      // ------------------------------------------
      // Expense total
      // ------------------------------------------

      const totalExpenses = (receipts ?? []).reduce(
        (total: number, receipt: any) =>
          total + Number(receipt.amount || 0),
        0
      );

      const subtotal =
        totalCleaning + totalExpenses;

      // ------------------------------------------
      // Current HST setting
      // ------------------------------------------

      const { data: hstSetting, error: hstError } =
        await supabaseAdmin
          .from("app_settings")
          .select("value")
          .eq("key", "hst_enabled")
          .maybeSingle();

      if (hstError) throw hstError;

      const hstEnabled =
        hstSetting?.value === "true";

      const hstAmount = hstEnabled
        ? subtotal * 0.13
        : 0;

      const totalDue = subtotal + hstAmount;

      // ------------------------------------------
      // Build statement items
      // ------------------------------------------

      const cleaningItems = (schedules ?? []).map(
        (schedule: any) => ({
          id: `schedule-${schedule.id}`,
          item_type: "cleaning",
          schedule_id: schedule.id,
          receipt_id: null,
          item_date: schedule.cleaning_date,
          description: "Regular Cleaning",
          quantity: 1,
          unit_price: Number(
            schedule.company_charge || 0
          ),
          amount: Number(
            schedule.company_charge || 0
          ),
        })
      );

      const expenseItems = (receipts ?? []).map(
        (receipt: any) => ({
          id: `receipt-${receipt.id}`,
          item_type: "expense",
          schedule_id:
            receipt.schedule_id ?? null,
          receipt_id: receipt.id,
          item_date: receipt.purchase_date,
          description:
            receipt.office_notes ||
            "Property Expense",
          quantity: 1,
          unit_price: Number(
            receipt.amount || 0
          ),
          amount: Number(
            receipt.amount || 0
          ),
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          property: {
            id: property.id,
            name: property.name,
            address: property.address,
            owner_id: property.owner_id,
          },

          period_start: periodStart,
          period_end: periodEnd,

          status: "Current",

          total_cleaning: totalCleaning,
          total_expenses: totalExpenses,

          subtotal,
          hst_enabled: hstEnabled,
          hst_amount: hstAmount,
          total_due: totalDue,

          items: [
            ...cleaningItems,
            ...expenseItems,
          ],
        },
      });
    }
    // ==========================================
    // LIST OWNER INVOICE HISTORY
    // ==========================================

    if (action === "list-owner") {
      const ownerId = Number(body.ownerId);

      if (!ownerId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing owner ID",
          },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select(`
          *,
          properties:property_id(
            id,
            name,
            address
          )
        `)
        .eq("owner_id", ownerId)
        .order("period_end", {
          ascending: false,
        })
        .order("property_id", {
          ascending: true,
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data ?? [],
      });
    }

    // ==========================================
    // GET SINGLE HISTORICAL INVOICE
    // ==========================================

    if (action === "get") {
      const invoiceId = Number(body.invoiceId);

      if (!invoiceId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing invoice ID",
          },
          { status: 400 }
        );
      }

      const { data: invoice, error: invoiceError } =
        await supabaseAdmin
          .from("invoices")
          .select(`
            *,
            properties:property_id(
              id,
              name,
              address
            ),
            owners:owner_id(
              id,
              name,
              email,
              phone
            )
          `)
          .eq("id", invoiceId)
          .maybeSingle();

      if (invoiceError) throw invoiceError;

      if (!invoice) {
        return NextResponse.json(
          {
            success: false,
            error: "Invoice not found",
          },
          { status: 404 }
        );
      }

      const { data: items, error: itemsError } =
        await supabaseAdmin
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", invoiceId)
          .order("item_date", {
            ascending: true,
          })
          .order("id", {
            ascending: true,
          });

      if (itemsError) throw itemsError;

      return NextResponse.json({
        success: true,
        data: {
          ...invoice,
          items: items ?? [],
        },
      });
    }

    // ==========================================
    // LIST CONSOLIDATED OFFICE INVOICES
    // ==========================================

    if (action === "list-office") {
      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select(`
          *,
          properties:property_id(
            id,
            name,
            address
          ),
          owners:owner_id(
            id,
            name,
            email,
            phone
          )
        `)
        .order("period_end", {
          ascending: false,
        })
        .order("owner_id", {
          ascending: true,
        });

      if (error) throw error;

      const invoices = data ?? [];

      const grouped = new Map<string, any>();

      for (const invoice of invoices) {
        const key = [
          invoice.owner_id,
          invoice.period_start,
          invoice.period_end,
        ].join("-");
if (!grouped.has(key)) {
  grouped.set(key, {
    owner_id: invoice.owner_id,
    owner_name:
      invoice.owners?.name ||
      `Owner #${invoice.owner_id}`,
    owner_email:
      invoice.owners?.email || null,
    period_start: invoice.period_start,
    period_end: invoice.period_end,
    status: invoice.status,
    invoices: [],
    total_cleaning: 0,
    total_expenses: 0,
    total_due: 0,
  });
}
        const group = grouped.get(key);

        group.invoices.push(invoice);

        group.total_cleaning += Number(
          invoice.total_cleaning ?? 0
        );

        group.total_expenses += Number(
          invoice.total_expenses ?? 0
        );

        group.total_due += Number(
          invoice.total_due ?? 0
        );
      }

      return NextResponse.json({
        success: true,
        data: Array.from(grouped.values()),
      });
    }

    // ==========================================
    // CREATE HISTORICAL INVOICE
    // ==========================================

    if (action === "create") {
      const invoice = body.invoice;
      const items = Array.isArray(body.items)
        ? body.items
        : [];

      if (
        !invoice ||
        !invoice.owner_id ||
        !invoice.property_id ||
        !invoice.period_start ||
        !invoice.period_end
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing invoice information",
          },
          { status: 400 }
        );
      }

      // ------------------------------------------
      // Prevent duplicate invoices
      // ------------------------------------------

      const { data: existing, error: existingError } =
        await supabaseAdmin
          .from("invoices")
          .select("*")
          .eq("property_id", Number(invoice.property_id))
          .eq("period_start", invoice.period_start)
          .eq("period_end", invoice.period_end)
          .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const { data: existingItems, error: existingItemsError } =
          await supabaseAdmin
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", existing.id)
            .order("item_date", {
              ascending: true,
            })
            .order("id", {
              ascending: true,
            });

        if (existingItemsError) {
          throw existingItemsError;
        }

        return NextResponse.json({
          success: true,
          existing: true,
          data: {
            ...existing,
            items: existingItems ?? [],
          },
        });
      }

      // ------------------------------------------
      // Generate permanent invoice number
      // ------------------------------------------

      const periodEnd =
        String(invoice.period_end).replaceAll("-", "");

      const propertyId =
        String(invoice.property_id).padStart(5, "0");

      const invoiceNumber =
        invoice.invoice_number ||
        `PS-${periodEnd}-${propertyId}`;

      // ------------------------------------------
      // Create invoice
      // ------------------------------------------

      const { data: createdInvoice, error: createError } =
        await supabaseAdmin
          .from("invoices")
          .insert([
            {
              invoice_number: invoiceNumber,

              owner_id: Number(invoice.owner_id),

              property_id: Number(invoice.property_id),

              period_start: invoice.period_start,

              period_end: invoice.period_end,

              property_name:
                invoice.property_name || "Property",

              property_address:
                invoice.property_address || null,

              total_cleaning:
                Number(invoice.total_cleaning ?? 0),

              total_expenses:
                Number(invoice.total_expenses ?? 0),

            total_due:
  Number(invoice.total_due ?? 0),

hst_enabled:
  Boolean(invoice.hst_enabled),

status:
  invoice.status || "Finalized",
            },
          ])
          .select()
          .single();

      if (createError) throw createError;

      // ------------------------------------------
      // Create invoice items
      // ------------------------------------------

      if (items.length > 0) {
        const rows = items.map((item: any) => ({
          invoice_id: createdInvoice.id,

          item_type:
            item.item_type || "service",

          schedule_id:
            item.schedule_id
              ? Number(item.schedule_id)
              : null,

          receipt_id:
            item.receipt_id
              ? Number(item.receipt_id)
              : null,

          item_date:
            item.item_date || null,

          description:
            item.description || "Invoice Item",

          quantity:
            Number(item.quantity ?? 1),

          unit_price:
            Number(item.unit_price ?? 0),

          amount:
            Number(item.amount ?? 0),
        }));

        const { error: itemsError } =
          await supabaseAdmin
            .from("invoice_items")
            .insert(rows);

        if (itemsError) {
          // If items fail, remove the invoice so
          // we never leave a half-created invoice.
          await supabaseAdmin
            .from("invoices")
            .delete()
            .eq("id", createdInvoice.id);

          throw itemsError;
        }
      }

      return NextResponse.json({
        success: true,
        existing: false,
        data: {
          ...createdInvoice,
          items,
        },
      });
    }

    // ==========================================
    // INVALID ACTION
    // ==========================================

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Invoices API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}