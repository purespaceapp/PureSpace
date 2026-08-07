"use client";

import { downloadInvoice } from "@/lib/invoice";
import { useEffect, useState } from "react";
import { getCleanerSchedule } from "@/lib/cleaner";
import { getScheduleExtras } from "@/lib/extras";
import { getProperties } from "@/lib/properties";
import { getApprovedCleanerReceipts } from "@/lib/receipts";
export default function CleanerPage() {

  // ⚠️ Temporal
  // Luego iniciaremos sesión y este número saldrá automáticamente.
  
const [employeeId, setEmployeeId] = useState(0);

  const [jobs, setJobs] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const jobsByDate = jobs.reduce(
    
    

  (acc: any, job: any) => {

    if (!acc[job.cleaning_date]) {

      acc[job.cleaning_date] = [];

    }

    acc[job.cleaning_date].push(job);

    return acc;

  },

  {}

);


  const [properties, setProperties] = useState<any[]>([]);
  const [approvedReceipts, setApprovedReceipts] = useState<any[]>([]);
  
const receiptTotal = approvedReceipts.reduce(

  (sum, receipt) =>

    sum + Number(receipt.amount),

  0

);

const grandTotal =
  jobs.reduce(

    (sum, job) =>

      sum + Number(job.cleaner_pay),

    0

  ) + receiptTotal;

  useEffect(() => {
    const id = Number(
  sessionStorage.getItem("employeeId") || "0"
);

setEmployeeId(id);

if (!id) {
  window.location.href = "/cleaner-login";
  return;
}

    async function load() {
const employeeData = JSON.parse(

  sessionStorage.getItem("employee") || "null"

);

setEmployee(employeeData);
      const propertyData = await getProperties();

      setProperties(propertyData);

      const schedule =
  await getCleanerSchedule(id);

const receipts =
  await getApprovedCleanerReceipts(id);

setApprovedReceipts(receipts);

      const jobsWithExtras =
        await Promise.all(

          schedule.map(async (job) => ({

            ...job,

            extras:
              await getScheduleExtras(job.id),

          }))

        );

      setJobs(jobsWithExtras);

    }

    load();

  }, []);

  return (

    <div className="min-h-screen bg-[#F5F7FA] p-8">

      <h1 className="text-4xl font-bold text-[#2E7BBE]">

        👋 Hello Cleaner

      </h1>

      <p className="text-gray-500 mt-2">

        Current Pay Period

      </p>

      <div className="mt-10 space-y-6">

        {Object.entries(jobsByDate).map(

  ([date, dayJobs]: any) => {

   const dayTotal =
  dayJobs.reduce(

    (sum: number, job: any) =>

      sum + Number(job.cleaner_pay),

    0

  ) +

  approvedReceipts
    .filter((receipt: any) =>
      dayJobs.some(
        (job: any) =>
          job.id === receipt.schedule_id
      )
    )
    .reduce(
      (sum: number, receipt: any) =>
        sum + Number(receipt.amount),
      0
    );

    return (

      <div
        key={date}
        className="bg-white rounded-3xl shadow-lg overflow-hidden"
      >

        <div className="bg-[#0F1C3F] text-white flex justify-between px-6 py-4">

          <span>
            📅 {date}
          </span>

          <span className="font-bold">
            ${dayTotal}
          </span>

        </div>

        <div className="p-6 space-y-5">

          {dayJobs.map((job: any) => {

            const property = properties.find(
              (p) => p.id === job.property_id
            );

            return (

              <div key={job.id}>

                <div className="flex justify-between">

                  <span className="text-xl font-semibold">

                    {property?.name}

                  </span>

                  <span>

                    ${property?.cleaner_price}

                  </span>

                </div>

                {job.extras?.length > 0 && (

                  <div className="mt-2 ml-4 space-y-1">

                   {job.extras.map((extra: any) => {

  const cleanerExtra =

    extra.extra_id === 1 ? 16 :

    extra.extra_id === 2 ? 18 :

    extra.extra_id === 3 ? 25 :

    extra.extra_id === 4 ? 10 :

    extra.extra_id === 5 ? 15 :

    extra.extra_id === 6 ? 15 :

    extra.extra_id === 7 ? 18 :

    extra.extra_id === 8 ? 18 :

    0;

  return (

    <div
      key={extra.extra_id}
      className="flex justify-between text-gray-600"
    >

      <span>

        {extra.extra_id === 1 && "🧺 Laundry"}
        {extra.extra_id === 2 && "🕒 Extra Hour"}
        {extra.extra_id === 3 && "🧼 Deep Clean"}
        {extra.extra_id === 4 && "🪟 Windows"}
        {extra.extra_id === 5 && "🐶 Pet Hair"}
        {extra.extra_id === 6 && "🛏️ Extra Linen"}
        {extra.extra_id === 7 && "☣️ Biohazard"}
        {extra.extra_id === 8 && "🌿 Balcony"}

        {" ×"}

        {extra.quantity}

      </span>

      <span className="font-medium text-green-600">

        +$
        {cleanerExtra * extra.quantity}

      </span>

    </div>

  );

})}

                  </div>

                )}
{approvedReceipts
  .filter(
    (receipt: any) =>
      receipt.schedule_id === job.id
  )
  .map((receipt: any) => (

    <div
      key={receipt.id}
      className="flex justify-between ml-4 text-blue-600"
    >
      <span>
        🧾 Receipt
      </span>

      <span className="font-medium">
        +${Number(receipt.amount).toFixed(2)}
      </span>
    </div>

))}
              </div>

            );

          })}

        </div>

      </div>

    );

  }

)}

<div className="bg-[#0F1C3F] text-white rounded-3xl p-8 flex justify-between text-3xl font-bold">

  <span>

    Grand Total

  </span>

  <span>

    ${grandTotal}

  </span>

</div>
<div className="mt-6 space-y-4">

  <button
    onClick={() =>
      downloadInvoice(
  employee,
  jobs,
  properties,
  grandTotal,
  approvedReceipts
)
    }
    className="w-full bg-[#2E7BBE] hover:bg-[#23649D] text-white py-4 rounded-2xl text-lg font-semibold shadow-lg"
  >
    ⬇ Download Payment Invoice
  </button>

  <button
    onClick={() => {
      window.location.href = "/cleaner/inventory";
    }}
    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg"
  >
    📦 Inventory
  </button>

</div>
      </div>

    </div>

  );

}