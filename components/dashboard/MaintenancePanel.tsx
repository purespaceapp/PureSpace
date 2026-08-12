"use client";

import { useEffect, useState } from "react";

import {
  Wrench,
  Plus,
  X,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

import { getProperties } from "@/lib/properties";
import {
  createMaintenanceIssue,
  getMaintenanceIssues,
} from "@/lib/maintenance";

interface MaintenancePanelProps {
  issues?: any[];
}

export default function MaintenancePanel({
  issues: dashboardIssues,
}: MaintenancePanelProps) {
  const [open, setOpen] = useState(false);

  const [properties, setProperties] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>(dashboardIssues || []);

  const [selectedProperty, setSelectedProperty] = useState("");
  const [issueType, setIssueType] = useState("Other");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [propertiesData, issuesData] = await Promise.all([
          getProperties(),
          getMaintenanceIssues(),
        ]);

        setProperties(propertiesData);
        setIssues(issuesData);
      } catch (error) {
        console.error("Error loading maintenance data:", error);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (dashboardIssues) {
      setIssues(dashboardIssues);
    }
  }, [dashboardIssues]);

  async function saveIssue() {
    if (!selectedProperty || !description.trim()) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      await createMaintenanceIssue({
        property_id: Number(selectedProperty),
        issue_type: issueType,
        notes: description,
        status: "Open",
      });

      setOpen(false);
      setSelectedProperty("");
      setIssueType("Other");
      setDescription("");

      const updatedIssues = await getMaintenanceIssues();
      setIssues(updatedIssues);
    } catch (error) {
      console.error("Error creating maintenance issue:", error);
      alert("Could not create the maintenance issue.");
    }
  }

  const openIssues = issues.filter(
    (issue) => issue.status?.toLowerCase() === "open"
  );

  const inProgressIssues = issues.filter(
    (issue) => issue.status?.toLowerCase() === "in progress"
  );

  const resolvedIssues = issues.filter(
    (issue) => issue.status?.toLowerCase() === "resolved"
  );

  return (
    <div className="bg-white rounded-[34px] shadow-xl border border-slate-100 overflow-hidden">

      {/* HEADER */}

      <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between">

        <div className="flex items-center gap-5">

          <div className="w-16 h-16 rounded-3xl bg-[#EAF4FE] flex items-center justify-center">
            <Wrench className="w-8 h-8 text-[#2E7BBE]" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Maintenance Center
            </h2>

            <p className="text-slate-500 mt-2">
              Report and manage property issues.
            </p>
          </div>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 rounded-2xl bg-[#2E7BBE] hover:bg-[#23649D] transition px-7 py-4 text-white font-semibold shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Issue
        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-6 p-8 border-b border-slate-100">

        <div className="rounded-2xl bg-red-50 p-6">
          <p className="text-red-500 text-sm font-semibold uppercase">
            Open
          </p>

          <h3 className="text-4xl font-black text-red-600 mt-3">
            {openIssues.length}
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-50 p-6">
          <p className="text-yellow-600 text-sm font-semibold uppercase">
            In Progress
          </p>

          <h3 className="text-4xl font-black text-yellow-600 mt-3">
            {inProgressIssues.length}
          </h3>
        </div>

        <div className="rounded-2xl bg-green-50 p-6">
          <p className="text-green-600 text-sm font-semibold uppercase">
            Resolved
          </p>

          <h3 className="text-4xl font-black text-green-600 mt-3">
            {resolvedIssues.length}
          </h3>
        </div>

      </div>

      {/* ISSUES */}

      {issues.length > 0 ? (

        <div className="p-8 space-y-5">

          <div className="flex items-center justify-between">

            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Recent Issues
              </h3>

              <p className="text-slate-500 mt-1">
                Maintenance reports from your properties.
              </p>
            </div>

            <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              {openIssues.length} Open
            </span>

          </div>

          {issues.map((issue) => (

            <div
              key={issue.id}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-6"
            >

              <div className="flex items-start justify-between gap-6">

                <div>

                  <div className="flex items-center gap-3">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        issue.status === "Open"
                          ? "bg-red-100 text-red-600"
                          : issue.status === "Resolved"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {issue.status}
                    </span>

                    <span className="text-sm text-slate-400">
                      #{issue.id}
                    </span>

                  </div>

                  <h4 className="mt-4 text-xl font-bold text-slate-800">
                    {issue.issue_type || "Other"}
                  </h4>

                  <p className="mt-2 text-slate-600">
                    {issue.notes}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <span>Property:</span>
                    <span className="font-semibold text-slate-700">
                      {issue.property?.name ||
                        issue.properties?.name ||
                        issue.property_name ||
                        "Property"}
                    </span>
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="py-20 px-8 flex flex-col items-center">

          <div className="w-28 h-28 rounded-full bg-[#EAF4FE] flex items-center justify-center">
            <ClipboardList className="w-14 h-14 text-[#2E7BBE]" />
          </div>

          <h3 className="mt-8 text-3xl font-bold text-slate-800">
            No Maintenance Issues
          </h3>

          <p className="mt-4 text-slate-500 text-center max-w-lg leading-7">
            Great news! None of your properties currently have
            reported maintenance problems.
          </p>

          <button
            onClick={() => setOpen(true)}
            className="mt-8 flex items-center gap-3 rounded-2xl bg-[#2E7BBE] hover:bg-[#23649D] transition px-8 py-4 text-white font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Report New Issue
          </button>

        </div>

      )}

      {/* MODAL */}

      {open && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="w-[720px] rounded-[36px] bg-white shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-7">

              <div className="flex items-center gap-5">

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF4FE]">
                  <AlertTriangle className="h-8 w-8 text-[#2E7BBE]" />
                </div>

                <div>

                  <h2 className="text-3xl font-bold text-slate-800">
                    Report Maintenance Issue
                  </h2>

                  <p className="mt-1 text-slate-500">
                    Create a new issue for one of your properties.
                  </p>

                </div>

              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 transition"
              >
                <X className="h-6 w-6 text-slate-700" />
              </button>

            </div>

            <div className="space-y-6 p-8">

              <div>

                <label className="mb-2 block font-semibold text-slate-700">
                  Property
                </label>

                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-4 focus:border-[#2E7BBE] focus:outline-none"
                >

                  <option value="">
                    Select Property
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

                <label className="mb-2 block font-semibold text-slate-700">
                  Issue Type
                </label>

                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-4 focus:border-[#2E7BBE] focus:outline-none"
                >

                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Broken Item</option>
                  <option>Supplies</option>
                  <option>Other</option>

                </select>

              </div>

              <div>

                <label className="mb-2 block font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  className="h-40 w-full rounded-2xl border border-slate-300 p-4 focus:border-[#2E7BBE] focus:outline-none resize-none"
                />

              </div>

              <button
                onClick={saveIssue}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#2E7BBE] py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-[#23649D]"
              >
                <Plus className="h-5 w-5" />
                Save Issue
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}