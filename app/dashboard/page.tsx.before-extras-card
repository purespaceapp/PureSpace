"use client";

import { useEffect, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  Users,
  Wrench,
} from "lucide-react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ReservationsCalendar from "@/components/dashboard/ReservationsCalendar";
import TodaysOperations from "@/components/dashboard/TodaysOperations";
import MaintenancePanel from "@/components/dashboard/MaintenancePanel";

import { getProperties } from "@/lib/properties";
import { getEmployees } from "@/lib/employees";
import { getSchedules } from "@/lib/schedule";
import { getMaintenanceIssues } from "@/lib/maintenance";

export default function DashboardPage() {
  const [loading, setLoading] =
    useState(true);

  const [properties, setProperties] =
    useState<any[]>([]);

  const [employees, setEmployees] =
    useState<any[]>([]);

  const [schedules, setSchedules] =
    useState<any[]>([]);

  const [issues, setIssues] =
    useState<any[]>([]);

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

  const today = new Date()
    .toLocaleDateString("en-CA");

  const todaysJobs = schedules.filter(
    (schedule) =>
      schedule.cleaning_date === today &&
      schedule.status !== "Completed"
  );

  const openIssues = issues.filter(
    (issue) =>
      issue.status?.toLowerCase() === "open"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#2E7BBE] border-t-transparent" />

          <p className="mt-5 text-sm font-medium text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <div className="mx-auto max-w-[1700px] space-y-6 px-5 py-6 md:px-8 md:py-8">
        {/* COMPACT HERO */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#1F4E79] via-[#2E7BBE] to-[#66BDF0] px-7 py-8 text-white shadow-xl md:px-10 md:py-9">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute bottom-[-100px] right-[22%] h-56 w-56 rounded-full bg-white/10" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Welcome back
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">
                PureSpace Office
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">
                Your operations center for reservations,
                cleanings, employees, receipts and
                property management.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.25em] text-blue-100">
                Today
              </p>

              <p className="mt-1 text-xl font-bold">
                {new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Properties
                </p>

                <p className="mt-2 text-4xl font-black text-[#2E7BBE]">
                  {properties.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Active properties
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FE]">
                <Home className="h-5 w-5 text-[#2E7BBE]" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Employees
                </p>

                <p className="mt-2 text-4xl font-black text-[#2E7BBE]">
                  {employees.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Active cleaners
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FE]">
                <Users className="h-5 w-5 text-[#2E7BBE]" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Today's Jobs
                </p>

                <p className="mt-2 text-4xl font-black text-[#2E7BBE]">
                  {todaysJobs.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Scheduled cleanings
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FE]">
                <CalendarDays className="h-5 w-5 text-[#2E7BBE]" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Open Issues
                </p>

                <p className="mt-2 text-4xl font-black text-red-500">
                  {openIssues.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Maintenance reports
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                <Wrench className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <a
            href="/dashboard/schedule"
            className="group rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FE]">
                <CalendarDays className="h-5 w-5 text-[#2E7BBE]" />
              </div>

              <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2E7BBE]" />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Manage Schedule
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View and organize upcoming cleanings.
            </p>
          </a>

          <a
            href="/dashboard/invoices"
            className="group rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FE]">
                <FileText className="h-5 w-5 text-[#2E7BBE]" />
              </div>

              <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2E7BBE]" />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Invoice History
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Review owner billing and invoices.
            </p>
          </a>

          <a
            href="/dashboard/maintenance"
            className="group rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FE]">
                <Wrench className="h-5 w-5 text-[#2E7BBE]" />
              </div>

              <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2E7BBE]" />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Maintenance
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track reported property issues.
            </p>
          </a>
        </section>

        {/* OPERATIONS */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <ReservationsCalendar />
          </div>

          <div className="xl:col-span-4">
            <TodaysOperations
              schedules={schedules}
              employees={employees}
              properties={properties}
            />
          </div>
        </section>

        {/* MAINTENANCE */}
        <section>
          <MaintenancePanel issues={issues} />
        </section>
      </div>
    </div>
  );
}
