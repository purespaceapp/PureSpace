"use client";

import ScheduleCard from "@/components/cards/ScheduleCard";
import ScheduleForm from "@/components/forms/ScheduleForm";

import {
  getProperties,
} from "@/lib/properties";

import {
  getEmployees,
} from "@/lib/employees";

import {
  deleteSchedule,
  completeSchedules,
  reassignSchedules,
  getSchedules,
  getSchedulesByDate,
} from "@/lib/schedule";
import {
  getScheduleExtras,
} from "@/lib/extras";
import { useEffect, useState } from "react";



export default function SchedulePage() {

  const [schedules, setSchedules] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

const [employees, setEmployees] = useState<any[]>([]);

const [showForm, setShowForm] = useState(false);

const [editingSchedule, setEditingSchedule] = useState<any>(null);
const [viewingSchedule, setViewingSchedule] = useState<any>(null);
const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
const [showReassign, setShowReassign] = useState(false);

const [newEmployeeId, setNewEmployeeId] = useState("");
const [whatsAppMessage, setWhatsAppMessage] =
useState<any[]>([]);

  async function loadSchedules() {

  const data = await getSchedules();

  const schedulesWithExtras = await Promise.all(

    data.map(async (schedule) => {

      const extras =
        await getScheduleExtras(schedule.id);

      return {

        ...schedule,

        extras,

      };

    })

  );

  setSchedules(schedulesWithExtras);

}

async function loadProperties() {

  const data = await getProperties();

  setProperties(data);

}

async function loadEmployees() {

  const data = await getEmployees();

  setEmployees(data);
}

async function generateWhatsAppMessage() {

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, "-");

  const jobs = await getSchedulesByDate(today);

  const grouped = employees
    .map((employee) => ({
      employee,
      jobs: jobs.filter(
        (j) => j.employee_id === employee.id
      ),
    }))
    .filter((g) => g.jobs.length > 0);

  setWhatsAppMessage(grouped);
}
  useEffect(() => {

  loadSchedules();

  loadProperties();

  loadEmployees();

}, []);
const groupedSchedules = employees.map((employee) => ({

  employee,

  schedules: schedules.filter(
    (schedule) => schedule.employee_id === employee.id
  ),

}));

  return (

    <div className="min-h-screen bg-[#F2F5F7] p-10">

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-5xl font-bold text-[#2E7BBE]">
            Schedule
          </h1>

          <p className="text-gray-500 mt-2">
            Manage all cleaning jobs
          </p>

        </div>
<button
  onClick={generateWhatsAppMessage}
  className="bg-green-600 hover:bg-green-700 text-white px-7 py-4 rounded-2xl shadow-lg"
>

📲 Generate WhatsApp

</button>
        <button
  onClick={() => {
    setEditingSchedule(null);
    setShowForm(true);
  }}
  className="bg-[#2E7BBE] hover:bg-[#23649D] text-white font-semibold px-7 py-4 rounded-2xl shadow-lg"
>
  + Add Cleaning
</button>

      </div>

      {schedules.length === 0 ? (

        <div className="bg-white rounded-3xl shadow-md p-16 text-center">

          <h2 className="text-2xl font-bold text-[#2E7BBE]">

            No cleanings yet

          </h2>

          <p className="text-gray-500 mt-3">

            Click "Add Cleaning" to schedule your first job.

          </p>

        </div>

      ) : (

        <>

       <div className="grid gap-6">

  {groupedSchedules.map(({ employee, schedules }) => {

  if (schedules.length === 0) return null;

  return (

    <div
      key={employee.id}
      className="bg-white rounded-3xl shadow-lg border p-6"
    >

      <h2 className="text-2xl font-bold text-[#2E7BBE] mb-1">
        🧹 {employee.name}
      </h2>

      <p className="text-gray-500 mb-6">
        {schedules.length} Assigned Job(s)
      </p>

      <div className="grid md:grid-cols-2 gap-5">

        {schedules.map((schedule) => {

          const property = properties.find(
            (p) => p.id === schedule.property_id
          );

          return (

            <ScheduleCard
  key={schedule.id}
  property={property?.name || "Unknown Property"}
  cleaner={employee.name}
  date={schedule.cleaning_date}

  checkout={schedule.checkout_time}
  checkin={schedule.checkin_time}

  cleanerPay={schedule.cleaner_pay}
              companyCharge={schedule.company_charge}
              status={schedule.status}
              extras={schedule.extras?.map((extra: any) => ({

  name:

    extra.extra_id === 1 ? "🧺 Laundry" :

    extra.extra_id === 2 ? "🕒 Extra Hour" :

    extra.extra_id === 3 ? "🧼 Deep Clean" :

    extra.extra_id === 4 ? "🪟 Windows" :

    extra.extra_id === 5 ? "🐶 Pet Hair" :

    extra.extra_id === 6 ? "🛏️ Extra Linen" :

    extra.extra_id === 7 ? "☣️ Biohazard" :

    extra.extra_id === 8 ? "🌿 Balcony" :

    "Extra",

  quantity: extra.quantity,

}))}

              selected={selectedSchedules.includes(schedule.id)}

              onSelect={() => {

                if (selectedSchedules.includes(schedule.id)) {

                  setSelectedSchedules(
                    selectedSchedules.filter(
                      id => id !== schedule.id
                    )
                  );

                } else {

                  setSelectedSchedules([
                    ...selectedSchedules,
                    schedule.id,
                  ]);

                }

              }}

              onView={() => {
                setViewingSchedule(schedule);
              }}

              onEdit={() => {
                setEditingSchedule(schedule);
                setShowForm(true);
              }}

              onDelete={async () => {

                const confirmed = confirm(
                  "Delete this cleaning?"
                );

                if (!confirmed) return;

                await deleteSchedule(schedule.id);

                await loadSchedules();

              }}

            />

          );

        })}

      </div>

    </div>

  );

})}

</div>
{selectedSchedules.length > 0 && (

  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-2xl border px-8 py-4 flex items-center gap-6 z-50">

    <span className="font-semibold text-gray-700">
      {selectedSchedules.length} Job(s) Selected
    </span>

    <button
  onClick={async () => {

    try {

      await completeSchedules(selectedSchedules);

      await loadSchedules();

      setSelectedSchedules([]);

    } catch (error) {

      console.error(error);

      alert("Failed to complete jobs.");

    }

  }}
  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
>
  ✅ Complete
</button>

   <button
  onClick={() => setShowReassign(true)}
  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl"
>
  🔄 Reassign
</button>

  </div>

)}

</>

)}

{showForm && (

  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

    <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">

      <button
        onClick={() => {
          setShowForm(false);
          setEditingSchedule(null);
        }}
        className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-red-500"
      >
        ✕
      </button>

      <ScheduleForm
        properties={properties}
        employees={employees}
        schedule={editingSchedule}
        onClose={() => {
          setShowForm(false);
          setEditingSchedule(null);
        }}
        onSaved={async () => {
          await loadSchedules();
          setShowForm(false);
          setEditingSchedule(null);
        }}
      />

    </div>

  </div>

)}


{viewingSchedule && ( <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"> <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-xl p-8 relative"> <button onClick={() => setViewingSchedule(null)} className="absolute top-5 right-5 text-3xl text-gray-400 hover:text-red-500" > ✕ </button> <h2 className="text-3xl font-bold text-[#2E7BBE] mb-8"> Cleaning Details </h2> <div className="space-y-4"> <div> <span className="font-semibold">📍 Property:</span><br /> {properties.find( p => p.id === viewingSchedule.property_id )?.name} </div> <div> <span className="font-semibold">👤 Cleaner:</span><br /> {employees.find( e => e.id === viewingSchedule.employee_id )?.name} </div> <div> <span className="font-semibold">📅 Date:</span><br /> {viewingSchedule.cleaning_date} </div> <div> <span className="font-semibold">💵 Cleaner Pay:</span><br /> ${viewingSchedule.cleaner_pay} </div> 
<div>
   <span className="font-semibold">🏢 Company Charge:
    </span><br /> ${viewingSchedule.company_charge} 
    </div>
    {viewingSchedule.extras &&
viewingSchedule.extras.length > 0 && (

  <div>

    <span className="font-semibold">
      ✨ Extras:
    </span>

    <div className="mt-3 space-y-2">

      {viewingSchedule.extras.map((extra: any) => (

        <div
          key={extra.extra_id}
          className="flex justify-between bg-orange-50 rounded-xl px-4 py-2"
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

        </div>

      ))}

    </div>

  </div>

)}
     <div> <span className="font-semibold">📌 Status:</span><br /> {viewingSchedule.status} </div> <div> <span className="font-semibold">📝 Notes:</span><br />
 {viewingSchedule.notes || "No notes"} </div> </div> </div> </div> )}
   
   {showReassign && (

<div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

  <div className="bg-white rounded-3xl shadow-2xl p-8 w-[450px]">

    <h2 className="text-2xl font-bold text-[#2E7BBE] mb-6">
      Reassign Jobs
    </h2>

   <div className="mb-6">

  <p className="font-semibold text-gray-700 mb-3">
    You are reassigning:
  </p>

  <div className="bg-gray-50 border rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto">

    {selectedSchedules.map((id) => {

      const schedule = schedules.find(
        s => s.id === id
      );

      const property = properties.find(
        p => p.id === schedule?.property_id
      );

      return (

        <div
          key={id}
          className="flex items-center gap-2 text-gray-700"
        >
          <span>🏠</span>

          <span>
            {property?.name}
          </span>

        </div>

      );

    })}

  </div>

</div>

<p className="mb-4 font-semibold">
  Select the new cleaner:
</p>
    <select
      value={newEmployeeId}
      onChange={(e) => setNewEmployeeId(e.target.value)}
      className="border rounded-xl p-3 w-full"
    >

      <option value="">
        Choose Cleaner
      </option>

      {employees.map(employee => (

        <option
          key={employee.id}
          value={employee.id}
        >
          {employee.name}
        </option>

      ))}

    </select>

    <div className="flex justify-end gap-3 mt-8">

      <button
        onClick={() => setShowReassign(false)}
        className="px-5 py-2 rounded-xl bg-gray-200"
      >
        Cancel
      </button>

      <button
        onClick={async () => {

          if (!newEmployeeId) return;

          await reassignSchedules(
            selectedSchedules,
            Number(newEmployeeId)
          );

          await loadSchedules();

          setSelectedSchedules([]);

          setShowReassign(false);

          setNewEmployeeId("");

        }}
        className="bg-orange-500 text-white px-6 py-2 rounded-xl"
      >
        Assign
      </button>

    </div>

  </div>

</div>

)}
{whatsAppMessage.length > 0 && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

    <div className="bg-white rounded-3xl w-[750px] p-8 max-h-[80vh] overflow-y-auto">

      <h2 className="text-3xl font-bold mb-8">
        📲 Today's WhatsApp Messages
      </h2>

      <div className="space-y-6">

        {whatsAppMessage.map((group) => {

          const firstTime = group.jobs
            .map((j:any)=>j.checkout_time)
            .filter(Boolean)
            .sort()[0] || "--";

          const message =
`🧹 TODAY'S SCHEDULE

🕙 Start: ${firstTime}

${group.jobs.map((job:any)=>{

const property = properties.find(
(p)=>p.id===job.property_id
);

return `${property?.name} (${job.checkout_time || "--"} / ${job.checkin_time || "--"})`;

}).join("\n")}

Thank you ${group.employee.name} 🙏✨`;

          return (

            <div
              key={group.employee.id}
              className="border rounded-2xl p-5"
            >

              <h3 className="text-xl font-bold">
                🧹 {group.employee.name}
              </h3>

              <p className="text-gray-500 mb-4">
                {group.jobs.length} Property(s)
              </p>

              <button
                onClick={()=>{
                  navigator.clipboard.writeText(message);
                  alert("Copied!");
                }}
                className="bg-[#2E7BBE] text-white px-5 py-3 rounded-xl"
              >
                📋 Copy Message
              </button>

            </div>

          );

        })}

      </div>

      <button
        onClick={()=>setWhatsAppMessage([])}
        className="mt-8 w-full bg-gray-300 py-4 rounded-2xl"
      >
        Close
      </button>

    </div>

  </div>
)}
    </div>

  );

}
  