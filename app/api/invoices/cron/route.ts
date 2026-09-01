import { NextResponse } from "next/server";
import { generateInvoicesForPeriod } from "@/lib/generateInvoices";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const now = new Date();

    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    let start: string;
    let end: string;

    /*
     * The billing periods are:
     * 1–15
     * 16–last day of month
     *
     * The cron runs on the 1st and 16th.
     */

    if (day === 1) {
      // Finalize the second half of the previous month.
      const previousMonthLastDay = new Date(
        Date.UTC(year, month, 0)
      );

      const previousYear =
        previousMonthLastDay.getUTCFullYear();

      const previousMonth =
        previousMonthLastDay.getUTCMonth();

      const lastDay =
        previousMonthLastDay.getUTCDate();

      start = `${previousYear}-${String(
        previousMonth + 1
      ).padStart(2, "0")}-16`;

      end = `${previousYear}-${String(
        previousMonth + 1
      ).padStart(2, "0")}-${String(lastDay).padStart(
        2,
        "0"
      )}`;
    } else if (day === 16) {
      // Finalize the first half of the current month.
      start = `${year}-${String(
        month + 1
      ).padStart(2, "0")}-01`;

      end = `${year}-${String(
        month + 1
      ).padStart(2, "0")}-15`;
    } else {
      return NextResponse.json({
        success: true,
        message:
          "No billing period to finalize today.",
        generated: 0,
      });
    }

    const invoices =
      await generateInvoicesForPeriod({
        start,
        end,
      });

    return NextResponse.json({
      success: true,
      period: {
        start,
        end,
      },
      generated: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error(
      "Invoice cron error:",
      error
    );

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