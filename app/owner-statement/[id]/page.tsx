"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { pdf } from "@react-pdf/renderer";

import { getProperties } from "@/lib/properties";
import { getCompletedSchedulesByProperty } from "@/lib/schedule";
import {
  getExtras,
  getScheduleExtras,
} from "@/lib/extras";
import { getReceiptsByProperty } from "@/lib/receipts";

import InvoicePDF from "@/app/components/InvoicePDF";

export default function OwnerStatementPage() {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);

  const [schedules, setSchedules] = useState<any[]>([]);

  const [extrasCatalog, setExtrasCatalog] =
    useState<any[]>([]);

  const [approvedReceipts, setApprovedReceipts] =
    useState<any[]>([]);

  const [extrasMap, setExtrasMap] = useState<
    Record<number, any[]>
  >({});

  const [downloading, setDownloading] =
    useState(false);

  const cleaningTotal = schedules.reduce(
    (sum, schedule) =>
      sum + Number(schedule.company_charge),
    0
  );

  useEffect(() => {
    async function load() {
      const ownerId =
        sessionStorage.getItem("ownerId");

      if (!ownerId || !id) return;

      const properties = await getProperties(
        Number(ownerId)
      );

      const selected = properties.find(
        (p) => Number(p.id) === Number(id)
      );

      setProperty(selected);

      const completed =
        await getCompletedSchedulesByProperty(
          Number(id)
        );

      setSchedules(completed);

      const catalog = await getExtras();

      setExtrasCatalog(catalog);

      const receipts =
        await getReceiptsByProperty(Number(id));

      setApprovedReceipts(receipts);

      const map: Record<number, any[]> = {};

      for (const schedule of completed) {
        map[schedule.id] =
          await getScheduleExtras(schedule.id);
      }

      setExtrasMap(map);
    }

    load();
  }, [id]);

  async function downloadStatement() {
    try {
      setDownloading(true);

      const blob = await pdf(
        <InvoicePDF
          property={property}
          schedules={schedules}
          extrasMap={extrasMap}
          extrasCatalog={extrasCatalog}
          cleaningTotal={cleaningTotal}
          approvedReceipts={approvedReceipts}
        />
      ).toBlob();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = `Statement-${property.name}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (!property) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <h1 className="text-2xl font-semibold text-slate-600">
          Loading Statement...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-8 py-14">

      <div className="w-full max-w-4xl">

        <div className="bg-white rounded-[36px] shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-[#2E7BBE] to-[#4D97E8] px-10 py-12 text-center text-white">
<div className="w-30 h-30 rounded-full bg-white mx-auto flex items-center justify-center shadow-xl p-3">
  <img
    src="/images/logo.jpg"
    alt="PureSpace Cleaning"
    className="w-full h-full object-contain"
  />
</div>

            <h1 className="text-5xl font-bold mt-8">
              Statement Ready
            </h1>

            <p className="mt-4 text-blue-100 text-xl">
              Thank you for choosing PureSpace Cleaning.
            </p>

          </div>

          <div className="p-12">

            <h2 className="text-3xl font-bold text-slate-800">
              Your statement is ready.
            </h2>

            <p className="text-slate-500 text-lg mt-4 leading-8">
              We've prepared your complete property
              statement including all completed
              cleanings, approved extra services,
              property expense receipts and your final
              balance.
            </p>

            <div className="mt-10 space-y-5">
                            <div className="flex items-center gap-5 rounded-2xl bg-green-50 p-5">
                <div className="text-3xl">✔</div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Completed Cleanings
                  </h3>

                  <p className="text-slate-500">
                    {schedules.length} completed cleaning
                    {schedules.length === 1 ? "" : "s"} included.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-2xl bg-blue-50 p-5">
                <div className="text-3xl">✔</div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Approved Extra Services
                  </h3>

                  <p className="text-slate-500">
                    All approved extras have been added to your statement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-2xl bg-yellow-50 p-5">
                <div className="text-3xl">✔</div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Property Expense Receipts
                  </h3>

                  <p className="text-slate-500">
                    {approvedReceipts.length} approved receipt
                    {approvedReceipts.length === 1 ? "" : "s"} included.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-2xl bg-purple-50 p-5">
                <div className="text-3xl">✔</div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Total Cleaning Charges
                  </h3>

                  <p className="text-slate-500">
                    ${cleaningTotal.toFixed(2)}
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-10 rounded-3xl bg-slate-50 p-8">

              <h3 className="text-2xl font-bold text-slate-800">
                Property Information
              </h3>

              <div className="mt-5 space-y-3">

                <div>
                  <span className="font-semibold text-slate-700">
                    Property:
                  </span>{" "}
                  {property.name}
                </div>

                <div>
                  <span className="font-semibold text-slate-700">
                    Address:
                  </span>{" "}
                  {property.address}
                </div>

                <div>
                  <span className="font-semibold text-slate-700">
                    Completed Cleanings:
                  </span>{" "}
                  {schedules.length}
                </div>

              </div>

            </div>

            <p className="mt-10 text-center text-slate-500 leading-8">
              If you have any questions regarding your statement,
              or believe any information is incorrect,
              please contact PureSpace Cleaning.
              Our team will be happy to assist you.
            </p>

            <div className="mt-10 flex flex-col md:flex-row gap-5">
                            <button
                onClick={downloadStatement}
                disabled={downloading}
                className="flex-1 bg-[#2E7BBE] hover:bg-[#2569A3] disabled:opacity-60 text-white font-bold py-4 rounded-2xl shadow-lg transition"
              >
                {downloading
                  ? "Generating PDF..."
                  : "⬇ Download Statement"}
              </button>

              <button
                onClick={() => router.push("/owner-home")}
                className="flex-1 border-2 border-[#2E7BBE] text-[#2E7BBE] hover:bg-[#2E7BBE] hover:text-white font-bold py-4 rounded-2xl transition"
              >
                ← Back to Dashboard
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}