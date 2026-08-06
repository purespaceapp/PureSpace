"use client";

import { useEffect, useMemo, useState } from "react";
import { getReservations } from "@/lib/reservations";
interface Reservation {
  id: string;
  property_id: string;
  source: string;
  reservation_id: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  status: string;
  cleaning_status: string;
  assigned_cleaner_id: string | null;
}
export default function OfficeReservationsPage() {

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setLoading(true);

      const data = await getReservations();

      setReservations(data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
    const filteredReservations = useMemo(() => {

    return reservations.filter((reservation) => {

      return (
        reservation.guest_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        reservation.status
          .toLowerCase()
          .includes(search.toLowerCase())
      );

    });

  }, [reservations, search]);
    return (

    <main className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Office Reservations
      </h1>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 mb-6 w-full"
      />

      {loading ? (

        <p>Loading...</p>

      ) : (

        <div className="space-y-4">

          {filteredReservations.map((reservation) => (

            <div
              key={reservation.id}
              className="border rounded-xl p-5"
            >

              <h2 className="font-semibold text-lg">
                {reservation.guest_name || "Guest"}
              </h2>

              <p>
                Check In: {reservation.check_in}
              </p>

              <p>
                Check Out: {reservation.check_out}
              </p>

              <p>
                Status: {reservation.status}
              </p>

              <p>
                Cleaning: {reservation.cleaning_status}
              </p>

            </div>

          ))}

        </div>

      )}

    </main>

  );

}