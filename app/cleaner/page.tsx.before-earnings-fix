"use client";

import { downloadInvoice } from "@/lib/invoice";
import { useEffect, useMemo, useState } from "react";
import { getCleanerSchedule } from "@/lib/cleaner";
import { getScheduleExtras } from "@/lib/extras";
import { getProperties } from "@/lib/properties";
import { getApprovedCleanerReceipts } from "@/lib/receipts";
import { getCurrentBillingPeriod } from "@/lib/billingPeriod";

export default function CleanerPage() {
  // Temporary until cleaner authentication is fully connected.
  const [employeeId, setEmployeeId] = useState(0);

  const [jobs, setJobs] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [approvedReceipts, setApprovedReceipts] = useState<any[]>([]);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(
    {}
  );

  const billingPeriod = getCurrentBillingPeriod();

  const formatMoney = (value: unknown): string => {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      return "0.00";
    }

    return numberValue.toFixed(2);
  };

  useEffect(() => {
    const id = Number(sessionStorage.getItem("employeeId") || "0");

    setEmployeeId(id);

    if (!id) {
      window.location.href = "/cleaner-login";
      return;
    }

    async function load() {
      const employeeData = JSON.parse(
        sessionStorage.getItem("employee") || "null"
      );

      setEmployee(employeeData);

      const propertyData = await getProperties();
      setProperties(propertyData);

      const schedule = await getCleanerSchedule(id);

     const periodJobs = schedule.filter((job: any) => {
        const date = String(job.cleaning_date).slice(0, 10);

        return date >= billingPeriod.start && date <= billingPeriod.end;
      });

      const receipts = await getApprovedCleanerReceipts(id);

      const periodReceipts = receipts.filter((receipt: any) => {
        const date = String(receipt.purchase_date).slice(0, 10);

        return date >= billingPeriod.start && date <= billingPeriod.end;
      });

      setApprovedReceipts(periodReceipts);

      const jobsWithExtras = await Promise.all(
        periodJobs.map(async (job: any) => ({
          ...job,
          extras: await getScheduleExtras(job.id),
        }))
      );

      setJobs(jobsWithExtras);
    }

    load();
  }, []);

  const receiptTotal = approvedReceipts.reduce(
    (sum, receipt) => sum + Number(receipt.amount),
    0
  );

  const cleaningTotal = jobs.reduce(
    (sum, job) => sum + Number(job.cleaner_pay),
    0
  );

  const grandTotal = cleaningTotal + receiptTotal;

  const totalExtras = jobs.reduce((sum, job) => {
    return (
      sum +
      (job.extras || []).reduce((extraSum: number, extra: any) => {
        const cleanerExtra =
          extra.extra_id === 1
            ? 16
            : extra.extra_id === 2
              ? 18
              : extra.extra_id === 3
                ? 25
                : extra.extra_id === 4
                  ? 10
                  : extra.extra_id === 5
                    ? 15
                    : extra.extra_id === 6
                      ? 15
                      : extra.extra_id === 7
                        ? 18
                        : extra.extra_id === 8
                          ? 18
                          : 0;

        return extraSum + cleanerExtra * Number(extra.quantity || 0);
      }, 0)
    );
  }, [jobs]);

  const jobsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    jobs.forEach((job) => {
      const date = String(job.cleaning_date).slice(0, 10);

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(job);
    });

    return Object.entries(grouped).sort(([dateA], [dateB]) =>
      dateB.localeCompare(dateA)
    );
  }, [jobs]);

  const cleanerName =
    employee?.name ||
    employee?.full_name ||
    employee?.first_name ||
    "Cleaner";

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) {
      return date;
    }

    return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCleanerExtra = (extraId: number) => {
    switch (extraId) {
      case 1:
        return 16;
      case 2:
        return 18;
      case 3:
        return 25;
      case 4:
        return 10;
      case 5:
        return 15;
      case 6:
        return 15;
      case 7:
        return 18;
      case 8:
        return 18;
      default:
        return 0;
    }
  };

  const getExtraName = (extraId: number) => {
    switch (extraId) {
      case 1:
        return "Laundry";
      case 2:
        return "Extra Hour";
      case 3:
        return "Deep Clean";
      case 4:
        return "Windows";
      case 5:
        return "Pet Hair";
      case 6:
        return "Extra Linen";
      case 7:
        return "Biohazard";
      case 8:
        return "Balcony";
      default:
        return "Extra";
    }
  };

  const getExtraIcon = (extraId: number) => {
    switch (extraId) {
      case 1:
        return "🧺";
      case 2:
        return "🕒";
      case 3:
        return "🧼";
      case 4:
        return "🪟";
      case 5:
        return "🐶";
      case 6:
        return "🛏️";
      case 7:
        return "☣️";
      case 8:
        return "🌿";
      default:
        return "✨";
    }
  };

  const getJobTotal = (job: any): number => {
  const base = Number(job?.cleaner_pay ?? 0);

  const extrasTotal = Array.isArray(job?.extras)
    ? job.extras.reduce((sum: number, extra: any) => {
        const extraPrice = Number(
          getCleanerExtra(Number(extra?.extra_id ?? 0)) ?? 0
        );

        const quantity = Number(extra?.quantity ?? 0);

        return sum + extraPrice * quantity;
      }, 0)
    : 0;

  const receiptsTotal = Array.isArray(approvedReceipts)
    ? approvedReceipts
        .filter(
          (receipt: any) =>
            Number(receipt?.schedule_id) === Number(job?.id)
        )
        .reduce(
          (sum: number, receipt: any) =>
            sum + Number(receipt?.amount ?? 0),
          0
        )
    : 0;

  return Number(base + extrasTotal + receiptsTotal) || 0;
};

