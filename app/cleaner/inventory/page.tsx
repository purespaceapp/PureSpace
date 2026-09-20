"use client";

import { useEffect, useRef, useState } from "react";
import { getTodayCleanerSchedule } from "@/lib/cleaner";
import { getProperties } from "@/lib/properties";
import { downloadInventory } from "@/lib/inventory";
import { toPng } from "html-to-image";
import InventoryShareCard from "../../components/reports/InventoryShareCard";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Home,
  Package,
  Send,
  Sparkles,
  StickyNote,
  UserRound,
  Wrench,
  Bath,
  CookingPot,
  WashingMachine,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState(0);
  const [employee, setEmployee] = useState<any>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const shareRef = useRef<HTMLDivElement>(null);

  const handleShareImage = async () => {
    if (!shareRef.current) return;

    const dataUrl = await toPng(shareRef.current, {
      cacheBust: true,
      pixelRatio: 4,
      backgroundColor: "#ffffff",
    });

    const blob = await (await fetch(dataUrl)).blob();

    const file = new File(
      [blob],
      "Inventory_Report.png",
      { type: "image/png" }
    );

    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      const property = properties.find(
        (p) => String(p.id) === propertyId
      );

      const message = `🧹 Inventory Report

📍 Property: ${property?.name ?? "Unknown"}

👤 Cleaner: ${employee?.name ?? ""}

📅 Date: ${new Date().toLocaleDateString()}

Attached is today's inventory report for review.

Thank you! ✅`;

      await navigator.share({
        title: "Inventory Report",
        text: message,
        files: [file],
      });

      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "Inventory_Report.png";
    link.click();
  };

  const kitchenItems = [
    "Paper Towels",
    "Garbage Bags",
    "Dish Soap Gallons",
    "Dishwasher Pods",
    "Coffee Pods",
    "Ground Coffee",
    "Sponges",
    "Salt",
    "Pepper",
    "Cooking Oil",
  ];

  const bathroomItems = [
    "Toilet Paper",
    "Body Wash",
    "Shampoo",
    "Conditioner",
    "Hand Soap",
  ];

  const laundryItems = [
    "Laundry Pods",
    "Bleach",
    "All Purpose Cleaner",
    "Floor Cleaner",
    "Glass Cleaner",
  ];

  const maintenanceItems = [
    "Light Bulbs",
    "Batteries",
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = Number(
      sessionStorage.getItem("employeeId") || "0"
    );

    const emp = JSON.parse(
      sessionStorage.getItem("employee") || "null"
    );

    setEmployeeId(id);
    setEmployee(emp);

    async function load() {
      const schedule =
        await getTodayCleanerSchedule(id);

      const propertyData =
        await getProperties();

      setJobs(schedule);
      setProperties(propertyData);
    }

    load();
  }, []);

  const selectedProperty = properties.find(
    (p) => String(p.id) === propertyId
  );

  const updateInventory = (
    item: string,
    value: number
  ) => {
    setInventory({
      ...inventory,
      [item]: value,
    });
  };

  const renderInventorySection = (
    title: string,
    description: string,
    items: string[],
    icon: React.ReactNode,
    iconBackground: string,
    iconColor: string
  ) => (
    <section className="overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

      {/* Section Header */}

      <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBackground} ${iconColor}`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <h2 className="text-lg font-bold text-[#172A3F] sm:text-xl">
            {title}
          </h2>

          <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
            {description}
          </p>

        </div>

      </div>

      {/* Items */}

      <div className="divide-y divide-slate-100">

        {items.map((item) => (

          <div
            key={item}
            className="flex min-h-[72px] items-center justify-between gap-4 px-5 py-3 sm:px-6"
          >

            <div className="min-w-0">

              <p className="text-sm font-semibold text-[#273B50] sm:text-[15px]">
                {item}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                Quantity remaining
              </p>

            </div>

            <div className="relative shrink-0">

              <select
                value={inventory[item] ?? 0}
                onChange={(e) =>
                  updateInventory(
                    item,
                    Number(e.target.value)
                  )
                }
                className="h-11 w-[76px] appearance-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 pr-8 text-center text-sm font-bold text-[#172A3F] outline-none transition focus:border-[#2E7BBE] focus:ring-2 focus:ring-[#2E7BBE]/15"
              >
                {Array.from(
                  { length: 21 },
                  (_, i) => (
                    <option
                      key={i}
                      value={i}
                    >
                      {i}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

            </div>

          </div>

        ))}

      </div>

    </section>
  );

  return (
    <main className="min-h-screen bg-[#F4F8FC] text-[#14263A]">

      {/* ===================================================== */}
      {/* BACKGROUND                                            */}
      {/* ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-[320px] w-[320px] rounded-full bg-cyan-200/20 blur-3xl sm:h-[420px] sm:w-[420px]" />

        <div className="absolute -right-32 top-20 h-[320px] w-[320px] rounded-full bg-blue-200/20 blur-3xl sm:h-[420px] sm:w-[420px]" />

      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-32 pt-4 sm:px-8 sm:pb-10 sm:pt-6">

        {/* =================================================== */}
        {/* TOP BAR                                             */}
        {/* =================================================== */}

        <header className="flex items-center justify-between">

          <button
            onClick={() => router.push("/cleaner-home")}
            className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-[#2E7BBE]"
          >

            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Back
            </span>

          </button>

          <div className="flex items-center gap-2.5">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">

              <Package className="h-5 w-5 text-[#2E7BBE]" />

            </div>

            <div className="hidden sm:block">

              <p className="text-sm font-extrabold tracking-tight">
                PureSpace
              </p>

              <p className="text-[8px] font-bold uppercase tracking-[1.8px] text-slate-400">
                Cleaner Workspace
              </p>

            </div>

          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[11px] font-semibold text-slate-500">
              Online
            </span>

          </div>

        </header>

        {/* =================================================== */}
        {/* HERO                                                 */}
        {/* =================================================== */}

        <section className="mt-5 rounded-[28px] bg-gradient-to-br from-[#174B7A] via-[#276FA9] to-[#3B93D3] px-5 py-6 text-white shadow-[0_18px_45px_rgba(35,93,139,0.18)] sm:mt-8 sm:rounded-[32px] sm:p-9">

          <div className="flex items-center justify-between gap-4">

            <div>

              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold">

                <Sparkles className="h-3 w-3" />

                Daily Inventory

              </div>

              <h1 className="text-[29px] font-black tracking-tight sm:text-4xl">
                Inventory Report
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-5 text-blue-100 sm:text-base sm:leading-6">
                Check your supplies before leaving
                the property.
              </p>

            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white/10 ring-1 ring-white/20 sm:flex">

              <Package className="h-9 w-9 text-white/85" />

            </div>

          </div>

        </section>

        {/* =================================================== */}
        {/* PROPERTY INFORMATION                                */}
        {/* =================================================== */}

        <section className="mt-5 rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:mt-6 sm:p-6">

          <div className="mb-5">

            <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#2E7BBE] sm:text-[10px]">
              Report Information
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#172A3F]">
              Property details
            </h2>

          </div>

          <div className="space-y-4">

            {/* Property */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                <Home className="h-3.5 w-3.5 text-[#2E7BBE]" />

                Property

              </label>

              <div className="relative">

                <select
                  value={propertyId}
                  onChange={(e) =>
                    setPropertyId(e.target.value)
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 pr-10 text-sm font-semibold text-[#172A3F] outline-none transition focus:border-[#2E7BBE] focus:ring-2 focus:ring-[#2E7BBE]/15"
                >

                  <option value="">
                    Select Property
                  </option>

                  {jobs.map((job) => {

                    const property =
                      properties.find(
                        (p) =>
                          p.id === job.property_id
                      );

                    return (
                      <option
                        key={job.id}
                        value={job.property_id}
                      >
                        {property?.name}
                      </option>
                    );

                  })}

                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              </div>

            </div>

            {/* Cleaner + Date */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                  <UserRound className="h-3.5 w-3.5 text-[#2E7BBE]" />

                  Cleaner

                </label>

                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">

                  {employee?.name || "—"}

                </div>

              </div>

              <div>

                <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                  <CalendarDays className="h-3.5 w-3.5 text-[#2E7BBE]" />

                  Date

                </label>

                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">

                  {new Date().toLocaleDateString()}

                </div>

              </div>

            </div>

          </div>

          {selectedProperty && (

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">

              <CheckCircle2 className="h-4 w-4" />

              {selectedProperty.name} selected

            </div>

          )}

        </section>

        {/* =================================================== */}
        {/* INVENTORY SECTIONS                                  */}
        {/* =================================================== */}

        <div className="mt-7 space-y-5 sm:mt-8 sm:space-y-6">

          {renderInventorySection(
            "Kitchen",
            "Kitchen supplies and consumables",
            kitchenItems,
            <CookingPot className="h-6 w-6" />,
            "bg-blue-50",
            "text-[#2E7BBE]"
          )}

          {renderInventorySection(
            "Bathroom",
            "Bathroom and guest essentials",
            bathroomItems,
            <Bath className="h-6 w-6" />,
            "bg-cyan-50",
            "text-cyan-600"
          )}

          {renderInventorySection(
            "Laundry",
            "Laundry and cleaning products",
            laundryItems,
            <WashingMachine className="h-6 w-6" />,
            "bg-purple-50",
            "text-purple-600"
          )}

          {renderInventorySection(
            "Maintenance",
            "Basic maintenance supplies",
            maintenanceItems,
            <Wrench className="h-6 w-6" />,
            "bg-amber-50",
            "text-amber-600"
          )}

        </div>

        {/* =================================================== */}
        {/* NOTES                                               */}
        {/* =================================================== */}

        <section className="mt-5 rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:mt-6 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

              <StickyNote className="h-5 w-5" />

            </div>

            <div>

              <h2 className="font-bold text-[#172A3F]">
                Notes
              </h2>

              <p className="text-xs text-slate-500">
                Add anything the office should know.
              </p>

            </div>

          </div>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows={4}
            className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2E7BBE] focus:ring-2 focus:ring-[#2E7BBE]/15"
            placeholder="Write any observations..."
          />

        </section>

        {/* =================================================== */}
        {/* DESKTOP ACTIONS                                     */}
        {/* =================================================== */}

        <section className="mt-6 hidden gap-3 sm:flex sm:justify-end">

          <button
            onClick={handleShareImage}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >

            <Send className="h-4 w-4" />

            Share Inventory

          </button>

          <button
            onClick={() => {

              const property = properties.find(
                (p) =>
                  String(p.id) === propertyId
              );

              if (!property) {
                alert("Please select a property.");
                return;
              }

              downloadInventory(
                employee,
                property,
                inventory,
                notes
              );

            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#25659A]"
          >

            <FileText className="h-4 w-4" />

            Generate Inventory PDF

          </button>

        </section>

        {/* =================================================== */}
        {/* MOBILE STICKY ACTIONS                               */}
        {/* =================================================== */}

        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">

          <div className="mx-auto flex max-w-md gap-2">

            <button
              onClick={handleShareImage}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white active:scale-[0.98]"
            >

              <Send className="h-4 w-4" />

              Share

            </button>

            <button
              onClick={() => {

                const property = properties.find(
                  (p) =>
                    String(p.id) === propertyId
                );

                if (!property) {
                  alert("Please select a property.");
                  return;
                }

                downloadInventory(
                  employee,
                  property,
                  inventory,
                  notes
                );

              }}
              className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] text-xs font-bold text-white active:scale-[0.98]"
            >

              <FileText className="h-4 w-4" />

              Generate PDF

            </button>

          </div>

        </div>

        {/* =================================================== */}
        {/* FOOTER                                              */}
        {/* =================================================== */}

        <footer className="mt-7 border-t border-slate-200/70 py-6 text-center text-[10px] text-slate-400 sm:flex sm:items-center sm:justify-between sm:text-xs">

          <span>
            PureSpace Cleaning
          </span>

          <span className="mt-1 block sm:mt-0">
            Inventory Management · v2.0
          </span>

        </footer>

        {/* =================================================== */}
        {/* HIDDEN SHARE CARD                                   */}
        {/* =================================================== */}

        <div
          style={{
            position: "absolute",
            left: "-10000px",
            top: "0",
          }}
        >

          <div ref={shareRef}>

            <InventoryShareCard
              property={
                properties.find(
                  (p) =>
                    String(p.id) === propertyId
                )?.name || ""
              }
              cleaner={employee?.name || ""}
              date={new Date().toLocaleDateString()}
              inventory={inventory}
              notes={notes}
            />

          </div>

        </div>

      </div>

    </main>
  );
}