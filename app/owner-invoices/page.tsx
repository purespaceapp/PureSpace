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
        const ownerId =
          sessionStorage.getItem("ownerId");

        if (!ownerId) {
          router.replace("/owner-login");
          return;
        }

        const data = await getOwnerInvoices(
          Number(ownerId)
        );

        setInvoices(data);
      } catch (error) {
        console.error(
          "Error loading invoice history:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const filteredInvoices = useMemo(() => {
    const term = search.toLowerCase();

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

  const totalInvoices =
    filteredInvoices.length;

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

  function formatPeriod(
    start: string,
    end: string
  ) {
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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <h1 className="text-2xl font-semibold text-slate-600">
          Loading Invoice History...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">

      <div className="max-w-7xl mx-auto px-10 pt-10 pb-16">

 <button
    onClick={() => router.push("/owner-home")}
    className="mb-6 flex items-center gap-2 rounded-2xl border-2 border-[#2E7BBE] bg-white px-5 py-3 font-semibold text-[#2E7BBE] shadow-md transition hover:bg-[#2E7BBE] hover:text-white"
  >
    ← Back to Owner Portal
  </button>
  
        {/* HERO */}

        <div className="rounded-[35px] bg-gradient-to-r from-[#2E7BBE] to-[#4D97E8] text-white p-10 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-5xl font-bold">
                Invoice History
              </h1>

              <p className="text-blue-100 text-xl mt-3">
                View and download your historical property invoices.
              </p>

            </div>

            <div className="bg-white/15 rounded-3xl px-8 py-6 text-center">

              <p className="text-blue-100">
                Invoices
              </p>

              <h2 className="text-5xl font-bold">
                {totalInvoices}
              </h2>

            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          <div className="bg-white rounded-[30px] shadow-xl p-7">

            <p className="text-slate-500">
              Total Invoices
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {totalInvoices}
            </h2>

          </div>

          <div className="bg-white rounded-[30px] shadow-xl p-7">
<p className="text-slate-500">
  Total Amount
</p>

<h2 className="text-5xl font-bold mt-3 text-[#2E7BBE]">
 ${totalAmount.toFixed(2)}
</h2>

<p className="mt-2 text-sm text-slate-400">
 
</p>
          </div>

          <div className="bg-white rounded-[30px] shadow-xl p-7">

            <p className="text-slate-500">
              Status
            </p>

            <h2 className="text-5xl font-bold mt-3 text-green-600">
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-white rounded-2xl shadow-lg px-6 py-5 outline-none text-lg"
          />

        </div>

        {/* HISTORY */}

        <div className="mt-10 space-y-8">

          {groupedByPeriod.map((group) => (

            <section
              key={`${group.period_start}-${group.period_end}`}
              className="bg-white rounded-[35px] shadow-2xl overflow-hidden"
            >

              <div className="bg-slate-50 border-b px-8 py-6 flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                    Billing Period
                  </p>

                  <h2 className="text-2xl font-bold text-slate-800 mt-1">
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

  <p className="text-2xl font-bold text-[#2E7BBE]">
    $
    {group.invoices
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.total_due || 0),
        0
      )
      .toFixed(2)}
  </p>
</div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-[#2E7BBE] text-white">

                    <tr>

                      <th className="text-left px-6 py-5">
                        Property
                      </th>

                      <th className="text-left px-6 py-5">
                        Invoice
                      </th>

                      <th className="text-center px-6 py-5">
                        Cleaning
                      </th>

                      <th className="text-center px-6 py-5">
                        Expenses
                      </th>

                      <th className="text-center px-6 py-5">
  Total Due
</th>

                      <th className="text-center px-6 py-5">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {group.invoices.map(
                      (invoice) => (

                        <tr
                          key={invoice.id}
                          className="border-b hover:bg-slate-50 transition"
                        >

                          <td className="px-6 py-6">

                            <div>

                              <h3 className="font-bold text-slate-800">
                                {invoice.property_name}
                              </h3>

                              <p className="text-slate-500 text-sm">
                                {invoice.property_address}
                              </p>

                            </div>

                          </td>

                          <td className="px-6 py-6 font-mono text-sm text-slate-600">
                            {invoice.invoice_number}
                          </td>

                          <td className="px-6 py-6 text-center">
                            ${Number(
                              invoice.total_cleaning || 0
                            ).toFixed(2)}
                          </td>

                          <td className="px-6 py-6 text-center">
                            ${Number(
                              invoice.total_expenses || 0
                            ).toFixed(2)}
                          </td>

                     <td className="px-6 py-6 text-center">
  <p className="font-bold text-[#2E7BBE]">
  $
  {Number(invoice.total_due || 0).toFixed(2)}
</p>
  <p className="mt-1 text-xs text-slate-400">
   {invoice.hst_enabled ? "HST included" : "HST not applied"}
  </p>
</td>

                          <td className="px-6 py-6">

                           <div className="flex justify-center gap-3">

  <button
    onClick={() =>
      router.push(
        `/owner-statement/${invoice.id}`
      )
    }
    className="bg-[#2E7BBE] hover:bg-[#23649D] text-white px-5 py-3 rounded-xl font-semibold transition"
  >
    View Invoice
  </button>

  <button
    onClick={() =>
      downloadHistoricalOwnerInvoice({
        invoice_number: invoice.invoice_number,
        property_name: invoice.property_name,
        property_address: invoice.property_address,
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        total_cleaning: Number(invoice.total_cleaning || 0),
        total_expenses: Number(invoice.total_expenses || 0),
        total_due: Number(invoice.total_due || 0),
        hst_enabled: Boolean(invoice.hst_enabled),
      })
    }
    className="border border-[#2E7BBE] text-[#2E7BBE] hover:bg-[#EAF4FB] px-5 py-3 rounded-xl font-semibold transition"
  >
    Download PDF
  </button>

</div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>

          ))}

          {groupedByPeriod.length === 0 && (

            <div className="bg-white rounded-[35px] shadow-2xl py-20 text-center">

              <h2 className="text-2xl font-bold text-slate-700">
                No invoice history found.
              </h2>

              <p className="text-slate-500 mt-3">
                Historical invoices will appear here once they are created.
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}