"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Home,
  CalendarDays,
  AlertTriangle,
  ArrowRight,
  FileText,
  ShieldCheck,
  Building2,
  LogOut,
  Headphones,
  Wrench,
  ChevronRight,
  X,
} from "lucide-react";

import { getProperties } from "@/lib/properties";
import { getOwners, acceptOwnerTerms } from "@/lib/owners";
import { getMaintenanceIssues } from "@/lib/maintenance";
import { getSchedules } from "@/lib/schedule";

const TERMS_VERSION = "1.0";

export default function OwnerHomePage() {
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [upcomingCleanings, setUpcomingCleanings] = useState<any[]>([]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsScrolledToBottom, setTermsScrolledToBottom] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);

  function handleLogout() {
    sessionStorage.clear();
    router.replace("/owner-login");
  }

  useEffect(() => {
    async function load() {
      try {
        const ownerId = sessionStorage.getItem("ownerId");

        if (!ownerId) {
          router.replace("/owner-login");
          return;
        }

        const numericOwnerId = Number(ownerId);

        const owners = await getOwners();
        const currentOwner = owners.find(
          (owner: any) => Number(owner.id) === numericOwnerId
        );

        if (
          currentOwner &&
          (!currentOwner.terms_accepted ||
            currentOwner.terms_version !== TERMS_VERSION)
        ) {
          setShowTermsModal(true);
        }

        const propertyData = await getProperties(numericOwnerId);
        setProperties(propertyData);

        const maintenance = await getMaintenanceIssues();
        setIssues(maintenance);

        const schedules = await getSchedules();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ownerPropertyIds = propertyData.map((property: any) =>
          Number(property.id)
        );

        const upcoming = schedules
          .filter((schedule: any) => {
            const cleaningDate = new Date(schedule.cleaning_date);
            cleaningDate.setHours(0, 0, 0, 0);

            return (
              cleaningDate >= today &&
              ownerPropertyIds.includes(Number(schedule.property_id)) &&
              schedule.status !== "Completed"
            );
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.cleaning_date).getTime() -
              new Date(b.cleaning_date).getTime()
          );

        setUpcomingCleanings(upcoming);
      } catch (error) {
        console.error("Error loading owner dashboard:", error);
      }
    }

    load();
  }, [router]);

  const openIssues = issues.filter(
    (issue: any) =>
      issue.status === "Open" &&
      properties.some(
        (property: any) =>
          Number(property.id) === Number(issue.property_id)
      )
  ).length;

  function getNextCleaning(propertyId: number) {
    return upcomingCleanings.find(
      (schedule: any) => Number(schedule.property_id) === Number(propertyId)
    );
  }

  function formatCleaningDate(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Coming Soon";
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB] text-slate-800">
      {/* ================= HEADER ================= */}
      <header className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8">
        <div className="bg-white border border-slate-100 shadow-sm rounded-[28px] px-5 sm:px-7 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#2E7BBE]" />
              </div>

              <div className="min-w-0">
                <p className="uppercase tracking-[3px] text-[#2E7BBE] text-[10px] sm:text-xs font-bold">
                  PureSpace
                </p>
                <p className="font-semibold text-slate-700 truncate">
                  Owner Portal
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold text-slate-500 hover:text-[#2E7BBE] hover:bg-blue-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= WELCOME ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-7 sm:pt-9">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-[#2E7BBE] via-[#4C95E7] to-[#76C3FF] shadow-xl">
          <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-36 left-1/3 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative p-7 sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <p className="uppercase tracking-[4px] text-blue-100 text-xs sm:text-sm font-semibold">
                PureSpace Owner Portal
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 leading-tight">
                Welcome Back 👋
              </h1>

              <p className="text-blue-50 text-base sm:text-lg lg:text-xl leading-8 mt-4 max-w-2xl">
                Manage your properties, cleanings, statements, maintenance
                requests and invoices from one professional dashboard.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-2 text-white text-sm font-medium border border-white/10">
                  <ShieldCheck className="w-5 h-5" />
                  Professional Cleaning
                </div>

                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-2 text-white text-sm font-medium border border-white/10">
                  <Building2 className="w-5 h-5" />
                  {properties.length}{" "}
                  {properties.length === 1 ? "Property" : "Properties"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-7 sm:mt-9">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium">Properties</p>
                <h2 className="text-4xl font-bold text-slate-800 mt-3">
                  {properties.length}
                </h2>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Home className="w-8 h-8 text-[#2E7BBE]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium">Upcoming Cleanings</p>
                <h2 className="text-4xl font-bold text-slate-800 mt-3">
                  {upcomingCleanings.length}
                </h2>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                <CalendarDays className="w-8 h-8 text-green-700" />
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/owner-maintenance")}
            className="text-left bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium">Open Issues</p>
                <h2 className="text-4xl font-bold text-slate-800 mt-3">
                  {openIssues}
                </h2>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* ================= MY PROPERTIES ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-12 sm:mt-14">
        <div className="mb-7">
          <p className="uppercase tracking-[4px] text-[#2E7BBE] text-xs sm:text-sm font-semibold">
            Properties
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                My Properties
              </h2>

              <p className="text-slate-500 mt-2">
                Select a property to view statements and manage information.
              </p>
            </div>

            <span className="text-sm font-semibold text-slate-400">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"}
            </span>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg p-12 sm:p-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 mx-auto flex items-center justify-center">
              <Building2 className="w-10 h-10 text-[#2E7BBE]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold mt-7 text-slate-800">
              No Properties Assigned
            </h3>

            <p className="text-slate-500 mt-3 text-base sm:text-lg">
              Once a property has been assigned, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-7">
            {properties.map((property) => {
              const nextCleaning = getNextCleaning(property.id);

              return (
                <div
                  key={property.id}
                  className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-2 bg-gradient-to-r from-[#2E7BBE] via-[#4C95E7] to-[#76C3FF]" />

                  <div className="h-48 sm:h-52 bg-slate-100 overflow-hidden">
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

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">
                          {property.name}
                        </h3>

                        <p className="text-slate-500 mt-2">
                          {property.address}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                          ● Active
                        </span>

                        <span className="bg-blue-100 text-[#2E7BBE] px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                          ${property.company_price} / Cleaning
                        </span>
                      </div>
                    </div>

                    <div className="mt-7 rounded-2xl bg-slate-50 border border-slate-200 p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <CalendarDays className="w-5 h-5 text-[#2E7BBE]" />
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">
                            Next Cleaning
                          </p>

                          <p className="font-bold text-slate-700 mt-0.5">
                            {nextCleaning
                              ? formatCleaningDate(nextCleaning.cleaning_date)
                              : "Coming Soon"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-7">
                      <button
                        onClick={() => {
                          sessionStorage.setItem(
                            "selectedProperty",
                            property.id.toString()
                          );
                          router.push("/owner-property");
                        }}
                        className="rounded-2xl bg-[#2E7BBE] hover:bg-[#245E93] text-white py-4 px-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                      >
                        View Property
                        <ArrowRight className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/owner-current-statement?propertyId=${property.id}`
                          )
                        }
                        className="rounded-2xl border-2 border-[#2E7BBE] text-[#2E7BBE] hover:bg-[#2E7BBE] hover:text-white py-4 px-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                      >
                        <FileText className="w-5 h-5" />
                        Statement
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= SERVICES ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-12 sm:mt-14">
        <div className="mb-7">
          <p className="uppercase tracking-[4px] text-[#2E7BBE] text-xs sm:text-sm font-semibold">
            Quick Access
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2">
            Your Services
          </h2>

          <p className="text-slate-500 mt-2">
            Everything you need to manage your PureSpace account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            onClick={() => router.push("/owner-invoices")}
            className="group text-left bg-white rounded-[28px] p-6 border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-[#2E7BBE]" />
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#2E7BBE] group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-5">
              Invoice History
            </h3>

            <p className="text-slate-500 mt-2 leading-6">
              View your previous invoices and billing periods.
            </p>
          </button>

          <button
            onClick={() => router.push("/owner-maintenance")}
            className="group text-left bg-white rounded-[28px] p-6 border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center shrink-0">
                <Wrench className="w-7 h-7 text-yellow-600" />
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-5">
              Maintenance
            </h3>

            <p className="text-slate-500 mt-2 leading-6">
              View open issues and maintenance requests for your properties.
            </p>
          </button>

          <button
            onClick={() => setShowSupportModal(true)}
            className="group text-left bg-white rounded-[28px] p-6 border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                <Headphones className="w-7 h-7 text-green-700" />
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-green-700 group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-5">
              Contact Support
            </h3>

            <p className="text-slate-500 mt-2 leading-6">
              Get in touch with the PureSpace team whenever you need help.
            </p>
          </button>
        </div>
      </section>

      {/* ================= SUPPORT BANNER ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-12 sm:mt-14 mb-12">
        <div className="rounded-[32px] overflow-hidden bg-gradient-to-r from-[#1E4F85] to-[#2E7BBE] shadow-xl text-white">
          <div className="p-7 sm:p-9 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="uppercase tracking-[4px] text-blue-200 text-xs font-semibold">
                Need Assistance?
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                We&apos;re here when you need us.
              </h2>

              <p className="text-blue-100 mt-2">
                Our team is available to help with your properties and
                PureSpace services.
              </p>
            </div>

            <button
              onClick={() => setShowSupportModal(true)}
              className="shrink-0 bg-white text-[#2E7BBE] rounded-2xl px-7 py-3.5 font-bold shadow-lg hover:scale-105 transition-all"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="pb-10 text-center px-5">
        <p className="text-slate-500">
          Powered by{" "}
          <span className="font-semibold">PureSpace Cleaning</span>
        </p>

        <p className="text-slate-400 mt-2 text-sm">
          Professional Property Management Platform
        </p>
      </footer>

      {/* ================= SUPPORT MODAL ================= */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-[32px] max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2E7BBE] to-[#4C95E7] px-7 py-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="uppercase tracking-[3px] text-blue-100 text-xs font-semibold">
                    PureSpace Support
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    Contact Support
                  </h2>

                  <p className="text-blue-100 mt-2">
                    Our team will be happy to help you.
                  </p>
                </div>

                <button
                  onClick={() => setShowSupportModal(false)}
                  className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                  aria-label="Close support"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-7 space-y-3">
              <a
                href="mailto:info@purespacecleaning.ca"
                className="block rounded-2xl border border-slate-200 p-5 hover:bg-slate-50 transition"
              >
                <p className="font-semibold text-slate-800">📧 Email Us</p>
                <p className="text-slate-500 mt-1">
                  info@purespacecleaning.ca
                </p>
              </a>

              <a
                href="tel:+16475146361"
                className="block rounded-2xl border border-slate-200 p-5 hover:bg-slate-50 transition"
              >
                <p className="font-semibold text-slate-800">📞 Call Us</p>
                <p className="text-slate-500 mt-1">+1 (647) 514-6361</p>
              </a>

              <a
                href="https://wa.me/16475146361"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-slate-200 p-5 hover:bg-slate-50 transition"
              >
                <p className="font-semibold text-slate-800">💬 WhatsApp</p>
                <p className="text-slate-500 mt-1">+1 (647) 514-6361</p>
              </a>

              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="font-semibold text-slate-800">
                  Business Hours
                </p>
                <p className="text-slate-500 mt-2">
                  Monday - Sunday
                  <br />
                  8:00 AM - 8:00 PM
                </p>
              </div>

              <button
                onClick={() => setShowSupportModal(false)}
                className="w-full mt-2 bg-[#2E7BBE] hover:bg-[#245E93] text-white rounded-2xl py-4 font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TERMS & PRIVACY MODAL ================= */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-5">
          <div className="bg-white rounded-[32px] max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2E7BBE] to-[#4C95E7] px-7 sm:px-8 py-6 sm:py-7 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-2xl p-3 shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Terms & Privacy
                  </h2>

                  <p className="text-blue-100 mt-1">
                    Please review our terms before continuing.
                  </p>
                </div>
              </div>
            </div>

            <div
              onScroll={(e) => {
                const element = e.currentTarget;

                const reachedBottom =
                  element.scrollTop + element.clientHeight >=
                  element.scrollHeight - 10;

                if (reachedBottom) {
                  setTermsScrolledToBottom(true);
                }
              }}
              className="px-7 sm:px-8 py-6 max-h-[55vh] overflow-y-auto text-slate-600 leading-7 space-y-6"
            >
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  1. Use of Your Information
                </h3>

                <p>
                  PureSpace Cleaning may collect and use information provided
                  by property owners through the PureSpace platform in order
                  to provide and manage our cleaning, property management,
                  communication, scheduling, invoicing and related services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  2. How We Use Your Information
                </h3>

                <p>
                  Your information may be used by PureSpace Cleaning
                  exclusively for legitimate business purposes related to
                  providing our services, managing your properties,
                  communicating with you, processing payments and maintaining
                  our internal business records.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  3. Privacy of Your Information
                </h3>

                <p>
                  PureSpace Cleaning will not sell or share your personal
                  information with third parties for advertising or unrelated
                  commercial purposes. We will only disclose information when
                  necessary to provide our services, comply with applicable
                  legal requirements, or protect the rights and security of
                  PureSpace Cleaning, our clients and our platform.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  4. Property Information
                </h3>

                <p>
                  Information relating to your properties, including
                  addresses, access instructions, door codes, Wi-Fi
                  information, cleaning instructions and other operational
                  details, may be stored and accessed by authorized PureSpace
                  Cleaning personnel when necessary to provide our services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  5. Security
                </h3>

                <p>
                  PureSpace Cleaning takes reasonable measures to protect
                  information stored within the platform. However, no
                  electronic system can be guaranteed to be completely secure.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  6. Acceptance
                </h3>

                <p>
                  By selecting &quot;I Accept the Terms&quot;, you confirm that
                  you have read and understood these terms and agree to the
                  collection, use and storage of your information as described
                  above.
                </p>
              </section>

              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                <p className="text-sm text-blue-800 font-medium">
                  Please scroll through the entire Terms & Privacy notice
                  before accepting.
                </p>
              </div>
            </div>

            <div className="border-t bg-slate-50 px-7 sm:px-8 py-6">
              {!termsScrolledToBottom && (
                <p className="text-center text-sm text-slate-500 mb-4">
                  Please scroll to the bottom to continue.
                </p>
              )}

              <button
                disabled={!termsScrolledToBottom || acceptingTerms}
                onClick={async () => {
                  try {
                    const ownerId = sessionStorage.getItem("ownerId");

                    if (!ownerId) {
                      router.replace("/owner-login");
                      return;
                    }

                    setAcceptingTerms(true);

                    await acceptOwnerTerms(
                      Number(ownerId),
                      TERMS_VERSION
                    );

                    setShowTermsModal(false);
                  } catch (error) {
                    console.error(error);

                    alert(
                      "We could not save your acceptance. Please try again."
                    );
                  } finally {
                    setAcceptingTerms(false);
                  }
                }}
                className="w-full bg-[#2E7BBE] hover:bg-[#245E93] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl py-4 font-bold text-lg transition-all duration-300"
              >
                {acceptingTerms
                  ? "Saving..."
                  : termsScrolledToBottom
                    ? "I Accept the Terms"
                    : "Read the Terms to Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
