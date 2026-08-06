"use client";

import { useEffect, useState } from "react";
import {
  getReceipts,
  updateReceiptStatus,
} from "@/lib/receipts";
import { getEmployees } from "@/lib/employees";
import { getProperties } from "@/lib/properties";

export default function DashboardReceiptsPage() {

  const [receipts, setReceipts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  async function loadData() {

    const receiptData = await getReceipts();
    const employeeData = await getEmployees();
    const propertyData = await getProperties();

    setReceipts(receiptData);
    setEmployees(employeeData);
    setProperties(propertyData);

  }

  useEffect(() => {

    loadData();

  }, []);

  async function changeStatus(
    id: number,
    status: string
  ) {

    await updateReceiptStatus(id, status);

    await loadData();

  }

  return (

    <main className="min-h-screen bg-[#F5F7FA] p-10">

      <h1 className="text-4xl font-bold text-[#2E7BBE]">

        🧾 Receipt Approval

      </h1>

      <p className="text-gray-500 mt-2">

        Review receipts submitted by cleaners.

      </p>

      <div className="mt-10 space-y-5">

        {receipts.map((receipt) => {

          const employee = employees.find(
            (e) => e.id === receipt.employee_id
          );

          const property = properties.find(
            (p) => p.id === receipt.property_id
          );

          return (

            <div
              key={receipt.id}
              className="bg-white rounded-3xl shadow-lg p-6"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-2xl font-bold">

                    {employee?.name}

                  </h2>

                  <p className="text-gray-500">

                    {property?.name}

                  </p>

                  <p className="font-bold mt-2">

                    ${receipt.amount}

                  </p>

                  <p className="text-sm text-gray-400">

                    {receipt.purchase_date}

                  </p>

                </div>

                <div className="flex flex-col gap-3 items-end">

                  <div>

                    {receipt.status === "Pending" && "🟡 Pending"}
                    {receipt.status === "Approved" && "🟢 Approved"}
                    {receipt.status === "Rejected" && "🔴 Rejected"}

                  </div>

                  <a
                    href={receipt.receipt_photo}
                    target="_blank"
                    className="bg-[#2E7BBE] text-white px-5 py-2 rounded-xl"
                  >

                    View Receipt

                  </a>

                  {receipt.status === "Pending" && (
  <>
    <button
      onClick={() =>
        changeStatus(
          receipt.id,
          "Approved"
        )
      }
      className="bg-green-600 text-white px-5 py-2 rounded-xl w-full"
    >
      ✅ Approve
    </button>

    <button
      onClick={() =>
        changeStatus(
          receipt.id,
          "Rejected"
        )
      }
      className="bg-red-600 text-white px-5 py-2 rounded-xl w-full"
    >
      ❌ Reject
    </button>
  </>
)}

{receipt.status === "Approved" && (
  <button
    onClick={() =>
      changeStatus(
        receipt.id,
        "Pending"
      )
    }
    className="bg-yellow-500 text-white px-5 py-2 rounded-xl w-full"
  >
    ↩ Change to Pending
  </button>
)}

{receipt.status === "Rejected" && (
  <button
    onClick={() =>
      changeStatus(
        receipt.id,
        "Pending"
      )
    }
    className="bg-yellow-500 text-white px-5 py-2 rounded-xl w-full"
  >
    ↩ Change to Pending
  </button>
)}

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </main>

  );

}