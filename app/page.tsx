"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Sparkles,
  SprayCan,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7FAFD] text-slate-800">

      {/* ===================================================== */}
      {/* BACKGROUND                                            */}
      {/* ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-200/20 blur-3xl" />

        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-3xl" />

        <div className="absolute bottom-[-260px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-sky-200/15 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_55%)]" />

      </div>

      {/* ===================================================== */}
      {/* MAIN CONTENT                                          */}
      {/* ===================================================== */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10 md:py-10">

        {/* =================================================== */}
        {/* TOP BAR                                             */}
        {/* =================================================== */}

        <header className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

              <Image
                src="/images/logo.jpg"
                alt="PureSpace"
                width={40}
                height={40}
                priority
                className="h-full w-full object-cover"
              />

            </div>

            <div className="hidden sm:block">

              <p className="text-sm font-bold tracking-tight text-slate-800">
                PureSpace
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[2px] text-slate-400">
                Property Management
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">

            <span className="relative flex h-2.5 w-2.5">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

            </span>

            <span className="text-xs font-semibold text-slate-500">
              System Online
            </span>

          </div>

        </header>

        {/* =================================================== */}
        {/* HERO                                                */}
        {/* =================================================== */}

        <section className="flex flex-1 flex-col justify-center py-14 md:py-20">

          <div className="mx-auto w-full max-w-4xl text-center">

            {/* PREMIUM BADGE */}

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#DCEAF7] bg-white/80 px-4 py-2 text-xs font-semibold text-[#2E7BBE] shadow-sm backdrop-blur">

              <Sparkles className="h-3.5 w-3.5" />

              Professional Property Management

            </div>

            {/* LOGO */}

            <div className="mx-auto mt-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white p-2 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">

              <Image
                src="/images/logo.jpg"
                alt="PureSpace"
                width={88}
                height={88}
                priority
                className="h-full w-full rounded-[22px] object-cover"
              />

            </div>

            {/* TITLE */}

            <h1 className="mt-8 text-5xl font-black tracking-[-0.04em] text-slate-900 md:text-7xl">

              PureSpace

            </h1>

            <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-gradient-to-r from-[#2E7BBE] to-[#41B8B0]" />

            <p className="mt-6 text-lg font-medium text-[#2E7BBE] md:text-xl">

              Property Management Platform

            </p>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 md:text-base">

              Everything you need to manage properties,
              cleaning operations, maintenance and billing —
              all in one place.

            </p>

          </div>

          {/* ================================================= */}
          {/* WORKSPACE SELECTOR                                */}
          {/* ================================================= */}

          <div className="mx-auto mt-14 w-full max-w-5xl">

            <div className="mb-5 flex items-end justify-between px-1">

              <div>

                <p className="text-xs font-bold uppercase tracking-[2px] text-slate-400">
                  Workspace
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-800">
                  Choose where you want to go
                </h2>

              </div>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              {/* ================================================= */}
              {/* CLEANER                                             */}
              {/* ================================================= */}

              <button
                onClick={() => router.push("/cleaner-login")}
                className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#BFE6DF] hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
              >

                <div className="absolute right-[-35px] top-[-35px] h-28 w-28 rounded-full bg-[#EAF9F6] transition-transform duration-500 group-hover:scale-125" />

                <div className="relative flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF9F6] text-[#2E7BBE]">

                    <SprayCan className="h-7 w-7" />

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-300 shadow-sm transition-all duration-300 group-hover:border-[#2E7BBE] group-hover:bg-[#2E7BBE] group-hover:text-white">

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />

                  </div>

                </div>

                <div className="relative mt-7">

                  <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                    Cleaner
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Access your daily cleaning schedule,
                    assignments and operations.
                  </p>

                </div>

                <div className="relative mt-6 flex items-center gap-2 text-xs font-bold text-[#2E7BBE]">

                  <span>Enter workspace</span>

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

                </div>

              </button>

              {/* ================================================= */}
              {/* PROPERTY OWNER                                      */}
              {/* ================================================= */}

              <button
                onClick={() => router.push("/owner-login")}
                className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#BFDDF5] hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
              >

                <div className="absolute right-[-35px] top-[-35px] h-28 w-28 rounded-full bg-[#EEF6FF] transition-transform duration-500 group-hover:scale-125" />

                <div className="relative flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#2E7BBE]">

                    <Building2 className="h-7 w-7" />

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-300 shadow-sm transition-all duration-300 group-hover:border-[#2E7BBE] group-hover:bg-[#2E7BBE] group-hover:text-white">

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />

                  </div>

                </div>

                <div className="relative mt-7">

                  <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                    Property Owner
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    View your properties, reservations,
                    invoices and maintenance.
                  </p>

                </div>

                <div className="relative mt-6 flex items-center gap-2 text-xs font-bold text-[#2E7BBE]">

                  <span>Enter workspace</span>

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

                </div>

              </button>

              {/* ================================================= */}
              {/* OFFICE STAFF                                        */}
              {/* ================================================= */}

              <button
                onClick={() => router.push("/office-login")}
                className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D8D0FA] hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
              >

                <div className="absolute right-[-35px] top-[-35px] h-28 w-28 rounded-full bg-[#F3F0FF] transition-transform duration-500 group-hover:scale-125" />

                <div className="relative flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F0FF] text-[#7357C8]">

                    <BriefcaseBusiness className="h-7 w-7" />

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-300 shadow-sm transition-all duration-300 group-hover:border-[#7357C8] group-hover:bg-[#7357C8] group-hover:text-white">

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />

                  </div>

                </div>

                <div className="relative mt-7">

                  <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                    Office Staff
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Manage properties, employees,
                    schedules and operations.
                  </p>

                </div>

                <div className="relative mt-6 flex items-center gap-2 text-xs font-bold text-[#7357C8]">

                  <span>Enter workspace</span>

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

                </div>

              </button>

            </div>

          </div>

        </section>

        {/* =================================================== */}
        {/* FOOTER                                               */}
        {/* =================================================== */}

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-400 sm:flex-row">

          <div className="flex items-center gap-2">

            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

            <span>
              Secure workspace access
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