const getDayTotal = (dayJobs: any[]): number => {
  return dayJobs.reduce(
    (sum: number, job: any) => sum + getJobTotal(job),
    0
  );
};

  const toggleDay = (date: string) => {
    setExpandedDays((current) => ({
      ...current,
      [date]: !current[date],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#14213D]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF4FC] px-4 py-2 text-sm font-semibold text-[#2E7BBE]">
              <span>💼</span>
              Cleaner Portal
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#13213D] sm:text-5xl">
              Hello, {cleanerName}
              <span className="ml-2">👋</span>
            </h1>

            <p className="mt-3 text-base text-slate-500">
              Here is your earnings summary for the current pay period.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Current Pay Period
            </p>

            <p className="mt-1 text-sm font-bold text-[#1C3557]">
              {formatDate(billingPeriod.start)} –{" "}
              {formatDate(billingPeriod.end)}
            </p>
          </div>
        </div>

        {/* MAIN EARNINGS CARD */}
        <div className="mt-8 overflow-hidden rounded-[28px] bg-[#0F1C3F] shadow-xl">
          <div className="p-7 sm:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
                  Current Earnings
                </p>

                <div className="mt-2 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                  ${formatMoney(grandTotal)}
                </div>

                <p className="mt-2 text-sm text-blue-100/80">
                  Total earned during this pay period
                </p>
              </div>

              <div className="flex gap-3">
                <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {jobs.length}
                  </p>
                  <p className="mt-1 text-xs font-medium text-blue-100/70">
                    Cleanings
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {approvedReceipts.length}
                  </p>
                  <p className="mt-1 text-xs font-medium text-blue-100/70">
                    Receipts
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-3">
            <div className="px-7 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/60">
                Cleaning Pay
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                ${formatMoney(cleaningTotal)}
              </p>
            </div>

            <div className="border-t border-white/10 px-7 py-5 sm:border-l sm:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/60">
                Extras
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                ${formatMoney(totalExtras)}
              </p>
            </div>

            <div className="border-t border-white/10 px-7 py-5 sm:border-l sm:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/60">
                Approved Receipts
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                ${formatMoney(receiptTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* CLEANINGS HEADER */}
        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7BBE]">
              Earnings Activity
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#14213D] sm:text-3xl">
              Your Cleanings
            </h2>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
            {jobs.length} {jobs.length === 1 ? "cleaning" : "cleanings"}
          </div>
        </div>

        {/* CLEANINGS */}
        <div className="mt-5 space-y-4">
          {jobsByDate.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FC] text-2xl">
                📅
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#14213D]">
                No cleanings yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Your completed and scheduled cleanings for this pay period
                will appear here.
              </p>
            </div>
          ) : (
            jobsByDate.map(([date, dayJobs]) => {
              const isExpanded = expandedDays[date] ?? true;
              const dayTotal = getDayTotal(dayJobs);

              return (
                <div
                  key={date}
                  className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* DAY HEADER */}
                  <button
                    type="button"
                    onClick={() => toggleDay(date)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FC] text-xl">
                        📅
                      </div>

                      <div className="min-w-0">
                        <p className="text-base font-extrabold text-[#14213D] sm:text-lg">
                          {formatDate(date)}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {dayJobs.length}{" "}
                          {dayJobs.length === 1 ? "cleaning" : "cleanings"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Day total
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-[#16834A]">
                          ${formatMoney(dayTotal)}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        {isExpanded ? "−" : "+"}
                      </div>
                    </div>
                  </button>

                  {/* DAY CONTENT */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 pb-4 sm:px-6 sm:pb-6">
                      <div className="space-y-3 pt-4">
                        {dayJobs.map((job: any) => {
                          const property = properties.find(
                            (p) => p.id === job.property_id
                          );

                          const jobBasePay = Number(job?.cleaner_pay ?? 0);

                          const jobExtras = Array.isArray(job?.extras)
                            ? job.extras.reduce((sum: number, extra: any) => {
                                const extraPrice = Number(
                                  getCleanerExtra(Number(extra?.extra_id ?? 0))
                                );

                                const quantity = Number(extra?.quantity ?? 0);

                                return sum + extraPrice * quantity;
                              }, 0)
                            : 0;

                          const jobReceipts = Array.isArray(approvedReceipts)
                            ? approvedReceipts
                                .filter(
                                  (receipt: any) =>
                                    Number(receipt?.schedule_id) ===
                                    Number(job?.id)
                                )
                                .reduce(
                                  (sum: number, receipt: any) =>
                                    sum + Number(receipt?.amount ?? 0),
                                  0
                                )
                            : 0;

                          const jobTotal =
                            Number(jobBasePay + jobExtras + jobReceipts) || 0;

                          return (
                            <div
                              key={job.id}
                              className="rounded-2xl border border-slate-200 bg-[#FBFCFE] p-5"
                            >
                              {/* PROPERTY */}
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-slate-200">
                                    🏠
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="truncate text-base font-extrabold text-[#14213D] sm:text-lg">
                                      {property?.name || "Property"}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Cleaning service
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-xl bg-[#EAF8F0] px-4 py-2 text-right">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#16834A]">
                                    Your earnings
                                  </p>

                                  <p className="mt-0.5 text-lg font-extrabold text-[#16834A]">
                                    ${formatMoney(jobTotal)}
                                  </p>
                                </div>
                              </div>

                              {/* BASE PAY */}
                              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                                <span className="text-sm text-slate-500">
                                  Cleaning pay
                                </span>

                                <span className="text-sm font-bold text-slate-700">
                                  ${formatMoney(jobBasePay)}
                                </span>
                              </div>

                              {/* EXTRAS */}
                              {job.extras?.length > 0 && (
                                <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Extras
                                  </p>

                                  <div className="space-y-2">
                                    {job.extras.map((extra: any) => {
                                      const cleanerExtra =
                                        getCleanerExtra(
                                          Number(extra.extra_id)
                                        );

                                      const quantity = Number(
                                        extra.quantity || 0
                                      );

                                      const extraTotal =
                                        cleanerExtra * quantity;

                                      return (
                                        <div
                                          key={`${job.id}-${extra.extra_id}`}
                                          className="flex items-center justify-between gap-3 text-sm"
                                        >
                                          <span className="text-slate-600">
                                            {getExtraIcon(
                                              Number(extra.extra_id)
                                            )}{" "}
                                            {getExtraName(
                                              Number(extra.extra_id)
                                            )}{" "}
                                            ×{quantity}
                                          </span>

                                          <span className="font-bold text-[#16834A]">
                                            +${formatMoney(extraTotal)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* RECEIPTS */}
                              {jobReceipts > 0 && (
                                <div className="mt-3 rounded-xl bg-[#EEF6FF] p-3 ring-1 ring-blue-100">
                                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#2E7BBE]">
                                    Approved receipts
                                  </p>

                                  <div className="space-y-2">
                                    {approvedReceipts
                                      .filter(
                                        (receipt: any) =>
                                          receipt.schedule_id === job.id
                                      )
                                      .map((receipt: any) => (
                                        <div
                                          key={receipt.id}
                                          className="flex items-center justify-between gap-3 text-sm"
                                        >
                                          <span className="text-slate-600">
                                            🧾 Receipt
                                          </span>

                                          <span className="font-bold text-[#2E7BBE]">
                                            +$
                                            {formatMoney(receipt.amount)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* JOB TOTAL */}
                              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#0F1C3F] px-4 py-3">
                                <span className="text-sm font-semibold text-white/70">
                                  Job total
                                </span>

                                <span className="text-base font-extrabold text-white">
                                  ${formatMoney(jobTotal)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM SUMMARY */}
        <div className="mt-8 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E7BBE]">
                Payment Summary
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-[#14213D]">
                Current Pay Period
              </h2>
            </div>

            <div className="rounded-2xl bg-[#EAF8F0] px-5 py-3 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#16834A]">
                Grand Total
              </p>

              <p className="mt-0.5 text-2xl font-extrabold text-[#16834A]">
                ${formatMoney(grandTotal)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#F7F9FC] p-4">
              <p className="text-xs text-slate-400">Cleaning earnings</p>
              <p className="mt-1 text-lg font-bold text-[#14213D]">
                ${formatMoney(cleaningTotal)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F9FC] p-4">
              <p className="text-xs text-slate-400">Extras</p>
              <p className="mt-1 text-lg font-bold text-[#14213D]">
                ${formatMoney(totalExtras)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F9FC] p-4">
              <p className="text-xs text-slate-400">Approved receipts</p>
              <p className="mt-1 text-lg font-bold text-[#14213D]">
                ${formatMoney(receiptTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() =>
              downloadInvoice(
                employee,
                jobs,
                properties,
                grandTotal,
                approvedReceipts,
                billingPeriod
              )
            }
            className="group flex min-h-[68px] items-center justify-center gap-3 rounded-2xl bg-[#2E7BBE] px-6 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-[#23649D] hover:shadow-xl"
          >
            <span className="text-xl">↓</span>
            Download Payment Invoice
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>

          <button
            onClick={() => {
              window.location.href = "/cleaner/inventory";
            }}
            className="group flex min-h-[68px] items-center justify-center gap-3 rounded-2xl bg-[#16834A] px-6 text-base font-bold text-white shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5 hover:bg-[#116B3C] hover:shadow-xl"
          >
            <span className="text-xl">📦</span>
            Inventory
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        <p className="mt-8 pb-4 text-center text-xs text-slate-400">
          PureSpace Cleaning · Cleaner Earnings Portal
        </p>
      </div>
    </div>
  );
}