"use client";

import { useEffect, useState } from "react";
import { getTodayCleanerSchedule } from "@/lib/cleaner";
import { getProperties } from "@/lib/properties";
import { downloadInventory } from "@/lib/inventory";
import { toPng } from "html-to-image";
import { useRef } from "react";
import InventoryShareCard from "../../components/reports/InventoryShareCard";
export default function InventoryPage() {

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

const dataUrl = await toPng(shareRef.current!, {
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white py-8 px-4">

      <div className="max-w-6xl mx-auto bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 md:p-10">

        <div className="flex items-center gap-4 mb-8">

  <div className="w-16 h-16 rounded-2xl bg-[#2E7BBE] flex items-center justify-center text-white text-3xl shadow-lg">
    📦
  </div>

  <div>

    <h1 className="text-4xl font-bold text-slate-800">
      Inventory Report
    </h1>

    <p className="text-slate-500 mt-1">
      Check the remaining supplies before leaving the property.
    </p>

  </div>

</div>

<div className="grid md:grid-cols-3 gap-6 bg-slate-50 rounded-3xl p-6 mb-10">
   <label className="font-semibold">
      Property
    </label>

    <select
      value={propertyId}
      onChange={(e)=>setPropertyId(e.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 mt-2 shadow-sm focus:ring-2 focus:ring-[#2E7BBE] outline-none"
    >

      <option value="">
        Select Property
      </option>

      {jobs.map((job)=>{

        const property =
          properties.find(
            p=>p.id===job.property_id
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

  </div>

  <div>

    <label className="font-semibold">
      Cleaner
    </label>

    <input
      value={employee?.name || ""}
      disabled
      className="w-full rounded-2xl border border-slate-200 bg-gray-100 px-4 py-3 mt-2 shadow-sm outline-none"
    />

  </div>

  <div>

    <label className="font-semibold">
      Date
    </label>

    <input
      value={new Date().toLocaleDateString()}
      disabled
     className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 mt-2 text-slate-700"
    />

  </div>

</div>

  <div>
    <div className="mt-10">
  <h2 className="text-3xl font-bold text-[#2E7BBE] mb-6">
    🍽 Kitchen
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    {kitchenItems.map((item) => (

      <div
        key={item}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex items-center justify-between"
      >

        <span>{item}</span>

        <select
          value={inventory[item] ?? 0}
          onChange={(e) =>
            setInventory({
              ...inventory,
              [item]: Number(e.target.value),
            })
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 mt-2 shadow-sm focus:ring-2 focus:ring-[#2E7BBE] outline-none"
        >
          {Array.from({ length: 21 }, (_, i) => (
            <option key={i}>{i}</option>
          ))}
        </select>

      </div>

    ))}

  </div>
</div>
<div className="mt-10">
  <h2 className="text-3xl font-bold text-[#2E7BBE] mb-6">
    🛁 Bathroom
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    {bathroomItems.map((item) => (

      <div
        key={item}
        className="flex items-center justify-between border rounded-xl p-4"
      >

        <span>{item}</span>

        <select
          value={inventory[item] ?? 0}
          onChange={(e)=>
            setInventory({
              ...inventory,
              [item]: Number(e.target.value),
            })
          }
          className="w-20 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-center font-semibold"
        >
          {Array.from({ length:21 },(_,i)=>(

            <option key={i} value={i}>
              {i}
            </option>

          ))}
        </select>

      </div>

    ))}

  </div>
</div>
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-5">
    🧺 Laundry
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    {laundryItems.map((item)=>(

      <div
        key={item}
        className="flex items-center justify-between border rounded-xl p-4"
      >

        <span>{item}</span>

        <select
          value={inventory[item] ?? 0}
          onChange={(e)=>
            setInventory({
              ...inventory,
              [item]: Number(e.target.value),
            })
          }
          className="border rounded-lg px-3 py-2"
        >
          {Array.from({ length:21 },(_,i)=>(

            <option key={i} value={i}>
              {i}
            </option>

          ))}
        </select>

      </div>

    ))}

  </div>
</div>
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-5">
    🔧 Maintenance
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    {maintenanceItems.map((item)=>(

      <div
        key={item}
        className="flex items-center justify-between border rounded-xl p-4"
      >

        <span>{item}</span>

        <select
          value={inventory[item] ?? 0}
          onChange={(e)=>
            setInventory({
              ...inventory,
              [item]: Number(e.target.value),
            })
          }
          className="border rounded-lg px-3 py-2"
        >
          {Array.from({ length:21 },(_,i)=>(

            <option key={i} value={i}>
              {i}
            </option>

          ))}
        </select>

      </div>

    ))}

  </div>
</div>
<div className="mt-10">

  <label className="text-2xl font-bold block mb-4">
    📝 Notes
  </label>

  <textarea
    value={notes}
    onChange={(e)=>setNotes(e.target.value)}
    rows={5}
    className="w-full rounded-2xl border border-slate-200 p-5 shadow-sm focus:ring-2 focus:ring-[#2E7BBE] outline-none"
    placeholder="Write any observations..."
  />

</div>
<div className="mt-10 flex justify-end">

  <button
    onClick={() => {

      const property = properties.find(
        (p) => String(p.id) === propertyId
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
    className="bg-[#2E7BBE] hover:bg-[#25659A] text-white font-bold px-8 py-4 rounded-2xl transition"
  >
    📄 Generate Inventory PDF
  </button>

  <button
  onClick={handleShareImage}
  className="ml-4 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl transition"
>
  📲 Share Inventory
</button>

</div>

   
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
      (p) => String(p.id) === propertyId
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

    </div>
  );
}