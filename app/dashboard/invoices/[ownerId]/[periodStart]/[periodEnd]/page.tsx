"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Receipt,
  Building2,
  Download,
  Loader2,
} from "lucide-react";

import { getOfficeInvoices, Invoice } from "@/lib/invoices";
import { downloadOfficeInvoice } from "@/lib/officeInvoice";

export default function OfficeInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();

  const ownerId = Number(params.ownerId);
  const periodStart = String(params.periodStart);
  const periodEnd = String(params.periodEnd);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingInvoiceId, setSavingInvoiceId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await getOfficeInvoices();

        const matchingGroup = (data || []).find(
          (group: any) =>
            Number(group.owner_id) === ownerId &&
            group.period_start === periodStart &&
            group.period_end === periodEnd
        );

        setInvoices(matchingGroup?.invoices || []);
      } catch (error) {
        console.error("Error loading office invoice:", error);
      } finally {
        setLoading(false);
      }
    }

    if (
      Number.isFinite(ownerId) &&
      periodStart &&
      periodEnd
    ) {
      loadInvoices();
    } else {
      setLoading(false);
    }
  }, [ownerId, periodStart, periodEnd]);

  async function toggleInvoiceHst(invoice: Invoice) {
    const invoiceId = Number(invoice.id);
    const currentValue = Boolean(invoice.hst_enabled);
    const nextValue = !currentValue;

    try {
      setSavingInvoiceId(invoiceId);

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set-invoice-hst",
          invoiceId,
          enabled: nextValue,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to update invoice HST"
        );
      }

      const updatedInvoice = result.data;

      setInvoices((current) =>
        current.map((item) =>
          Number(item.id) === invoiceId
            ? {
                ...item,
                ...updatedInvoice,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update invoice HST:", error);
      alert("Unable to update HST for this invoice.");
    } finally {
      setSavingInvoiceId(null);
    }
  }

  const totals = useMemo(() => {
    const cleaning = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.total_cleaning || 0),
      0
    );

    const expenses = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.total_expenses || 0),
      0
    );

    const hst = invoices.reduce((sum, invoice) => {
      if (!invoice.hst_enabled) {
        return sum;
      }

      const subtotal =
        Number(invoice.total_cleaning || 0) +
        Number(invoice.total_expenses || 0);

      return sum + subtotal * 0.13;
    }, 0);

    const total = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.total_due || 0),
      0
    );

    return {
      cleaning,
      expenses,
      hst,
      total,
    };
  }, [invoices]);

  const ownerName =
    invoices[0]?.owners?.name ||
    `Owner #${ownerId}`;

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function formatMoney(amount: number) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(Number(amount || 0));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2E7BBE]" />
          <p className="mt-4 text-slate-500">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] p-8">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() =>
              router.push("/dashboard/invoices")
            }
            className="mb-6 flex items-center gap-2 text-[#246fae] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </button>

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-12 w-12 text-[#8ca0b5]" />

            <h1 className="text-2xl font-semibold text-[#174f7d]">
              Invoice not found
            </h1>

            <p className="mt-2 text-[#6f8297]">
              No invoice was found for this owner and billing period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK */}
        <button
          onClick={() =>
            router.push("/dashboard/invoices")
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#246fae] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoice History
        </button>

        {/* HEADER */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">

            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-[#e9f3fb] p-3">
                  <FileText className="h-6 w-6 text-[#2779b9]" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71869d]">
                  Consolidated Invoice
                </span>
              </div>

              <h1 className="text-3xl font-bold text-[#174f7d]">
                {ownerName}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-[#6f8297]">
                <CalendarDays className="h-4 w-4" />

                <span>
                  {formatDate(periodStart)} –{" "}
                  {formatDate(periodEnd)}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71869d]">
                Total Due
              </p>

              <p className="mt-1 text-4xl font-bold text-[#246fae]">
                {formatMoney(totals.total)}
              </p>

              <button
                onClick={() =>
                  downloadOfficeInvoice({
                    ownerName,
                    periodStart,
                    periodEnd,
                    invoices,
                  })
                }
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#2779b9] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1f6399]"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid gap-5 md:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#e9f3fb] p-3">
                <Building2 className="h-5 w-5 text-[#2779b9]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71869d]">
                  Properties
                </p>

                <p className="mt-1 text-2xl font-bold text-[#174f7d]">
                  {invoices.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#edf7f0] p-3">
                <Receipt className="h-5 w-5 text-[#3d8a5b]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71869d]">
                  Cleaning
                </p>

                <p className="mt-1 text-2xl font-bold text-[#174f7d]">
                  {formatMoney(totals.cleaning)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#fff5e8] p-3">
                <Receipt className="h-5 w-5 text-[#c9822b]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71869d]">
                  Expenses
                </p>

                <p className="mt-1 text-2xl font-bold text-[#174f7d]">
                  {formatMoney(totals.expenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#edf7f0] p-3">
                <Receipt className="h-5 w-5 text-[#3d8a5b]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71869d]">
                  HST
                </p>

                <p className="mt-1 text-2xl font-bold text-[#174f7d]">
                  {formatMoney(totals.hst)}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* PROPERTY BREAKDOWN */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b border-[#e8edf2] px-8 py-6">
            <h2 className="text-xl font-bold text-[#174f7d]">
              Property Breakdown
            </h2>

            <p className="mt-1 text-sm text-[#71869d]">
              Individual property invoices included in this consolidated billing period.
            </p>
          </div>

          <div className="divide-y divide-[#e8edf2]">

            {invoices.map((invoice) => {
              const hstEnabled = Boolean(
                invoice.hst_enabled
              );

              const saving =
                savingInvoiceId === Number(invoice.id);

              return (
                <div
                  key={invoice.id}
                  className="px-8 py-6"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* PROPERTY */}
                    <div className="flex items-start gap-4">

                      <div className="rounded-xl bg-[#edf4fa] p-3">
                        <Building2 className="h-5 w-5 text-[#2779b9]" />
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-[#174f7d]">
                          {invoice.property_name}
                        </h3>

                        {invoice.property_address && (
                          <p className="mt-1 text-sm text-[#71869d]">
                            {invoice.property_address}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3">

                          <p className="text-xs font-medium text-[#8a9aab]">
                            Invoice #{invoice.invoice_number}
                          </p>

                          {/* INDIVIDUAL HST CONTROL */}
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              toggleInvoiceHst(invoice)
                            }
                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                              hstEnabled
                                ? "bg-[#e9f3fb] text-[#246fae] hover:bg-[#dcecf8]"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            } ${
                              saving
                                ? "cursor-wait opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            {saving
                              ? "Saving..."
                              : hstEnabled
                              ? "HST 13% • ON"
                              : "HST • OFF"}
                          </button>

                        </div>

                      </div>
                    </div>

                    {/* AMOUNTS */}
                    <div className="grid grid-cols-3 gap-8 lg:min-w-[430px]">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#71869d]">
                          Cleaning
                        </p>

                        <p className="mt-1 font-semibold text-[#174f7d]">
                          {formatMoney(
                            Number(
                              invoice.total_cleaning || 0
                            )
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#71869d]">
                          Expenses
                        </p>

                        <p className="mt-1 font-semibold text-[#174f7d]">
                          {formatMoney(
                            Number(
                              invoice.total_expenses || 0
                            )
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#71869d]">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#246fae]">
                          {formatMoney(
                            Number(
                              invoice.total_due || 0
                            )
                          )}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* GRAND TOTAL */}
          <div className="border-t border-[#dfe7ee] bg-[#f8fafc] px-8 py-7">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm font-medium text-[#71869d]">
                  Consolidated invoice total
                </p>

                <p className="mt-1 text-2xl font-bold text-[#174f7d]">
                  {ownerName}
                </p>
              </div>

              <div className="text-left md:text-right">

                <div className="mb-1 flex justify-end gap-4 text-sm text-slate-500">
                  <span>HST:</span>
                  <span className="font-semibold text-slate-700">
                    {formatMoney(totals.hst)}
                  </span>
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#71869d]">
                  Total Due
                </p>

                <p className="mt-1 text-4xl font-bold text-[#246fae]">
                  {formatMoney(totals.total)}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}