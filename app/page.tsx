"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Sparkles,
  SprayCan,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F4F8FC] text-[#132238]">

      {/* ===================================================== */}
      {/* BACKGROUND                                            */}
      {/* ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#BFEAF0]/35 blur-3xl" />

        <div className="absolute -right-32 top-[-100px] h-[520px] w-[520px] rounded-full bg-[#BBD9F5]/40 blur-3xl" />

        <div className="absolute bottom-[-250px] left-[35%] h-[600px] w-[600px] rounded-full bg-[#D8F1F1]/40 blur-3xl" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#2E7BBE 1px, transparent 1px), linear-gradient(90deg, #2E7BBE 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

      </div>

      {/* ===================================================== */}
      {/* PAGE                                                   */}
      {/* ===================================================== */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-6 py-6 md:px-10 lg:px-12">

        {/* =================================================== */}
        {/* NAVBAR                                              */}
        {/* =================================================== */}

        <header className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-100">

              <Image
                src="/images/logo.jpg"
                alt="PureSpace"
                width={48}
                height={48}
                priority
                className="h-full w-full object-cover"
              />

            </div>

            <div>
              <p className="text-[17px] font-extrabold tracking-tight text-[#132238]">
                PureSpace
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[2.5px] text-[#6F8499]">
                Property Management
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur">

            <span className="relative flex h-2.5 w-2.5">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

            </span>

            <span className="text-xs font-semibold text-[#53677B]">
              System Online
            </span>

          </div>

        </header>

        {/* =================================================== */}
        {/* HERO                                                 */}
        {/* =================================================== */}

        <section className="flex flex-1 flex-col justify-center">

          <div className="mx-auto w-full max-w-6xl py-14 md:py-16">

            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">

              {/* LEFT */}

              <div className="text-center lg:text-left">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D4E7F4] bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#2E7BBE] shadow-sm">

                  <Sparkles className="h-3.5 w-3.5" />

                  Professional Workspace

                </div>

                <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.055em] text-[#122033] sm:text-6xl md:text-7xl">

                  Welcome to

                  <span className="mt-2 block text-[#2E7BBE]">
                    PureSpace.
                  </span>

                </h1>

                <p className="mt-7 max-w-xl text-base leading-7 text-[#64778B] md:text-lg">

                  One platform for cleaning operations,
                  property management, maintenance and
                  billing.

                </p>

                <div className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#52677B] lg:justify-start">

                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                  Everything organized in one place.

                </div>

              </div>

              {/* RIGHT — SELECT WORKSPACE */}

              <div className="rounded-[34px] border border-white bg-white/75 p-3 shadow-[0_25px_70px_rgba(32,69,103,0.10)] backdrop-blur-xl">

                <div className="rounded-[28px] bg-[#F8FBFE] p-6 md:p-7">

                  <div className="mb-6">

                    <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#8A9AAB]">
                      Your workspace
                    </p>

                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#16283D]">
                      Where would you like to go?
                    </h2>

                  </div>

                  <div className="space-y-3">

                    {/* CLEANER */}

                    <button
                      onClick={() =>
                        router.push("/cleaner-login")
                      }
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B8DFDA] hover:shadow-lg"
                    >

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E9F8F5] text-[#2E7BBE]">

                        <SprayCan className="h-6 w-6" />

                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="font-bold text-[#172A3F]">
                          Cleaner
                        </h3>

                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          Daily cleaning operations
                        </p>

                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-[#2E7BBE] group-hover:text-white">

                        <ArrowUpRight className="h-4 w-4" />

                      </div>

                    </button>

                    {/* OWNER */}

                    <button
                      onClick={() =>
                        router.push("/owner-login")
                      }
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BBD8F1] hover:shadow-lg"
                    >

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#2E7BBE]">

                        <Building2 className="h-6 w-6" />

                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="font-bold text-[#172A3F]">
                          Property Owner
                        </h3>

                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          Properties, invoices & maintenance
                        </p>

                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-[#2E7BBE] group-hover:text-white">

                        <ArrowUpRight className="h-4 w-4" />

                      </div>

                    </button>

                    {/* OFFICE */}

                    <button
                      onClick={() =>
                        router.push("/office-login")
                      }
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D9D0F4] hover:shadow-lg"
                    >

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F2EEFC] text-[#7357C8]">

                        <BriefcaseBusiness className="h-6 w-6" />

                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="font-bold text-[#172A3F]">
                          Office Staff
                        </h3>

                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          Operations, employees & properties
                        </p>

                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-[#7357C8] group-hover:text-white">

                        <ArrowUpRight className="h-4 w-4" />

                      </div>

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================== */}
        {/* FOOTER                                               */}
        {/* =================================================== */}

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 py-5 text-xs text-slate-400 sm:flex-row">

          <p>
            © 2026 PureSpace Cleaning
          </p>

          <div className="flex items-center gap-2">

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span>
              Property Management Platform
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span>
              v2.0
            </span>

          </div>

        </footer>

      </div>

    </main>
  );
}