
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
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
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

type CleaningForm = {
  id: number | null;
  property_id: string;
  employee_id: string;
  cleaning_date: string;
  checkout_time: string;
  checkin_time: string;
  status: string;
  notes: string;
};

const emptyForm: CleaningForm = {
  id: null,
  property_id: "",
  employee_id: "",
  cleaning_date: "",
  checkout_time: "",
  checkin_time: "",
  status: "Scheduled",
  notes: "",
};

export default function TeamDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CleaningForm>(emptyForm);
  const [dateFilter, setDateFilter] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

      const scheduleResponse = await fetch("/api/team-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
        cache: "no-store",
      });

      const scheduleResult = await scheduleResponse.json();

      if (!scheduleResponse.ok) {
        throw new Error(
          scheduleResult.error || "Unable to load team schedule."
        );
      }

      setData({
        ...result,
        schedule: scheduleResult.schedule ?? [],
      });
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

  function openNewCleaning() {
    setForm({
      ...emptyForm,
      property_id: data?.properties[0]
        ? String(data.properties[0].id)
        : "",
      employee_id: data?.employees[0]
        ? String(data.employees[0].id)
        : "",
    });
    setActionError("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditCleaning(item: ScheduleItem) {
    setForm({
      id: item.id,
      property_id: String(item.property_id),
      employee_id: item.employee_id ? String(item.employee_id) : "",
      cleaning_date: item.cleaning_date,
      checkout_time: item.checkout_time?.slice(0, 5) || "",
      checkin_time: item.checkin_time?.slice(0, 5) || "",
      status: item.status || "Scheduled",
      notes: item.notes || "",
    });
    setActionError("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  async function saveCleaning(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setSuccessMessage("");

    if (!form.property_id || !form.employee_id || !form.cleaning_date) {
      setActionError("Please select a property, cleaner and cleaning date.");
      return;
    }

    if (
      !data?.properties.some(
        (property) => property.id === Number(form.property_id)
      ) ||
      !data?.employees.some(
        (employee) => employee.id === Number(form.employee_id)
      )
    ) {
      setActionError("The selected property or cleaner is not assigned to your team.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/team-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: form.id ? "update" : "create",
          id: form.id,
          property_id: Number(form.property_id),
          employee_id: Number(form.employee_id),
          cleaning_date: form.cleaning_date,
          checkout_time: form.checkout_time,
          checkin_time: form.checkin_time,
          status: form.status,
          notes: form.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save cleaning.");
      }

      setFormOpen(false);
      setForm(emptyForm);
      setSuccessMessage(
        form.id ? "Cleaning updated successfully." : "Cleaning created successfully."
      );

      await loadDashboard();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to save cleaning."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCleaning(item: ScheduleItem) {
    const confirmed = window.confirm(
      `Delete the cleaning for ${getPropertyName(item.property_id)} on ${item.cleaning_date}?`
    );

    if (!confirmed) return;

    setActionError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/team-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: item.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete cleaning.");
      }

      setSuccessMessage("Cleaning deleted successfully.");
      await loadDashboard();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to delete cleaning."
      );
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

  const pendingCount = data.schedule.filter(
    (item) =>
      !["completed", "done", "cancelled", "canceled"].includes(
        (item.status || "").toLowerCase()
      )
  ).length;

  const filteredSchedule = [...data.schedule]
    .filter((item) => !dateFilter || item.cleaning_date === dateFilter)
    .sort((a, b) =>
      `${a.cleaning_date} ${a.checkout_time || ""}`.localeCompare(
        `${b.cleaning_date} ${b.checkout_time || ""}`
      )
    );

  return (
    <main className="min-h-screen bg-[#F4F8FC] text-[#132238]">
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
                <p className="font-bold">{data.team.name}</p>
              </div>
            </div>
          </div>
        </section>

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
            <p className="mt-1 text-sm text-slate-500">Assigned properties</p>
          </div>

          <div className="rounded-[24px] border border-white bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EEFC] text-[#7357C8]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="mt-5 text-3xl font-black text-[#172A3F]">
              {data.schedule.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">Team cleanings</p>
          </div>

          <div className="rounded-[24px] border border-white bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9F8F5] text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="mt-5 text-3xl font-black text-[#172A3F]">
              {completedCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">Completed</p>
          </div>

          <div className="rounded-[24px] border border-white bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF5E8] text-orange-500">
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="mt-5 text-3xl font-black text-[#172A3F]">
              {pendingCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">Pending cleanings</p>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-3">
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

        <section className="mt-10">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#2E7BBE]">
                Daily operations
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#172A3F]">
                Cleaning schedule
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Manage cleaning assignments for your team.
              </p>
            </div>

            <button
              onClick={openNewCleaning}
              disabled={
                data.properties.length === 0 || data.employees.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#23649D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Cleaning
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          {actionError && !formOpen && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {actionError}
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <CalendarDays className="h-4 w-4 text-[#2E7BBE]" />
              Filter schedule by date
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2E7BBE] sm:w-auto"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="rounded-lg px-3 py-2 text-xs font-bold text-[#2E7BBE] hover:bg-blue-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white bg-white shadow-sm">
            {filteredSchedule.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 font-bold text-[#172A3F]">
                  No scheduled cleanings
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {dateFilter
                    ? "There are no cleanings for this date."
                    : "Create your first team cleaning using Add Cleaning."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredSchedule.map((item) => (
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
                        {item.notes && (
                          <p className="mt-2 max-w-xl whitespace-pre-wrap text-xs text-slate-500">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${statusStyle(item.status)}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                      <button
                        onClick={() => openEditCleaning(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#2E7BBE] hover:text-[#2E7BBE]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCleaning(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 py-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} PURESPACE CLEANING</p>
          <p>Secure Team Workspace</p>
        </footer>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-[26px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#2E7BBE]">
                  Team operations
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#172A3F]">
                  {form.id ? "Edit Cleaning" : "Add Cleaning"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Assign a property and cleaner from your team.
                </p>
              </div>
              <button
                onClick={() => {
                  setFormOpen(false);
                  setActionError("");
                }}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveCleaning} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Property
                </label>
                <select
                  required
                  value={form.property_id}
                  onChange={(event) =>
                    setForm({ ...form, property_id: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                >
                  <option value="">Select property</option>
                  {data.properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Cleaner
                </label>
                <select
                  required
                  value={form.employee_id}
                  onChange={(event) =>
                    setForm({ ...form, employee_id: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                >
                  <option value="">Select cleaner</option>
                  {data.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Cleaning date
                </label>
                <input
                  type="date"
                  required
                  value={form.cleaning_date}
                  onChange={(event) =>
                    setForm({ ...form, cleaning_date: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Checkout time
                  </label>
                  <input
                    type="time"
                    value={form.checkout_time}
                    onChange={(event) =>
                      setForm({ ...form, checkout_time: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Check-in time
                  </label>
                  <input
                    type="time"
                    value={form.checkin_time}
                    onChange={(event) =>
                      setForm({ ...form, checkin_time: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                  />
                </div>
              </div>

              {form.id && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  placeholder="Additional cleaning instructions..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                />
              </div>

              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setFormOpen(false);
                    setActionError("");
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-bold text-white hover:bg-[#23649D] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Cleaning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
