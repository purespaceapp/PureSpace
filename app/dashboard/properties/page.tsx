"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import PropertyForm from "@/components/forms/PropertyForm";

import {
  Search,
  Plus,
  Home,
  Building2,
  DollarSign,
  Wifi,
  CalendarDays,
  RefreshCcw,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  User,
} from "lucide-react";

import {
  getProperties,
  deleteProperty,
} from "@/lib/properties";

export default function PropertiesPage() {

  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProperty, setEditingProperty] = useState<any>(null);

  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const [showView, setShowView] = useState(false);
    async function loadProperties() {

    try {

      const data = await getProperties();

      setProperties(data);
      setFilteredProperties(data);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    loadProperties();

  }, []);

  useEffect(() => {

    if (!search.trim()) {

      setFilteredProperties(properties);
      return;

    }

    const text = search.toLowerCase();

    setFilteredProperties(

      properties.filter((property) =>

        property.name?.toLowerCase().includes(text) ||
        property.owner?.toLowerCase().includes(text) ||
        property.address?.toLowerCase().includes(text)

      )

    );

  }, [search, properties]);

  const activeProperties = properties.filter(
    (property) => property.active !== false
  );

  const connectedAirbnb = properties.filter(
    (property) => property.airbnb_connected
  );

  const averageCleanerPrice =
    properties.length === 0
      ? 0
      : Math.round(
          properties.reduce(
            (total, property) =>
              total + Number(property.cleaner_price || 0),
            0
          ) / properties.length
        );

  const averageCompanyPrice =
    properties.length === 0
      ? 0
      : Math.round(
          properties.reduce(
            (total, property) =>
              total + Number(property.company_price || 0),
            0
          ) / properties.length
        );

  return (

    <main className="min-h-screen bg-[#F4F7FB]">

      <div className="max-w-[1700px] mx-auto px-8 py-8">
                {/* HEADER */}

        <section className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-5xl font-bold text-[#2E7BBE]">

              Properties

            </h1>

            <p className="mt-2 text-lg text-slate-500">

              Manage all your properties from one place.

            </p>

          </div>

          <button
            onClick={() => {
              setEditingProperty(null);
              setShowForm(true);
            }}
            className="flex items-center gap-3 rounded-2xl bg-[#2E7BBE] px-7 py-4 text-white font-semibold shadow-lg transition hover:bg-[#2568A3]"
          >

            <Plus className="w-5 h-5" />

            Add Property

          </button>

        </section>

        {/* SEARCH */}

        <section className="mb-8">

          <div className="relative">

            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property name, owner or address..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-6 text-lg outline-none transition focus:border-[#2E7BBE] focus:ring-4 focus:ring-blue-100"
            />

          </div>

        </section>

        {/* STATS */}

        <section className="grid grid-cols-4 gap-6 mb-8">

          <div className="rounded-[28px] bg-white border border-slate-100 p-7 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500">

                  Total Properties

                </p>

                <h2 className="mt-3 text-4xl font-bold">

                  {properties.length}

                </h2>

              </div>

              <div className="rounded-2xl bg-blue-50 p-4">

                <Building2 className="w-7 h-7 text-[#2E7BBE]" />

              </div>

            </div>

          </div>

          <div className="rounded-[28px] bg-white border border-slate-100 p-7 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500">

                  Active

                </p>

                <h2 className="mt-3 text-4xl font-bold text-green-600">

                  {activeProperties.length}

                </h2>

              </div>

              <div className="rounded-2xl bg-green-50 p-4">

                <Home className="w-7 h-7 text-green-600" />

              </div>

            </div>

          </div>

          <div className="rounded-[28px] bg-white border border-slate-100 p-7 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500">

                  Airbnb Connected

                </p>

                <h2 className="mt-3 text-4xl font-bold text-[#2E7BBE]">

                  {connectedAirbnb.length}

                </h2>

              </div>

              <div className="rounded-2xl bg-cyan-50 p-4">

                <Wifi className="w-7 h-7 text-cyan-600" />

              </div>

            </div>

          </div>

          <div className="rounded-[28px] bg-white border border-slate-100 p-7 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500">

                  Avg Company Price

                </p>

                <h2 className="mt-3 text-4xl font-bold">

                  ${averageCompanyPrice}

                </h2>

              </div>

              <div className="rounded-2xl bg-orange-50 p-4">

                <DollarSign className="w-7 h-7 text-orange-600" />

              </div>

            </div>

          </div>

        </section>
                {/* PROPERTIES */}

        <section className="space-y-6">

          {filteredProperties.length === 0 ? (

            <div className="rounded-[32px] bg-white border border-slate-100 shadow-lg p-20 text-center">

              <Building2 className="mx-auto h-16 w-16 text-slate-300" />

              <h2 className="mt-6 text-3xl font-bold text-slate-700">

                No properties found

              </h2>

              <p className="mt-3 text-slate-500">

                Add your first property or change your search.

              </p>

            </div>

          ) : (

            filteredProperties.map((property) => (

              <div
                key={property.id}
                className="rounded-[30px] bg-white border border-slate-100 shadow-lg p-8 hover:shadow-xl transition"
              >

                <div className="flex justify-between items-start">

                  <div className="flex-1">

                    <div className="flex items-center gap-4">

                      <h2 className="text-3xl font-bold text-slate-800">

                        {property.name}

                      </h2>

                      {property.airbnb_connected ? (

                        <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">

                          Airbnb Connected

                        </span>

                      ) : (

                        <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">

                          Not Connected

                        </span>

                      )}

                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-7">

                      <div className="flex items-center gap-3">

                        <User className="w-5 h-5 text-[#2E7BBE]" />

                        <div>

                          <p className="text-xs uppercase text-slate-400">

                            Owner

                          </p>

                          <p className="font-semibold">

                            {property.owner}

                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <MapPin className="w-5 h-5 text-[#2E7BBE]" />

                        <div>

                          <p className="text-xs uppercase text-slate-400">

                            Address

                          </p>

                          <p className="font-semibold">

                            {property.address}

                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <DollarSign className="w-5 h-5 text-green-600" />

                        <div>

                          <p className="text-xs uppercase text-slate-400">

                            Company Price

                          </p>

                          <p className="font-semibold">

                            ${property.company_price}

                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <DollarSign className="w-5 h-5 text-orange-500" />

                        <div>

                          <p className="text-xs uppercase text-slate-400">

                            Cleaner Pay

                          </p>

                          <p className="font-semibold">

                            ${property.cleaner_price}

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="flex flex-col gap-3 ml-8">

                    <button
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowView(true);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 hover:bg-slate-200"
                    >
                      <Eye className="w-5 h-5" />
                      View
                    </button>

                    <button
                      onClick={() => {
                        setEditingProperty(property);
                        setShowForm(true);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-3 text-[#2E7BBE] hover:bg-blue-200"
                    >
                      <Pencil className="w-5 h-5" />
                      Edit
                    </button>

                    <button
                      onClick={async () => {

                        if (!confirm(`Delete "${property.name}"?`)) return;

                        await deleteProperty(property.id);

                        await loadProperties();

                      }}
                      className="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-3 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-6 mt-8 border-t border-slate-100 pt-6">

                  <div>

                    <p className="text-xs uppercase text-slate-400">

                      Airbnb Listing

                    </p>

                    <p className="mt-1 font-medium break-all">

                      {property.airbnb_listing_url || "Not configured"}

                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase text-slate-400">

                      Last Sync

                    </p>

                    <p className="mt-1 font-medium">

                      {property.last_airbnb_sync || "Never"}

                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase text-slate-400">

                      Calendar

                    </p>

                    <p className="mt-1 font-medium break-all">

                      {property.airbnb_calendar_url || "Not configured"}

                    </p>

                  </div>

                </div>

              </div>

            ))

          )}

        </section>
              {/* ADD / EDIT PROPERTY */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="relative max-h-[92vh] w-[96%] max-w-7xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl">

            <button
              onClick={() => {
                setShowForm(false);
                setEditingProperty(null);
              }}
              className="absolute right-6 top-6 text-3xl text-slate-400 transition hover:text-red-500"
            >
              ×
            </button>

            <PropertyForm
              property={editingProperty}
              onClose={() => {
                setShowForm(false);
                setEditingProperty(null);
              }}
              onSaved={async () => {
                await loadProperties();
                setShowForm(false);
                setEditingProperty(null);
              }}
            />

          </div>

        </div>

      )}

      {/* VIEW PROPERTY */}

      {showView && selectedProperty && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="relative w-[95%] max-w-4xl rounded-[32px] bg-white p-10 shadow-2xl">

            <button
              onClick={() => setShowView(false)}
              className="absolute right-6 top-6 text-3xl text-slate-400 transition hover:text-red-500"
            >
              ×
            </button>

            <h2 className="mb-8 text-4xl font-bold text-[#2E7BBE]">

              {selectedProperty.name}

            </h2>

            <div className="grid grid-cols-2 gap-8">

              <div>

                <p className="text-xs uppercase text-slate-400">Owner</p>
                <p className="mb-5 text-lg font-semibold">{selectedProperty.owner}</p>

                <p className="text-xs uppercase text-slate-400">Address</p>
                <p className="mb-5 text-lg">{selectedProperty.address}</p>

                <p className="text-xs uppercase text-slate-400">Email</p>
                <p className="mb-5">{selectedProperty.email || "-"}</p>

                <p className="text-xs uppercase text-slate-400">Phone</p>
                <p>{selectedProperty.phone || "-"}</p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">Company Price</p>
                <p className="mb-5 text-lg font-semibold">
                  ${selectedProperty.company_price}
                </p>

                <p className="text-xs uppercase text-slate-400">Cleaner Pay</p>
                <p className="mb-5 text-lg font-semibold">
                  ${selectedProperty.cleaner_price}
                </p>

                <p className="text-xs uppercase text-slate-400">Door Code</p>
                <p className="mb-5">{selectedProperty.door_code || "-"}</p>

                <p className="text-xs uppercase text-slate-400">WiFi</p>
                <p>
                  {selectedProperty.wifi_name || "-"}
                  {selectedProperty.wifi_password
                    ? ` (${selectedProperty.wifi_password})`
                    : ""}
                </p>

              </div>

            </div>

            <div className="mt-10 grid grid-cols-2 gap-8">

              <div>

                <p className="text-xs uppercase text-slate-400">

                  Airbnb Listing

                </p>

                <p className="break-all">

                  {selectedProperty.airbnb_listing_url || "Not configured"}

                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">

                  Airbnb Calendar

                </p>

                <p className="break-all">

                  {selectedProperty.airbnb_calendar_url || "Not configured"}

                </p>

              </div>

            </div>

            <div className="mt-10">

              <p className="text-xs uppercase text-slate-400">

                Notes

              </p>

              <div className="mt-2 rounded-2xl bg-slate-100 p-5">

                {selectedProperty.notes || "No notes"}

              </div>

            </div>

          </div>

        </div>

      )}

      </div>

    </main>

  );

}