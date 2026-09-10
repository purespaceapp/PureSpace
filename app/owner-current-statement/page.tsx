"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, ArrowLeft } from "lucide-react";
import { getCurrentOwnerStatement } from "@/lib/invoices";

type StatementItem = {
  id: string | number;
  item_type: string;
  item_date?: string | null;
  description: string;
  amount: number;
};

type CurrentStatement = {
  property: {
    id: number;
    name: string;
    address?: string | null;
    owner_id: number;
  };

  period_start: string;
  period_end: string;

  status: string;

  total_cleaning: number;
  total_expenses: number;

  subtotal: number;
  hst_enabled: boolean;
  hst_amount: number;
  total_due: number;

  items: StatementItem[];
};

function CurrentOwnerStatementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const propertyId = searchParams.get("propertyId");

  const [statement, setStatement] =
    useState<CurrentStatement | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

  function formatMoney(value: number) {
    return Number(value || 0).toFixed(2);
  }

  useEffect(() => {
    async function load() {
      try {
        const ownerId =
          sessionStorage.getItem("ownerId");

        if (!ownerId) {
          router.replace("/owner-login");
          return;
        }

        if (!propertyId) {
          setError("Property was not specified.");
          return;
        }

        const data =
          await getCurrentOwnerStatement(
            Number(propertyId)
          );

        setStatement(data);
      } catch (err) {
        console.error(
          "Error loading current statement:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load statement."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [propertyId, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <h1 className="text-2xl font-semibold text-slate-600">
          Loading Statement...
        </h1>
      </main>
    );
  }

  if (error || !statement) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-6">
        <div className="bg-white rounded-[30px] shadow-xl p-10 text-center max-w-lg">
          <h1 className="text-3xl font-bold text-slate-800">
            Statement Unavailable
          </h1>

          <p className="text-slate-500 mt-4">
            {error ||
              "This statement could not be loaded."}
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

  const cleaningItems =
    statement.items.filter(
      (item) =>
        item.item_type === "cleaning"
    );

  const expenseItems =
    statement.items.filter(
      (item) =>
        item.item_type === "expense"
    );

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-6 py-12">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden">

          {/* HEADER */}

          <div className="bg-gradient-to-r from-[#2E7BBE] to-[#4D97E8] px-10 py-12 text-white">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

              <div>

                <p className="text-blue-100 uppercase tracking-wider text-sm font-semibold">
                  Current Statement
                </p>

                <h1 className="text-5xl font-bold mt-3">
                  {statement.property.name}
                </h1>

                {statement.property.address && (
                  <p className="text-blue-100 text-lg mt-3">
                    {statement.property.address}
                  </p>
                )}

              </div>

              <div className="bg-white/15 rounded-3xl px-7 py-6 text-center">

                <p className="text-blue-100 text-sm">
                  Billing Period
                </p>

                <p className="text-xl font-bold mt-2">
                  {formatDate(
                    statement.period_start
                  )}
                </p>

                <p className="text-blue-100">
                  to
                </p>

                <p className="text-xl font-bold">
                  {formatDate(
                    statement.period_end
                  )}
                </p>

              </div>

            </div>

          </div>

          <div className="p-10">

            {/* INFO */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-slate-50 rounded-2xl p-6">

                <p className="text-sm text-slate-400 font-semibold uppercase">
                  Statement Type
                </p>

                <p className="text-xl font-bold text-[#2E7BBE] mt-2">
                  Current
                </p>

              </div>

              <div className="bg-slate-50 rounded-2xl p-6">

                <p className="text-sm text-slate-400 font-semibold uppercase">
                  Completed Cleanings
                </p>

                <p className="text-xl font-bold text-slate-800 mt-2">
                  {cleaningItems.length}
                </p>

              </div>

              <div className="bg-slate-50 rounded-2xl p-6">

                <p className="text-sm text-slate-400 font-semibold uppercase">
                  Status
                </p>

                <p className="text-xl font-bold text-green-600 mt-2">
                  Current
                </p>

              </div>

            </div>

            {/* CLEANINGS */}

            <div className="mt-12">

              <h2 className="text-3xl font-bold text-slate-800">
                Completed Cleanings
              </h2>

              <p className="text-slate-500 mt-2">
                Completed services included in the current billing period.
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
                            {formatMoney(
                              item.amount
                            )}
                          </td>

                        </tr>
                      )
                    )}

                    {cleaningItems.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          No completed cleanings in this billing period yet.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* EXPENSES */}

            <div className="mt-10">

              <h2 className="text-2xl font-bold text-slate-800">
                Property Expenses
              </h2>

              <p className="text-slate-500 mt-2">
                Approved property expenses included in this period.
              </p>

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
                        {formatMoney(
                          item.amount
                        )}
                      </span>

                    </div>
                  )
                )}

                {expenseItems.length === 0 && (
                  <div className="bg-slate-50 rounded-2xl px-6 py-5 text-slate-500">
                    No approved property expenses in this billing period.
                  </div>
                )}

              </div>

            </div>

            {/* TOTAL */}

            <div className="mt-12 ml-auto max-w-md">

              <div className="bg-slate-50 rounded-3xl p-7 space-y-4">

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Cleaning Total
                  </span>

                  <span className="font-semibold">
                    $
                    {formatMoney(
                      statement.total_cleaning
                    )}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Property Expenses
                  </span>

                  <span className="font-semibold">
                    $
                    {formatMoney(
                      statement.total_expenses
                    )}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    $
                    {formatMoney(
                      statement.subtotal
                    )}
                  </span>

                </div>

                {statement.hst_enabled && (
                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      HST (13%)
                    </span>

                    <span className="font-semibold">
                      $
                      {formatMoney(
                        statement.hst_amount
                      )}
                    </span>

                  </div>
                )}

                <div className="border-t pt-5 flex justify-between">

                  <span className="text-xl font-bold text-slate-800">
                    CURRENT TOTAL
                  </span>

                  <span className="text-2xl font-bold text-[#2E7BBE]">
                    $
                    {formatMoney(
                      statement.total_due
                    )}
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
                className="flex-1 border-2 border-[#2E7BBE] text-[#2E7BBE] hover:bg-[#2E7BBE] hover:text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Owner Portal
              </button>

              <button
                onClick={() =>
                  router.push("/owner-invoices")
                }
                className="flex-1 bg-[#2E7BBE] hover:bg-[#23649D] text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Invoice History
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
export default function CurrentOwnerStatementPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
          <h1 className="text-2xl font-semibold text-slate-600">
            Loading Statement...
          </h1>
        </main>
      }
    >
      <CurrentOwnerStatementContent />
    </Suspense>
  );
}
