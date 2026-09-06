"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getInvoice, type Invoice } from "@/lib/invoices";

export default function OwnerStatementPage() {
  const { id } = useParams();
  const router = useRouter();

  const [invoice, setInvoice] =
    useState<Invoice | null>(null);

  const [loading, setLoading] =
    useState(true);

  function formatDate(value?: string | null) {
    if (!value) return "—";

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatPeriod(
    start?: string,
    end?: string
  ) {
    if (!start || !end) return "—";

    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  useEffect(() => {
    async function load() {
      try {
        if (!id) return;

        const data = await getInvoice(
          Number(id)
        );

        setInvoice(data);
      } catch (error) {
        console.error(
          "Error loading historical invoice:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <h1 className="text-2xl font-semibold text-slate-600">
          Loading Invoice...
        </h1>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-6">
        <div className="bg-white rounded-[30px] shadow-xl p-10 text-center max-w-lg">
          <h1 className="text-3xl font-bold text-slate-800">
            Invoice Not Found
          </h1>

          <p className="text-slate-500 mt-4">
            This historical invoice could not be found.
          </p>

          <button
            onClick={() =>
              router.push("/owner-home")
            }
            className="mt-8 bg-[#2E7BBE] hover:bg-[#23649D] text-white px-6 py-3 rounded-xl font-semibold"
          >
            ← Back to Owner Portal
          </button>
        </div>
      </main>
    );
  }

  const items = invoice.items ?? [];

  const cleaningItems = items.filter(
    (item) =>
      item.item_type === "cleaning"
  );

  const extraItems = items.filter(
    (item) =>
      item.item_type === "extra"
  );

  const expenseItems = items.filter(
    (item) =>
      item.item_type === "expense" ||
      item.item_type === "receipt"
  );

  /*
   * IMPORTANT:
   * Historical invoices already store their final
   * totals in the database.
   *
   * We only calculate the subtotal for display.
   * HST is displayed according to the invoice's
   * saved hst_enabled value.
   *
   * TOTAL DUE always comes from invoice.total_due.
   */

  const subtotal =
    Number(invoice.total_cleaning || 0) +
    Number(invoice.total_expenses || 0);

  const hstEnabled =
    Boolean(invoice.hst_enabled);

  const hstAmount = hstEnabled
    ? subtotal * 0.13
    : 0;

  const grandTotal =
    Number(invoice.total_due || 0);

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-6 py-12">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-[#2E7BBE] to-[#4D97E8] px-10 py-12 text-white">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

              <div>

                <p className="text-blue-100 uppercase tracking-wider text-sm font-semibold">
                  Historical Invoice
                </p>

                <h1 className="text-5xl font-bold mt-3">
                  {invoice.property_name}
                </h1>

                {invoice.property_address && (
                  <p className="text-blue-100 text-lg mt-3">
                    {invoice.property_address}
                  </p>
                )}

              </div>

              <div className="bg-white/15 rounded-3xl px-7 py-6 text-center">

                <p className="text-blue-100 text-sm">
                  Invoice
                </p>

                <p className="text-2xl font-bold mt-1">
                  {invoice.invoice_number}
                </p>

              </div>

            </div>

          </div>

          {/* INFORMATION */}

          <div className="p-10">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-slate-50 rounded-2xl p-6">

                <p className="text-sm text-slate-400 font-semibold uppercase">
                  Bill To
                </p>

                <p className="text-xl font-bold text-slate-800 mt-2">
                  {invoice.owners?.name ||
                    "Property Owner"}
                </p>

              </div>

              <div className="bg-slate-50 rounded-2xl p-6">

                <p className="text-sm text-slate-400 font-semibold uppercase">
                  Billing Period
                </p>

                <p className="text-lg font-bold text-slate-800 mt-2">
                  {formatPeriod(
                    invoice.period_start,
                    invoice.period_end
                  )}
                </p>

              </div>

              <div className="bg-slate-50 rounded-2xl p-6">

                <p className="text-sm text-slate-400 font-semibold uppercase">
                  Status
                </p>

                <p className="text-lg font-bold text-green-600 mt-2">
                  {invoice.status}
                </p>

              </div>

            </div>

            {/* CLEANINGS */}

            <div className="mt-12">

              <h2 className="text-3xl font-bold text-slate-800">
                Completed Cleanings
              </h2>

              <p className="text-slate-500 mt-2">
                Services included in this historical invoice.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">

                <table className="w-full">

                  <thead className="bg-slate-100">

                    <tr>

                      <th className="text-left px-6 py-4">
                        Date
                      </th>

                      <th className="text-left px-6 py-4">
                        Description
                      </th>

                      <th className="text-right px-6 py-4">
                        Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {cleaningItems.map(
                      (item) => (

                        <tr
                          key={item.id}
                          className="border-t"
                        >

                          <td className="px-6 py-4">
                            {formatDate(
                              item.item_date
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {item.description}
                          </td>

                          <td className="px-6 py-4 text-right font-semibold">
                            $
                            {Number(
                              item.amount
                            ).toFixed(2)}
                          </td>

                        </tr>

                      )
                    )}

                    {cleaningItems.length === 0 && (

                      <tr>

                        <td
                          colSpan={3}
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          No cleaning items recorded.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* EXTRAS */}

            {extraItems.length > 0 && (

              <div className="mt-10">

                <h2 className="text-2xl font-bold text-slate-800">
                  Extra Services
                </h2>

                <div className="mt-5 space-y-3">

                  {extraItems.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="flex justify-between bg-green-50 rounded-2xl px-6 py-4"
                      >

                        <span className="text-slate-700">
                          {item.description}
                        </span>

                        <span className="font-bold text-green-700">
                          +$
                          {Number(
                            item.amount
                          ).toFixed(2)}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

            {/* EXPENSES */}

            {expenseItems.length > 0 && (

              <div className="mt-10">

                <h2 className="text-2xl font-bold text-slate-800">
                  Property Expenses
                </h2>

                <div className="mt-5 space-y-3">

                  {expenseItems.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="flex justify-between bg-blue-50 rounded-2xl px-6 py-4"
                      >

                        <span className="text-slate-700">
                          {item.description}
                        </span>

                        <span className="font-bold text-blue-700">
                          +$
                          {Number(
                            item.amount
                          ).toFixed(2)}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

            {/* TOTAL */}

            <div className="mt-12 ml-auto max-w-md">

              <div className="bg-slate-50 rounded-3xl p-7 space-y-4">

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Cleaning Total
                  </span>

                  <span className="font-semibold">
                    $
                    {Number(
                      invoice.total_cleaning || 0
                    ).toFixed(2)}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Property Expenses
                  </span>

                  <span className="font-semibold">
                    $
                    {Number(
                      invoice.total_expenses || 0
                    ).toFixed(2)}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    $
                    {subtotal.toFixed(2)}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    HST (13%)
                  </span>

                  <span className="font-semibold">
                    $
                    {hstAmount.toFixed(2)}
                  </span>

                </div>

                <div className="border-t pt-5 flex justify-between">

                  <span className="text-xl font-bold text-slate-800">
                    TOTAL DUE
                  </span>

                  <span className="text-2xl font-bold text-[#2E7BBE]">
                    $
                    {grandTotal.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-10 flex flex-col md:flex-row gap-4">

              <button
                onClick={() =>
                  router.push("/owner-home")
                }
                className="flex-1 border-2 border-[#2E7BBE] text-[#2E7BBE] hover:bg-[#2E7BBE] hover:text-white font-bold py-4 rounded-2xl transition"
              >
                ← Back to Owner Portal
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}