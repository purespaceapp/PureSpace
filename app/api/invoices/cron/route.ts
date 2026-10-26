
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateInvoicesForPeriod } from "@/lib/generateInvoices";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    let start: string;
    let end: string;

    // Day 15: finalize the current month's 1st–15th period.
    if (day === 15) {
      start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      end = `${year}-${String(month + 1).padStart(2, "0")}-15`;
    } else if (day === 1) {
      // Day 1: finalize the previous month's 16th–last-day period.
      const previousMonthLastDay = new Date(Date.UTC(year, month, 0));
      const previousYear = previousMonthLastDay.getUTCFullYear();
      const previousMonth = previousMonthLastDay.getUTCMonth();
      const lastDay = previousMonthLastDay.getUTCDate();

      start = `${previousYear}-${String(previousMonth + 1).padStart(2, "0")}-16`;
      end = `${previousYear}-${String(previousMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else {
      return NextResponse.json({
        success: true,
        message: "No billing period to finalize today.",
        generated: 0,
      });
    }

    const { data: hstSetting, error: hstError } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "hst_enabled")
      .maybeSingle();

    if (hstError) throw hstError;

    const hstEnabled = hstSetting?.value === "true";

    const invoices = await generateInvoicesForPeriod({
      start,
      end,
      hstEnabled,
    });

    return NextResponse.json({
      success: true,
      period: { start, end },
      generated: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Invoice cron error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate invoices",
      },
      { status: 500 }
    );
  }
}
