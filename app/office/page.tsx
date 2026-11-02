import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Users,
} from "lucide-react";

export default function OfficePage() {
  return (
    <main className="min-h-screen bg-[#F4F8FC] px-6 py-10 text-[#132238]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#64778B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <header className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#7357C8]">
            PURESPACE Cleaning
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Office Workspace
          </h1>

          <p className="mt-3 text-[#64778B]">
            Select the workspace you want to access.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {/* COMMAND CENTER */}
          <Link
            href="/office-login"
            className="group rounded-3xl border border-white bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2EEFC] text-[#7357C8]">
              <BriefcaseBusiness className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold">
              COMMAND CENTER
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#64778B]">
              Access global office operations, employees, properties,
              schedules and financial management.
            </p>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm font-bold text-[#7357C8]">
                Enter Command Center
              </span>

              <ArrowUpRight className="h-5 w-5 text-[#7357C8]" />
            </div>
          </Link>

          {/* TEAMS */}
          <Link
            href="/teams"
            className="group rounded-3xl border border-white bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#2E7BBE]">
              <Users className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold">
              TEAMS
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#64778B]">
              Access your assigned team workspace, properties,
              cleaning schedules and operational information.
            </p>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm font-bold text-[#2E7BBE]">
                Enter Team Workspace
              </span>

              <ArrowUpRight className="h-5 w-5 text-[#2E7BBE]" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}