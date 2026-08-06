"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getCompletedSchedulesByOwner } from "@/lib/schedule";

export default function OwnerInvoicesPage() {

  const router = useRouter();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    async function load() {

      const ownerId =
        sessionStorage.getItem("ownerId");

      if (!ownerId) return;

      const data =
        await getCompletedSchedulesByOwner(
          Number(ownerId)
        );

      setInvoices(data);

    }

    load();

  }, []);

  const filteredInvoices = useMemo(() => {

    return invoices.filter((invoice) =>

      invoice.properties.name
        .toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [invoices, search]);

  const totalInvoices =
    filteredInvoices.length;

  const totalAmount =
    filteredInvoices.reduce(

      (sum, invoice) =>

        sum +
        Number(invoice.company_charge),

      0

    );

  return (

    <main className="min-h-screen bg-[#F5F7FA]">

      <div className="max-w-7xl mx-auto px-10 pt-10">

        {/* Hero */}

        <div className="rounded-[35px] bg-gradient-to-r from-[#2E7BBE] to-[#4D97E8] text-white p-10 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-5xl font-bold">

                Cleaning Invoices

              </h1>

              <p className="text-blue-100 text-xl mt-3">

                Download and manage all of your property statements.

              </p>

            </div>

            <div className="bg-white/15 rounded-3xl px-8 py-6 text-center">

              <p className="text-blue-100">

                Statements

              </p>

              <h2 className="text-5xl font-bold">

                {totalInvoices}

              </h2>

            </div>

          </div>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          <div className="bg-white rounded-[30px] shadow-xl p-7">

            <p className="text-slate-500">

              Total Statements

            </p>

            <h2 className="text-5xl font-bold mt-3">

              {totalInvoices}

            </h2>

          </div>

          <div className="bg-white rounded-[30px] shadow-xl p-7">

            <p className="text-slate-500">

              Total Amount

            </p>

            <h2 className="text-5xl font-bold mt-3 text-[#2E7BBE]">

              ${totalAmount.toFixed(2)}

            </h2>

          </div>

          <div className="bg-white rounded-[30px] shadow-xl p-7">

            <p className="text-slate-500">

              Status

            </p>

            <h2 className="text-5xl font-bold mt-3 text-green-600">

              Completed

            </h2>

          </div>

        </div>

        {/* Search */}

        <div className="mt-10">

          <input

            type="text"

            placeholder="Search property..."

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            className="w-full bg-white rounded-2xl shadow-lg px-6 py-5 outline-none text-lg"

          />

        </div>

        {/* Table */}

        <div className="mt-10 bg-white rounded-[35px] shadow-2xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-[#2E7BBE] text-white">

              <tr>

                <th className="text-left px-6 py-5">
                  Date
                </th>

                <th className="text-left px-6 py-5">
                  Property
                </th>

                <th className="text-center px-6 py-5">
                  Amount
                </th>

                <th className="text-center px-6 py-5">
                  Status
                </th>

                <th className="text-center px-6 py-5">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>
                            {filteredInvoices.map((invoice) => (

                <tr
                  key={invoice.id}
                  className="border-b hover:bg-slate-50 transition"
                >

                  <td className="px-6 py-6">
                    {new Date(
                      invoice.cleaning_date
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-6">

                    <div>

                      <h3 className="font-bold text-slate-800">

                        {invoice.properties.name}

                      </h3>

                      <p className="text-slate-500 text-sm">

                        {invoice.properties.address}

                      </p>

                    </div>

                  </td>

                  <td className="px-6 py-6 text-center font-semibold text-[#2E7BBE]">

                    ${Number(
                      invoice.company_charge
                    ).toFixed(2)}

                  </td>

                  <td className="px-6 py-6 text-center">

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">

                      {invoice.status}

                    </span>

                  </td>

                  <td className="px-6 py-6">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          router.push(
                            `/owner-statement/${invoice.property_id}`
                          )
                        }
                        className="bg-[#2E7BBE] hover:bg-[#23649D] text-white px-5 py-3 rounded-xl font-semibold transition"
                      >
                        View Statement
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/owner-statement/${invoice.property_id}`
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                      >
                        Download
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {filteredInvoices.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="py-16 text-center text-slate-500 text-lg"
                  >

                    No invoices found.

                  </td>

                </tr>

              )}
                          </tbody>

          </table>

        </div>

      </div>

    </main>

  );

}