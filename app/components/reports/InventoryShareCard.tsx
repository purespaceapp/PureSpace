import React from "react";
import {
  Bath,
  CalendarDays,
  CookingPot,
  Sparkles,
  UserRound,
  WashingMachine,
  Wrench,
  Home,
  StickyNote,
} from "lucide-react";

type CleanerSupplyValue = {
  unit: "Gallon" | "Bottle";
  quantity: number;
};

type InventoryShareCardProps = {
  property: string;
  cleaner: string;
  date: string;
  inventory: Record<string, number>;
  cleanerSupplies?: Record<string, CleanerSupplyValue>;
  notes: string;
};

const sections = [
  {
    title: "Kitchen",
    description: "Kitchen supplies and consumables",
    icon: CookingPot,
    iconBg: "bg-blue-50",
    iconColor: "text-[#2E7BBE]",
    items: [
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
    ],
  },
  {
    title: "Bathroom",
    description: "Bathroom and guest essentials",
    icon: Bath,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    items: ["Toilet Paper", "Body Wash", "Shampoo", "Conditioner", "Hand Soap"],
  },
  {
    title: "Laundry",
    description: "Laundry and cleaning products",
    icon: WashingMachine,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    items: ["Laundry Pods", "Bleach", "All Purpose Cleaner", "Floor Cleaner", "Glass Cleaner"],
  },
  {
    title: "Maintenance",
    description: "Basic maintenance supplies",
    icon: Wrench,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    items: ["Light Bulbs", "Batteries"],
  },
];

const cleanerSupplyItems = ["WINDEX", "LYSOL", "CLOROX", "PINESOL", "VIM CREAM"];

function InventorySection({
  title,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  items,
  inventory,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  items: string[];
  inventory: Record<string, number>;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#172A3F]">{title}</h3>
          <p className="mt-0.5 text-[10px] text-slate-400">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="divide-y divide-slate-100">
          {items.filter((_, index) => index % 2 === 0).map((item) => (
            <div key={item} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="text-xs font-semibold text-slate-600">{item}</span>
              <span className="min-w-[34px] rounded-full bg-[#EEF6FF] px-2.5 py-1 text-center text-xs font-extrabold text-[#2E7BBE]">
                {inventory[item] ?? 0}
              </span>
            </div>
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {items.filter((_, index) => index % 2 === 1).map((item) => (
            <div key={item} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="text-xs font-semibold text-slate-600">{item}</span>
              <span className="min-w-[34px] rounded-full bg-[#EEF6FF] px-2.5 py-1 text-center text-xs font-extrabold text-[#2E7BBE]">
                {inventory[item] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function InventoryShareCard({
  property,
  cleaner,
  date,
  inventory,
  cleanerSupplies = {},
  notes,
}: InventoryShareCardProps) {
  return (
    <div className="w-[900px] bg-[#F4F8FC] p-8 font-sans text-[#14263A]">
      <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
        <header className="bg-[#0F1C3F] px-8 py-7 text-white">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                PureSpace Cleaning
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Unit Inventory Report</h1>
              <p className="mt-1 text-sm text-blue-100/70">Supplies remaining after today&apos;s cleaning</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">📦</div>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-4 p-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#2E7BBE]">
              <Home className="h-4 w-4" /> Property
            </div>
            <p className="mt-2 text-sm font-extrabold text-[#172A3F]">{property || "—"}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <UserRound className="h-4 w-4" /> Cleaner
            </div>
            <p className="mt-2 text-sm font-extrabold text-[#172A3F]">{cleaner || "—"}</p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-purple-700">
              <CalendarDays className="h-4 w-4" /> Date
            </div>
            <p className="mt-2 text-sm font-extrabold text-[#172A3F]">{date || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 px-6 pb-6">
          {sections.map((section) => (
            <InventorySection key={section.title} {...section} inventory={inventory} />
          ))}
        </div>

        <section className="mx-6 mb-6 overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#172A3F]">Cleaner Supplies</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">Products carried by the cleaner</p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="divide-y divide-slate-100">
              {cleanerSupplyItems.filter((_, index) => index % 2 === 0).map((item) => {
                const value = cleanerSupplies[item] ?? { unit: "Bottle", quantity: 0 };
                return (
                  <div key={item} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="text-xs font-semibold text-slate-600">{item}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                      {value.quantity} {value.unit}{value.quantity === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="divide-y divide-slate-100">
              {cleanerSupplyItems.filter((_, index) => index % 2 === 1).map((item) => {
                const value = cleanerSupplies[item] ?? { unit: "Bottle", quantity: 0 };
                return (
                  <div key={item} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="text-xs font-semibold text-slate-600">{item}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                      {value.quantity} {value.unit}{value.quantity === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-6 mb-7 rounded-[24px] border border-amber-100 bg-amber-50/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <StickyNote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-800">Notes</h3>
              <p className="text-[10px] text-amber-700/70">Office observations</p>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">{notes?.trim() || "No notes"}</p>
        </section>

        <footer className="border-t border-slate-100 px-6 py-4 text-center text-[10px] font-medium text-slate-400">
          PureSpace Cleaning · Inventory Management
        </footer>
      </div>
    </div>
  );
}
