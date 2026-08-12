"use client";

import { useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ReservationsCalendar from "@/components/dashboard/ReservationsCalendar";
import TodaysOperations from "@/components/dashboard/TodaysOperations";
import MaintenancePanel from "@/components/dashboard/MaintenancePanel";

import { getProperties } from "@/lib/properties";
import { getEmployees } from "@/lib/employees";
import { getSchedules } from "@/lib/schedule";
import { getMaintenanceIssues } from "@/lib/maintenance";

export default function DashboardPage() {

  const [loading, setLoading] = useState(true);

  const [properties, setProperties] = useState<any[]>([]);

  const [employees, setEmployees] = useState<any[]>([]);

  const [schedules, setSchedules] = useState<any[]>([]);

  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {

    loadDashboard();

  }, []);

  async function loadDashboard() {

    try {

      setLoading(true);

      const [

        propertiesData,

        employeesData,

        schedulesData,

        issuesData,

      ] = await Promise.all([

        getProperties(),

        getEmployees(),

        getSchedules(),

        getMaintenanceIssues(),

      ]);

      setProperties(propertiesData);

      setEmployees(employeesData);

      setSchedules(schedulesData);

      setIssues(issuesData);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">

        <div className="text-center">

          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#2E7BBE] border-t-transparent" />

          <p className="mt-6 text-slate-500">

            Loading Dashboard...

          </p>

        </div>

      </div>

    );

  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">

  <div className="mx-auto max-w-[1700px] px-8 py-8 space-y-6">

    {/* HERO */}

    <DashboardHeader />

    {/* DASHBOARD STATS */}

    <div className="grid grid-cols-4 gap-5">

      <div className="rounded-[28px] bg-white border border-slate-100 shadow-md p-6">

        <p className="text-xs uppercase tracking-widest text-slate-400">

          Properties

        </p>

        <h2 className="mt-3 text-4xl font-black text-[#2E7BBE]">

          {properties.length}

        </h2>

        <p className="mt-2 text-slate-500">

          Active Properties

        </p>

      </div>

      <div className="rounded-[28px] bg-white border border-slate-100 shadow-md p-6">

        <p className="text-xs uppercase tracking-widest text-slate-400">

          Employees

        </p>

        <h2 className="mt-3 text-4xl font-black text-[#2E7BBE]">

          {employees.length}

        </h2>

        <p className="mt-2 text-slate-500">

          Active Cleaners

        </p>

      </div>

      <div className="rounded-[28px] bg-white border border-slate-100 shadow-md p-6">

        <p className="text-xs uppercase tracking-widest text-slate-400">

          Today's Jobs

        </p>

        <h2 className="mt-3 text-4xl font-black text-[#2E7BBE]">

          {
            schedules.filter(
              (s) =>
                s.status !== "Completed"
            ).length
          }

        </h2>

        <p className="mt-2 text-slate-500">

          Scheduled Cleanings

        </p>

      </div>

      <div className="rounded-[28px] bg-white border border-slate-100 shadow-md p-6">

        <p className="text-xs uppercase tracking-widest text-slate-400">

          Open Issues

        </p>

        <h2 className="mt-3 text-4xl font-black text-red-500">

          {issues.length}

        </h2>

        <p className="mt-2 text-slate-500">

          Maintenance Reports

        </p>

      </div>

    </div>

    {/* MAIN CONTENT */}

    <div className="grid grid-cols-12 gap-6">
            {/* LEFT COLUMN */}

      <div className="col-span-8">

        <ReservationsCalendar />

      </div>

      {/* RIGHT COLUMN */}

      <div className="col-span-4">

        <TodaysOperations
          schedules={schedules}
          employees={employees}
          properties={properties}
        />

      </div>

    </div>

    {/* MAINTENANCE */}

    <div className="mt-6">

<MaintenancePanel issues={issues} />

    </div>

  </div>

</div>
  );

}