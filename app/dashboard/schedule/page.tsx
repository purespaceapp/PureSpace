"use client";

import ScheduleCard from "@/components/cards/ScheduleCard";
import ScheduleForm from "@/components/forms/ScheduleForm";

import { getProperties } from "@/lib/properties";
import { getEmployees } from "@/lib/employees";

import {
  deleteSchedule,
  completeSchedules,
  reassignSchedules,
  getSchedules,
  getSchedulesByDate,
} from "@/lib/schedule";

import { getScheduleExtras } from "@/lib/extras";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MessageCircle,
  Plus,
  RefreshCw,
  Sparkles,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewingSchedule, setViewingSchedule] = useState<any>(null);

  const [selectedSchedules, setSelectedSchedules] =
    useState<number[]>([]);

  const [showReassign, setShowReassign] =
    useState(false);

  const [newEmployeeId, setNewEmployeeId] =
    useState("");

  const [whatsAppMessage, setWhatsAppMessage] =
    useState<any[]>([]);

  const [generatingWhatsApp, setGeneratingWhatsApp] =
    useState(false);

  async function loadSchedules() {
    try {
      const data = await getSchedules();

      const schedulesWithExtras = await Promise.all(
      data.map(async (schedule: any) => {
          const extras = await getScheduleExtras(
            schedule.id
          );

          return {
            ...schedule,
            extras,
          };
        })
      );

      setSchedules(schedulesWithExtras);
    } catch (error) {
      console.error(
        "Failed to load schedules:",
        error
      );
    }
  }

  async function loadProperties() {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error(
        "Failed to load properties:",
        error
      );
    }
  }

  async function loadEmployees() {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error
      );
    }
  }

  /*
   * Prepare WhatsApp messages for TOMORROW.
   *
   * Office can prepare and send the message
   * one day before the cleaning.
   */
  async function generateWhatsAppMessage() {
    try {
      setGeneratingWhatsApp(true);

      const tomorrow = new Date();

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      const tomorrowDate =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Toronto",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
          .format(tomorrow)
          .replace(/\//g, "-");

      const jobs =
        await getSchedulesByDate(
          tomorrowDate
        );
const grouped = employees
  .map((employee) => {
    const employeeJobs = jobs.filter(
      (job: any) => job.employee_id === employee.id
    );

    return {
      employee,
      jobs: employeeJobs,
    };
  })
  .filter((group) => group.jobs.length > 0);

      setWhatsAppMessage(grouped);
    } catch (error) {
      console.error(
        "Failed to generate WhatsApp messages:",
        error
      );

      alert(
        "Failed to prepare WhatsApp messages."
      );
    } finally {
      setGeneratingWhatsApp(false);
    }
  }

  useEffect(() => {
    loadSchedules();
    loadProperties();
    loadEmployees();
  }, []);

  const groupedSchedules =
    employees.map((employee) => ({
      employee,

      schedules: schedules.filter(
        (schedule) =>
          schedule.employee_id ===
          employee.id
      ),
    }));

  const assignedCleanerCount =
    employees.filter((employee) =>
      schedules.some(
        (schedule) =>
          schedule.employee_id ===
          employee.id
      )
    ).length;

  const completedCount =
    schedules.filter(
      (schedule) =>
        schedule.status === "Completed"
    ).length;

  const openCount =
    schedules.filter(
      (schedule) =>
        schedule.status !== "Completed"
    ).length;

  return (
    <div className="min-h-screen bg-[#F4F7FA]">

      {/* ================================================== */}
      {/* PAGE CONTAINER                                     */}
      {/* ================================================== */}

      <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">

        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

        <div className="mb-9">

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FC] text-[#2E7BBE] shadow-sm">

                  <CalendarDays className="h-5 w-5" />

                </div>

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7BBE]">
                  Operations
                </span>

              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Cleaning Schedule
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                Manage cleanings, cleaners,
                assignments and daily operations
                from one place.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* WHATSAPP */}

              <button
                onClick={
                  generateWhatsAppMessage
                }
                disabled={
                  generatingWhatsApp
                }
                className="group flex items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-3.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                  {generatingWhatsApp ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <MessageCircle className="h-5 w-5" />
                  )}

                </div>

                <div>

                  <span className="block text-sm font-bold text-emerald-700">
                    {generatingWhatsApp
                      ? "Preparing..."
                      : "Prepare Messages"}
                  </span>

                  <span className="block text-xs font-medium text-emerald-500">
                    For tomorrow
                  </span>

                </div>

                <span className="ml-2 text-lg text-emerald-300 transition-transform group-hover:translate-x-1">
                  →
                </span>

              </button>

              {/* ADD CLEANING */}

              <button
                onClick={() => {
                  setEditingSchedule(null);
                  setShowForm(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#2E7BBE] px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#23649D] hover:shadow-xl"
              >

                <Plus className="h-5 w-5" />

                Add Cleaning

              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* STATS                                             */}
          {/* ================================================= */}

          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Cleanings
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {schedules.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Scheduled jobs
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2E7BBE]">

                  <CalendarDays className="h-5 w-5" />

                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cleaners
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {assignedCleanerCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    With assigned jobs
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                  <UserRound className="h-5 w-5" />

                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Completed
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {completedCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Finished jobs
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600">

                  <CheckCircle2 className="h-5 w-5" />

                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Open Jobs
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {openCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Still scheduled
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600">

                  <Clock3 className="h-5 w-5" />

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* EMPTY STATE                                      */}
        {/* ================================================= */}

        {schedules.length === 0 ? (

          <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2E7BBE]">

              <CalendarDays className="h-8 w-8" />

            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No cleanings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Click Add Cleaning to create
              your first scheduled job.
            </p>

            <button
              onClick={() => {
                setEditingSchedule(null);
                setShowForm(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2E7BBE] px-6 py-3 font-bold text-white transition hover:bg-[#23649D]"
            >

              <Plus className="h-4 w-4" />

              Add Cleaning

            </button>

          </div>

        ) : (

          <>
            {/* ================================================= */}
            {/* CLEANER GROUPS                                   */}
            {/* ================================================= */}

            <div className="space-y-6">

              {groupedSchedules.map(
                ({
                  employee,
                  schedules,
                }) => {

                  if (
                    schedules.length === 0
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={employee.id}
                      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                    >

                      {/* CLEANER HEADER */}

                      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                        <div className="flex items-center gap-3">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg shadow-sm ring-1 ring-slate-100">
                            🧹
                          </div>

                          <div>

                            <h2 className="text-xl font-black text-slate-900">
                              {employee.name}
                            </h2>

                            <p className="mt-0.5 text-sm text-slate-500">
                              {schedules.length}{" "}
                              {schedules.length === 1
                                ? "assigned job"
                                : "assigned jobs"}
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#2E7BBE]">
                            Cleaner
                          </span>

                          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
                            {schedules.length} jobs
                          </span>

                        </div>

                      </div>

                      {/* SCHEDULE CARDS */}

                      <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">

                        {schedules.map(
                          (schedule) => {

                            const property =
                              properties.find(
                                (p) =>
                                  p.id ===
                                  schedule.property_id
                              );

                            return (
                              <ScheduleCard
                                key={schedule.id}

                                property={
                                  property?.name ||
                                  "Unknown Property"
                                }

                                cleaner={
                                  employee.name
                                }

                                date={
                                  schedule.cleaning_date
                                }

                                checkout={
                                  schedule.checkout_time
                                }

                                checkin={
                                  schedule.checkin_time
                                }

                                cleanerPay={
                                  schedule.cleaner_pay
                                }

                                companyCharge={
                                  schedule.company_charge
                                }

                                status={
                                  schedule.status
                                }

                                extras={
                                  schedule.extras?.map(
                                    (
                                      extra: any
                                    ) => ({
                                      name:
                                        extra.extra_id ===
                                        1
                                          ? "🧺 Laundry"
                                          : extra.extra_id ===
                                            2
                                          ? "🕒 Extra Hour"
                                          : extra.extra_id ===
                                            3
                                          ? "🧼 Deep Clean"
                                          : extra.extra_id ===
                                            4
                                          ? "🪟 Windows"
                                          : extra.extra_id ===
                                            5
                                          ? "🐶 Pet Hair"
                                          : extra.extra_id ===
                                            6
                                          ? "🛏️ Extra Linen"
                                          : extra.extra_id ===
                                            7
                                          ? "☣️ Biohazard"
                                          : extra.extra_id ===
                                            8
                                          ? "🌿 Balcony"
                                          : "Extra",

                                      quantity:
                                        extra.quantity,
                                    })
                                  )
                                }

                                selected={selectedSchedules.includes(
                                  schedule.id
                                )}

                                onSelect={() => {

                                  if (
                                    selectedSchedules.includes(
                                      schedule.id
                                    )
                                  ) {

                                    setSelectedSchedules(
                                      selectedSchedules.filter(
                                        (id) =>
                                          id !==
                                          schedule.id
                                      )
                                    );

                                  } else {

                                    setSelectedSchedules(
                                      [
                                        ...selectedSchedules,
                                        schedule.id,
                                      ]
                                    );

                                  }

                                }}

                                onView={() => {
                                  setViewingSchedule(
                                    schedule
                                  );
                                }}

                                onEdit={() => {
                                  setEditingSchedule(
                                    schedule
                                  );

                                  setShowForm(true);
                                }}

                                onDelete={async () => {

                                  const confirmed =
                                    confirm(
                                      "Delete this cleaning?"
                                    );

                                  if (!confirmed) {
                                    return;
                                  }

                                  await deleteSchedule(
                                    schedule.id
                                  );

                                  await loadSchedules();

                                }}
                              />
                            );
                          }
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* ================================================= */}
            {/* BULK ACTION BAR                                  */}
            {/* ================================================= */}

            {selectedSchedules.length >
              0 && (

              <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:w-auto sm:px-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5">

                    <CheckCircle2 className="h-4 w-4 text-[#2E7BBE]" />

                    <span className="text-sm font-bold text-slate-700">
                      {selectedSchedules.length}{" "}
                      selected
                    </span>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={async () => {

                        try {

                          await completeSchedules(
                            selectedSchedules
                          );

                          await loadSchedules();

                          setSelectedSchedules(
                            []
                          );

                        } catch (error) {

                          console.error(
                            error
                          );

                          alert(
                            "Failed to complete jobs."
                          );

                        }

                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >

                      <CheckCircle2 className="h-4 w-4" />

                      Complete

                    </button>

                    <button
                      onClick={() =>
                        setShowReassign(true)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
                    >

                      <RefreshCw className="h-4 w-4" />

                      Reassign

                    </button>

                  </div>

                </div>

              </div>

            )}

          </>
        )}

      </div>

      {/* ================================================== */}
      {/* ADD / EDIT CLEANING MODAL                          */}
      {/* ================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl sm:p-8">

            <button
              onClick={() => {
                setShowForm(false);
                setEditingSchedule(null);
              }}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
            >

              <X className="h-5 w-5" />

            </button>

            <ScheduleForm
              properties={properties}
              employees={employees}
              schedule={editingSchedule}

              onClose={() => {
                setShowForm(false);
                setEditingSchedule(
                  null
                );
              }}

              onSaved={async () => {
                await loadSchedules();

                setShowForm(false);

                setEditingSchedule(
                  null
                );
              }}
            />

          </div>

        </div>

      )}

      {/* ================================================== */}
      {/* CLEANING DETAILS MODAL                             */}
      {/* ================================================== */}

      {viewingSchedule && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-xl overflow-hidden rounded-[30px] bg-white shadow-2xl">

            {/* HEADER */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#174B7A] to-[#3188C8] px-6 py-7 text-white">

              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10" />

              <div className="relative flex items-start justify-between">

                <div>

                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                    <FileText className="h-5 w-5" />
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
                    Cleaning Information
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Cleaning Details
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setViewingSchedule(
                      null
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

            </div>

            {/* BODY */}

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">

              {/* PROPERTY */}

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Property
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {properties.find(
                    (p) =>
                      p.id ===
                      viewingSchedule.property_id
                  )?.name ||
                    "Unknown Property"}
                </p>

              </div>

              {/* CLEANER + DATE */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex items-center gap-2">

                    <UserRound className="h-4 w-4 text-[#2E7BBE]" />

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cleaner
                    </p>

                  </div>

                  <p className="mt-2 font-bold text-slate-900">
                    {employees.find(
                      (e) =>
                        e.id ===
                        viewingSchedule.employee_id
                    )?.name ||
                      "Unassigned"}
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex items-center gap-2">

                    <CalendarDays className="h-4 w-4 text-[#2E7BBE]" />

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </p>

                  </div>

                  <p className="mt-2 font-bold text-slate-900">
                    {viewingSchedule.cleaning_date}
                  </p>

                </div>

              </div>

              {/* TIMES */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    Checkout
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {viewingSchedule.checkout_time ||
                      "--"}
                  </p>

                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Check-in
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {viewingSchedule.checkin_time ||
                      "--"}
                  </p>

                </div>

              </div>

              {/* FINANCIAL */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cleaner Pay
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    $
                    {Number(
                      viewingSchedule.cleaner_pay ||
                        0
                    ).toFixed(2)}
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Company Charge
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    $
                    {Number(
                      viewingSchedule.company_charge ||
                        0
                    ).toFixed(2)}
                  </p>

                </div>

              </div>

              {/* EXTRAS */}

              {viewingSchedule.extras &&
                viewingSchedule.extras.length >
                  0 && (

                <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">

                  <div className="flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-orange-500" />

                    <p className="text-sm font-bold text-slate-900">
                      Extras
                    </p>

                  </div>

                  <div className="mt-3 space-y-2">

                    {viewingSchedule.extras.map(
                      (extra: any) => (

                        <div
                          key={
                            extra.extra_id
                          }
                          className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                        >

                          <span className="text-sm font-semibold text-slate-700">

                            {extra.extra_id ===
                              1 &&
                              "🧺 Laundry"}

                            {extra.extra_id ===
                              2 &&
                              "🕒 Extra Hour"}

                            {extra.extra_id ===
                              3 &&
                              "🧼 Deep Clean"}

                            {extra.extra_id ===
                              4 &&
                              "🪟 Windows"}

                            {extra.extra_id ===
                              5 &&
                              "🐶 Pet Hair"}

                            {extra.extra_id ===
                              6 &&
                              "🛏️ Extra Linen"}

                            {extra.extra_id ===
                              7 &&
                              "☣️ Biohazard"}

                            {extra.extra_id ===
                              8 &&
                              "🌿 Balcony"}

                          </span>

                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                            ×
                            {extra.quantity}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </div>
              )}

              {/* STATUS */}

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {viewingSchedule.status}
                    </p>

                  </div>

                  {viewingSchedule.status ===
                    "Completed" ? (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">

                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Completed

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">

                      <Clock3 className="h-3.5 w-3.5" />

                      Scheduled

                    </span>

                  )}

                </div>

              </div>

              {/* NOTES */}

              <div className="rounded-2xl border border-slate-100 bg-white p-4">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {viewingSchedule.notes ||
                    "No notes"}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================================================== */}
      {/* REASSIGN MODAL                                    */}
      {/* ================================================== */}

      {showReassign && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-[30px] bg-white shadow-2xl">

            {/* HEADER */}

            <div className="bg-gradient-to-br from-orange-500 to-orange-400 px-6 py-7 text-white">

              <div className="flex items-start justify-between">

                <div>

                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">

                    <RefreshCw className="h-5 w-5" />

                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
                    Schedule Management
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Reassign Jobs
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowReassign(false)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

            </div>

            {/* BODY */}

            <div className="space-y-6 p-6">

              <div>

                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selected Jobs
                </p>

                <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3">

                  {selectedSchedules.map(
                    (id) => {

                      const schedule =
                        schedules.find(
                          (s) =>
                            s.id === id
                        );

                      const property =
                        properties.find(
                          (p) =>
                            p.id ===
                            schedule?.property_id
                        );

                      return (

                        <div
                          key={id}
                          className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
                        >

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                            🏠
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-800">
                              {property?.name ||
                                "Unknown Property"}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {schedule?.cleaning_date}
                            </p>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

              <div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  New Cleaner
                </label>

                <select
                  value={newEmployeeId}
                  onChange={(e) =>
                    setNewEmployeeId(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >

                  <option value="">
                    Choose Cleaner
                  </option>

                  {employees.map(
                    (employee) => (

                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                      </option>

                    )
                  )}

                </select>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  onClick={() => {
                    setShowReassign(false);
                    setNewEmployeeId("");
                  }}
                  className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {

                    if (!newEmployeeId) {
                      alert(
                        "Please choose a cleaner."
                      );
                      return;
                    }

                    await reassignSchedules(
                      selectedSchedules,
                      Number(
                        newEmployeeId
                      )
                    );

                    await loadSchedules();

                    setSelectedSchedules(
                      []
                    );

                    setShowReassign(
                      false
                    );

                    setNewEmployeeId("");

                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >

                  <RefreshCw className="h-4 w-4" />

                  Reassign Jobs

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================================================== */}
      {/* WHATSAPP MODAL                                    */}
      {/* ================================================== */}

      {whatsAppMessage.length >
        0 && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">

            {/* HEADER */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#168A5B] to-[#27B477] px-6 py-7 text-white sm:px-7">

              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />

              <div className="relative flex items-start justify-between gap-4">

                <div>

                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">

                    <MessageCircle className="h-5 w-5" />

                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100">
                    Cleaner Communication
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Tomorrow's Messages
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50">
                    Prepare the cleaning information
                    today and send it to your cleaners
                    before tomorrow's jobs.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setWhatsAppMessage([])
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

            </div>

            {/* BODY */}

            <div className="max-h-[60vh] space-y-4 overflow-y-auto bg-slate-50 p-5 sm:p-6">

              {whatsAppMessage.map(
                (group) => {

                  const firstTime =
                    group.jobs
                      .map(
                        (j: any) =>
                          j.checkout_time
                      )
                      .filter(Boolean)
                      .sort()[0] ||
                    "--";

                  const message =
`🧹 TOMORROW'S SCHEDULE

🕙 Start: ${firstTime}

${group.jobs
  .map((job: any) => {

    const property =
      properties.find(
        (p) =>
          p.id ===
          job.property_id
      );

    return `${property?.name} (${job.checkout_time || "--"} / ${job.checkin_time || "--"})`;

  })
  .join("\n")}

Thank you ${group.employee.name} 🙏✨`;

                  return (

                    <div
                      key={
                        group.employee.id
                      }
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >

                      {/* CLEANER */}

                      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                            🧹
                          </div>

                          <div>

                            <h3 className="font-bold text-slate-900">
                              {
                                group
                                  .employee
                                  .name
                              }
                            </h3>

                            <p className="text-xs text-slate-500">
                              {
                                group.jobs
                                  .length
                              }{" "}
                              {group.jobs
                                .length ===
                              1
                                ? "property"
                                : "properties"}
                            </p>

                          </div>

                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                          Tomorrow
                        </span>

                      </div>

                      {/* MESSAGE */}

                      <div className="p-5">

                        <div className="rounded-2xl bg-slate-50 p-4">

                          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                            {message}
                          </p>

                        </div>

                        <button
                          onClick={() => {

                            navigator.clipboard.writeText(
                              message
                            );

                            alert(
                              "Message copied!"
                            );

                          }}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] py-3.5 text-sm font-bold text-white transition hover:bg-[#23649D]"
                        >

                          📋 Copy WhatsApp Message

                        </button>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

            {/* FOOTER */}

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs leading-5 text-slate-400">
                Messages are prepared for
                tomorrow's scheduled cleanings.
              </p>

              <button
                onClick={() =>
                  setWhatsAppMessage([])
                }
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Done
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}