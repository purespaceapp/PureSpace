"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getOwnerInvoices,
  type Invoice,
} from "@/lib/invoices";
import { downloadHistoricalOwnerInvoice } from "@/lib/ownerHistoricalInvoice";

export default function OwnerInvoicesPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ownerId = sessionStorage.getItem("ownerId");

        if (!ownerId) {
          router.replace("/owner-login");
          return;
        }

        const data = await getOwnerInvoices(Number(ownerId));

        setInvoices(data);
      } catch (error) {
        console.error("Error loading invoice history:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      const propertyName =
        invoice.property_name?.toLowerCase() || "";

      const propertyAddress =
        invoice.property_address?.toLowerCase() || "";

      const invoiceNumber =
        invoice.invoice_number?.toLowerCase() || "";

      return (
        propertyName.includes(term) ||
        propertyAddress.includes(term) ||
        invoiceNumber.includes(term)
      );
    });
  }, [invoices, search]);

  const totalInvoices = filteredInvoices.length;

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_due || 0),
    0
  );

  const groupedByPeriod = useMemo(() => {
    const groups = new Map<
      string,
      {
        period_start: string;
        period_end: string;
        invoices: Invoice[];
      }
    >();

    for (const invoice of filteredInvoices) {
      const key =
        `${invoice.period_start}-${invoice.period_end}`;

      if (!groups.has(key)) {
        groups.set(key, {
          period_start: invoice.period_start,
          period_end: invoice.period_end,
          invoices: [],
        });
      }

      groups
        .get(key)!
        .invoices
        .push(invoice);
    }

    return Array.from(groups.values());
  }, [filteredInvoices]);

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(Number(value || 0));
  }

  function formatPeriod(start: string, end: string) {
    const startDate =
      new Date(`${start}T00:00:00`);

    const endDate =
      new Date(`${end}T00:00:00`);

    const startText =
      startDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );

    const endText =
      endDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );

    return `${startText} – ${endText}`;
  }

  async function handleDownload(invoice: Invoice) {
    try {
      await downloadHistoricalOwnerInvoice({
        invoice_number: invoice.invoice_number,
        property_name: invoice.property_name,
        property_address: invoice.property_address,
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        total_cleaning: Number(invoice.total_cleaning || 0),
        total_expenses: Number(invoice.total_expenses || 0),
        total_due: Number(invoice.total_due || 0),
        hst_enabled: Boolean(invoice.hst_enabled),
      });
    } catch (error) {
      console.error("Failed to download invoice PDF:", error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DCEAF5] border-t-[#2E7BBE]" />

          <h1 className="mt-5 text-2xl font-semibold text-slate-600">
            Loading Invoice History...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto max-w-7xl px-10 pt-10 pb-16">

        {/* BACK */}
        <button
          onClick={() => router.push("/owner-home")}
          className="mb-6 flex items-center gap-2 rounded-2xl border-2 border-[#2E7BBE] bg-white px-5 py-3 font-semibold text-[#2E7BBE] shadow-md transition hover:bg-[#2E7BBE] hover:text-white"
        >
          ← Back to Owner Portal
        </button>

        {/* HERO */}
        <div className="rounded-[35px] bg-gradient-to-r from-[#2E7BBE] to-[#4D97E8] p-10 text-white shadow-2xl">
          <div className="flex items-center justify-between gap-8">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
                Finance
              </p>

              <h1 className="mt-2 text-5xl font-bold">
                Invoice History
              </h1>

              <p className="mt-3 text-xl text-blue-100">
                View and download your historical property invoices.
              </p>
            </div>

            <div className="rounded-3xl bg-white/15 px-8 py-6 text-center">
              <p className="text-blue-100">
                Invoices
              </p>

              <h2 className="mt-1 text-5xl font-bold">
                {totalInvoices}
              </h2>
            </div>

          </div>
        </div>

        {/* STATS */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-[30px] bg-white p-7 shadow-xl">
            <p className="text-slate-500">
              Total Invoices
            </p>

            <h2 className="mt-3 text-5xl font-bold">
              {totalInvoices}
            </h2>
          </div>

          <div className="rounded-[30px] bg-white p-7 shadow-xl">
            <p className="text-slate-500">
              Total Amount
            </p>

            <h2 className="mt-3 text-5xl font-bold text-[#2E7BBE]">
              {formatMoney(totalAmount)}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Based on stored invoice totals
            </p>
          </div>

          <div className="rounded-[30px] bg-white p-7 shadow-xl">
            <p className="text-slate-500">
              Status
            </p>

            <h2 className="mt-3 text-5xl font-bold text-green-600">
              Historical
            </h2>
          </div>

        </div>

        {/* SEARCH */}
        <div className="mt-10">
          <input
            type="text"
            placeholder="Search property or invoice number..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-2xl bg-white px-6 py-5 text-lg shadow-lg outline-none ring-0 transition focus:ring-2 focus:ring-[#2E7BBE]"
          />
        </div>

        {/* HISTORY */}
        <div className="mt-10 space-y-8">

          {groupedByPeriod.map((group) => {

            const periodTotal = group.invoices.reduce(
              (sum, invoice) =>
                sum + Number(invoice.total_due || 0),
              0
            );

            return (
              <section
                key={`${group.period_start}-${group.period_end}`}
                className="overflow-hidden rounded-[35px] bg-white shadow-2xl"
              >

                {/* PERIOD HEADER */}
                <div className="flex items-center justify-between gap-8 border-b bg-slate-50 px-8 py-6">

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Billing Period
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-800">
                      {formatPeriod(
                        group.period_start,
                        group.period_end
                      )}
                    </h2>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-500">
                      Period Total
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#2E7BBE]">
                      {formatMoney(periodTotal)}
                    </p>
                  </div>

                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full">

                    <thead className="bg-[#2E7BBE] text-white">
                      <tr>

                        <th className="px-6 py-5 text-left">
                          Property
                        </th>

                        <th className="px-6 py-5 text-left">
                          Invoice
                        </th>

                        <th className="px-6 py-5 text-center">
                          Cleaning
                        </th>

                        <th className="px-6 py-5 text-center">
                          Expenses
                        </th>

                        <th className="px-6 py-5 text-center">
                          Total Due
                        </th>

                        <th className="px-6 py-5 text-center">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {group.invoices.map((invoice) => (

                        <tr
                          key={invoice.id}
                          className="border-b transition hover:bg-slate-50"
                        >

                          {/* PROPERTY */}
                          <td className="px-6 py-6">
                            <div>
                              <h3 className="font-bold text-slate-800">
                                {invoice.property_name}
                              </h3>

                              {invoice.property_address && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {invoice.property_address}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* INVOICE NUMBER */}
                          <td className="px-6 py-6 font-mono text-sm text-slate-600">
                            {invoice.invoice_number}
                          </td>

                          {/* CLEANING */}
                          <td className="px-6 py-6 text-center">
                            {formatMoney(
                              Number(invoice.total_cleaning || 0)
                            )}
                          </td>

                          {/* EXPENSES */}
                          <td className="px-6 py-6 text-center">
                            {formatMoney(
                              Number(invoice.total_expenses || 0)
                            )}
                          </td>

                          {/* TOTAL */}
                          <td className="px-6 py-6 text-center">
                            <p className="font-bold text-[#2E7BBE]">
                              {formatMoney(
                                Number(invoice.total_due || 0)
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {invoice.hst_enabled
                                ? "HST included"
                                : "HST not applied"}
                            </p>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-6 py-6">
                            <div className="flex justify-center gap-3">

                              <button
                                onClick={() =>
                                  router.push(
                                    `/owner-statement/${invoice.id}`
                                  )
                                }
                                className="rounded-xl bg-[#2E7BBE] px-5 py-3 font-semibold text-white transition hover:bg-[#23649D]"
                              >
                                View Invoice
                              </button>

                              <button
                                onClick={() =>
                                  handleDownload(invoice)
                                }
                                className="rounded-xl border border-[#2E7BBE] px-5 py-3 font-semibold text-[#2E7BBE] transition hover:bg-[#EAF4FB]"
                              >
                                Download PDF
                              </button>

                            </div>
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>
                </div>

              </section>
            );
          })}

          {groupedByPeriod.length === 0 && (
            <div className="rounded-[35px] bg-white py-20 text-center shadow-2xl">

              <h2 className="text-2xl font-bold text-slate-700">
                No invoice history found.
              </h2>

              <p className="mt-3 text-slate-500">
                Historical invoices will appear here once they are created.
              </p>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}