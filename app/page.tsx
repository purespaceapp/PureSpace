"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {

  const router = useRouter();

  return (

    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7FAFD] px-8 py-12">

      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute left-[-180px] top-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="absolute right-[-150px] bottom-[-120px] h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />

      </div>

      <div className="relative w-full max-w-5xl">
              {/* HEADER */}

      <div className="mb-16 flex flex-col items-center text-center">

        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-xl">

          <Image
            src="/images/logo.jpg"
            alt="PureSpace"
            width={110}
            height={110}
            priority
            className="rounded-full"
          />

        </div>

        <h1 className="mt-8 text-6xl font-black tracking-tight text-slate-800">

          PureSpace

        </h1>

        <p className="mt-4 text-2xl font-medium text-[#2E7BBE]">

          Property Management Platform

        </p>

        <p className="mt-8 text-lg text-slate-500">

          Welcome back.

        </p>

        <p className="mt-2 text-slate-400">

          Choose the workspace you want to access.

        </p>

      </div>

      {/* PORTALS */}

      <div className="grid gap-6 md:grid-cols-3">
                {/* CLEANER */}

        <button
          onClick={() => router.push("/cleaner-login")}
          className="group rounded-[30px] border border-slate-200 bg-white p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#2E7BBE] hover:shadow-2xl"
        >

          <div className="flex items-center justify-between">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF9F6] text-4xl">

              🧹

            </div>

            <span className="text-3xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2E7BBE]">

              →

            </span>

          </div>

          <h2 className="mt-8 text-3xl font-bold text-slate-800">

            Cleaner

          </h2>

          <p className="mt-3 text-slate-500">

            Daily cleaning operations.

          </p>

        </button>

        {/* OWNER */}

        <button
          onClick={() => router.push("/owner-login")}
          className="group rounded-[30px] border border-slate-200 bg-white p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#2E7BBE] hover:shadow-2xl"
        >

          <div className="flex items-center justify-between">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF6FF] text-4xl">

              🏠

            </div>

            <span className="text-3xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2E7BBE]">

              →

            </span>

          </div>

          <h2 className="mt-8 text-3xl font-bold text-slate-800">

            Property Owner

          </h2>

          <p className="mt-3 text-slate-500">

            Reservations, invoices and maintenance.

          </p>

        </button>

        {/* OFFICE */}

        <button
          onClick={() => router.push("/office-login")}
          className="group rounded-[30px] border border-slate-200 bg-white p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#2E7BBE] hover:shadow-2xl"
        >

          <div className="flex items-center justify-between">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F0FF] text-4xl">

              💼

            </div>

            <span className="text-3xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2E7BBE]">

              →

            </span>

          </div>

          <h2 className="mt-8 text-3xl font-bold text-slate-800">

            Office Staff

          </h2>

          <p className="mt-3 text-slate-500">

            Manage operations, employees and properties.

          </p>

        </button>

      </div>
              {/* FOOTER */}

        <div className="mt-16 flex items-center justify-between border-t border-slate-200 px-2 pt-8">

          <div className="flex items-center gap-3">

            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />

            <p className="text-sm text-slate-500">

              System Online

            </p>

          </div>

          <p className="text-sm text-slate-400">

            PureSpace Cleaning · Version 2.0

          </p>

        </div>

      </div>

    </main>

  );

}