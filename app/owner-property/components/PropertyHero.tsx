"use client";

import { useRouter } from "next/navigation";
type Props = {
  property: any;
  schedules: any[];
  receipts: any[];
};
export default function PropertyHero({
  property,
  schedules,
  receipts,
}: Props) {

  const nextCleaning =
    schedules.find(
      (s) => s.status !== "Completed"
    );
    const router = useRouter();

  return (

  <div className="rounded-3xl bg-gradient-to-r from-[#2E7BBE] to-[#4A90E2] text-white p-8 shadow-xl">

    <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-8">

      <div className="flex-1">

        <button
          onClick={() => router.push("/owner-home")}
          className="bg-white/20 hover:bg-white/30 transition px-5 py-2 rounded-xl mb-6"
        >
          ← Back to Properties
        </button>

        <h1 className="text-4xl font-bold">
          🏠 {property.name}
        </h1>

        <p className="text-blue-100 text-lg mt-2">
          📍 {property.address}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
          <span className="text-green-300">●</span>
          <span>Active Property</span>
        </div>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white/15 rounded-2xl p-5 min-w-[170px]">
          <p className="text-blue-100 text-sm">
            💰 Service Price
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ${property.company_price}
          </h2>
        </div>

        <div className="bg-white/15 rounded-2xl p-5 min-w-[170px]">
          <p className="text-blue-100 text-sm">
            🧹 Next Cleaning
          </p>

          <h2 className="text-lg font-bold mt-2">
            {nextCleaning ? nextCleaning.cleaning_date : "--"}
          </h2>
        </div>

        <div className="bg-white/15 rounded-2xl p-5 min-w-[170px]">
          <p className="text-blue-100 text-sm">
            🧾 Approved
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {receipts.length}
          </h2>
        </div>

        <div className="bg-white/15 rounded-2xl p-5 min-w-[170px]">
          <p className="text-blue-100 text-sm">
            📅 Upcoming
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              schedules.filter(
                s => s.status !== "Completed"
              ).length
            }
          </h2>
        </div>

      </div>

    </div>

  </div>

  );

}