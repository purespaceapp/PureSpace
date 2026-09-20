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

        <div className="absolute -left-32 -top-32 h-[320px] w-[320px] rounded-full bg-cyan-200/20 blur-3xl sm:h-[420px] sm:w-[420px]" />

        <div className="absolute -right-32 top-20 h-[320px] w-[320px] rounded-full bg-blue-200/20 blur-3xl sm:h-[420px] sm:w-[420px]" />

      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-6 pt-4 sm:px-8 sm:py-6">

        {/* =================================================== */}
        {/* HEADER                                               */}
        {/* =================================================== */}

        <header className="flex items-center justify-between">

          <div className="flex items-center gap-2.5">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 sm:h-11 sm:w-11 sm:rounded-2xl">

              <BriefcaseBusiness className="h-5 w-5 text-[#2E7BBE]" />

            </div>

            <div>

              <p className="text-sm font-extrabold tracking-tight">
                PureSpace
              </p>

              <p className="text-[8px] font-bold uppercase tracking-[1.8px] text-slate-400 sm:text-[9px]">
                Cleaner Workspace
              </p>

            </div>

          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

            </span>

            <span className="text-[11px] font-semibold text-slate-500">
              Online
            </span>

          </div>

        </header>

        {/* =================================================== */}
        {/* WELCOME                                              */}
        {/* =================================================== */}

        <section className="mt-5 rounded-[26px] bg-gradient-to-br from-[#174B7A] via-[#276FA9] to-[#3B93D3] px-5 py-6 text-white shadow-[0_18px_45px_rgba(35,93,139,0.18)] sm:mt-8 sm:rounded-[32px] sm:p-9">

          <div className="flex items-center justify-between gap-4">

            <div>

              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold">

                <Sparkles className="h-3 w-3" />

                Cleaner Portal

              </div>

              <h1 className="text-[30px] font-black tracking-tight sm:text-4xl">

                Hello, {firstName}! 👋

              </h1>

              <p className="mt-2 max-w-md text-sm leading-5 text-blue-100 sm:mt-3 sm:text-base sm:leading-6">

                Everything you need for your
                cleaning work, right here.

              </p>

            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white/10 ring-1 ring-white/20 sm:flex">

              <Sparkles className="h-8 w-8 text-white/80" />

            </div>

          </div>

        </section>

        {/* =================================================== */}
        {/* WORKSPACE                                            */}
        {/* =================================================== */}

        <section className="mt-7 sm:mt-10">

          <div className="mb-4 px-1 sm:mb-5">

            <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#2E7BBE] sm:text-[10px]">
              Your Workspace
            </p>

            <h2 className="mt-1 text-[22px] font-bold tracking-tight text-[#16283D] sm:text-2xl">
              What do you need?
            </h2>

          </div>

          <div className="space-y-3.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">

            {/* ================================================= */}
            {/* MY EARNINGS                                       */}
            {/* ================================================= */}

            <button
              onClick={() => router.push("/cleaner")}
              className="group relative flex min-h-[118px] w-full items-center gap-4 overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-[0_7px_25px_rgba(15,23,42,0.06)] transition-all duration-300 active:scale-[0.985] sm:min-h-[250px] sm:block sm:rounded-[28px] sm:p-6 sm:hover:-translate-y-1 sm:hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
            >

              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50 sm:h-32 sm:w-32" />

              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2E7BBE] sm:h-14 sm:w-14">

                <Wallet className="h-6 w-6 sm:h-7 sm:w-7" />

              </div>

              <div className="relative min-w-0 flex-1 sm:mt-7">

                <h3 className="text-lg font-bold text-[#172A3F] sm:text-xl">
                  My Earnings
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                  Schedule, payroll and invoice
                  information.
                </p>

              </div>

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF6FC] text-[#2E7BBE] transition-all group-hover:bg-[#2E7BBE] group-hover:text-white sm:absolute sm:right-5 sm:top-5">

                <ArrowRight className="h-4 w-4" />

              </div>

            </button>

            {/* ================================================= */}
            {/* SUBMIT RECEIPT                                    */}
            {/* ================================================= */}

            <button
              onClick={() => router.push("/receipt")}
              className="group relative flex min-h-[118px] w-full items-center gap-4 overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-[0_7px_25px_rgba(15,23,42,0.06)] transition-all duration-300 active:scale-[0.985] sm:min-h-[250px] sm:block sm:rounded-[28px] sm:p-6 sm:hover:-translate-y-1 sm:hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
            >

              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-50 sm:h-32 sm:w-32" />

              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">

                <FileText className="h-6 w-6 sm:h-7 sm:w-7" />

              </div>

              <div className="relative min-w-0 flex-1 sm:mt-7">

                <h3 className="text-lg font-bold text-[#172A3F] sm:text-xl">
                  Submit Receipt
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                  Upload purchases for
                  reimbursement.
                </p>

              </div>

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition-all group-hover:bg-purple-600 group-hover:text-white sm:absolute sm:right-5 sm:top-5">

                <ArrowRight className="h-4 w-4" />

              </div>

            </button>

            {/* ================================================= */}
            {/* INVENTORY                                         */}
            {/* ================================================= */}

            <button
              onClick={() =>
                router.push("/cleaner/inventory")
              }
              className="group relative flex min-h-[118px] w-full items-center gap-4 overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-[0_7px_25px_rgba(15,23,42,0.06)] transition-all duration-300 active:scale-[0.985] sm:min-h-[250px] sm:block sm:rounded-[28px] sm:p-6 sm:hover:-translate-y-1 sm:hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
            >

              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-50 sm:h-32 sm:w-32" />

              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                <Package className="h-6 w-6 sm:h-7 sm:w-7" />

              </div>

              <div className="relative min-w-0 flex-1 sm:mt-7">

                <h3 className="text-lg font-bold text-[#172A3F] sm:text-xl">
                  Inventory
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                  Check supplies and create your
                  inventory report.
                </p>

              </div>

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-all group-hover:bg-emerald-600 group-hover:text-white sm:absolute sm:right-5 sm:top-5">

                <ArrowRight className="h-4 w-4" />

              </div>

            </button>

          </div>

        </section>

        {/* =================================================== */}
        {/* MOBILE STATUS                                       */}
        {/* =================================================== */}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 sm:mt-10">

          <CheckCircle2 className="h-4 w-4 text-emerald-500" />

          <span>
            Your workspace is ready
          </span>

        </div>

        {/* =================================================== */}
        {/* FOOTER                                              */}
        {/* =================================================== */}

        <footer className="mt-5 border-t border-slate-200/70 pt-5 text-center text-[10px] text-slate-400 sm:mt-6 sm:flex sm:items-center sm:justify-between sm:text-xs">

          <span>
            PureSpace Cleaning
          </span>

          <span className="mt-1 block sm:mt-0">
            Property Management Platform · v2.0
          </span>

        </footer>

      </div>

    </main>
  );
}