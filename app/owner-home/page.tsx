"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Home,
  CalendarDays,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  FileText,
  ShieldCheck,
  Building2,
  LogOut,
  Headphones,
} from "lucide-react";

import { getProperties } from "@/lib/properties";
import { getMaintenanceIssues } from "@/lib/maintenance";

export default function OwnerHomePage() {
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [showSupportModal, setShowSupportModal] = useState(false);

  function handleLogout() {
    sessionStorage.clear();
    router.replace("/owner-login");
  }

  useEffect(() => {
    async function load() {
      const ownerId = sessionStorage.getItem("ownerId");

      if (!ownerId) {
        router.replace("/owner-login");
        return;
      }

      const propertyData = await getProperties(Number(ownerId));
      setProperties(propertyData);

      const maintenance = await getMaintenanceIssues();
      setIssues(maintenance);
    }

    load();
  }, [router]);

  const openIssues = issues.filter(
    (issue) =>
      issue.status === "Open" &&
      properties.some(
        (property) =>
          Number(property.id) === Number(issue.property_id)
      )
  ).length;

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
            {/* ================= HERO ================= */}

      <section className="max-w-7xl mx-auto px-8 pt-10">

        <div className="relative overflow-hidden rounded-[42px] bg-gradient-to-r from-[#2E7BBE] via-[#4C95E7] to-[#76C3FF] shadow-2xl">

          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute bottom-[-150px] left-1/3 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col xl:flex-row justify-between gap-12 p-14">

            {/* LEFT */}

            <div className="max-w-2xl">

              <p className="uppercase tracking-[5px] text-blue-100 text-sm font-semibold">
                PureSpace Owner Portal
              </p>

              <h1 className="text-6xl font-bold text-white mt-6 leading-tight">
                Welcome Back 👋
              </h1>

              <p className="text-blue-100 text-xl leading-9 mt-6">
                Manage your Airbnb properties, statements, maintenance requests and invoices from one professional dashboard.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">

                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center gap-3 text-white">

                  <ShieldCheck className="w-6 h-6"/>

                  Professional Cleaning

                </div>

                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center gap-3 text-white">

                  <Building2 className="w-6 h-6"/>

                  {properties.length} Properties

                </div>

                <button
                  onClick={() => setShowSupportModal(true)}
                  className="bg-white text-[#2E7BBE] rounded-2xl px-6 py-4 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >

                  <Headphones className="w-5 h-5"/>

                  Contact Support

                </button>

                <button
                  onClick={handleLogout}
                  className="bg-slate-900 text-white rounded-2xl px-6 py-4 font-semibold flex items-center gap-2 shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all duration-300"
                >

                  <LogOut className="w-5 h-5"/>

                  Sign Out

                </button>

              </div>

            </div>

            {/* RIGHT */}

            <div className="bg-white/15 backdrop-blur-xl rounded-[32px] px-10 py-10 min-w-[260px] text-center shadow-xl">

              <p className="uppercase tracking-[4px] text-blue-100 text-sm">
                Today
              </p>

              <h2 className="text-5xl font-bold text-white mt-5">

                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}

              </h2>

              <p className="text-blue-100 text-lg mt-4">

                {new Date().getFullYear()}

              </p>

            </div>

          </div>

        </div>

      </section>
            {/* ================= STATS ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-10">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7">

          {/* Properties */}

          <div className="group bg-white rounded-[34px] p-8 border border-slate-100 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500 font-medium">
                  Properties
                </p>

                <h2 className="text-5xl font-bold text-slate-800 mt-4">
                  {properties.length}
                </h2>

              </div>

              <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center">

                <Home className="w-10 h-10 text-[#2E7BBE]" />

              </div>

            </div>

          </div>

          {/* Upcoming */}

          <div className="group bg-white rounded-[34px] p-8 border border-slate-100 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500 font-medium">
                  Upcoming Cleanings
                </p>

                <h2 className="text-5xl font-bold text-slate-800 mt-4">
                  0
                </h2>

              </div>

              <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center">

                <CalendarDays className="w-10 h-10 text-green-700" />

              </div>

            </div>

          </div>

          {/* Open Issues */}

          <div className="group bg-white rounded-[34px] p-8 border border-slate-100 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500 font-medium">
                  Open Issues
                </p>

                <h2 className="text-5xl font-bold text-slate-800 mt-4">
                  {openIssues}
                </h2>

              </div>

              <div className="w-20 h-20 rounded-3xl bg-yellow-100 flex items-center justify-center">

                <AlertTriangle className="w-10 h-10 text-yellow-600" />

              </div>

            </div>

          </div>

          {/* Monthly */}

          <div className="group bg-white rounded-[34px] p-8 border border-slate-100 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500 font-medium">
                  This Month
                </p>

                <h2 className="text-5xl font-bold text-slate-800 mt-4">
                  $0
                </h2>

              </div>

              <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center">

                <DollarSign className="w-10 h-10 text-emerald-700" />

              </div>

            </div>

          </div>

        </div>

      </section>
            {/* ================= PORTFOLIO OVERVIEW ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-12">

        <div className="bg-white rounded-[36px] border border-slate-100 shadow-xl p-10">

          <div className="flex flex-col lg:flex-row justify-between gap-10">

            <div>

              <p className="uppercase tracking-[4px] text-[#2E7BBE] text-sm font-semibold">
                Portfolio Overview
              </p>

              <h2 className="text-4xl font-bold text-slate-800 mt-4">
                Your Account at a Glance
              </h2>

              <p className="text-slate-500 mt-4 max-w-2xl leading-8">
                View the overall status of your properties, maintenance requests
                and upcoming services in one place.
              </p>

            </div>

            <div className="flex items-center justify-center">

              <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center">

                <Building2 className="w-14 h-14 text-[#2E7BBE]" />

              </div>

            </div>

          </div>

          <div className="grid md:grid-cols-4 gap-8 mt-12">

            <div>

              <p className="text-slate-500">
                Properties
              </p>

              <h3 className="text-4xl font-bold text-slate-800 mt-3">
                {properties.length}
              </h3>

            </div>

            <div>

              <p className="text-slate-500">
                Open Issues
              </p>

              <h3 className="text-4xl font-bold text-slate-800 mt-3">
                {openIssues}
              </h3>

            </div>

            <div>

              <p className="text-slate-500">
                Upcoming Cleanings
              </p>

              <h3 className="text-4xl font-bold text-slate-800 mt-3">
                0
              </h3>

            </div>

            <div>

              <p className="text-slate-500">
                Monthly Expenses
              </p>

              <h3 className="text-4xl font-bold text-slate-800 mt-3">
                $0
              </h3>

            </div>

          </div>

          <div className="mt-12">

            <div className="flex justify-between mb-3">

              <span className="font-semibold text-slate-700">
                Portfolio Health
              </span>

              <span className="font-bold text-[#2E7BBE]">
                100%
              </span>

            </div>

            <div className="h-4 rounded-full bg-slate-200 overflow-hidden">

              <div className="h-full w-full bg-gradient-to-r from-[#2E7BBE] via-[#4C95E7] to-[#76C3FF]" />

            </div>

          </div>

        </div>

      </section>
            {/* ================= MY PROPERTIES ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-14">

        <div className="flex items-end justify-between mb-8">

          <div>

            <p className="uppercase tracking-[4px] text-[#2E7BBE] text-sm font-semibold">
              Properties
            </p>

            <h2 className="text-4xl font-bold text-slate-800 mt-3">
              My Properties
            </h2>

            <p className="text-slate-500 mt-3">
              Select a property to view statements and manage information.
            </p>

          </div>

        </div>

        {properties.length === 0 ? (

          <div className="bg-white rounded-[36px] border border-slate-100 shadow-xl p-16 text-center">

            <Building2 className="w-20 h-20 mx-auto text-[#2E7BBE]" />

            <h3 className="text-3xl font-bold mt-8 text-slate-800">
              No Properties Assigned
            </h3>

            <p className="text-slate-500 mt-4 text-lg">
              Once a property has been assigned, it will appear here.
            </p>

          </div>

        ) : (

          <div className="grid xl:grid-cols-2 gap-8">

            {properties.map((property) => (

              <div
                key={property.id}
                className="bg-white rounded-[34px] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >

                {/* Top Color */}

                <div className="h-3 bg-gradient-to-r from-[#2E7BBE] via-[#4C95E7] to-[#76C3FF]" />

                {/* Property Image */}

