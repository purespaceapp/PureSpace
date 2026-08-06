"use client";

import {
  CalendarDays,
  MapPin,
  User,
  Clock3,
} from "lucide-react";

type Props = {
  schedules: any[];
  employees: any[];
  properties: any[];
};

export default function TodaysOperations({
  schedules,
  employees,
  properties,
}: Props) {

  const today = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  )
    .format(new Date())
    .replace(/\//g, "-");

  const jobs = schedules.filter(
    (s) =>
      s.cleaning_date === today &&
      s.status !== "Completed"
  );


  return (

<div className="bg-white rounded-[34px] shadow-xl border border-slate-100 overflow-hidden h-full">
  
  {/* HEADER */}

  <div className="flex items-center justify-between border-b border-slate-100 px-8 py-7">

    <div className="flex items-center gap-5">

      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF4FE]">

        <CalendarDays className="h-8 w-8 text-[#2E7BBE]" />

      </div>

      <div>

        <h2 className="text-3xl font-bold text-slate-800">

          Today's Operations

        </h2>

        <p className="mt-2 text-slate-500">

          Scheduled cleanings for today.

        </p>

      </div>

    </div>

    <div className="rounded-2xl bg-[#EAF4FE] px-6 py-3">

      <span className="text-lg font-bold text-[#2E7BBE]">

        {jobs.length} Job{jobs.length !== 1 ? "s" : ""}

      </span>

    </div>

  </div>

  {/* LIST */}

 <div className="p-8 space-y-5 max-h-[650px] overflow-y-auto">

    {jobs.length === 0 && (

      <div className="flex flex-col items-center py-16">

        <CalendarDays className="h-16 w-16 text-slate-300" />

        <h3 className="mt-6 text-2xl font-bold text-slate-700">

          No Cleanings Today

        </h3>

        <p className="mt-3 text-slate-500">

          There are no scheduled cleanings for today.

        </p>

      </div>

    )}

    {jobs.map((job) => {

      const employee = employees.find(
        (e) => e.id === job.employee_id
      );

      const property = properties.find(
        (p) => p.id === job.property_id
      );

     return (

<div
  key={job.id}
  className="rounded-3xl border border-slate-200 bg-white p-7 transition hover:shadow-xl"
>

  <div className="flex items-start justify-between">

    <div className="space-y-5">

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4FE]">

          <User className="h-6 w-6 text-[#2E7BBE]" />

        </div>

        <div>

          <h3 className="text-xl font-bold text-slate-800">

            {employee?.name || "Cleaner"}

          </h3>

          <p className="text-slate-500">

            Assigned Cleaner

          </p>

        </div>

      </div>

      <div className="flex items-center gap-3">

        <MapPin className="h-5 w-5 text-slate-400" />

        <span className="text-slate-700 font-medium">

          {property?.name || "Property"}

        </span>

      </div>

      <div className="flex items-center gap-3">

        <Clock3 className="h-5 w-5 text-slate-400" />

        <span className="text-slate-600">

          {job.cleaning_date}

        </span>

      </div>

    </div>

    <div>

      <span
        className={`rounded-full px-5 py-2 text-sm font-bold ${
          job.status === "Assigned"
            ? "bg-blue-100 text-blue-700"
            : job.status === "In Progress"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >

        {job.status}

      </span>

    </div>

  </div>

</div>

);
      })}

  </div>

</div>

);

}