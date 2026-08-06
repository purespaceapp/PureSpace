"use client";

import Image from "next/image";
import { Bell, Settings, CalendarDays } from "lucide-react";

export default function DashboardHeader() {
  const today = new Date();

  const date = today.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hour = today.getHours();

  let greeting = "Good Morning";

  if (hour >= 12) greeting = "Good Afternoon";
  if (hour >= 18) greeting = "Good Evening";

  return (
    <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-r from-[#2E7BBE] via-[#4F97E4] to-[#74B6FF] shadow-xl">

      <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-white/10" />

      <div className="absolute right-44 bottom-0 w-64 h-64 rounded-full bg-white/5" />

      <div className="relative flex items-center justify-between p-10">

        <div className="flex items-center gap-7">

          <div className="w-28 h-28 rounded-3xl bg-white shadow-xl flex items-center justify-center">

            <Image
              src="/images/logo.jpg"
              alt="PureSpace"
              width={82}
              height={82}
              priority
            />

          </div>

          <div>

            <p className="text-white/90 text-xl">

              {greeting}

            </p>

            <h1 className="text-6xl font-bold text-white mt-2">

              PureSpace Office

            </h1>

            <p className="text-white/90 text-xl mt-4 max-w-3xl">

              Your operations center for reservations, cleanings,
              employees, receipts and property management.

            </p>

          </div>

        </div>

        <div className="flex flex-col items-end gap-5">

          <div className="flex gap-4">

            <button
              className="w-14 h-14 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition flex items-center justify-center"
            >

              <Bell className="w-6 h-6 text-white" />

            </button>

            <button
              className="w-14 h-14 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition flex items-center justify-center"
            >

              <Settings className="w-6 h-6 text-white" />

            </button>

          </div>

          <div className="bg-white/15 backdrop-blur-xl rounded-3xl px-8 py-7 min-w-[330px]">

            <div className="flex items-center gap-3 mb-3">

              <CalendarDays className="text-white w-6 h-6" />

              <span className="uppercase tracking-[4px] text-white/80 text-sm">

                Today

              </span>

            </div>

            <h2 className="text-white text-4xl font-bold leading-snug">

              {date}

            </h2>

          </div>

        </div>

      </div>

    </div>
  );
}