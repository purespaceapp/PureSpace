"use client";
import Image from "next/image";
type Props = {
  property: string;
  cleaner: string;
  date: string;
  inventory: Record<string, number>;
  notes: string;
};

export default function InventoryShareCard({
  property,
  cleaner,
  date,
  inventory,
  notes,
}: Props) {
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
  return (
    <div
  id="inventory-share-card"
  className="w-[900px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-200"
>

  <div className="bg-[#2E7BBE] text-white px-10 py-8 flex justify-between items-center">

    <div>

      <h1 className="text-5xl font-extrabold tracking-wide">
        PURESPACE CLEANING
      </h1>

      <p className="text-xl text-blue-100 mt-2">
        Unit Inventory Report
      </p>

    </div>

   <Image
  src="/images/logo.jpg"
  alt="PureSpace Logo"
  width={110}
  height={110}
  priority
  unoptimized
  className="object-contain"
/>

  </div>

  <div className="p-10">

    <div className="grid grid-cols-3 gap-6 mb-10">

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">

        <div className="text-blue-600 font-bold uppercase text-sm">
          Property
        </div>

        <div className="text-2xl font-bold mt-3">
          {property}
        </div>

      </div>

      <div className="rounded-3xl border border-green-100 bg-green-50 p-6">

        <div className="text-green-600 font-bold uppercase text-sm">
          Cleaner
        </div>

        <div className="text-2xl font-bold mt-3">
          {cleaner}
        </div>

      </div>

      <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6">

        <div className="text-purple-600 font-bold uppercase text-sm">
          Date
        </div>

        <div className="text-2xl font-bold mt-3">
          {date}
        </div>

      </div>

    </div>
<div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 mb-8">

  <h2 className="text-2xl font-bold text-blue-700 mb-6">
    🍽 Kitchen
  </h2>
{kitchenItems.map((item) => {

  const value = inventory[item] ?? 0;

  return (

    <div
      key={item}
      className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-4 mb-3 shadow-sm"
    >

      <span className="font-medium text-slate-700">
        {item}
      </span>

      <div
        className={`min-w-[52px] text-center rounded-xl px-3 py-1 font-bold text-lg
        ${
          value === 0
            ? "bg-red-100 text-red-600"
            : value <= 2
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {value}
      </div>

    </div>

  );

})}

  </div>

<div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-8 mb-8">

  <h2 className="text-2xl font-bold text-cyan-700 mb-6">
    🛁 Bathroom
  </h2>


  {bathroomItems.map((item) => {

  const value = inventory[item] ?? 0;

  return (

    <div
      key={item}
      className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-4 mb-3 shadow-sm"
    >

      <span className="font-medium text-slate-700">
        {item}
      </span>

      <div
        className={`min-w-[52px] text-center rounded-xl px-3 py-1 font-bold text-lg
        ${
          value === 0
            ? "bg-red-100 text-red-600"
            : value <= 2
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {value}
      </div>

    </div>

  );

})}

</div>

<div className="rounded-3xl border border-purple-100 bg-purple-50 p-8 mb-8">

  <h2 className="text-2xl font-bold text-purple-700 mb-6">
    🧺 Laundry
  </h2>

  {laundryItems.map((item) => {

  const value = inventory[item] ?? 0;

  return (

    <div
      key={item}
      className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-4 mb-3 shadow-sm"
    >

      <span className="font-medium text-slate-700">
        {item}
      </span>

      <div
        className={`min-w-[52px] text-center rounded-xl px-3 py-1 font-bold text-lg
        ${
          value === 0
            ? "bg-red-100 text-red-600"
            : value <= 2
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {value}
      </div>

    </div>

  );

})}
</div>

<div className="rounded-3xl border border-orange-100 bg-orange-50 p-8 mb-8">

  <h2 className="text-2xl font-bold text-orange-700 mb-6">
    🔧 Maintenance
  </h2>
{maintenanceItems.map((item) => {

  const value = inventory[item] ?? 0;

  return (

    <div
      key={item}
      className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-4 mb-3 shadow-sm"
    >

      <span className="font-medium text-slate-700">
        {item}
      </span>

      <div
        className={`min-w-[52px] text-center rounded-xl px-3 py-1 font-bold text-lg
        ${
          value === 0
            ? "bg-red-100 text-red-600"
            : value <= 2
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {value}
      </div>

    </div>

  );

})}

</div>

<div className="rounded-3xl border border-amber-100 bg-amber-50 p-8">

  <h2 className="text-2xl font-bold text-amber-700 mb-4">
    📝 Notes
  </h2>

  <p>{notes || "No notes"}</p>


</div>

</div>

</div>

);
}