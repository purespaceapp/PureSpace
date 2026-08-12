"use client";

import { useEffect, useState } from "react";
import {
  getMaintenanceIssues,
  resolveMaintenanceIssue,
  reopenMaintenanceIssue,
} from "@/lib/maintenance";
import { getProperties } from "@/lib/properties";

export default function MaintenancePage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  async function loadData() {
    try {
      setLoading(true);

      const [issuesData, propertiesData] = await Promise.all([
        getMaintenanceIssues(),
        getProperties(),
      ]);

      setIssues(issuesData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error loading maintenance issues:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getPropertyName(propertyId: number) {
    const property = properties.find(
      (item) => Number(item.id) === Number(propertyId)
    );

    return property?.name || `Property #${propertyId}`;
  }

  async function handleResolve(id: number) {
    try {
      setUpdating(id);

      await resolveMaintenanceIssue(id);

      await loadData();
    } catch (error) {
      console.error("Error resolving issue:", error);
      alert("Could not resolve this issue.");
    } finally {
      setUpdating(null);
    }
  }

  async function handleReopen(id: number) {
    try {
      setUpdating(id);

      await reopenMaintenanceIssue(id);

      await loadData();
    } catch (error) {
      console.error("Error reopening issue:", error);
      alert("Could not reopen this issue.");
    } finally {
      setUpdating(null);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const openIssues = issues.filter(
    (issue) => issue.status === "Open"
  );

  const resolvedIssues = issues.filter(
    (issue) => issue.status === "Resolved"
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="text-lg font-semibold text-[#2E7BBE]">
          Loading maintenance issues...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB] p-8">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#2E7BBE]">
            Operations
          </p>

          <h1 className="text-4xl font-bold text-[#17324D] mt-2">
            Maintenance Issues
          </h1>

          <p className="text-gray-500 mt-2">
            Manage reported maintenance problems and track their status.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Open Issues
                </p>

                <p className="text-4xl font-bold text-red-500 mt-2">
                  {openIssues.length}
                </p>

                <p className="text-gray-500 mt-1">
                  Issues requiring attention
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">
                🔴
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Resolved Issues
                </p>

                <p className="text-4xl font-bold text-green-600 mt-2">
                  {resolvedIssues.length}
                </p>

                <p className="text-gray-500 mt-1">
                  Successfully resolved
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

        </div>

        {/* OPEN ISSUES */}
        <section className="mb-10">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#17324D]">
                Open Issues
              </h2>

              <p className="text-gray-500">
                Maintenance problems that still need attention.
              </p>
            </div>

            <span className="bg-red-50 text-red-600 px-4 py-2 rounded-full font-semibold">
              {openIssues.length} Open
            </span>
          </div>

          {openIssues.length === 0 ? (

            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">
                🎉
              </div>

              <h3 className="text-xl font-bold text-[#17324D]">
                No open maintenance issues
              </h3>

              <p className="text-gray-500 mt-2">
                Everything is currently under control.
              </p>
            </div>

          ) : (

            <div className="space-y-5">

              {openIssues.map((issue) => (

                <div
                  key={issue.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-red-100"
                >

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3 mb-3">

                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-bold">
                          OPEN
                        </span>

                        <span className="text-sm text-gray-400">
                          #{issue.id}
                        </span>

                      </div>

                      <h3 className="text-2xl font-bold text-[#17324D]">
                        {issue.issue_type || "Maintenance Issue"}
                      </h3>

                      <p className="text-gray-600 mt-3 whitespace-pre-wrap">
                        {issue.notes || "No additional notes provided."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                        <div>
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
                            Property
                          </p>

                          <p className="font-semibold text-gray-700 mt-1">
                            🏠 {getPropertyName(issue.property_id)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
                            Reported
                          </p>

                          <p className="font-semibold text-gray-700 mt-1">
                            📅 {formatDate(issue.reported_at)}
                          </p>
                        </div>

                      </div>

                      {issue.photo_url && (
                        <div className="mt-5">
                          <a
                            href={issue.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#2E7BBE] font-semibold hover:underline"
                          >
                            📸 View Report Photo
                          </a>
                        </div>
                      )}

                    </div>

                    <div className="lg:w-52">

                      <button
                        onClick={() => handleResolve(issue.id)}
                        disabled={updating === issue.id}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-5 rounded-2xl transition"
                      >
                        {updating === issue.id
                          ? "Updating..."
                          : "✓ Mark as Resolved"}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* RESOLVED ISSUES */}
        <section>

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-2xl font-bold text-[#17324D]">
                Resolved Issues
              </h2>

              <p className="text-gray-500">
                Previously reported problems that have been resolved.
              </p>
            </div>

            <span className="bg-green-50 text-green-600 px-4 py-2 rounded-full font-semibold">
              {resolvedIssues.length} Resolved
            </span>

          </div>

          {resolvedIssues.length === 0 ? (

            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">

              <div className="text-5xl mb-4">
                📋
              </div>

              <h3 className="text-xl font-bold text-[#17324D]">
                No resolved issues yet
              </h3>

              <p className="text-gray-500 mt-2">
                Resolved maintenance reports will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {resolvedIssues.map((issue) => (

                <div
                  key={issue.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-green-100"
                >

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                    <div className="flex-1">

                      <div className="flex items-center gap-3 mb-3">

                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-bold">
                          RESOLVED
                        </span>

                        <span className="text-sm text-gray-400">
                          #{issue.id}
                        </span>

                      </div>

                      <h3 className="text-xl font-bold text-[#17324D]">
                        {issue.issue_type || "Maintenance Issue"}
                      </h3>

                      <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                        {issue.notes || "No additional notes provided."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                        <div>
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
                            Property
                          </p>

                          <p className="font-semibold text-gray-700 mt-1">
                            🏠 {getPropertyName(issue.property_id)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
                            Reported
                          </p>

                          <p className="font-semibold text-gray-700 mt-1">
                            📅 {formatDate(issue.reported_at)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
                            Resolved
                          </p>

                          <p className="font-semibold text-green-600 mt-1">
                            ✓ {formatDate(issue.resolved_at)}
                          </p>
                        </div>

                      </div>

                      {issue.photo_url && (
                        <div className="mt-5">
                          <a
                            href={issue.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#2E7BBE] font-semibold hover:underline"
                          >
                            📸 View Report Photo
                          </a>
                        </div>
                      )}

                    </div>

                    <div className="lg:w-44">

                      <button
                        onClick={() => handleReopen(issue.id)}
                        disabled={updating === issue.id}
                        className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold py-3 px-5 rounded-2xl transition"
                      >
                        {updating === issue.id
                          ? "Updating..."
                          : "↩ Reopen Issue"}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}