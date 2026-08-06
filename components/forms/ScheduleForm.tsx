"use client";
import { useEffect, useState } from "react";
import {
  saveSchedule,
  updateSchedule,
} from "@/lib/schedule";

import {
  updateReservation,
  getReservations,
} from "@/lib/reservations";
import {
  getExtras,
  saveScheduleExtras,
  deleteScheduleExtras,
} from "@/lib/extras";
type ScheduleFormProps = {
  properties: any[];
  employees: any[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  schedule?: any;
};
export default function ScheduleForm({
  properties,
  employees,
  onClose,
  onSaved,
  schedule,
}: ScheduleFormProps) {
const [propertyId, setPropertyId] = useState(
  schedule?.property_id?.toString() || ""
);

const [employeeId, setEmployeeId] = useState(
  schedule?.employee_id?.toString() || ""
);

const [cleaningDate, setCleaningDate] = useState(
  schedule?.cleaning_date || ""
);

const [notes, setNotes] = useState(
  schedule?.notes || ""
);

const [cleanerPay, setCleanerPay] = useState(
  schedule?.cleaner_pay?.toString() || ""
);

const [companyCharge, setCompanyCharge] = useState(
  schedule?.company_charge?.toString() || ""
);
const [checkoutTime, setCheckoutTime] = useState(
  schedule?.checkout_time || ""
);

const [checkinTime, setCheckinTime] = useState(
  schedule?.checkin_time || ""
);
const [baseCleanerPay, setBaseCleanerPay] = useState(0);
const [baseCompanyCharge, setBaseCompanyCharge] = useState(0);
const [loading, setLoading] = useState(false);
const [extras, setExtras] = useState<any[]>([]);
const [selectedExtras, setSelectedExtras] = useState<
  {
    id: number;
    quantity: number;
  }[]
>([]);
useEffect(() => {

  async function loadExtras() {

    const data = await getExtras();

    setExtras(data);

  }

  loadExtras();

}, []);
useEffect(() => {

  let cleanerTotal = baseCleanerPay;
  let ownerTotal = baseCompanyCharge;

 selectedExtras.forEach((selected) => {

  const extra = extras.find(
    (e) => e.id === selected.id
  );

  if (!extra) return;

  cleanerTotal +=
    Number(extra.cleaner_price) *
    selected.quantity;

  ownerTotal +=
    Number(extra.owner_price) *
    selected.quantity;

});
  setCleanerPay(cleanerTotal.toString());
  setCompanyCharge(ownerTotal.toString());

}, [
  selectedExtras,
  extras,
  baseCleanerPay,
  baseCompanyCharge,
]);
async function handleSave() {

  try {

    setLoading(true);

   const scheduleData = {
  property_id: Number(propertyId),
  employee_id: Number(employeeId),

  cleaning_date: cleaningDate,

  checkout_time: checkoutTime,
  checkin_time: checkinTime,

  cleaner_pay: Number(cleanerPay),
  company_charge: Number(companyCharge),

  status: "Scheduled",

  notes,
};

    if (schedule) {

  await updateSchedule(
    schedule.id,
    scheduleData
  );

  await deleteScheduleExtras(
    schedule.id
  );

  await saveScheduleExtras(
    schedule.id,
    selectedExtras
  );

} else {
const newSchedule =
  await saveSchedule(scheduleData);

await saveScheduleExtras(
  newSchedule.id,
  selectedExtras
);

// Buscar la reserva correspondiente

const reservations =
  await getReservations();

const reservation =
  reservations.find(
    (r: any) =>
      r.property_id === Number(propertyId) &&
      r.check_out === cleaningDate
  );

if (reservation) {

  const cleaner =
    employees.find(
      e =>
        e.id === Number(employeeId)
    );

  await updateReservation(
    reservation.id,
    {
      assigned_cleaner_id:
        Number(employeeId),

      assigned_cleaner_name:
        cleaner?.name || "",

      cleaning_status:
        "Assigned",
    }
  );

}

}

    await onSaved();

    onClose();

  } catch (error: any) {

    console.error(error);

    alert(error.message);

  } finally {

    setLoading(false);

  }

}
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <h2 className="text-2xl font-bold text-[#2E7BBE] mb-6">
  {schedule ? "Edit Cleaning" : "Add Cleaning"}
</h2>
      <div className="grid grid-cols-2 gap-5">

       <input
  type="time"
  value={checkoutTime}
  onChange={(e) => setCheckoutTime(e.target.value)}
  className="border rounded-xl p-3"
  placeholder="Checkout"
/>

<input
  type="time"
  value={checkinTime}
  onChange={(e) => setCheckinTime(e.target.value)}
  className="border rounded-xl p-3"
  placeholder="Check-in"
/>
<input
  type="date"
  value={cleaningDate}
  onChange={(e) => setCleaningDate(e.target.value)}
  className="border rounded-xl p-3"
 />
        <select
  value={propertyId}
  onChange={(e) => {

  const id = e.target.value;

  setPropertyId(id);

  const property = properties.find(
    (p) => p.id.toString() === id
  );

  if (property) {

  const cleaner = Number(property.cleaner_price || 0);
  const owner = Number(property.company_price || 0);

  setBaseCleanerPay(cleaner);
  setBaseCompanyCharge(owner);

  setCleanerPay(cleaner.toString());
  setCompanyCharge(owner.toString());

}

}}
  className="border rounded-xl p-3"
>
  <option value="">Select Property</option>

  {properties.map((property) => (
    <option
      key={property.id}
      value={property.id}
    >
      {property.name}
    </option>
  ))}
</select>
        <select
  value={employeeId}
  onChange={(e) => setEmployeeId(e.target.value)}
  className="border rounded-xl p-3"
>
  <option value="">Select Cleaner</option>

  {employees.map((employee) => (
    <option
      key={employee.id}
      value={employee.id}
    >
      {employee.name}
    </option>
  ))}
</select>
        <input
  value={cleanerPay}
  disabled
  placeholder="Cleaner Pay"
  className="border rounded-xl p-3 bg-gray-100"
/>

       <input
  value={companyCharge}
  disabled
  placeholder="Company Charge"
  className="border rounded-xl p-3 bg-gray-100"
/>

<div className="col-span-2">

  <h3 className="font-bold text-lg mb-3">
    Extras
  </h3>

  <div className="grid grid-cols-2 gap-3">

    {extras.map((extra) => (

      <label
        key={extra.id}
        className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer hover:bg-gray-50"
      >

        <input
          type="checkbox"
          checked={selectedExtras.some(
  (e) => e.id === extra.id
)}

          onChange={(e) => {

            if (e.target.checked) {

              setSelectedExtras([
  ...selectedExtras,
  {
    id: extra.id,
    quantity: 1,
  },
]);
            } else {

              setSelectedExtras(
                selectedExtras.filter(
  (e) => e.id !== extra.id
)
              );

            }

          }}

        />

       <div className="flex-1">

  <p className="font-medium">
    {extra.name}
  </p>

  <p className="text-sm text-gray-500">
    👤 +${extra.cleaner_price}
    {" • "}
    🏠 +${extra.owner_price}
    {extra.per_hour ? "/hour" : ""}
  </p>

  {selectedExtras.some(
    (e) => e.id === extra.id
  ) && (

    <div className="flex items-center gap-3 mt-3">

      <button
        type="button"
        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={() => {

          setSelectedExtras(

            selectedExtras.map((item) =>

              item.id === extra.id

                ? {
                    ...item,
                    quantity: Math.max(
                      1,
                      item.quantity - 1
                    ),
                  }

                : item

            )

          );

        }}
      >
        −
      </button>

      <span className="font-bold text-lg">

        {
          selectedExtras.find(
            (e) => e.id === extra.id
          )?.quantity
        }

      </span>

      <button
        type="button"
        className="w-8 h-8 rounded-full bg-[#2E7BBE] text-white hover:bg-[#23649D]"
        onClick={() => {

          setSelectedExtras(

            selectedExtras.map((item) =>

              item.id === extra.id

                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                  }

                : item

            )

          );

        }}
      >
        +
      </button>

    </div>

  )}

</div>

      </label>

    ))}

  </div>

</div>
        <textarea
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  placeholder="Notes..."
  className="border rounded-xl p-3 col-span-2 h-32"
/>
        

      </div>

      <button
  onClick={handleSave}
  disabled={loading}
  className="mt-6 w-full bg-[#2E7BBE] hover:bg-[#23649D] disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
>

  {loading
  ? "Saving..."
  : schedule
  ? "Update Cleaning"
  : "Save Cleaning"}
</button>
    </div>
  );
}