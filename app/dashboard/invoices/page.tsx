"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getOfficeInvoices, Invoice } from "@/lib/invoices";

type OfficeInvoiceGroup = {
  owner_id: number;
  owner_name: string;
  owner_email?: string | null;
  period_start: string;
  period_end: string;
  total_cleaning: number;
  total_expenses: number;
  total_due: number;
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
  }).format(value);
}

export default function OfficeInvoicesPage() {
  const router = useRouter();

const [groups, setGroups] = useState<OfficeInvoiceGroup[]>([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [hstEnabled, setHstEnabled] = useState(true);
const [savingHst, setSavingHst] = useState(false);

useEffect(() => {
  loadInvoices();
  loadHstSetting();
}, []);

  async function loadInvoices() {
  try {
    setLoading(true);

    const data = await getOfficeInvoices();

    setGroups((data || []) as unknown as OfficeInvoiceGroup[]);
  } catch (error) {
    console.error("Failed to load office invoices:", error);
  } finally {
    setLoading(false);
  }
}
async function loadHstSetting() {
  try {
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "get-hst",
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Failed to load HST setting"
      );
    }

    setHstEnabled(Boolean(result.data));
  } catch (error) {
    console.error(
      "Failed to load HST setting:",
      error
    );
  }
}

async function toggleHst() {
  try {
    setSavingHst(true);

    const nextValue = !hstEnabled;

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "set-hst",
        enabled: nextValue,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Failed to update HST setting"
      );
    }

    setHstEnabled(Boolean(result.data));
  } catch (error) {
    console.error(
      "Failed to update HST setting:",
      error
    );
  } finally {
    setSavingHst(false);
  }
}
  const filteredGroups = useMemo(() => {
    return groups
      .filter((group) => {
        if (!search.trim()) {
          return true;
        }

        const term = search.toLowerCase();

        return (
          group.owner_name
            ?.toLowerCase()
            .includes(term) ||
          group.owner_email
            ?.toLowerCase()
            .includes(term) ||
          group.invoices.some((invoice) =>
            invoice.property_name
              ?.toLowerCase()
              .includes(term)
          ) ||
          group.invoices.some((invoice) =>
            invoice.invoice_number
              ?.toLowerCase()
              .includes(term)
          )
        );
      })
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
  }, [groups, search]);

  const propertyInvoiceCount = filteredGroups.reduce(
    (sum, group) => sum + group.invoices.length,
    0
  );

  const totalBilled = filteredGroups.reduce(
    (sum, group) =>
      sum + Number(group.total_due || 0),
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
  </div>

  <div className="flex items-center gap-4">


    {/* INVOICE ICON */}
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-md">
      <FileText className="h-8 w-8 text-[#2E7BBE]" />
    </div>

  </div>

</div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-5">

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
              Across stored invoices
            </p>
          </div>

        </div>

        {/* SEARCH */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-md">
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
        </div>

        {/* INVOICES */}
        {filteredGroups.length === 0 ? (
          <div className="rounded-[32px] border border-slate-100 bg-white p-16 text-center shadow-md">

            <FileText className="mx-auto h-14 w-14 text-slate-300" />

            <h2 className="mt-5 text-2xl font-bold text-[#1F4E79]">
              No invoices found
            </h2>

            <p className="mt-2 text-slate-500">
              Stored invoices will appear here once billing
              periods have been finalized.
            </p>

          </div>
        ) : (
          <div className="space-y-6">

            {filteredGroups.map((group) => (
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
                        Total
                      </p>

                      <p className="mt-1 text-3xl font-black text-[#2E7BBE]">
                        {formatMoney(
                          Number(group.total_due || 0)
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* PROPERTY BREAKDOWN */}
                <div className="divide-y divide-slate-100">

                  {group.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between gap-6 px-7 py-6 transition hover:bg-slate-50"
                    >

                      <div className="min-w-0">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FB]">
                            <FileText className="h-5 w-5 text-[#2E7BBE]" />
                          </div>

                          <div className="min-w-0">

                            <h3 className="truncate font-bold text-[#1F4E79]">
                              {invoice.property_name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                              {invoice.invoice_number}
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="flex shrink-0 items-center gap-10">

                        <div className="hidden text-right md:block">
                          <p className="text-xs uppercase tracking-widest text-slate-400">
                            Cleaning
                          </p>

                          <p className="mt-1 font-semibold text-slate-700">
                            {formatMoney(
                              Number(
                                invoice.total_cleaning || 0
                              )
                            )}
                          </p>
                        </div>

                        <div className="hidden text-right md:block">
                          <p className="text-xs uppercase tracking-widest text-slate-400">
                            Expenses
                          </p>

                          <p className="mt-1 font-semibold text-slate-700">
                            {formatMoney(
                              Number(
                                invoice.total_expenses || 0
                              )
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs uppercase tracking-widest text-slate-400">
                            Total
                          </p>

                          <p className="mt-1 text-xl font-black text-[#1F4E79]">
                            {formatMoney(
                              Number(
                                invoice.total_due || 0
                              )
                            )}
                          </p>
                        </div>

                      </div>

                    </div>
                  ))}

                </div>

                {/* GROUP TOTAL */}
                <div className="border-t border-slate-100 bg-white px-7 py-5">

                  <div className="flex items-center justify-between gap-6">

                    <div>
                      <p className="text-sm text-slate-400">
                        {group.invoices.length}{" "}
                        {group.invoices.length === 1
                          ? "property invoice"
                          : "property invoices"}
                      </p>

                      <p className="mt-1 font-semibold text-[#1F4E79]">
                        Consolidated invoice
                      </p>
                    </div>

                    <div className="flex items-center gap-8">

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-slate-400">
                          Cleaning
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                          {formatMoney(
                            Number(
                              group.total_cleaning || 0
                            )
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-slate-400">
                          Expenses
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                          {formatMoney(
                            Number(
                              group.total_expenses || 0
                            )
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-slate-400">
                          Total Due
                        </p>

                        <p className="mt-1 text-xl font-black text-[#1F4E79]">
                          {formatMoney(
                            Number(
                              group.total_due || 0
                            )
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/invoices/${group.owner_id}/${group.period_start}/${group.period_end}`
                          )
                        }
                        className="flex items-center gap-2 rounded-2xl bg-[#2E7BBE] px-5 py-3 font-semibold text-white transition hover:bg-[#1F4E79]"
                      >
                        View
                        <ChevronRight className="h-4 w-4" />
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}