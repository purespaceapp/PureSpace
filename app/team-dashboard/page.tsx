
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  LogOut,
  Loader2,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

type Team = {
  id: number;
  name: string;
};

type Property = {
  id: number;
  name: string;
  owner?: string | null;
  address?: string | null;
  phone?: string | null;
};

type ScheduleItem = {
  id: number;
  property_id: number;
  employee_id: number | null;
  cleaning_date: string;
  checkout_time?: string | null;
  checkin_time?: string | null;
  status?: string | null;
  notes?: string | null;
};

type Employee = {
  id: number;
  name: string;
};

type DashboardData = {
  success: boolean;
  team: Team;
  properties: Property[];
  schedule: ScheduleItem[];
  employees: Employee[];
};

export default function TeamDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/team-dashboard", {
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/teams");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load dashboard.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load team workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function getPropertyName(propertyId: number) {
    return (
      data?.properties.find((property) => property.id === propertyId)?.name ||
      "Property"
    );
  }

  function getCleanerName(employeeId: number | null) {
    if (!employeeId) return "Not assigned";

    return (
      data?.employees.find((employee) => employee.id === employeeId)?.name ||
      "Cleaner"
    );
  }

  function formatDate(date: string) {
    const parsed = new Date(`${date}T12:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function statusStyle(status?: string | null) {
    const value = (status || "scheduled").toLowerCase();

    if (["completed", "done"].includes(value)) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (["cancelled", "canceled"].includes(value)) {
      return "bg-red-50 text-red-600";
    }

    return "bg-blue-50 text-[#2E7BBE]";
  }

  function statusLabel(status?: string | null) {
    return (status || "Scheduled").replaceAll("_", " ");
  }

  async function logout() {
    try {
      await fetch("/api/team-logout", {
        method: "POST",
      });
    } finally {
      router.replace("/teams");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F8FC]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2E7BBE]" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading team workspace...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F8FC] px-5">
        <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />

          <h1 className="mt-5 text-2xl font-bold text-[#172A3F]">
            Unable to load workspace
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {error || "Please try again."}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-bold text-white hover:bg-[#23649D]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  const completedCount = data.schedule.filter((item) =>
    ["completed", "done"].includes((item.status || "").toLowerCase())
  ).length;

  const pendingCount = data.schedule.length - completedCount;

  return (
    <main className="min-h-screen bg-[#F4F8FC] text-[#132238]">

      {/* HEADER */}

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-10">

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white shadow-sm">
              <Image
                src="/images/logo.jpg"
                alt="PureSpace"
                width={44}
                height={44}
                priority
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="font-extrabold tracking-tight text-[#172A3F]">
                PURESPACE
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-slate-400">
                Team Workspace
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-10">

        {/* WELCOME */}

        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#173A5E] via-[#23649D] to-[#2E7BBE] p-7 text-white shadow-xl md:p-10">

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[2px] text-blue-100/80">
              Team manager workspace
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 text-sm text-blue-100">
              Your team's operations and assigned properties.
            </p>

            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <Users className="h-5 w-5" />

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-100/70">
                  Your team
                </p>
                <p className="font-bold">
                  {data.team.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTICS */}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-[24px] border border-white bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2E7BBE]">
                <Building2 className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300" />
            </div>

            <p className="mt-5 text-3xl font-black text-[#172A3F]">
              {data.properties.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Assigned properties
            </p>
          </div>

          <div className="rounded-[24px] border border-white bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EEFC] text-[#7357C8]">
              <CalendarDays className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-black text-[#172A3F]">
              {data.schedule.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Recent scheduled cleanings
            </p>
          </div>

          <div className="rounded-[24px] border border-white bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9F8F5] text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-black text-[#172A3F]">
              {completedCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Completed
            </p>
          </div>

          <div className="rounded-[24px] border border-white bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF5E8] text-orange-500">
              <ClipboardList className="h-5 w-5" />
            </div>

            <p className="mt-5 text-3xl font-black text-[#172A3F]">
              {pendingCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Not completed
            </p>
          </div>

        </section>

        {/* PROPERTIES */}

        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#2E7BBE]">
                Your locations
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#172A3F]">
                Assigned properties
              </h2>
            </div>

            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
              {data.properties.length} properties
            </span>
          </div>

          {data.properties.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-4 font-bold text-[#172A3F]">
                No properties assigned yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Your assigned properties will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.properties.map((property) => (
                <article
                  key={property.id}
                  className="rounded-[24px] border border-white bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#2E7BBE]">
                      <Building2 className="h-6 w-6" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Assigned
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#172A3F]">
                    {property.name}
                  </h3>

                  {property.owner && (
                    <p className="mt-1 text-sm text-slate-500">
                      Owner: {property.owner}
                    </p>
                  )}

                  {property.address && (
                    <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7BBE]" />
                      {property.address}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

        </section>

        {/* SCHEDULE */}

        <section className="mt-10">

          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#2E7BBE]">
              Daily operations
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#172A3F]">
              Cleaning schedule
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Recent cleaning assignments for your team.
            </p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white bg-white shadow-sm">

            {data.schedule.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-4 font-bold text-[#172A3F]">
                  No scheduled cleanings
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Your team's cleaning schedule will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.schedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-[#F8FBFE] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2E7BBE]">
                        <CalendarDays className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-[#172A3F]">
                          {getPropertyName(item.property_id)}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(item.cleaning_date)}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="h-3.5 w-3.5" />
                          {getCleanerName(item.employee_id)}
                        </p>

                        {(item.checkout_time || item.checkin_time) && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            {item.checkout_time || "--"}
                            {" → "}
                            {item.checkin_time || "--"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${statusStyle(item.status)}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </section>

        {/* FOOTER */}

        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 py-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} PURESPACE CLEANING</p>

          <p>
            Secure Team Workspace
          </p>
        </footer>

      </div>
    </main>
  );
}
