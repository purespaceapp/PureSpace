"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  ChevronRight,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getOfficeInvoices,
  setInvoiceHst,
  setInvoicePaymentStatus,
  Invoice,
} from "@/lib/invoices";

type OfficeInvoiceGroup = {
  owner_id: number;
  owner_name: string;
  owner_email?: string | null;
  period_start: string;
  period_end: string;
  status?: string;
  invoices: Invoice[];
};

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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(value || 0));
}

function getSubtotal(invoice: Invoice) {
  return (
    Number(invoice.total_cleaning || 0) +
    Number(invoice.total_expenses || 0)
  );
}

function getHstAmount(invoice: Invoice) {
  if (!invoice.hst_enabled) {
    return 0;
  }

  return getSubtotal(invoice) * 0.13;
}

export default function OfficeInvoicesPage() {
  const router = useRouter();

  const [groups, setGroups] =
    useState<OfficeInvoiceGroup[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState("all");
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const [customStart, setCustomStart] =
    useState("");

  const [customEnd, setCustomEnd] =
    useState("");

  const [generatingPeriod, setGeneratingPeriod] =
    useState(false);

  const [savingInvoiceId, setSavingInvoiceId] =
    useState<number | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);

      const data = await getOfficeInvoices();

      setGroups(
        (data || []) as OfficeInvoiceGroup[]
      );
    } catch (error) {
      console.error(
        "Failed to load office invoices:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCustomPeriod() {
    if (!customStart || !customEnd) {
      alert("Please select both start and end dates.");
      return;
    }

    if (customStart > customEnd) {
      alert("The start date cannot be after the end date.");
      return;
    }

    if (generatingPeriod) return;

    try {
      setGeneratingPeriod(true);

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create-period",
          start: customStart,
          end: customEnd,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.error || "Failed to generate invoices."
        );
      }

      const invoiceCount = Array.isArray(result.data)
        ? result.data.length
        : 0;

      alert(
        `Invoice generation completed. ${invoiceCount} invoice(s) processed. Existing invoices for the same property and date range were left unchanged.`
      );

      await loadInvoices();
    } catch (error) {
      console.error(
        "Failed to generate custom-period invoices:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate invoices."
      );
    } finally {
      setGeneratingPeriod(false);
    }
  }

  async function handleToggleHst(
    invoice: Invoice
  ) {
    if (savingInvoiceId !== null) {
      return;
    }

    const nextEnabled =
      !Boolean(invoice.hst_enabled);

    try {
      setSavingInvoiceId(invoice.id);

      const updated = await setInvoiceHst(
        invoice.id,
        nextEnabled
      );

      setGroups((currentGroups) =>
        currentGroups.map((group) => ({
          ...group,
          invoices: group.invoices.map(
            (currentInvoice) =>
              currentInvoice.id === updated.id
                ? {
                    ...currentInvoice,
                    ...updated,
                  }
                : currentInvoice
          ),
        }))
      );
    } catch (error) {
      console.error(
        "Failed to update invoice HST:",
        error
      );

      alert(
        "Could not update HST for this invoice."
      );
    } finally {
      setSavingInvoiceId(null);
    }
  }

  async function handlePaymentStatusChange(
    invoice: Invoice,
    paymentStatus: "Paid" | "Pending" | "Unpaid"
  ) {
    if (savingInvoiceId !== null) return;

    try {
      setSavingInvoiceId(invoice.id);

      const updated = await setInvoicePaymentStatus(
        invoice.id,
        paymentStatus
      );

      setGroups((currentGroups) =>
        currentGroups.map((group) => ({
          ...group,
          invoices: group.invoices.map(
            (currentInvoice) =>
              currentInvoice.id === updated.id
                ? {
                    ...currentInvoice,
                    ...updated,
                  }
                : currentInvoice
          ),
        }))
      );
    } catch (error) {
      console.error(
        "Failed to update payment status:",
        error
      );

      alert(
        "Could not update payment status. Please try again."
      );
    } finally {
      setSavingInvoiceId(null);
    }
  }
    const availableMonths = useMemo(() => {
    const months = new Set<string>();

    groups.forEach((group) => {
      group.invoices.forEach((invoice) => {
        if (invoice.period_end) {
          months.add(invoice.period_end.slice(0, 7));
        }
      });
    });

    return Array.from(months).sort((a, b) =>
      b.localeCompare(a)
    );
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    return groups
      .map((group) => {
        const matchingInvoices = group.invoices.filter(
          (invoice) => {
            const invoiceMonth =
              invoice.period_end?.slice(0, 7) || "";

            const matchesMonth =
              selectedMonth === "all" ||
              invoiceMonth === selectedMonth;

            const matchesSearch =
              !term ||
              group.owner_name?.toLowerCase().includes(term) ||
              group.owner_email?.toLowerCase().includes(term) ||
              invoice.property_name?.toLowerCase().includes(term) ||
              invoice.invoice_number?.toLowerCase().includes(term);

            return matchesMonth && matchesSearch;
          }
        );

        return {
          ...group,
          invoices: matchingInvoices,
        };
      })
      .filter((group) => group.invoices.length > 0)
      .sort((a, b) => {
        const periodCompare =
          b.period_end.localeCompare(a.period_end);

        if (periodCompare !== 0) {
          return periodCompare;
        }

        return (a.owner_name || "").localeCompare(
          b.owner_name || ""
        );
      });
  }, [groups, search, selectedMonth]);

  const propertyInvoiceCount = filteredGroups.reduce(
    (sum, group) => sum + group.invoices.length,
    0
  );

  const totalBilled = filteredGroups.reduce(
    (sum, group) =>
      sum +
      group.invoices.reduce(
        (invoiceSum, invoice) =>
          invoiceSum + Number(invoice.total_due || 0),
        0
      ),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2E7BBE]" />

          <p className="mt-4 text-slate-500">
            Loading invoices...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <div className="mx-auto max-w-[1700px] space-y-8 px-8 py-8">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2E7BBE]">
              Finance
            </p>

            <h1 className="mt-2 text-4xl font-black text-[#1F4E79]">
              Invoices
            </h1>

            <p className="mt-2 text-slate-500">
              Historical owner invoices and billing periods.
            </p>

            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              HST is managed individually for each property invoice.
              Payment status can be updated for each invoice.
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-md">
            <FileText className="h-8 w-8 text-[#2E7BBE]" />
          </div>
        </div>

        {/* CUSTOM INVOICE PERIOD */}

        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-[#1F4E79]">
            Generate Custom Period
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Choose a start and end date to generate owner invoices
            for a custom billing period.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="custom-invoice-start"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Start date
              </label>

              <input
                id="custom-invoice-start"
                type="date"
                value={customStart}
                onChange={(event) =>
                  setCustomStart(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-[#2E7BBE]"
              />
            </div>

            <div>
              <label
                htmlFor="custom-invoice-end"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                End date
              </label>

              <input
                id="custom-invoice-end"
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(event) =>
                  setCustomEnd(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-[#2E7BBE]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerateCustomPeriod}
                disabled={
                  generatingPeriod ||
                  !customStart ||
                  !customEnd ||
                  customStart > customEnd
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 font-semibold text-white transition hover:bg-[#1F4E79] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingPeriod && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}

                {generatingPeriod
                  ? "Generating..."
                  : "Generate Invoices"}
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Existing invoices for the same property and period may remain unchanged.
          </p>
        </div>
                {/* STATS */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Invoice Periods
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#2E7BBE]">
              {filteredGroups.length}
            </h2>

            <p className="mt-2 text-slate-500">
              Historical billing periods
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Property Invoices
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#2E7BBE]">
              {propertyInvoiceCount}
            </h2>

            <p className="mt-2 text-slate-500">
              Individual property invoices
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Total Billed
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#1F4E79]">
              {formatMoney(totalBilled)}
            </h2>

            <p className="mt-2 text-slate-500">
              Based on individual invoice totals
            </p>
          </div>
        </div>

        {/* SEARCH AND MONTH FILTER */}

        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search owner, property or invoice number..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 outline-none transition focus:border-[#2E7BBE] focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="invoice-month"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Monthly History
              </label>

              <select
                id="invoice-month"
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700 outline-none transition focus:border-[#2E7BBE] focus:bg-white"
              >
                <option value="all">All months</option>

                {availableMonths.map((month) => {
                  const [year, monthNumber] = month.split("-");
                  const monthLabel = new Date(
                    Number(year),
                    Number(monthNumber) - 1,
                    1
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <option key={month} value={month}>
                      {monthLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* INVOICE GROUPS */}
        {/* Monthly collapse state is managed by expandedMonths. */}

        {filteredGroups.length === 0 ? (
          <div className="rounded-[32px] border border-slate-100 bg-white p-16 text-center shadow-md">
            <FileText className="mx-auto h-14 w-14 text-slate-300" />

            <h2 className="mt-5 text-2xl font-bold text-[#1F4E79]">
              No invoices found
            </h2>

            <p className="mt-2 text-slate-500">
              Try another month or change your search.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(
              new Set(
                filteredGroups.flatMap((group) =>
                  group.invoices
                    .map((invoice) => invoice.period_end?.slice(0, 7) || "")
                    .filter(Boolean)
                )
              )
            ).sort((a, b) => b.localeCompare(a)).map((month) => {
              const monthGroups = filteredGroups
                .map((group) => ({
                  ...group,
                  invoices: group.invoices.filter(
                    (invoice) => invoice.period_end?.slice(0, 7) === month
                  ),
                }))
                .filter((group) => group.invoices.length > 0);

              const isExpanded =
                expandedMonths[month] ??
                month === Array.from(
                  new Set(
                    filteredGroups.flatMap((group) =>
                      group.invoices
                        .map((invoice) => invoice.period_end?.slice(0, 7) || "")
                        .filter(Boolean)
                    )
                  )
                ).sort((a, b) => b.localeCompare(a))[0];

              const [year, monthNumber] = month.split("-");
              const monthLabel = new Date(
                Number(year),
                Number(monthNumber) - 1,
                1
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });

              const monthTotal = monthGroups.reduce(
                (sum, group) =>
                  sum + group.invoices.reduce(
                    (invoiceSum, invoice) =>
                      invoiceSum + Number(invoice.total_due || 0),
                    0
                  ),
                0
              );

              const invoiceCount = monthGroups.reduce(
                (sum, group) => sum + group.invoices.length,
                0
              );

              return (
                <section
                  key={month}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMonths((current) => ({
                        ...current,
                        [month]: !isExpanded,
                      }))
                    }
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        className={`h-5 w-5 shrink-0 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <div>
                        <h2 className="text-xl font-bold text-[#1F4E79]">
                          {monthLabel}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {invoiceCount} {invoiceCount === 1 ? "invoice" : "invoices"}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#2E7BBE]">
                      {formatMoney(monthTotal)}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="space-y-6 border-t border-slate-100 p-4 sm:p-6">
                      {monthGroups.map((group) => {
              const groupTotal = group.invoices.reduce(
                (sum, invoice) =>
                  sum + Number(invoice.total_due || 0),
                0
              );

              return (
                <div
                  key={`${group.owner_id}-${group.period_start}-${group.period_end}`}
                  className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-md"
                >
                  {/* GROUP HEADER */}

                  <div className="border-b border-slate-100 bg-slate-50/70 px-7 py-6">
                    <div className="flex items-center justify-between gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                          Billing Period
                        </p>

                        <h2 className="mt-2 text-2xl font-black text-[#1F4E79]">
                          {group.owner_name ||
                            `Owner #${group.owner_id}`}
                        </h2>

                        <p className="mt-1 text-slate-500">
                          {formatDate(group.period_start)}
                          {" — "}
                          {formatDate(group.period_end)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-slate-400">
                          Period Total
                        </p>

                        <p className="mt-1 text-3xl font-black text-[#2E7BBE]">
                          {formatMoney(groupTotal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INDIVIDUAL INVOICES */}

                  <div className="divide-y divide-slate-100">
                    {group.invoices.map((invoice) => {
                      const subtotal = getSubtotal(invoice);
                      const hst = getHstAmount(invoice);
                      const isSaving =
                        savingInvoiceId === invoice.id;

                      const paymentStatus =
                        invoice.payment_status || "Unpaid";

                      const paymentColor =
                        paymentStatus === "Paid"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : paymentStatus === "Pending"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-red-200 bg-red-50 text-red-700";

                      return (
                        <div
                          key={invoice.id}
                          className="px-7 py-6 transition hover:bg-slate-50"
                        >
                          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            {/* PROPERTY */}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FB]">
                                  <FileText className="h-5 w-5 text-[#2E7BBE]" />
                                </div>

                                <div className="min-w-0">
                                  <h3 className="font-bold text-[#1F4E79]">
                                    {invoice.property_name}
                                  </h3>

                                  {invoice.property_address && (
                                    <p className="mt-1 text-sm text-slate-400">
                                      {invoice.property_address}
                                    </p>
                                  )}

                                  <p className="mt-1 text-sm text-slate-400">
                                    {invoice.invoice_number}
                                  </p>

                                  {/* PAYMENT STATUS */}

                                  <div className="mt-4">
                                    <label
                                      htmlFor={`payment-status-${invoice.id}`}
                                      className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
                                    >
                                      Payment Status
                                    </label>

                                    <select
                                      id={`payment-status-${invoice.id}`}
                                      value={paymentStatus}
                                      disabled={isSaving}
                                      onChange={(event) =>
                                        handlePaymentStatusChange(
                                          invoice,
                                          event.target.value as
                                            | "Paid"
                                            | "Pending"
                                            | "Unpaid"
                                        )
                                      }
                                      className={`rounded-xl border px-4 py-2 text-sm font-semibold outline-none disabled:cursor-wait disabled:opacity-60 ${paymentColor}`}
                                    >
                                      <option value="Unpaid">
                                        Unpaid
                                      </option>
                                      <option value="Pending">
                                        Pending
                                      </option>
                                      <option value="Paid">
                                        Paid
                                      </option>
                                    </select>

                                    {isSaving && (
                                      <p className="mt-1 text-xs text-slate-400">
                                        Saving...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* AMOUNTS */}

                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-slate-400">
                                  Cleaning
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {formatMoney(
                                    Number(invoice.total_cleaning || 0)
                                  )}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-slate-400">
                                  Expenses
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {formatMoney(
                                    Number(invoice.total_expenses || 0)
                                  )}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-slate-400">
                                  HST
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {formatMoney(hst)}
                                </p>

                                <p
                                  className={`mt-1 text-xs font-semibold ${
                                    invoice.hst_enabled
                                      ? "text-green-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {invoice.hst_enabled
                                    ? "13% applied"
                                    : "Not applied"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-slate-400">
                                  Total
                                </p>

                                <p className="mt-1 text-xl font-black text-[#2E7BBE]">
                                  {formatMoney(
                                    Number(invoice.total_due || 0)
                                  )}
                                </p>
                              </div>
                            </div>
                                                        {/* HST CONTROL */}

                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() =>
                                  handleToggleHst(invoice)
                                }
                                className={`relative flex h-11 w-[78px] items-center rounded-full p-1 transition ${
                                  invoice.hst_enabled
                                    ? "bg-green-500"
                                    : "bg-slate-300"
                                } ${
                                  isSaving
                                    ? "cursor-wait opacity-60"
                                    : "cursor-pointer"
                                }`}
                                aria-label={
                                  invoice.hst_enabled
                                    ? "Disable HST"
                                    : "Enable HST"
                                }
                              >
                                <span
                                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition ${
                                    invoice.hst_enabled
                                      ? "translate-x-[34px]"
                                      : "translate-x-0"
                                  }`}
                                >
                                  {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                  ) : invoice.hst_enabled ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <X className="h-4 w-4 text-slate-400" />
                                  )}
                                </span>
                              </button>

                              <div className="min-w-[105px]">
                                <p className="text-xs uppercase tracking-widest text-slate-400">
                                  HST
                                </p>

                                <p
                                  className={`text-sm font-bold ${
                                    invoice.hst_enabled
                                      ? "text-green-600"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {isSaving
                                    ? "Saving..."
                                    : invoice.hst_enabled
                                      ? "Enabled · 13%"
                                      : "Disabled"}
                                </p>
                              </div>
                            </div>

                            {/* VIEW */}

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/dashboard/invoices/${group.owner_id}/${group.period_start}/${group.period_end}`
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-2xl bg-[#2E7BBE] px-5 py-3 font-semibold text-white transition hover:bg-[#1F4E79]"
                            >
                              View
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>

                          {/* SMALL TOTAL BREAKDOWN */}

                          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                            <span>
                              Subtotal:{" "}
                              <strong className="text-slate-600">
                                {formatMoney(subtotal)}
                              </strong>
                            </span>

                            <span>
                              HST:{" "}
                              <strong className="text-slate-600">
                                {formatMoney(hst)}
                              </strong>
                            </span>

                            <span>
                              Final amount:{" "}
                              <strong className="text-[#2E7BBE]">
                                {formatMoney(
                                  Number(invoice.total_due || 0)
                                )}
                              </strong>
                            </span>

                            <span
                              className={
                                invoice.hst_enabled
                                  ? "font-semibold text-green-600"
                                  : "font-semibold text-slate-400"
                              }
                            >
                              {invoice.hst_enabled
                                ? "HST included in total"
                                : "HST not applied"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}