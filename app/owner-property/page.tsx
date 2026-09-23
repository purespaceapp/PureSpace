"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Home,
  KeyRound,
  MapPin,
  Receipt,
  ShieldCheck,
  StickyNote,
  Wrench,
  Wifi,
  Car,
  DollarSign,
  Clock3,
  AlertTriangle,
  X,
} from "lucide-react";

import {
  getProperties,
  updateAirbnbConnection,
} from "@/lib/properties";

import { getSchedulesByProperty } from "@/lib/schedule";
import { getEmployees } from "@/lib/employees";
import { getReceiptsByProperty } from "@/lib/receipts";
import { getMaintenanceByProperty } from "@/lib/maintenance";


function formatScheduleDate(value: unknown) {
  if (!value) return "Date unavailable";

  const raw = String(value);

  // cleaning_date is a calendar date, not a timestamp.
  // Keep it in the property's scheduled day and avoid timezone shifts.
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return raw;
  }

  const [, year, month, day] = match;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day)
      )
    )
  );
}

function formatShortDate(value: unknown) {
  if (!value) return "—";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <div className="w-12 h-12 rounded-2xl bg-[#EAF4FE] flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#17324D]">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-[#17324D] mt-2">
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="w-11 h-11 rounded-2xl bg-[#EAF4FE] flex items-center justify-center text-[#2E7BBE]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 py-10 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm mx-auto flex items-center justify-center text-slate-300">
        {icon}
      </div>

      <p className="font-semibold text-slate-600 mt-4">
        {title}
      </p>

      {description && (
        <p className="text-sm text-slate-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

export default function OwnerPropertyPage() {
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);

  const [showAirbnbModal, setShowAirbnbModal] =
    useState(false);

  const [listingUrl, setListingUrl] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [savingAirbnb, setSavingAirbnb] =
    useState(false);

  useEffect(() => {
    async function load() {
      const propertyId =
        sessionStorage.getItem("selectedProperty");

      const ownerId =
        sessionStorage.getItem("ownerId");

      if (!propertyId || !ownerId) {
        router.replace("/owner-home");
        return;
      }

      try {
        const properties = await getProperties(
          Number(ownerId)
        );
const selected = properties.find(
  (p: any) => p.id === Number(propertyId)
);
        if (!selected) {
          router.replace("/owner-home");
          return;
        }

        setProperty(selected);

        setListingUrl(
          selected.airbnb_listing_url || ""
        );

        setCalendarUrl(
          selected.airbnb_calendar_url || ""
        );

        const [
          scheduleData,
          employeeData,
          receiptData,
          maintenanceData,
        ] = await Promise.all([
          getSchedulesByProperty(Number(propertyId)),
          getEmployees(),
          getReceiptsByProperty(Number(propertyId)),
          getMaintenanceByProperty(Number(propertyId)),
        ]);

        setSchedules(scheduleData || []);
        setEmployees(employeeData || []);
        setReceipts(receiptData || []);
        setIssues(maintenanceData || []);
      } catch (error) {
        console.error(
          "Error loading property:",
          error
        );
      }
    }

    load();
  }, [router]);

  async function saveAirbnbConnection() {
    if (!property) return;

    if (
      listingUrl.trim() === "" ||
      calendarUrl.trim() === ""
    ) {
      alert("Please complete both Airbnb links.");
      return;
    }

    try {
      setSavingAirbnb(true);

      await updateAirbnbConnection(property.id, {
        airbnb_listing_url: listingUrl,
        airbnb_calendar_url: calendarUrl,
        airbnb_connected: true,
      });

      setProperty({
        ...property,
        airbnb_listing_url: listingUrl,
        airbnb_calendar_url: calendarUrl,
        airbnb_connected: true,
        last_airbnb_sync:
          new Date().toISOString(),
      });

      setShowAirbnbModal(false);

      alert("Airbnb connected successfully!");
    } catch (error) {
      console.error(error);
      alert(
        "Unable to save the Airbnb connection."
      );
    } finally {
      setSavingAirbnb(false);
    }
  }

  const upcomingCleanings = useMemo(
    () =>
      schedules
        .filter(
          (schedule) =>
            schedule.status !== "Completed"
        )
        .sort(
          (a, b) =>
            new Date(
              a.cleaning_date
            ).getTime() -
            new Date(
              b.cleaning_date
            ).getTime()
        ),
    [schedules]
  );

  const completedCleanings = useMemo(
    () =>
      schedules
        .filter(
          (schedule) =>
            schedule.status === "Completed"
        )
        .sort(
          (a, b) =>
            new Date(
              b.cleaning_date
            ).getTime() -
            new Date(
              a.cleaning_date
            ).getTime()
        ),
    [schedules]
  );

  const nextCleaning =
    upcomingCleanings[0] || null;

  const openMaintenance = issues.filter(
    (issue) =>
      issue.status?.toLowerCase() === "open"
  );

  if (!property) {
    return (
      <main className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7 text-[#2E7BBE] animate-pulse" />
          </div>

          <p className="text-lg font-semibold text-[#17324D] mt-5">
            Loading property...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Please wait a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB]">

      {/* ===================================================== */}
      {/* TOP PROPERTY HEADER                                  */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#173F70] via-[#246BA5] to-[#55A9EE] text-white">

        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-white/10" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 pt-7 pb-10">

          <button
            onClick={() =>
              router.push("/owner-home")
            }
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Properties
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

            <div className="min-w-0">

              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Active Property
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mt-5 tracking-tight">
                {property.name}
              </h1>

              <div className="flex items-center gap-2 mt-4 text-blue-100">
                <MapPin className="w-5 h-5 shrink-0" />
                <span className="text-lg">
                  {property.address}
                </span>
              </div>

              <p className="mt-4 text-blue-100 max-w-2xl">
                Manage cleaning activity, property
                information, maintenance, receipts and
                Airbnb connection from one place.
              </p>

            </div>

            <div className="w-full lg:w-[290px] bg-white text-[#17324D] rounded-3xl p-6 shadow-2xl shrink-0">

              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[2px] font-bold text-[#2E7BBE]">
                  Property Status
                </p>

                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-6">

                <div>
                  <p className="text-xs text-slate-400">
                    Cleaning Price
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    ${property.company_price ?? 0}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Cleanings
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {schedules.length}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================================================== */}
      {/* QUICK STATS                                           */}
      {/* ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-5 relative z-10">

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            icon={<CalendarDays className="w-5 h-5" />}
            label="Next Cleaning"
            value={
              nextCleaning
                ? formatShortDate(
                    nextCleaning.cleaning_date
                  )
                : "—"
            }
            subtitle={
              nextCleaning
                ? (() => {
                    const employee =
                      employees.find(
                        (e) =>
                          Number(e.id) ===
                          Number(
                            nextCleaning.employee_id
                          )
                      );

                    return (
                      employee?.name ||
                      "Unassigned"
                    );
                  })()
                : "No upcoming cleaning"
            }
          />

          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Completed Cleanings"
            value={completedCleanings.length}
            subtitle="Cleaning history"
          />

          <StatCard
            icon={<Wrench className="w-5 h-5" />}
            label="Maintenance"
            value={openMaintenance.length}
            subtitle={
              openMaintenance.length === 1
                ? "Open issue"
                : "Open issues"
            }
          />

          <StatCard
            icon={<Receipt className="w-5 h-5" />}
            label="Receipts"
            value={receipts.length}
            subtitle="Property receipts"
          />

        </div>
      </section>

      {/* ===================================================== */}
      {/* PROPERTY DETAILS                                     */}
      {/* ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-10">

        <div className="mb-5">
          <p className="text-xs uppercase tracking-[2px] font-bold text-[#2E7BBE]">
            Property Details
          </p>

          <h2 className="text-2xl font-bold text-[#17324D] mt-1">
            Property Information
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* GENERAL */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <SectionHeader
              icon={
                <Home className="w-6 h-6 text-[#2E7BBE]" />
              }
              title="General Information"
              subtitle="Basic property details"
            />

            <div className="divide-y divide-slate-100">

              <div className="py-4 flex justify-between gap-6">
                <span className="text-slate-500">
                  Property Name
                </span>

                <span className="font-semibold text-right text-[#17324D]">
                  {property.name}
                </span>
              </div>

              <div className="py-4 flex justify-between gap-6">
                <span className="text-slate-500">
                  Address
                </span>

                <span className="font-semibold text-right text-[#17324D] max-w-sm">
                  {property.address}
                </span>
              </div>

              <div className="py-4 flex justify-between gap-6">
                <span className="text-slate-500">
                  Cleaning Price
                </span>

                <span className="font-bold text-[#2E7BBE]">
                  ${property.company_price ?? 0}
                </span>
              </div>

            </div>
          </div>

          {/* ACCESS */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <SectionHeader
              icon={
                <KeyRound className="w-6 h-6 text-[#2E7BBE]" />
              }
              title="Access Information"
              subtitle="Information for property access"
            />

            <div className="grid sm:grid-cols-3 gap-4">

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <KeyRound className="w-5 h-5 text-[#2E7BBE]" />

                <p className="text-xs text-slate-400 mt-4">
                  Door Code
                </p>

                <p className="font-bold text-[#17324D] mt-1">
                  {property.door_code ||
                    "Not Available"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <Car className="w-5 h-5 text-[#2E7BBE]" />

                <p className="text-xs text-slate-400 mt-4">
                  Parking
                </p>

                <p className="font-bold text-[#17324D] mt-1">
                  {property.parking ||
                    "Not Available"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <Wifi className="w-5 h-5 text-[#2E7BBE]" />

                <p className="text-xs text-slate-400 mt-4">
                  WiFi
                </p>

                <p className="font-bold text-[#17324D] mt-1 break-words">
                  {property.wifi ||
                    "Not Available"}
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ===================================================== */}
      {/* CLEANING ACTIVITY                                    */}
      {/* ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-10">

        <div className="mb-5">
          <p className="text-xs uppercase tracking-[2px] font-bold text-[#2E7BBE]">
            Cleaning Activity
          </p>

          <h2 className="text-2xl font-bold text-[#17324D] mt-1">
            Schedule & History
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* UPCOMING */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <SectionHeader
              icon={
                <CalendarDays className="w-6 h-6 text-[#2E7BBE]" />
              }
              title="Upcoming Cleanings"
              subtitle="Scheduled cleaning visits"
            />

            {upcomingCleanings.length === 0 ? (
              <EmptyState
                icon={
                  <CalendarDays className="w-6 h-6" />
                }
                title="No upcoming cleanings"
                description="There are no scheduled cleanings at the moment."
              />
            ) : (
              <div className="space-y-3">

                {upcomingCleanings
                  .slice(0, 5)
                  .map((schedule) => {

                    const employee =
                      employees.find(
                        (e) =>
                          Number(e.id) ===
                          Number(
                            schedule.employee_id
                          )
                      );

                    return (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4"
                      >

                        <div className="flex items-center gap-4">

                          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <CalendarDays className="w-5 h-5 text-[#2E7BBE]" />
                          </div>

                          <div>
                            <p className="font-bold text-[#17324D]">
                              {formatScheduleDate(
                                schedule.cleaning_date
                              )}
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                              {employee?.name ||
                                "Unassigned"}
                            </p>
                          </div>

                        </div>

                        <span className="px-3 py-1.5 rounded-full bg-blue-50 text-[#2E7BBE] text-xs font-bold">
                          {schedule.status}
                        </span>

                      </div>
                    );
                  })}

              </div>
            )}
          </div>

          {/* HISTORY */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <SectionHeader
              icon={
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              }
              title="Cleaning History"
              subtitle="Recently completed cleanings"
            />

            {completedCleanings.length === 0 ? (
              <EmptyState
                icon={
                  <CheckCircle2 className="w-6 h-6" />
                }
                title="No completed cleanings"
                description="Completed cleaning visits will appear here."
              />
            ) : (
              <div className="space-y-2">

                {completedCleanings
                  .slice(0, 5)
                  .map((schedule) => {

                    const employee =
                      employees.find(
                        (e) =>
                          Number(e.id) ===
                          Number(
                            schedule.employee_id
                          )
                      );

                    return (
                      <div
                        key={schedule.id}
                        className="flex gap-4 py-4 border-b border-slate-100 last:border-0"
                      >

                        <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>

                        <div>
                          <p className="font-bold text-[#17324D]">
                            {formatScheduleDate(
                              schedule.cleaning_date
                            )}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            Completed by{" "}
                            {employee?.name ||
                              "Unknown"}
                          </p>
                        </div>

                      </div>
                    );
                  })}

              </div>
            )}
          </div>

        </div>
      </section>

      {/* ===================================================== */}
      {/* MAINTENANCE + RECEIPTS                               */}
      {/* ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-10">

        <div className="grid lg:grid-cols-2 gap-6">

          {/* MAINTENANCE */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <SectionHeader
              icon={
                <Wrench className="w-6 h-6 text-[#2E7BBE]" />
              }
              title="Maintenance Issues"
              subtitle="Reported property problems"
            />

            {issues.length === 0 ? (
              <EmptyState
                icon={
                  <Wrench className="w-6 h-6" />
                }
                title="No maintenance issues"
                description="There are no reported problems for this property."
              />
            ) : (
              <div className="space-y-3">

                {issues.slice(0, 5).map((issue) => (

                  <div
                    key={issue.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />

                          <h3 className="font-bold text-[#17324D]">
                            {issue.issue_type}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-500 mt-2">
                          {issue.notes}
                        </p>

                        <p className="text-xs text-slate-400 mt-3">
                          {issue.reported_at
                            ? new Date(
                                issue.reported_at
                              ).toLocaleDateString()
                            : "Date unavailable"}
                        </p>

                      </div>

                      <span
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                          issue.status === "Open"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {issue.status}
                      </span>

                    </div>

                    {issue.photo_url && (
                      <a
                        href={issue.photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#2E7BBE] hover:underline"
                      >
                        View Photo
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                  </div>

                ))}

              </div>
            )}
          </div>

          {/* RECEIPTS */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <SectionHeader
              icon={
                <Receipt className="w-6 h-6 text-[#2E7BBE]" />
              }
              title="Receipts"
              subtitle="Property-related expenses"
            />

            {receipts.length === 0 ? (
              <EmptyState
                icon={
                  <Receipt className="w-6 h-6" />
                }
                title="No receipts available"
                description="Property receipts will appear here."
              />
            ) : (
              <div className="space-y-3">

                {receipts.slice(0, 5).map(
                  (receipt) => (

                    <div
                      key={receipt.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5"
                    >

                      <div>
                        <p className="font-bold text-[#17324D]">
                          {receipt.title ||
                            "Cleaning Receipt"}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          {receipt.description ||
                            "No description available."}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">
                          Amount
                        </p>

                        <p className="text-xl font-bold text-[#2E7BBE] mt-1">
                          $
                          {Number(
                            receipt.amount || 0
                          ).toFixed(2)}
                        </p>
                      </div>

                    </div>

                  )
                )}

              </div>
            )}
          </div>

        </div>
      </section>

      {/* ===================================================== */}
      {/* AIRBNB                                                */}
      {/* ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-10">

        <div className="mb-5">
          <p className="text-xs uppercase tracking-[2px] font-bold text-[#FF5A5F]">
            Airbnb
          </p>

          <h2 className="text-2xl font-bold text-[#17324D] mt-1">
            Airbnb & Calendar Connection
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* AIRBNB CONNECTION */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <div className="flex items-start justify-between gap-5">

              <SectionHeader
                icon={
                  <Building2 className="w-6 h-6 text-[#FF5A5F]" />
                }
                title="Airbnb Connection"
                subtitle="Listing and calendar configuration"
              />

              <span
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                  property.airbnb_calendar_url
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {property.airbnb_calendar_url
                  ? "Configured"
                  : "Not Configured"}
              </span>

            </div>

            <div className="space-y-4">

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Listing URL
                </p>

                <p className="text-sm font-medium text-[#17324D] mt-2 break-all">
                  {property.airbnb_listing_url ||
                    "No listing connected"}
                </p>

              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Calendar URL
                </p>

                <p className="text-sm font-medium text-[#17324D] mt-2 break-all">
                  {property.airbnb_calendar_url ||
                    "No calendar connected"}
                </p>

              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-5">

                <div className="flex items-center gap-3">
                  <Clock3 className="w-5 h-5 text-[#2E7BBE]" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Last Sync
                    </p>

                    <p className="font-semibold text-[#17324D] mt-1">
                      {property.last_airbnb_sync
                        ? new Date(
                            property.last_airbnb_sync
                          ).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-5">

              <button
                onClick={() =>
                  setShowAirbnbModal(true)
                }
                className="rounded-2xl bg-[#FF5A5F] hover:bg-[#E14D52] text-white py-3.5 font-semibold transition"
              >
                Edit Connection
              </button>

              <button
                disabled={
                  !property.airbnb_listing_url
                }
                onClick={() =>
                  window.open(
                    property.airbnb_listing_url,
                    "_blank"
                  )
                }
                className="rounded-2xl border-2 border-[#FF5A5F] text-[#FF5A5F] hover:bg-[#FF5A5F] hover:text-white py-3.5 font-semibold transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#FF5A5F]"
              >
                <span className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Listing
                </span>
              </button>

            </div>
          </div>

          {/* CALENDAR */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

            <SectionHeader
              icon={
                <CalendarDays className="w-6 h-6 text-[#2E7BBE]" />
              }
              title="Calendar Sync"
              subtitle="Reservation synchronization"
            />

            <div
              className={`rounded-2xl border p-6 ${
                property.airbnb_calendar_url
                  ? "bg-green-50 border-green-100"
                  : "bg-orange-50 border-orange-100"
              }`}
            >

              <div className="flex items-center gap-3">

                {property.airbnb_calendar_url ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock3 className="w-6 h-6 text-orange-500" />
                )}

                <div>

                  <p className="text-sm text-slate-500">
                    Synchronization Status
                  </p>

                  <p
                    className={`font-bold text-lg mt-1 ${
                      property.airbnb_calendar_url
                        ? "text-green-700"
                        : "text-orange-600"
                    }`}
                  >
                    {property.airbnb_calendar_url
                      ? "Connected"
                      : "Pending Airbnb Connection"}
                  </p>

                </div>

              </div>

            </div>

            <p className="text-slate-500 text-sm leading-6 mt-5">
              Once Airbnb is connected, reservations
              and future cleanings can appear here
              automatically.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5">

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Calendar
                </span>

                <span className="font-semibold text-[#17324D]">
                  {property.airbnb_calendar_url
                    ? "Connected"
                    : "Not Connected"}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-500">
                  Upcoming Reservation
                </span>

                <span className="font-semibold text-[#17324D]">
                  —
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================================================== */}
      {/* PROPERTY NOTES                                       */}
      {/* ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-10">

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

          <SectionHeader
            icon={
              <StickyNote className="w-6 h-6 text-[#2E7BBE]" />
            }
            title="Property Notes"
            subtitle="Important instructions and information"
          />

          <div className="rounded-2xl bg-[#F7FAFD] border border-slate-100 p-6">

            <p className="text-slate-600 leading-7 whitespace-pre-line">
              {property.notes ||
                "No notes available for this property."}
            </p>

          </div>

        </div>
      </section>

      {/* ===================================================== */}
      {/* FINANCIAL OVERVIEW                                   */}
      {/* ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-10 mb-12">

        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#173F70] via-[#246BA5] to-[#3B8FD1] shadow-xl text-white">

          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10" />

          <div className="relative p-7 md:p-9 flex flex-col lg:flex-row lg:items-center justify-between gap-8">

            <div className="max-w-2xl">

              <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-[2px]">
                <DollarSign className="w-4 h-4" />
                Financial Overview
              </div>

              <h2 className="text-3xl font-bold mt-3">
                Property Statement
              </h2>

              <p className="text-blue-100 leading-7 mt-3">
                View completed cleanings, additional
                services, maintenance expenses and your
                property billing history.
              </p>

            </div>

            <button
              onClick={() =>
                router.push(
                  `/owner-statement/${property.id}`
                )
              }
              className="inline-flex items-center justify-center gap-3 bg-white text-[#2E7BBE] rounded-2xl px-7 py-4 font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
            >
              <FileText className="w-5 h-5" />
              View Full Statement
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>

        </div>
      </section>

      {/* ===================================================== */}
      {/* FOOTER                                                */}
      {/* ===================================================== */}

      <footer className="pb-10 text-center">

        <p className="text-sm text-slate-500">
          Powered by{" "}
          <span className="font-semibold text-[#2E7BBE]">
            PureSpace Cleaning
          </span>
        </p>

        <p className="text-xs text-slate-400 mt-1">
          Professional Property Management Platform
        </p>

      </footer>

      {/* ===================================================== */}
      {/* AIRBNB MODAL                                         */}
      {/* ===================================================== */}

      {showAirbnbModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-2xl overflow-hidden">

            <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#FF5A5F]" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-[#17324D]">
                      Connect Airbnb
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Connect your listing and calendar
                    </p>
                  </div>

                </div>
              </div>

              <button
                onClick={() =>
                  setShowAirbnbModal(false)
                }
                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="p-7">

              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 mb-6">

                <p className="text-sm text-[#2E7BBE] leading-6">
                  Add your Airbnb listing URL and
                  Airbnb calendar (.ics) URL to connect
                  this property.
                </p>

              </div>

              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-semibold text-[#17324D] mb-2">
                    Airbnb Listing URL
                  </label>

                  <input
                    type="text"
                    value={listingUrl}
                    onChange={(e) =>
                      setListingUrl(e.target.value)
                    }
                    placeholder="https://www.airbnb.com/rooms/..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:bg-white focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-50 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#17324D] mb-2">
                    Airbnb Calendar (.ics)
                  </label>

                  <input
                    type="text"
                    value={calendarUrl}
                    onChange={(e) =>
                      setCalendarUrl(e.target.value)
                    }
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:bg-white focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-50 transition"
                  />
                </div>

              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">

                <button
                  onClick={() =>
                    setShowAirbnbModal(false)
                  }
                  className="px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={saveAirbnbConnection}
                  disabled={savingAirbnb}
                  className="px-7 py-3.5 rounded-2xl bg-[#FF5A5F] text-white font-semibold hover:bg-[#E14D52] transition disabled:opacity-50"
                >
                  {savingAirbnb
                    ? "Saving..."
                    : "Save Connection"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}