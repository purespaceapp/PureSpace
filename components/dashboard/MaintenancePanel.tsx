"use client";

import { useEffect, useState } from "react";

import {
  Wrench,
  Plus,
  X,
  Building2,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

import { getProperties } from "@/lib/properties";
import { createMaintenanceIssue } from "@/lib/maintenance";

export default function MaintenancePanel() {

  const [open, setOpen] = useState(false);

  const [properties, setProperties] = useState<any[]>([]);

  const [selectedProperty, setSelectedProperty] = useState("");

  const [issueType, setIssueType] = useState("Other");

  const [description, setDescription] = useState("");

  useEffect(() => {

    async function loadProperties() {

      const data = await getProperties();

      setProperties(data);

    }

    loadProperties();

  }, []);

  async function saveIssue() {

    if (!selectedProperty || !description.trim()) {

      alert("Please complete all required fields.");

      return;

    }

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

    window.location.reload();

  }

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

  {/* SMALL STATS */}

  <div className="grid grid-cols-3 gap-6 p-8 border-b border-slate-100">

    <div className="rounded-2xl bg-red-50 p-6">

      <p className="text-red-500 text-sm font-semibold uppercase">

        Open

      </p>

      <h3 className="text-4xl font-black text-red-600 mt-3">

        0

      </h3>

    </div>

    <div className="rounded-2xl bg-yellow-50 p-6">

      <p className="text-yellow-600 text-sm font-semibold uppercase">

        In Progress

      </p>

      <h3 className="text-4xl font-black text-yellow-600 mt-3">

        0

      </h3>

    </div>

    <div className="rounded-2xl bg-green-50 p-6">

      <p className="text-green-600 text-sm font-semibold uppercase">

        Resolved

      </p>

      <h3 className="text-4xl font-black text-green-600 mt-3">

        0

      </h3>

    </div>

  </div>

  {/* EMPTY */}

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
  {open && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

  <div className="w-[720px] rounded-[36px] bg-white shadow-2xl overflow-hidden">

    {/* HEADER */}

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

    {/* BODY */}

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