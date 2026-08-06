"use client";

import { useState } from "react";
import { properties } from "@/components/properties/propertiesData";

export default function NewCleaningPage() {
  const [selectedProperty, setSelectedProperty] = useState("");
  const [checkout, setCheckout] = useState("");
  const [checkin, setCheckin] = useState("");

  const property = properties.find(
    (p) => p.id === Number(selectedProperty)
  );

  return (
    <main className="min-h-screen bg-[#F2F5F7] p-10">

      <h1 className="text-5xl font-bold text-[#2E7BBE]">
        New Cleaning
      </h1>

      <p className="text-gray-500 mt-2">
        Assign today's cleaning
      </p>

      <div className="bg-white rounded-3xl shadow-md p-8 mt-10 max-w-3xl">

        <div className="space-y-6">

          <div>
            <label className="font-semibold">
              Property
            </label>

            <select
              className="w-full mt-2 border rounded-xl p-3"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              <option value="">
                Select property...
              </option>

              {properties.map((property) => (
                <option
                  key={property.id}
                  value={property.id}
                >
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold">
              Employee
            </label>

            <select className="w-full mt-2 border rounded-xl p-3">
              <option>Select employee...</option>
              <option>Emily</option>
              <option>Jessica</option>
              <option>Sophia</option>
              <option>Emma</option>
              <option>Olivia</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="font-semibold">
                Checkout
              </label>

              <input
                type="text"
                placeholder="11:00 AM"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full mt-2 border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="font-semibold">
                Checkin
              </label>

              <input
                type="text"
                placeholder="4:00 PM"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full mt-2 border rounded-xl p-3"
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="font-semibold">
                Cleaner Pay
              </label>

              <input
                disabled
                value={property?.cleanerPrice ?? ""}
                className="w-full mt-2 border rounded-xl p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="font-semibold">
                Company Charge
              </label>

              <input
                disabled
                value={property?.companyPrice ?? ""}
                className="w-full mt-2 border rounded-xl p-3 bg-gray-100"
              />
            </div>

          </div>

          <button className="bg-[#2E7BBE] text-white rounded-xl px-8 py-4 w-full hover:bg-blue-700 transition">
            Save Cleaning
          </button>

        </div>

      </div>

    </main>
  );
}