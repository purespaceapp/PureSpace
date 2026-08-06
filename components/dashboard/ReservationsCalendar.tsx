"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  ArrowRight,
  Clock3,
  CheckCircle2,
  Home,
  User,
} from "lucide-react";

import { getReservations } from "@/lib/reservations";
import { getProperties } from "@/lib/properties";

interface Reservation {
  id: string;

  property_id: number;

  reservation_id: string;

  guest_name: string | null;

  check_in: string;

  check_out: string;

  status: string;

  source: string;

  cleaning_status: string;

  assigned_cleaner_id: number | null;

  assigned_cleaner_name: string | null;
}

interface Property {
  id: number;

  name: string;
}

export default function ReservationsCalendar() {
  const [loading, setLoading] = useState(true);

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [properties, setProperties] =
    useState<Property[]>([]);
      useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [reservationData, propertyData] =
        await Promise.all([
          getReservations(),
          getProperties(),
        ]);

      setReservations(reservationData);
      setProperties(propertyData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const reservationsWithProperty = useMemo(() => {
    return reservations
      .map((reservation) => {

        const property = properties.find(
          (p) => p.id === reservation.property_id
        );

        return {
          ...reservation,
          property_name:
            property?.name ?? "Unknown Property",
        };

      })
      .sort(
        (a, b) =>
          new Date(a.check_in).getTime() -
          new Date(b.check_in).getTime()
      );

  }, [reservations, properties]);

  if (loading) {
    return (
      <div className="h-[720px] flex items-center justify-center">

        <div className="text-center">

          <Clock3 className="w-14 h-14 animate-pulse text-[#2E7BBE] mx-auto" />

          <p className="mt-5 text-slate-500">
            Loading reservations...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="h-[720px] overflow-y-auto bg-slate-50">

      <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 z-10">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-800">
              Upcoming Reservations
            </h2>

            <p className="text-slate-500 mt-2">
              {reservationsWithProperty.length} reservation(s) found
            </p>

          </div>

          <div className="rounded-2xl bg-[#EAF4FE] p-4">
            <CalendarDays className="w-8 h-8 text-[#2E7BBE]" />
          </div>

        </div>

      </div>

      <div className="p-8 space-y-5">
                {reservationsWithProperty.length === 0 ? (

          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-14 text-center">

            <CalendarDays className="w-16 h-16 text-slate-300 mx-auto" />

            <h3 className="mt-6 text-2xl font-bold text-slate-700">
              No reservations found
            </h3>

            <p className="mt-3 text-slate-500">
              As soon as reservations are imported from Airbnb,
              they will appear here automatically.
            </p>

          </div>

        ) : (

          reservationsWithProperty.map((reservation: any) => (

            <div
              key={reservation.id}
              className="rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition p-8"
            >

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <Home className="w-5 h-5 text-[#2E7BBE]" />

                    <h3 className="text-xl font-bold text-slate-800">
                      {reservation.property_name}
                    </h3>

                  </div>

                  <div className="flex items-center gap-3 mt-4">

                    <User className="w-4 h-4 text-slate-500" />

                    <span className="text-slate-700">
                      {reservation.guest_name || "Guest"}
                    </span>

                  </div>

                </div>

                <span className="rounded-full bg-blue-100 text-blue-700 px-5 py-2 text-sm font-semibold">
                  {reservation.status}
                </span>

              </div>

              <div className="grid grid-cols-3 gap-6 mt-8">

                <div>

                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Check In
                  </p>

                  <p className="mt-2 font-semibold">
                    {reservation.check_in}
                  </p>

                </div>

                <div className="flex items-center justify-center">

                  <ArrowRight className="text-slate-300" />

                </div>

                <div>

                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Check Out
                  </p>

                  <p className="mt-2 font-semibold">
                    {reservation.check_out}
                  </p>

                </div>

              </div>

              <div className="mt-8 flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2 flex-wrap">

                    {reservation.assigned_cleaner_name && (

                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        👤 {reservation.assigned_cleaner_name}
                      </span>

                    )}

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        reservation.cleaning_status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : reservation.cleaning_status === "Assigned"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {reservation.cleaning_status}
                    </span>

                  </div>

                  <div className="mt-3">

                    {reservation.cleaning_status === "Pending" && (

                      <div className="flex items-center gap-2">

                        <Clock3 className="w-5 h-5 text-yellow-500" />

                        <span className="font-semibold text-yellow-700">
                          Cleaner Pending
                        </span>

                      </div>

                    )}

                    {reservation.cleaning_status === "Assigned" && (

                      <div className="flex items-center gap-2">

                        <Clock3 className="w-5 h-5 text-blue-500" />

                        <span className="font-semibold text-blue-700">
                          Cleaning Scheduled
                        </span>

                      </div>

                    )}

                    {reservation.cleaning_status === "Completed" && (

                      <div className="flex items-center gap-2">

                        <CheckCircle2 className="w-5 h-5 text-green-600" />

                        <span className="font-semibold text-green-700">
                          Cleaning Completed
                        </span>

                      </div>

                    )}

                  </div>

                </div>

                <span className="text-xs text-slate-400">
                  {reservation.source}
                </span>

              </div>

            </div>

          ))

        )}
              </div>

    </div>

  );

}