
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  RefreshCw,
  UserRound,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  CircleDashed,
  CalendarCheck,
} from "lucide-react";

import ScheduleForm from "@/components/forms/ScheduleForm";
import { getSchedules, deleteSchedule } from "@/lib/schedule";
import { getProperties } from "@/lib/properties";
import { getEmployees } from "@/lib/employees";

type ViewMode = "Month" | "Week" | "Day";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value) return "";
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes} ${suffix}`;
}

function statusStyle(status?: string) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "completed") {
    return {
      card: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
      label: "Completed",
    };
  }

  if (normalized.includes("progress")) {
    return {
      card: "border-violet-200 bg-violet-50 text-violet-800",
      dot: "bg-violet-500",
      label: status || "In Progress",
    };
  }

  if (normalized.includes("cancel")) {
    return {
      card: "border-rose-200 bg-rose-50 text-rose-800",
      dot: "bg-rose-500",
      label: status || "Cancelled",
    };
  }

  if (normalized.includes("issue") || normalized.includes("attention")) {
    return {
      card: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
      label: status || "Needs attention",
    };
  }

  return {
    card: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
    label: status === "Scheduled" ? "Assigned" : status || "Scheduled",
  };
}

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>("Month");
  const [cleanerFilter, setCleanerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (refresh = false) => {
    try {
      setError("");
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const [scheduleData, propertyData, employeeData] = await Promise.all([
        getSchedules(),
        getProperties(),
        getEmployees(),
      ]);

      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      setProperties(Array.isArray(propertyData) ? propertyData : []);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      console.error("Calendar loading failed:", err);
      setError("We couldn't load the calendar. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const propertyById = useMemo(
    () => new Map(properties.map((item) => [Number(item.id), item])),
    [properties]
  );

  const employeeById = useMemo(
    () => new Map(employees.map((item) => [Number(item.id), item])),
    [employees]
  );

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (cleanerFilter !== "all" &&
          Number(schedule.employee_id) !== Number(cleanerFilter)) {
        return false;
      }

      if (statusFilter !== "all" &&
          (schedule.status || "").toLowerCase() !== statusFilter) {
        return false;
      }

      return Boolean(schedule.cleaning_date);
    });
  }, [schedules, cleanerFilter, statusFilter]);

  const visibleDates = useMemo(() => {
    if (view === "Day") return [new Date(selectedDate)];

    if (view === "Week") {
      const start = startOfWeek(selectedDate);
      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }

    const firstDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const gridStart = startOfWeek(firstDay);

    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [selectedDate, view]);

  const getJobsForDate = useCallback(
    (date: Date) =>
      filteredSchedules.filter(
        (schedule) => String(schedule.cleaning_date).slice(0, 10) === dateKey(date)
      ),
    [filteredSchedules]
  );

  const stats = useMemo(() => {
    const today = dateKey(new Date());
    const todayJobs = filteredSchedules.filter(
      (item) => String(item.cleaning_date).slice(0, 10) === today
    );

    return {
      today: todayJobs.length,
      scheduled: filteredSchedules.filter(
        (item) => (item.status || "").toLowerCase() === "scheduled"
      ).length,
      completed: filteredSchedules.filter(
        (item) => (item.status || "").toLowerCase() === "completed"
      ).length,
      cleaners: new Set(
        filteredSchedules
          .filter((item) => item.status !== "Completed")
          .map((item) => item.employee_id)
      ).size,
    };
  }, [filteredSchedules]);

  function moveDate(direction: number) {
    setSelectedDate((current) => {
      const next = new Date(current);

      if (view === "Month") {
        next.setDate(1);
        next.setMonth(next.getMonth() + direction);
      } else if (view === "Week") {
        next.setDate(next.getDate() + direction * 7);
      } else {
        next.setDate(next.getDate() + direction);
      }

      return next;
    });
  }

  function openNewCleaning(date?: Date) {
    setSelectedSchedule(null);
    setEditingSchedule(null);
    setShowForm(true);
    if (date) setSelectedDate(new Date(date));
  }

  function openEdit(schedule: any) {
    setSelectedSchedule(null);
    setEditingSchedule(schedule);
    setShowForm(true);
  }

  async function handleDelete(schedule: any) {
    const property = propertyById.get(Number(schedule.property_id));
    const confirmed = window.confirm(
      `Delete the cleaning assignment for "${property?.name || "this property"}" on ${schedule.cleaning_date}?`
    );

    if (!confirmed) return;

    try {
      await deleteSchedule(Number(schedule.id));
      setSelectedSchedule(null);
      await loadData(true);
    } catch (err) {
      console.error("Unable to delete cleaning:", err);
      window.alert("Unable to delete this cleaning. Please try again.");
    }
  }

  function renderJob(schedule: any, compact = false) {
    const property = propertyById.get(Number(schedule.property_id));
    const employee = employeeById.get(Number(schedule.employee_id));
    const style = statusStyle(schedule.status);

    return (
      <button
        key={schedule.id}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setSelectedSchedule(schedule);
        }}
        className={`w-full overflow-hidden rounded-lg border p-2 text-left transition hover:shadow-md ${style.card}`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
          <span className="truncate text-[11px] font-bold">
            {formatTime(schedule.checkout_time) || "Time not set"}
          </span>
        </div>
        <p className="mt-1 truncate text-xs font-semibold">
          {property?.name || `Property #${schedule.property_id}`}
        </p>
        {!compact && (
          <p className="mt-1 truncate text-[11px] opacity-80">
            {employee?.name || "Cleaner not assigned"}
          </p>
        )}
      </button>
    );
  }

  const pageTitle = selectedDate.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#2E7BBE] border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">Loading Calendar & Bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#2E7BBE]">
              <CalendarDays className="h-4 w-4" />
              OPERATIONS
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
              Calendar & Bookings
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Plan your cleanings, manage assignments, and keep every property on schedule.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => openNewCleaning()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#23649D]"
            >
              <Plus className="h-4 w-4" />
              New Cleaning
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
            <button onClick={() => void loadData(true)} className="font-bold underline">
              Try again
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Today's Cleanings",
              value: stats.today,
              icon: CalendarCheck,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Scheduled",
              value: stats.scheduled,
              icon: CircleDashed,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle2,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Cleaners Assigned",
              value: stats.cleaners,
              icon: UserRound,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 sm:text-sm">{item.label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-800">{item.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveDate(-1)}
                    aria-label="Previous period"
                    className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveDate(1)}
                    aria-label="Next period"
                    className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <h2 className="ml-1 text-lg font-extrabold text-slate-800 sm:text-xl">
                    {view === "Day" ? formatLongDate(selectedDate) : pageTitle}
                  </h2>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="ml-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Today
                  </button>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1">
                  {(["Month", "Week", "Day"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setView(mode)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 ${
                        view === mode
                          ? "bg-white text-[#2E7BBE] shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <select
                    value={cleanerFilter}
                    onChange={(event) => setCleanerFilter(event.target.value)}
                    className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="all">All cleaners</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={String(employee.id)}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <CircleDashed className="h-4 w-4 shrink-0 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="all">All statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="in progress">In Progress</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </label>
              </div>
            </div>

            <div className="p-2 sm:p-4">
              {view !== "Day" && (
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">
                      {day}
                    </div>
                  ))}
                </div>
              )}

              {view === "Month" && (
                <div className="grid grid-cols-7">
                  {visibleDates.map((date) => {
                    const jobs = getJobsForDate(date);
                    const inMonth = date.getMonth() === selectedDate.getMonth();
                    const isToday = dateKey(date) === dateKey(new Date());

                    return (
                      <div
                        key={dateKey(date)}
                        onClick={() => {
                          setSelectedDate(new Date(date));
                          setView("Day");
                        }}
                        className={`min-h-[112px] cursor-pointer border-b border-r border-slate-100 p-1 transition hover:bg-blue-50/60 sm:min-h-[145px] sm:p-2 ${
                          inMonth ? "bg-white" : "bg-slate-50/70"
                        }`}
                      >
                        <div className="mb-1 flex justify-center sm:justify-start">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
                            isToday
                              ? "bg-[#2E7BBE] text-white"
                              : inMonth
                              ? "text-slate-700"
                              : "text-slate-300"
                          }`}>
                            {date.getDate()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {jobs.slice(0, 3).map((job) => renderJob(job, true))}
                          {jobs.length > 3 && (
                            <p className="px-1 text-[10px] font-bold text-slate-500">
                              +{jobs.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === "Week" && (
                <div className="grid grid-cols-7">
                  {visibleDates.map((date) => {
                    const jobs = getJobsForDate(date);
                    const isToday = dateKey(date) === dateKey(new Date());

                    return (
                      <div
                        key={dateKey(date)}
                        className="min-h-[240px] border-b border-r border-slate-100 p-1 sm:min-h-[360px] sm:p-2"
                      >
                        <button
                          onClick={() => {
                            setSelectedDate(new Date(date));
                            setView("Day");
                          }}
                          className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            isToday ? "bg-[#2E7BBE] text-white" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                        <div className="space-y-1.5">
                          {jobs.map((job) => renderJob(job, true))}
                          <button
                            onClick={() => openNewCleaning(date)}
                            className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-200 py-2 text-slate-400 hover:border-blue-300 hover:text-blue-600"
                            aria-label={`Add cleaning on ${dateKey(date)}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === "Day" && (
                <div>
                  <div className="mb-4 rounded-xl bg-[#F4F7FB] p-4">
                    <p className="font-bold text-slate-800">{formatLongDate(selectedDate)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {getJobsForDate(selectedDate).length} cleaning assignment(s)
                    </p>
                  </div>

                  <div className="space-y-3">
                    {getJobsForDate(selectedDate).map((job) => {
                      const property = propertyById.get(Number(job.property_id));
                      const employee = employeeById.get(Number(job.employee_id));
                      const style = statusStyle(job.status);

                      return (
                        <button
                          key={job.id}
                          onClick={() => setSelectedSchedule(job)}
                          className={`flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition hover:shadow-sm sm:flex-row sm:items-center ${style.card}`}
                        >
                          <div className="flex min-w-24 items-center gap-2 text-sm font-bold">
                            <Clock3 className="h-4 w-4" />
                            {formatTime(job.checkout_time) || "Time not set"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold">{property?.name || `Property #${job.property_id}`}</p>
                            <p className="mt-1 text-sm opacity-80">{employee?.name || "Cleaner not assigned"}</p>
                            {property?.address && (
                              <p className="mt-1 flex items-center gap-1 text-xs opacity-70">
                                <MapPin className="h-3 w-3" /> {property.address}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{style.label}</span>
                        </button>
                      );
                    })}

                    {getJobsForDate(selectedDate).length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                        <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
                        <p className="mt-3 font-bold text-slate-700">No cleanings scheduled</p>
                        <p className="mt-1 text-sm text-slate-500">Add a cleaning to organize this day.</p>
                      </div>
                    )}

                    <button
                      onClick={() => openNewCleaning(selectedDate)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 py-3 text-sm font-bold text-[#2E7BBE] hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add cleaning for this day
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 px-4 py-4 text-xs text-slate-500 sm:px-5">
              {[
                ["bg-blue-500", "Scheduled"],
                ["bg-violet-500", "In Progress"],
                ["bg-emerald-500", "Completed"],
                ["bg-rose-500", "Cancelled"],
              ].map(([color, label]) => (
                <span key={label} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            {selectedSchedule ? (
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#2E7BBE]">
                      Assignment Details
                    </p>
                    <h3 className="mt-2 text-xl font-extrabold text-slate-800">
                      {propertyById.get(Number(selectedSchedule.property_id))?.name ||
                        `Property #${selectedSchedule.property_id}`}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedSchedule(null)}
                    aria-label="Close details"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {(() => {
                  const property = propertyById.get(Number(selectedSchedule.property_id));
                  const employee = employeeById.get(Number(selectedSchedule.employee_id));
                  const style = statusStyle(selectedSchedule.status);

                  return (
                    <>
                      <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${style.card}`}>
                        {style.label}
                      </span>

                      <div className="mt-5 space-y-4">
                        <div className="flex gap-3">
                          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                            <CalendarDays className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Cleaning date</p>
                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {formatLongDate(parseDate(String(selectedSchedule.cleaning_date)))}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Assigned cleaner</p>
                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {employee?.name || "Not assigned"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                            <Clock3 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Checkout / Check-in</p>
                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {formatTime(selectedSchedule.checkout_time) || "--"}
                              {" / "}
                              {formatTime(selectedSchedule.checkin_time) || "--"}
                            </p>
                          </div>
                        </div>

                        {property?.address && (
                          <div className="flex gap-3">
                            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Property address</p>
                              <p className="mt-1 text-sm font-bold text-slate-700">{property.address}</p>
                            </div>
                          </div>
                        )}

                        {selectedSchedule.notes && (
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs font-bold text-slate-500">Notes</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{selectedSchedule.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openEdit(selectedSchedule)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-3 py-3 text-sm font-bold text-white hover:bg-[#23649D]"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => void handleDelete(selectedSchedule)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  );
                })()}
              </section>
            ) : (
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2E7BBE]">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800">Cleaning Details</h3>
                    <p className="text-xs text-slate-500">Select a cleaning to view details.</p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-[#F4F7FB] p-4">
                  <p className="text-sm font-bold text-slate-700">Quick tip</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Select any cleaning on the calendar to see its property, cleaner, time and notes.
                  </p>
                </div>
                <button
                  onClick={() => openNewCleaning(selectedDate)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-4 py-3 text-sm font-bold text-white hover:bg-[#23649D]"
                >
                  <Plus className="h-4 w-4" />
                  Create assignment
                </button>
              </section>
            )}

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-slate-800">Upcoming Cleanings</h3>
              <p className="mt-1 text-xs text-slate-500">Next scheduled assignments</p>

              <div className="mt-4 space-y-3">
                {filteredSchedules
                  .filter((item) => String(item.cleaning_date).slice(0, 10) >= dateKey(new Date()))
                  .sort((a, b) => String(a.cleaning_date).localeCompare(String(b.cleaning_date)))
                  .slice(0, 4)
                  .map((job) => {
                    const property = propertyById.get(Number(job.property_id));
                    const employee = employeeById.get(Number(job.employee_id));

                    return (
                      <button
                        key={job.id}
                        onClick={() => {
                          setSelectedSchedule(job);
                          setSelectedDate(parseDate(String(job.cleaning_date)));
                        }}
                        className="flex w-full items-start gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50"
                      >
                        <div className="min-w-12 rounded-lg bg-blue-50 px-2 py-2 text-center text-[#2E7BBE]">
                          <p className="text-[10px] font-bold uppercase">
                            {parseDate(String(job.cleaning_date)).toLocaleDateString("en-CA", { month: "short" })}
                          </p>
                          <p className="text-lg font-black">
                            {parseDate(String(job.cleaning_date)).getDate()}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-700">
                            {property?.name || `Property #${job.property_id}`}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {employee?.name || "Cleaner not assigned"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatTime(job.checkout_time) || "Time not set"}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                {filteredSchedules.filter(
                  (item) => String(item.cleaning_date).slice(0, 10) >= dateKey(new Date())
                ).length === 0 && (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No upcoming cleanings found.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
            <div className="mx-auto my-4 max-w-3xl rounded-2xl bg-white p-4 shadow-2xl sm:my-8 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2E7BBE]">
                    Calendar & Bookings
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-800">
                    {editingSchedule ? "Edit Cleaning" : "New Cleaning Assignment"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSchedule(null);
                  }}
                  aria-label="Close form"
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ScheduleForm
                properties={properties}
                employees={employees}
                schedule={editingSchedule || undefined}
                onClose={() => {
                  setShowForm(false);
                  setEditingSchedule(null);
                }}
                onSaved={async () => {
                  await loadData(true);
                  setSelectedSchedule(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
