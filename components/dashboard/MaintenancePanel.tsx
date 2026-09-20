"use client";

import { useEffect, useRef, useState } from "react";

import {
  Wrench,
  Plus,
  X,
  ClipboardList,
  AlertTriangle,
  ImagePlus,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { getProperties } from "@/lib/properties";

import {
  createMaintenanceIssue,
  getMaintenanceIssues,
  uploadMaintenancePhoto,
} from "@/lib/maintenance";

interface MaintenancePanelProps {
  issues?: any[];
}

export default function MaintenancePanel({
  issues: dashboardIssues,
}: MaintenancePanelProps) {
  const [open, setOpen] = useState(false);

  const [properties, setProperties] = useState<any[]>(
    []
  );

  const [issues, setIssues] = useState<any[]>(
    dashboardIssues || []
  );

  const [selectedProperty, setSelectedProperty] =
    useState("");

  const [issueType, setIssueType] =
    useState("Other");

  const [description, setDescription] =
    useState("");

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          propertiesData,
          issuesData,
        ] = await Promise.all([
          getProperties(),
          getMaintenanceIssues(),
        ]);

        setProperties(propertiesData);
        setIssues(issuesData);
      } catch (error) {
        console.error(
          "Error loading maintenance data:",
          error
        );
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (dashboardIssues) {
      setIssues(dashboardIssues);
    }
  }, [dashboardIssues]);

  function resetForm() {
    setSelectedProperty("");
    setIssueType("Other");
    setDescription("");
    setPhoto(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function closeModal() {
    if (saving) return;

    setOpen(false);
    resetForm();
  }

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("The image must be smaller than 5MB.");
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(file);
    setPhotoPreview(
      URL.createObjectURL(file)
    );
  }

  function removePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function saveIssue() {
    if (
      !selectedProperty ||
      !description.trim()
    ) {
      alert(
        "Please complete all required fields."
      );
      return;
    }

    try {
      setSaving(true);

      let photoUrl: string | null = null;

      if (photo) {
        photoUrl = await uploadMaintenancePhoto(
          photo,
          Number(selectedProperty)
        );
      }

      await createMaintenanceIssue({
        property_id: Number(selectedProperty),
        issue_type: issueType,
        notes: description.trim(),
        status: "Open",
        photo_url: photoUrl,
      });

      const updatedIssues =
        await getMaintenanceIssues();

      setIssues(updatedIssues);

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(
        "Error creating maintenance issue:",
        error
      );

      alert(
        "Could not create the maintenance issue. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const openIssues = issues.filter(
    (issue) =>
      issue.status?.toLowerCase() === "open"
  );

  const inProgressIssues = issues.filter(
    (issue) =>
      issue.status?.toLowerCase() ===
      "in progress"
  );

  const resolvedIssues = issues.filter(
    (issue) =>
      issue.status?.toLowerCase() ===
      "resolved"
  );

  return (
    <div className="overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-xl">
      <div className="flex flex-col gap-5 border-b border-slate-100 px-8 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF4FE]">
            <Wrench className="h-8 w-8 text-[#2E7BBE]" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Maintenance Center
            </h2>

            <p className="mt-1 text-slate-500">
              Report and manage property issues.
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-3 rounded-2xl bg-[#2E7BBE] px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-[#23649D]"
        >
          <Plus className="h-5 w-5" />
          New Issue
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 border-b border-slate-100 p-6 md:grid-cols-3 md:p-8">
        <div className="rounded-2xl bg-red-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500">
            Open
          </p>

          <h3 className="mt-2 text-3xl font-black text-red-600">
            {openIssues.length}
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600">
            In Progress
          </p>

          <h3 className="mt-2 text-3xl font-black text-yellow-600">
            {inProgressIssues.length}
          </h3>
        </div>

        <div className="rounded-2xl bg-green-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600">
            Resolved
          </p>

          <h3 className="mt-2 text-3xl font-black text-green-600">
            {resolvedIssues.length}
          </h3>
        </div>
      </div>

      {issues.length > 0 ? (
        <div className="space-y-5 p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Recent Issues
              </h3>

              <p className="mt-1 text-slate-500">
                Maintenance reports from your properties.
              </p>
            </div>

            <span className="w-fit rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              {openIssues.length} Open
            </span>
          </div>

          {issues.slice(0, 6).map((issue) => (
            <div
              key={issue.id}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-5 md:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row">
                {issue.photo_url && (
                  <a
                    href={issue.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 lg:h-32 lg:w-40"
                  >
                    <img
                      src={issue.photo_url}
                      alt="Maintenance issue"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </a>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
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

                  <h4 className="mt-3 text-xl font-bold text-slate-800">
                    {issue.issue_type ||
                      "Other"}
                  </h4>

                  <p className="mt-2 text-slate-600">
                    {issue.notes}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                    <span>Property:</span>

                    <span className="font-semibold text-slate-700">
                      {issue.property?.name ||
                        issue.properties?.name ||
                        issue.property_name ||
                        "Property"}
                    </span>
                  </div>

                  {issue.photo_url && (
                    <a
                      href={issue.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2E7BBE] hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Photo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center px-8 py-20 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#EAF4FE]">
            <ClipboardList className="h-14 w-14 text-[#2E7BBE]" />
          </div>

          <h3 className="mt-8 text-3xl font-bold text-slate-800">
            No Maintenance Issues
          </h3>

          <p className="mt-4 max-w-lg leading-7 text-slate-500">
            Great news! None of your properties currently have reported maintenance problems.
          </p>

          <button
            onClick={() => setOpen(true)}
            className="mt-8 flex items-center gap-3 rounded-2xl bg-[#2E7BBE] px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-[#23649D]"
          >
            <Plus className="h-5 w-5" />
            Report New Issue
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-[720px] overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6 md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FE]">
                  <AlertTriangle className="h-7 w-7 text-[#2E7BBE]" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Report Maintenance Issue
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add details and a photo if needed.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>

            <div className="space-y-5 p-6 md:p-8">
              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Property
                </label>

                <select
                  value={selectedProperty}
                  onChange={(e) =>
                    setSelectedProperty(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-[#2E7BBE]"
                >
                  <option value="">
                    Select Property
                  </option>

                  {properties.map(
                    (property) => (
                      <option
                        key={property.id}
                        value={property.id}
                      >
                        {property.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Issue Type
                </label>

                <select
                  value={issueType}
                  onChange={(e) =>
                    setIssueType(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-[#2E7BBE]"
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
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe the issue..."
                  className="h-32 w-full resize-none rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-[#2E7BBE]"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Photo
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                {!photoPreview ? (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-[#2E7BBE] hover:bg-[#F4F9FE]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <ImagePlus className="h-6 w-6 text-[#2E7BBE]" />
                    </div>

                    <p className="mt-3 font-semibold text-slate-700">
                      Add a photo
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      JPG, PNG or other image • Max 5MB
                    </p>
                  </button>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img
                      src={photoPreview}
                      alt="Selected maintenance photo"
                      className="max-h-64 w-full object-contain"
                    />

                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-red-500 shadow-lg transition hover:bg-white"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <button
                onClick={saveIssue}
                disabled={saving}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#2E7BBE] py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-[#23649D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  "Saving Issue..."
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Save Issue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
