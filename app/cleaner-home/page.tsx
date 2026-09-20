"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Package,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";

export default function CleanerHomePage() {
  const router = useRouter();

  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("employee");

    if (!data) {
      router.push("/cleaner-login");
      return;
    }

    setEmployee(JSON.parse(data));
  }, [router]);

  const firstName =
    employee?.name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-[#F4F8FC] text-[#14263A]">

      {/* ===================================================== */}
      {/* BACKGROUND                                            */}
      {/* ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-cyan-200/20 blur-3xl" />

        <div className="absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-3xl" />

        <div className="absolute bottom-[-250px] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />

      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-6 sm:px-8">

        {/* =================================================== */}
        {/* HEADER                                               */}
        {/* =================================================== */}

        <header className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

              <BriefcaseBusiness className="h-5 w-5 text-[#2E7BBE]" />

            </div>

            <div>

              <p className="text-sm font-extrabold tracking-tight">
                PureSpace
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[2px] text-slate-400">
                Cleaner Workspace
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 shadow-sm backdrop-blur">

            <span className="relative flex h-2.5 w-2.5">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

            </span>

            <span className="hidden text-xs font-semibold text-slate-500 sm:block">
              Online
            </span>

          </div>

        </header>

        {/* =================================================== */}
        {/* WELCOME HERO                                        */}
        {/* =================================================== */}

        <section className="mt-10 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#174B7A] via-[#276FA9] to-[#3B93D3] p-7 text-white shadow-[0_20px_60px_rgba(35,93,139,0.20)] sm:p-9">

          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-blue-50">

                <Sparkles className="h-3.5 w-3.5" />

                Cleaner Portal

              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">

                Hello, {firstName}! 👋

              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">

                Welcome to your PureSpace workspace.
                Manage your earnings, receipts and
                inventory from one place.

              </p>

            </div>

            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-white/10 ring-1 ring-white/20 sm:flex">

              <Sparkles className="h-10 w-10 text-white/80" />

            </div>

          </div>

        </section>

        {/* =================================================== */}
        {/* QUICK OVERVIEW                                      */}
        {/* =================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2E7BBE]">

                <Wallet className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Earnings
                </p>

                <p className="text-sm font-bold text-[#17324D]">
                  My Payroll
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                <Receipt className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Expenses
                </p>

                <p className="text-sm font-bold text-[#17324D]">
                  Receipts
                </p>

              </div>

            </div>

          </div>

          <div className="col-span-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:col-span-1">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                <Package className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Supplies
                </p>

                <p className="text-sm font-bold text-[#17324D]">
                  Inventory
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================== */}
        {/* WORKSPACE                                           */}
        {/* =================================================== */}

        <section className="mt-10">

          <div className="mb-5">

            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#2E7BBE]">
              Your Workspace
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#16283D]">
              What would you like to do?
            </h2>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {/* ================================================= */}
            {/* MY EARNINGS                                       */}
            {/* ================================================= */}

            <button
              onClick={() => router.push("/cleaner")}
              className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-6 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
            >

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-start justify-between">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2E7BBE]">

                  <Wallet className="h-7 w-7" />

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-[#2E7BBE] group-hover:text-white">

                  <ArrowRight className="h-4 w-4" />

                </div>

              </div>

              <div className="relative mt-7">

                <h3 className="text-xl font-bold text-[#172A3F]">
                  My Earnings
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View your schedule, payroll and
                  invoice information.
                </p>

              </div>

              <div className="relative mt-6 flex items-center gap-2 text-xs font-bold text-[#2E7BBE]">

                View earnings

                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

              </div>

            </button>

            {/* ================================================= */}
            {/* SUBMIT RECEIPT                                    */}
            {/* ================================================= */}

            <button
              onClick={() => router.push("/receipt")}
              className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-6 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
            >

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-50 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-start justify-between">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">

                  <FileText className="h-7 w-7" />

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-purple-600 group-hover:text-white">

                  <ArrowRight className="h-4 w-4" />

                </div>

              </div>

              <div className="relative mt-7">

                <h3 className="text-xl font-bold text-[#172A3F]">
                  Submit Receipt
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Upload purchases and submit them
                  for reimbursement.
                </p>

              </div>

              <div className="relative mt-6 flex items-center gap-2 text-xs font-bold text-purple-600">

                Submit expense

                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

              </div>

            </button>

            {/* ================================================= */}
            {/* INVENTORY                                         */}
            {/* ================================================= */}

            <button
              onClick={() =>
                router.push("/cleaner/inventory")
              }
              className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-6 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
            >

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-start justify-between">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                  <Package className="h-7 w-7" />

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-emerald-600 group-hover:text-white">

                  <ArrowRight className="h-4 w-4" />

                </div>

              </div>

              <div className="relative mt-7">

                <h3 className="text-xl font-bold text-[#172A3F]">
                  Inventory
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Check supplies and generate your
                  inventory report.
                </p>

              </div>

              <div className="relative mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600">

                Open inventory

                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

              </div>

            </button>

          </div>

        </section>

        {/* =================================================== */}
        {/* FOOTER                                               */}
        {/* =================================================== */}

        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 py-6 text-xs text-slate-400 sm:flex-row">

          <div className="flex items-center gap-2">

            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

            <span>
              Your workspace is ready
            </span>

          </div>

          <div className="flex items-center gap-2">

            <span>
              PureSpace Cleaning
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span>
              Version 2.0
            </span>

          </div>

        </footer>

      </div>

    </main>
  );
}