<div className="h-44 bg-slate-100 overflow-hidden">

  {property.property_images?.[0] ? (

    <img
      src={property.property_images[0]}
      alt={property.name}
      className="w-full h-full object-cover"
    />

  ) : (

    <div className="w-full h-full flex items-center justify-center">
      <Home className="w-16 h-16 text-slate-300" />
    </div>

  )}

</div>

                {/* Content */}

                <div className="p-8">

                  <h3 className="text-3xl font-bold text-slate-800">

                    {property.name}

                  </h3>

                  <p className="text-slate-500 mt-3">

                    {property.address}

                  </p>

                  <div className="flex flex-wrap gap-3 mt-7">

                    <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold">

                      ● Active

                    </span>

                    <span className="bg-blue-100 text-[#2E7BBE] px-5 py-2 rounded-full font-semibold">

                      ${property.company_price} / Cleaning

                    </span>

                  </div>

                  {/* Coming Soon */}

                  <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-5">

                    <p className="text-sm text-slate-500">

                      Next Cleaning

                    </p>

                    <p className="font-bold text-slate-700 mt-2">

                      Coming Soon

                    </p>

                  </div>

                  {/* Buttons */}

                  <div className="grid grid-cols-2 gap-4 mt-8">

                    <button
                      onClick={() => {
                        sessionStorage.setItem(
                          "selectedProperty",
                          property.id.toString()
                        );

                        router.push("/owner-property");
                      }}
                      className="rounded-2xl bg-[#2E7BBE] hover:bg-[#245E93] text-white py-4 font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                    >

                      View Property

                      <ArrowRight className="w-5 h-5"/>

                    </button>

                    <button
                      onClick={() =>
                        router.push(`/owner-statement/${property.id}`)
                      }
                      className="rounded-2xl border-2 border-[#2E7BBE] text-[#2E7BBE] hover:bg-[#2E7BBE] hover:text-white py-4 font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                    >

                      <FileText className="w-5 h-5"/>

                      Statement

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>
            {/* ================= SUPPORT ================= */}

      <section className="max-w-7xl mx-auto px-8 mt-14 mb-14">

        <div className="rounded-[36px] overflow-hidden bg-gradient-to-r from-[#1E4F85] to-[#2E7BBE] shadow-2xl text-white">

          <div className="p-12 flex flex-col lg:flex-row justify-between items-center gap-10">

            <div>

              <p className="uppercase tracking-[4px] text-blue-200 text-sm font-semibold">
                Need Help?
              </p>

              <h2 className="text-4xl font-bold mt-4">
                We're always here for you.
              </h2>

              <p className="text-blue-100 text-lg mt-5 leading-8 max-w-2xl">
                Contact the PureSpace team whenever you need assistance with
                your property, statements, maintenance requests or cleaning
                services.
              </p>

            </div>

            <button
              onClick={() => setShowSupportModal(true)}
              className="bg-white text-[#2E7BBE] rounded-2xl px-10 py-5 font-bold shadow-xl hover:scale-105 transition-all duration-300"
            >
              Contact Support
            </button>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="pb-10 text-center">

        <p className="text-slate-500">

          Powered by <span className="font-semibold">PureSpace Cleaning</span>

        </p>

        <p className="text-slate-400 mt-2">

          Professional Property Management Platform

        </p>

      </footer>

      {/* ================= SUPPORT MODAL ================= */}

      {showSupportModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">

          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 shadow-2xl">

            <h2 className="text-3xl font-bold text-slate-800">

              Contact Support

            </h2>

            <p className="text-slate-500 mt-3">

              Our team will be happy to help you.

            </p>

            <div className="space-y-4 mt-8">

              <a
                href="mailto:info@purespacecleaning.ca"
                className="block rounded-2xl border p-5 hover:bg-slate-50 transition"
              >
                📧 Email Us
              </a>

              <a
  href="tel:+16475146361"
  className="block rounded-2xl border p-5 hover:bg-slate-50 transition"
>

  <p className="font-semibold text-slate-800">
    📞 Call Us
  </p>

  <p className="text-slate-500 mt-2">
    +1 (647) 514-6361
  </p>

</a>
<a
  href="https://wa.me/16475146361"
  target="_blank"
  rel="noopener noreferrer"
  className="block rounded-2xl border p-5 hover:bg-slate-50 transition"
>

  <p className="font-semibold text-slate-800">
    💬 WhatsApp
  </p>

  <p className="text-slate-500 mt-2">
    +1 (647) 514-6361
  </p>

</a>

              <div className="rounded-2xl border p-5">

                <p className="font-semibold">

                  Business Hours

                </p>

                <p className="text-slate-500 mt-2">

                  Monday - Sunday

                  <br />

                  8:00 AM - 8:00 PM

                </p>

              </div>

            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full mt-8 bg-[#2E7BBE] hover:bg-[#245E93] text-white rounded-2xl py-4 font-semibold transition-all duration-300"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </main>

  );
}