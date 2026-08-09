"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Home,
  MapPin,
  CalendarDays,
  FileText,
  DollarSign,
  AlertTriangle,
  KeyRound,
  Receipt,
  Wrench,
  StickyNote,
  Building2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
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

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
}
export default function OwnerPropertyPage() {

  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [showAirbnbModal, setShowAirbnbModal] = useState(false);

const [listingUrl, setListingUrl] = useState("");

const [calendarUrl, setCalendarUrl] = useState("");

const [savingAirbnb, setSavingAirbnb] = useState(false);

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

      const properties =
        await getProperties(Number(ownerId));

      const selected =
        properties.find(
          (p) => p.id === Number(propertyId)
        );

      setProperty(selected);
      if (selected) {

  setListingUrl(
    selected.airbnb_listing_url || ""
  );

  setCalendarUrl(
    selected.airbnb_calendar_url || ""
  );

}

      const scheduleData =
        await getSchedulesByProperty(
          Number(propertyId)
        );

      setSchedules(scheduleData);

      const employeeData =
        await getEmployees();

      setEmployees(employeeData);

      const receiptData =
        await getReceiptsByProperty(
          Number(propertyId)
        );

      setReceipts(receiptData);

      const maintenanceData =
        await getMaintenanceByProperty(
          Number(propertyId)
        );

      setIssues(maintenanceData);

    }

    load();

  }, [router]);

  if (!property) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-[#F4F7FB]">

        <p className="text-2xl font-semibold text-slate-600">

          Loading Property...

        </p>

      </main>

    );

  }
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

    await updateAirbnbConnection(
      property.id,
      {
        airbnb_listing_url: listingUrl,
        airbnb_calendar_url: calendarUrl,
        airbnb_connected: true,
      }
    );

    setProperty({
      ...property,
      airbnb_listing_url: listingUrl,
      airbnb_calendar_url: calendarUrl,
      airbnb_connected: true,
      last_airbnb_sync: new Date().toISOString(),
    });

    setShowAirbnbModal(false);

    alert("Airbnb connected successfully!");

  } catch (error) {

    console.error(error);

    alert("Unable to save the Airbnb connection.");

  } finally {

    setSavingAirbnb(false);

  }

}
  return (

    <main className="min-h-screen bg-[#F4F7FB]">
            {/* ================= HERO ================= */}

      <section className="relative overflow-hidden bg-gradient-to-r from-[#1E4F85] via-[#2E7BBE] to-[#5DA9F6] text-white">

        <div className="absolute inset-0 opacity-10">

          <div className="absolute -top-28 -right-20 w-96 h-96 rounded-full bg-white"></div>

          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white"></div>

        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-14">

          <button
            onClick={() => router.push("/owner-home")}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-10 transition"
          >
            <ArrowLeft className="w-5 h-5" />

            Back to Dashboard
          </button>

          <div className="flex flex-col xl:flex-row justify-between gap-12">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2">

                <ShieldCheck className="w-5 h-5" />

                <span className="font-semibold">
                  Active Property
                </span>

              </div>

              <h1 className="text-5xl font-bold mt-7">

                {property.name}

              </h1>

              <div className="flex items-center gap-3 mt-5 text-xl text-blue-100">

                <MapPin className="w-6 h-6" />

                {property.address}

              </div>

              <p className="mt-8 text-lg text-blue-100 max-w-2xl leading-8">

                Manage your property information, cleaning schedule,
                maintenance requests, invoices and Airbnb connection
                from one place.

              </p>

            </div>

            <div className="bg-white rounded-[34px] text-slate-800 shadow-2xl p-8 min-w-[340px]">

              <p className="uppercase tracking-[3px] text-[#2E7BBE] text-sm font-semibold">

                Property Summary

              </p>

              <div className="space-y-7 mt-8">

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Cleanings
                  </span>

                  <span className="font-bold">
                    {schedules.length}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Receipts
                  </span>

                  <span className="font-bold">
                    {receipts.length}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Maintenance
                  </span>

                  <span className="font-bold">
                    {issues.length}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Status
                  </span>

                  <span className="text-green-600 font-bold">
                    Active
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
            {/* ================= OVERVIEW ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-12">

        <div className="grid xl:grid-cols-2 gap-8">

          {/* General Information */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <Home className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">
                General Information
              </h2>

            </div>

            <div className="space-y-5">

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Property Name
                </span>

                <span className="font-semibold">
                  {property.name}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Address
                </span>

                <span className="font-semibold text-right max-w-xs">
                  {property.address}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Cleaning Price
                </span>

                <span className="font-semibold">
                  ${property.company_price}
                </span>

              </div>

            </div>

          </div>

          {/* Access Information */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <KeyRound className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">
                Access Information
              </h2>

            </div>

            <div className="space-y-5">

              <div>

                <p className="text-slate-500 mb-2">
                  Door Code
                </p>

                <p className="font-semibold">
                  {property.door_code || "Not Available"}
                </p>

              </div>

              <div>

                <p className="text-slate-500 mb-2">
                  Parking
                </p>

                <p className="font-semibold">
                  {property.parking || "Not Available"}
                </p>

              </div>

              <div>

                <p className="text-slate-500 mb-2">
                  WiFi
                </p>

                <p className="font-semibold">
                  {property.wifi || "Not Available"}
                </p>

              </div>

            </div>

          </div>

         {/* Airbnb Connection */}

<div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

  <div className="flex items-center justify-between">

    <div className="flex items-center gap-3">

      <Building2 className="w-7 h-7 text-[#FF5A5F]" />

      <h2 className="text-2xl font-bold text-slate-800">
        Airbnb Connection
      </h2>

    </div>

    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
    property.airbnb_calendar_url
  ? "bg-yellow-100 text-yellow-700"
  : "bg-slate-100 text-slate-600" 
      }`}
    >
      property.airbnb_calendar_url
  ? "Configuration Saved"
  : "Not Configured"
    </span>

  </div>

  <div className="space-y-6 mt-8">

    <div>

      <p className="text-slate-500 text-sm">

        Listing URL

      </p>

      <p className="font-medium break-all mt-2">

        {property.airbnb_listing_url ||
          "No listing connected"}

      </p>

    </div>

    <div>

      <p className="text-slate-500 text-sm">

        Calendar URL

      </p>

      <p className="font-medium break-all mt-2">

        {property.airbnb_calendar_url ||
          "No calendar connected"}

      </p>

    </div>

    <div>

      <p className="text-slate-500 text-sm">

        Last Sync

      </p>

      <p className="font-medium mt-2">

        {property.last_airbnb_sync
          ? new Date(
              property.last_airbnb_sync
            ).toLocaleString()
          : "Never"}

      </p>

    </div>

  </div>

  <div className="grid grid-cols-2 gap-4 mt-10">

    <button
      onClick={() => setShowAirbnbModal(true)}
      className="rounded-2xl bg-[#FF5A5F] hover:bg-[#E14D52] text-white py-4 font-semibold transition"
    >

      Edit Connection

    </button>

    <button
      disabled={!property.airbnb_listing_url}
      onClick={() =>
        window.open(
          property.airbnb_listing_url,
          "_blank"
        )
      }
      className="rounded-2xl border-2 border-[#FF5A5F] text-[#FF5A5F] hover:bg-[#FF5A5F] hover:text-white py-4 font-semibold transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#FF5A5F]"
    >

      <div className="flex items-center justify-center gap-2">

        <ExternalLink className="w-5 h-5" />

        Open Listing

      </div>

    </button>

  </div>

</div>

          {/* Calendar Sync */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <CalendarDays className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">
                Calendar Sync
              </h2>

            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

              <p className="text-slate-500">
                Synchronization Status
              </p>

              <p className="font-bold text-xl mt-2 text-orange-500">
                Pending Airbnb Connection
              </p>

            </div>

            <p className="text-slate-500 mt-6">

              Once Airbnb is connected, reservations and future cleanings will automatically appear here.

            </p>

          </div>

        </div>

      </section>
            {/* ================= CLEANINGS ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-12">

        <div className="grid xl:grid-cols-2 gap-8">

          {/* Upcoming Cleanings */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <CalendarDays className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">
                Upcoming Cleanings
              </h2>

            </div>

            {schedules.filter(
              (schedule) => schedule.status !== "Completed"
            ).length === 0 ? (

              <div className="py-16 text-center">

                <CalendarDays className="w-16 h-16 text-slate-300 mx-auto" />

                <p className="text-slate-500 mt-6">
                  No upcoming cleanings scheduled.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {schedules
                  .filter(
                    (schedule) => schedule.status !== "Completed"
                  )
                  .slice(0, 5)
                  .map((schedule) => {

                    const employee =
                      employees.find(
                        (e) =>
                          Number(e.id) ===
                          Number(schedule.employee_id)
                      );

                    return (

                      <div
                        key={schedule.id}
                        className="rounded-2xl border border-slate-200 p-5 hover:border-[#2E7BBE] transition"
                      >

                        <div className="flex justify-between items-center">

                          <div>

                            <p className="font-bold text-slate-800">
{formatScheduleDate(schedule.cleaning_date)}
                            </p>

                            <p className="text-slate-500 mt-2">

                              {employee?.name || "Unassigned"}

                            </p>

                          </div>

                          <span className="bg-blue-100 text-[#2E7BBE] px-4 py-2 rounded-full text-sm font-semibold">

                            {schedule.status}

                          </span>

                        </div>

                      </div>

                    );

                  })}

              </div>

            )}

          </div>

          {/* Cleaning History */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <Home className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">
                Cleaning History
              </h2>

            </div>

            {schedules.filter(
              (schedule) => schedule.status === "Completed"
            ).length === 0 ? (

              <div className="py-16 text-center">

                <Home className="w-16 h-16 text-slate-300 mx-auto" />

                <p className="text-slate-500 mt-6">
                  No completed cleanings yet.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {schedules
                  .filter(
                    (schedule) =>
                      schedule.status === "Completed"
                  )
                  .slice(0, 5)
                  .map((schedule) => {

                    const employee =
                      employees.find(
                        (e) =>
                          Number(e.id) ===
                          Number(schedule.employee_id)
                      );

                    return (

                      <div
                        key={schedule.id}
                        className="flex gap-4"
                      >

                        <div className="w-4 flex justify-center">

                          <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>

                        </div>

                        <div className="flex-1 pb-6 border-l border-slate-200 pl-6">

                          <p className="font-bold text-slate-800">

                           {formatScheduleDate(schedule.cleaning_date)}

                          </p>

                          <p className="text-slate-500 mt-2">

                            Completed by{" "}
                            {employee?.name || "Unknown"}

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
            {/* ================= RECEIPTS / MAINTENANCE / NOTES ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-12">

        <div className="grid gap-8">

          {/* RECEIPTS */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <Receipt className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">

                Receipts

              </h2>

            </div>

            {receipts.length === 0 ? (

              <div className="py-16 text-center">

                <Receipt className="w-16 h-16 mx-auto text-slate-300" />

                <p className="text-slate-500 mt-6">

                  No receipts available.

                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {receipts.map((receipt) => (

                  <div
                    key={receipt.id}
                    className="rounded-2xl border border-slate-200 p-6 hover:border-[#2E7BBE] transition"
                  >

                    <div className="flex flex-col md:flex-row justify-between gap-6">

                      <div>

                        <h3 className="font-bold text-lg text-slate-800">

                          {receipt.title || "Cleaning Receipt"}

                        </h3>

                        <p className="text-slate-500 mt-2">

                          {receipt.description || "No description available."}

                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-sm text-slate-500">

                          Amount

                        </p>

                        <p className="text-2xl font-bold text-[#2E7BBE]">

                          ${receipt.amount}

                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* MAINTENANCE */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <Wrench className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">

                Maintenance Issues

              </h2>

            </div>

            {issues.length === 0 ? (

              <div className="py-16 text-center">

                <Wrench className="w-16 h-16 mx-auto text-slate-300" />

                <p className="text-slate-500 mt-6">

                  No maintenance issues reported.

                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {issues.map((issue) => (

                  <div
                    key={issue.id}
                    className="rounded-2xl border border-slate-200 p-6"
                  >

                    <div className="flex justify-between gap-6">

                      <div>

                        <h3 className="font-bold text-xl text-slate-800">

                          {issue.issue_type}

                        </h3>

                        <p className="text-slate-500 mt-3">

                          {issue.notes}

                        </p>

                        <p className="text-sm text-slate-400 mt-4">

                          {new Date(
                            issue.reported_at
                          ).toLocaleDateString()}

                        </p>

                      </div>

                      <span
                        className={`h-fit px-5 py-2 rounded-full font-semibold ${
                          issue.status === "Open"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >

                        {issue.status}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* NOTES */}

          <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 p-8">

            <div className="flex items-center gap-3 mb-8">

              <StickyNote className="w-7 h-7 text-[#2E7BBE]" />

              <h2 className="text-2xl font-bold text-slate-800">

                Property Notes

              </h2>

            </div>

            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-8">

              <p className="text-slate-600 leading-8 text-lg">

                {property.notes || "No notes available for this property."}

              </p>

            </div>

          </div>

        </div>

      </section>
            {/* ================= PROPERTY STATEMENT ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-12 mb-14">

        <div className="rounded-[36px] overflow-hidden bg-gradient-to-r from-[#1E4F85] to-[#2E7BBE] shadow-2xl text-white">

          <div className="p-12 flex flex-col xl:flex-row justify-between gap-10">

            <div className="max-w-3xl">

              <p className="uppercase tracking-[4px] text-blue-200 text-sm font-semibold">

                Financial Overview

              </p>

              <h2 className="text-4xl font-bold mt-4">

                Property Statement

              </h2>

              <p className="text-blue-100 text-lg leading-8 mt-5">

                View your complete financial statement including completed
                cleanings, additional services, maintenance expenses and
                monthly billing history.

              </p>

              <button
                onClick={() =>
                  router.push(`/owner-statement/${property.id}`)
                }
                className="mt-8 bg-white text-[#2E7BBE] rounded-2xl px-8 py-4 font-bold hover:scale-105 transition-all duration-300"
              >

                <div className="flex items-center gap-3">

                  <FileText className="w-5 h-5" />

                  View Full Statement

                </div>

              </button>

            </div>

            <div className="bg-white text-slate-800 rounded-[30px] p-8 min-w-[340px] shadow-xl">

              <div className="flex items-center gap-3">

                <Building2 className="w-7 h-7 text-[#FF5A5F]" />

                <h3 className="text-2xl font-bold">

                  Airbnb Sync

                </h3>

              </div>

              <div className="space-y-6 mt-8">

                <div className="flex justify-between">

                  <span className="text-slate-500">

                    Status

                  </span>

                  <span className="text-orange-500 font-bold">

                    Awaiting Connection

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">

                    Last Sync

                  </span>

                  <span className="font-semibold">

                    —

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">

                    Upcoming Reservation

                  </span>

                  <span className="font-semibold">

                    —

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">

                    Calendar

                  </span>

                  <span className="font-semibold">

                    Not Connected

                  </span>

                </div>

              </div>

              <button
                disabled
                className="mt-8 w-full rounded-2xl bg-slate-200 text-slate-500 py-4 font-semibold cursor-not-allowed"
              >

                Sync Airbnb (Coming Soon)

              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="pb-10 text-center">

        <p className="text-slate-500">

          Powered by <span className="font-semibold">PureSpace Cleaning</span>

        </p>

        <p className="text-slate-400 mt-2">

          Professional Property Management Platform

        </p>

      </footer>
      {/* ================= AIRBNB MODAL ================= */}

      {showAirbnbModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">

          <div className="bg-white rounded-[34px] shadow-2xl w-full max-w-2xl p-8">

            <div className="flex items-center justify-between">

              <h2 className="text-3xl font-bold text-slate-800">

                Connect Airbnb

              </h2>

              <button
                onClick={() => setShowAirbnbModal(false)}
                className="text-slate-400 hover:text-slate-700 text-3xl"
              >

                ×

              </button>

            </div>

            <p className="text-slate-500 mt-3 leading-7">

              Connect your Airbnb listing to automatically synchronize reservations and generate cleanings.

            </p>

            <div className="mt-8 space-y-6">

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">

                  Airbnb Listing URL

                </label>

                <input
                  type="text"
                  value={listingUrl}
                  onChange={(e) =>
                    setListingUrl(e.target.value)
                  }
                  placeholder="https://www.airbnb.com/rooms/..."
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-[#FF5A5F]"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">

                  Airbnb Calendar (.ics)

                </label>

                <input
                  type="text"
                  value={calendarUrl}
                  onChange={(e) =>
                    setCalendarUrl(e.target.value)
                  }
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-[#FF5A5F]"
                />

              </div>

            </div>

            <div className="flex justify-end gap-4 mt-10">

              <button
                onClick={() => setShowAirbnbModal(false)}
                className="px-7 py-4 rounded-2xl border border-slate-300 font-semibold"
              >

                Cancel

              </button>
<button
  onClick={saveAirbnbConnection}
  disabled={savingAirbnb}
  className="px-8 py-4 rounded-2xl bg-[#FF5A5F] text-white font-semibold hover:bg-[#E14D52] disabled:opacity-50"
>

  {savingAirbnb
    ? "Saving..."
    : "Save Connection"}

</button>

            </div>

          </div>

        </div>

      )}
    </main>

  );

}