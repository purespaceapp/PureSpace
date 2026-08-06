"use client";
import { getReceipts } from "@/lib/receipts";
import {
  saveReceipt,
  uploadReceiptPhoto
} from "@/lib/receipts";
import { useEffect, useState } from "react";
import { getEmployees } from "@/lib/employees";
import { getProperties } from "@/lib/properties";
import { getSchedulesByProperty } from "@/lib/schedule";

export default function ReceiptPage() {

  const [employees, setEmployees] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [amount, setAmount] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
const [schedules, setSchedules] = useState<any[]>([]);
const [scheduleId, setScheduleId] = useState("");
  useEffect(() => {

  async function load() {

    const employeeData = await getEmployees();

    const propertyData = await getProperties();
    const receiptData = await getReceipts(
  Number(employeeId)
);


setReceipts(receiptData);

    setEmployees(employeeData);

    setProperties(propertyData);

  }

  load();

}, []);


async function handleSubmit() {

if (
  !employeeId ||
  !propertyId ||
  !scheduleId ||
  !amount ||
  !photo
) {

    alert("Complete all fields.");

    return;

  }

  try {

    const photoUrl =
      await uploadReceiptPhoto(photo);

    await saveReceipt({
      

  employee_id: Number(employeeId),

  property_id: Number(propertyId),
schedule_id: Number(scheduleId),
  amount: Number(amount),

  receipt_photo: photoUrl,

  purchase_date:
  new Date()
    .toISOString()
    .split("T")[0],

  status: "Pending"

});


    alert("Receipt submitted!");

    setEmployeeId("");
    setPropertyId("");
    setAmount("");
    setPhoto(null);

  } catch (err: any) {

  console.error(err);

  alert(JSON.stringify(err));

}
}

  return (

    <div className="min-h-screen bg-[#F5F7FA] flex justify-center py-12">

      <div className="bg-white rounded-3xl shadow-xl w-[520px] p-10">

        <h1 className="text-4xl font-bold text-[#2E7BBE]">

          🧾 Submit Receipt

        </h1>

        <p className="text-gray-500 mt-2">

          Upload a purchase receipt

        </p>

        <div className="mt-8 space-y-6">

          <div>

            <label className="font-semibold">

              Cleaner

            </label>

            <select

  value={employeeId}

  onChange={async (e)=>{

    const id = e.target.value;

    setEmployeeId(id);

    const receiptData =
      await getReceipts(
        Number(id)
      );

    setReceipts(receiptData);

  }}
              className="w-full border rounded-xl p-4 mt-2"

            >

              <option value="">

                Select Cleaner

              </option>

              {employees.map(employee=>(

                <option

                  key={employee.id}

                  value={employee.id}

                >

                  {employee.name}

                </option>

              ))}

            </select>

          </div>

          <div>

            <label className="font-semibold">

              Property

            </label>

            <select
  value={propertyId}
  onChange={async (e) => {

    const id = e.target.value;

    setPropertyId(id);

    setScheduleId("");

    if (!id) {

      setSchedules([]);

      return;

    }

    const data =
      await getSchedulesByProperty(
        Number(id)
      );

    setSchedules(data);

  }}
  className="w-full border rounded-xl p-4 mt-2"
>

              <option value="">

                Select Property

              </option>

              {properties.map(property=>(

                <option

                  key={property.id}

                  value={property.id}

                >

                  {property.name}

                </option>

              ))}

            </select>
            <div>

  <label className="font-semibold">

    Cleaning

  </label>

  <select

    value={scheduleId}

    onChange={(e)=>setScheduleId(e.target.value)}

    className="w-full border rounded-xl p-4 mt-2"

  >

    <option value="">

      Select Cleaning

    </option>

    {schedules.map(schedule=>(

      <option
        key={schedule.id}
        value={schedule.id}
      >

        {schedule.cleaning_date}

      </option>

    ))}

  </select>

</div>

          </div>

          <div>

            <label className="font-semibold">

              Amount

            </label>

            <input

              value={amount}

              onChange={(e)=>setAmount(e.target.value)}

              placeholder="$0.00"

              className="w-full border rounded-xl p-4 mt-2"

            />

          </div>

          <div>

            <label className="font-semibold">

              Receipt Photo

            </label>

            <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setPhoto(e.target.files?.[0] || null)
  }
  className="w-full border rounded-xl p-4 mt-2"
/>

          </div>

          <button

  onClick={handleSubmit}

  className="w-full bg-[#2E7BBE] hover:bg-[#23649D] text-white py-4 rounded-2xl text-lg font-semibold"

>

Submit Receipt

</button>
<div className="mt-12">

  <h2 className="text-2xl font-bold mb-6">

    My Receipts

  </h2>

  <div className="space-y-4">

    {receipts.map((receipt) => {

      const employee =
        employees.find(
          e => e.id === receipt.employee_id
        );

      const property =
        properties.find(
          p => p.id === receipt.property_id
        );

      return (

        <div
          key={receipt.id}
          className="bg-[#F8FAFC] rounded-2xl p-5 shadow"
        >

          <div className="flex justify-between">

            <div>

              <div className="font-semibold">

                {property?.name}

              </div>

              <div className="text-gray-500 text-sm">

                {receipt.purchase_date}

              </div>

            </div>

            <div className="text-right">

              <div className="font-bold">

                ${receipt.amount}

              </div>

              <div>

                {receipt.status === "Pending" && "🟡 Pending"}

                {receipt.status === "Approved" && "🟢 Approved"}

                {receipt.status === "Rejected" && "🔴 Rejected"}

              </div>

            </div>

          </div>

        </div>

      );

    })}

  </div>

</div>
        </div>

      </div>

    </div>

  );

}