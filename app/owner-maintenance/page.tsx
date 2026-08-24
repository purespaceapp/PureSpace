"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Home,
  Image as ImageIcon,
} from "lucide-react";

import { getProperties } from "@/lib/properties";
import { getMaintenanceIssues } from "@/lib/maintenance";

export default function OwnerMaintenancePage() {
  const router = useRouter();

  const [issues, setIssues] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ownerId = sessionStorage.getItem("ownerId");

      if (!ownerId) {
        router.replace("/owner-login");
        return;
      }

      try {
        const propertyData = await getProperties(Number(ownerId));
        setProperties(propertyData);

        const maintenanceData = await getMaintenanceIssues();

        const ownerPropertyIds = propertyData.map(
          (property) => Number(property.id)
        );

        const ownerIssues = maintenanceData.filter((issue: any) =>
          ownerPropertyIds.includes(Number(issue.property_id))
        );

        setIssues(ownerIssues);
      } catch (error) {
        console.error("Error loading maintenance issues:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function getProperty(propertyId: number) {
    return properties.find(
      (property) => Number(property.id) === Number(propertyId)
    );
  }

  const openIssues = issues.filter(
    (issue) => issue.status === "Open"
  );

  const resolvedIssues = issues.filter(
    (issue) => issue.status === "Resolved"
  );

  return (
    <main className="min-h-screen bg-[#F4F7FB]">

      {/* HEADER */}
      <section className="max-w-7xl mx-auto px-8 pt-10">

        <button
          onClick={() => router.push("/owner-home")}
          className="flex items-center gap-2 text-[#2E7BBE] font-semibold hover:underline mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-[#1E4F85] via-[#2E7BBE] to-[#76C3FF] shadow-2xl">

          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative p-12">

            <div className="flex flex-col lg:flex-row justify-between gap-10">

              <div>

                <p className="uppercase tracking-[5px] text-blue-100 text-sm font-semibold">
                  PureSpace Owner Portal
                </p>

                <h1 className="text-5xl font-bold text-white mt-5">
                  Maintenance Issues
                </h1>

                <p className="text-blue-100 text-lg mt-5 max-w-2xl leading-8">
                  View maintenance issues reported for your Airbnb properties
                  and keep track of their current status.
                </p>

              </div>

              <div className="flex gap-4">

                <div className="bg-white/15 backdrop-blur-xl rounded-3xl px-7 py-6 text-center text-white min-w-[130px]">
                  <AlertTriangle className="w-7 h-7 mx-auto mb-3" />

                  <p className="text-3xl font-bold">
                    {openIssues.length}
                  </p>

                  <p className="text-blue-100 text-sm mt-1">
                    Open
                  </p>
                </div>

                <div className="bg-white/15 backdrop-blur-xl rounded-3xl px-7 py-6 text-center text-white min-w-[130px]">
                  <CheckCircle2 className="w-7 h-7 mx-auto mb-3" />

                  <p className="text-3xl font-bold">
                    {resolvedIssues.length}
                  </p>

                  <p className="text-blue-100 text-sm mt-1">
                    Resolved
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-8 mt-10 pb-16">

        {loading ? (

          <div className="bg-white rounded-[32px] shadow-xl p-16 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-48 mx-auto" />
              <div className="h-4 bg-slate-200 rounded w-72 mx-auto mt-4" />
            </div>
          </div>

        ) : issues.length === 0 ? (

          <div className="bg-white rounded-[36px] border border-slate-100 shadow-xl p-16 text-center">

            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-slate-800 mt-8">
              No Maintenance Issues
            </h2>

            <p className="text-slate-500 text-lg mt-4">
              There are currently no maintenance issues reported for your
              properties.
            </p>

          </div>

        ) : (

          <div className="space-y-7">

            {issues.map((issue) => {

              const property = getProperty(issue.property_id);

              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-[34px] border border-slate-100 shadow-xl overflow-hidden"
                >

                  <div
                    className={`h-2 ${
                      issue.status === "Open"
                        ? "bg-yellow-400"
                        : "bg-green-500"
                    }`}
                  />

                  <div className="p-8">

                    <div className="flex flex-col xl:flex-row gap-8">

                      {/* PHOTO */}
                      <div className="xl:w-72">

                        <div className="h-52 rounded-3xl overflow-hidden bg-slate-100">

                          {issue.photo_url ? (

                            <img
                              src={issue.photo_url}
                              alt={issue.issue_type || "Maintenance issue"}
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <ImageIcon className="w-12 h-12" />
                              <p className="text-sm mt-3">
                                No photo provided
                              </p>
                            </div>

                          )}

                        </div>

                      </div>

                      {/* DETAILS */}
                      <div className="flex-1">

                        <div className="flex flex-col md:flex-row justify-between gap-5">

                          <div>

                            <div className="flex items-center gap-3">

                              <Building2 className="w-6 h-6 text-[#2E7BBE]" />

                              <h2 className="text-2xl font-bold text-slate-800">
                                {property?.name || "Property"}
                              </h2>

                            </div>

                            {property?.address && (
                              <p className="text-slate-500 mt-2">
                                {property.address}
                              </p>
                            )}

                          </div>

                          <div>

                            {issue.status === "Open" ? (

                              <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-5 py-2.5 rounded-full font-semibold">
                                <Clock className="w-4 h-4" />
                                Open
                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2.5 rounded-full font-semibold">
                                <CheckCircle2 className="w-4 h-4" />
                                Resolved
                              </span>

                            )}

                          </div>

                        </div>

                        <div className="grid md:grid-cols-2 gap-5 mt-8">

                          <div className="rounded-2xl bg-slate-50 p-5">

                            <p className="text-sm text-slate-500">
                              Issue Type
                            </p>

                            <p className="font-bold text-slate-800 mt-2">
                              {issue.issue_type || "Maintenance Issue"}
                            </p>

                          </div>

                          <div className="rounded-2xl bg-slate-50 p-5">

                            <p className="text-sm text-slate-500">
                              Reported
                            </p>

                            <div className="flex items-center gap-2 mt-2">

                              <CalendarDays className="w-4 h-4 text-[#2E7BBE]" />

                              <p className="font-bold text-slate-800">
                                {issue.reported_at
                                  ? new Date(
                                      issue.reported_at
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Unknown"}
                              </p>

                            </div>

                          </div>

                        </div>

                        {issue.notes && (

                          <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-5">

                            <p className="text-sm text-slate-500">
                              Notes
                            </p>

                            <p className="text-slate-700 mt-2 leading-7">
                              {issue.notes}
                            </p>

                          </div>

                        )}

                        {issue.resolved_at && (

                          <div className="mt-5 text-sm text-green-700">

                            Resolved on{" "}
                            {new Date(
                              issue.resolved_at
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}