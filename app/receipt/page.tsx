"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Home,
  Receipt,
  Sparkles,
  Upload,
  UserRound,
  Wallet,
  XCircle,
  Clock3,
} from "lucide-react";

import {
  getReceipts,
  saveReceipt,
  uploadReceiptPhoto,
} from "@/lib/receipts";

import { getProperties } from "@/lib/properties";
import { getSchedulesByProperty } from "@/lib/schedule";

export default function ReceiptPage() {
  const router = useRouter();

  const [employee, setEmployee] = useState<any>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [amount, setAmount] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    async function load() {
      if (typeof window === "undefined") return;

      const employeeData = JSON.parse(
        sessionStorage.getItem("employee") || "null"
      );

      const storedEmployeeId =
        sessionStorage.getItem("employeeId");

      if (!employeeData || !storedEmployeeId) {
        router.push("/cleaner-login");
        return;
      }

      const id = Number(storedEmployeeId);

      setEmployee(employeeData);
      setEmployeeId(String(id));

      try {
        const [propertyData, receiptData] =
          await Promise.all([
            getProperties(),
            getReceipts(id),
          ]);

        setProperties(propertyData);
        setReceipts(receiptData);
      } catch (error) {
        console.error(
          "Failed to load receipt data:",
          error
        );
      }
    }

    load();
  }, [router]);

  async function handlePropertyChange(
    value: string
  ) {
    setPropertyId(value);
    setScheduleId("");
    setSchedules([]);

    if (!value) return;

    try {
      const data =
        await getSchedulesByProperty(
          Number(value)
        );

      /*
       * Only show cleaning records assigned to
       * the logged-in cleaner.
       */
      const ownSchedules = data.filter(
        (schedule: any) =>
          Number(schedule.employee_id) ===
          Number(employeeId)
      );

      setSchedules(ownSchedules);
    } catch (error) {
      console.error(
        "Failed to load cleanings:",
        error
      );
    }
  }

  function handlePhotoChange(
    file: File | null
  ) {
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    setPhoto(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview(null);
  }

  function resetForm() {
    setPropertyId("");
    setScheduleId("");
    setSchedules([]);
    setAmount("");
    setPhoto(null);
    setPhotoPreview(null);
  }

  async function handleSubmit() {
    if (
      !employeeId ||
      !propertyId ||
      !scheduleId ||
      !amount ||
      !photo
    ) {
      alert("Please complete all fields.");
      return;
    }

    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setSubmitting(true);

      const photoUrl =
        await uploadReceiptPhoto(photo);

      await saveReceipt({
        employee_id: Number(employeeId),
        property_id: Number(propertyId),
        schedule_id: Number(scheduleId),
        amount: numericAmount,
        receipt_photo: photoUrl,
        purchase_date:
          new Date()
            .toISOString()
            .split("T")[0],
        status: "Pending",
      });

      const updatedReceipts =
        await getReceipts(
          Number(employeeId)
        );

      setReceipts(updatedReceipts);

      resetForm();

      alert(
        "Receipt submitted successfully!"
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Something went wrong while submitting the receipt."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProperty =
    properties.find(
      (property) =>
        String(property.id) === propertyId
    );

  const pendingCount =
    receipts.filter(
      (receipt) =>
        receipt.status === "Pending"
    ).length;

  const approvedCount =
    receipts.filter(
      (receipt) =>
        receipt.status === "Approved"
    ).length;

  return (
    <main className="min-h-screen bg-[#F4F8FC] text-[#14263A]">

      {/* =================================================== */}
      {/* BACKGROUND                                          */}
      {/* =================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-[320px] w-[320px] rounded-full bg-cyan-200/20 blur-3xl sm:h-[420px] sm:w-[420px]" />

        <div className="absolute -right-32 top-20 h-[320px] w-[320px] rounded-full bg-blue-200/20 blur-3xl sm:h-[420px] sm:w-[420px]" />

      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-8 sm:py-6">

        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

        <header className="flex items-center justify-between">

          <button
            onClick={() =>
              router.push("/cleaner-home")
            }
            className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-[#2E7BBE]"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Back
            </span>
          </button>

          <div className="flex items-center gap-2.5">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">

              <Receipt className="h-5 w-5 text-[#2E7BBE]" />

            </div>

            <div className="hidden sm:block">

              <p className="text-sm font-extrabold tracking-tight">
                PureSpace
              </p>

              <p className="text-[8px] font-bold uppercase tracking-[1.8px] text-slate-400">
                Cleaner Workspace
              </p>

            </div>

          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[11px] font-semibold text-slate-500">
              Online
            </span>

          </div>

        </header>

        {/* ================================================= */}
        {/* HERO                                               */}
        {/* ================================================= */}

        <section className="mt-5 rounded-[28px] bg-gradient-to-br from-[#174B7A] via-[#276FA9] to-[#3B93D3] px-5 py-6 text-white shadow-[0_18px_45px_rgba(35,93,139,0.18)] sm:mt-8 sm:rounded-[32px] sm:p-9">

          <div className="flex items-center justify-between gap-4">

            <div>

              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold">

                <Sparkles className="h-3 w-3" />

                Expense Center

              </div>

              <h1 className="text-[29px] font-black tracking-tight sm:text-4xl">
                Submit Receipt
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-5 text-blue-100 sm:text-base sm:leading-6">
                Submit a purchase for reimbursement
                and keep track of your expenses.
              </p>

            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white/10 ring-1 ring-white/20 sm:flex">

              <Receipt className="h-9 w-9 text-white/85" />

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* QUICK SUMMARY                                     */}
        {/* ================================================= */}

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

                <Clock3 className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Pending
                </p>

                <p className="text-lg font-bold text-[#17324D]">
                  {pendingCount}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                <CheckCircle2 className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Approved
                </p>

                <p className="text-lg font-bold text-[#17324D]">
                  {approvedCount}
                </p>

              </div>

            </div>

          </div>

          <div className="col-span-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:col-span-1">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2E7BBE]">

                <Wallet className="h-4 w-4" />

              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  My Receipts
                </p>

                <p className="text-lg font-bold text-[#17324D]">
                  {receipts.length}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* SUBMIT FORM                                       */}
        {/* ================================================= */}

        <section className="mt-7 rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:mt-8 sm:p-6">

          <div className="mb-6">

            <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#2E7BBE] sm:text-[10px]">
              New Expense
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#172A3F]">
              Add a purchase
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Submit the receipt from your cleaning.
            </p>

          </div>

          <div className="space-y-5">

            {/* Logged in cleaner */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                <UserRound className="h-3.5 w-3.5 text-[#2E7BBE]" />

                Cleaner

              </label>

              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">

                {employee?.name || "—"}

              </div>

              <p className="mt-1.5 text-[10px] text-slate-400">
                You can only submit receipts for
                your own account.
              </p>

            </div>

            {/* Property */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                <Home className="h-3.5 w-3.5 text-[#2E7BBE]" />

                Property

              </label>

              <div className="relative">

                <select
                  value={propertyId}
                  onChange={(e) =>
                    handlePropertyChange(
                      e.target.value
                    )
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 pr-10 text-sm font-semibold text-[#172A3F] outline-none transition focus:border-[#2E7BBE] focus:ring-2 focus:ring-[#2E7BBE]/15"
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

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              </div>

            </div>

            {/* Cleaning */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                <CalendarDays className="h-3.5 w-3.5 text-[#2E7BBE]" />

                Cleaning

              </label>

              <div className="relative">

                <select
                  value={scheduleId}
                  onChange={(e) =>
                    setScheduleId(
                      e.target.value
                    )
                  }
                  disabled={!propertyId}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 pr-10 text-sm font-semibold text-[#172A3F] outline-none transition focus:border-[#2E7BBE] focus:ring-2 focus:ring-[#2E7BBE]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <option value="">
                    {propertyId
                      ? "Select Cleaning"
                      : "Select a property first"}
                  </option>

                  {schedules.map(
                    (schedule) => (
                      <option
                        key={schedule.id}
                        value={schedule.id}
                      >
                        {schedule.cleaning_date}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              </div>

              {propertyId &&
                schedules.length === 0 && (
                  <p className="mt-2 text-[10px] text-slate-400">
                    No cleaning assigned to you
                    was found for this property.
                  </p>
                )}

            </div>

            {/* Amount */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                <Wallet className="h-3.5 w-3.5 text-[#2E7BBE]" />

                Amount

              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="0.00"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] pl-9 pr-4 text-sm font-semibold text-[#172A3F] outline-none transition placeholder:text-slate-400 focus:border-[#2E7BBE] focus:ring-2 focus:ring-[#2E7BBE]/15"
                />

              </div>

            </div>

            {/* Receipt Photo */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">

                <Upload className="h-3.5 w-3.5 text-[#2E7BBE]" />

                Receipt Photo

              </label>

              {!photoPreview ? (

                <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] px-5 text-center transition hover:border-[#2E7BBE] hover:bg-blue-50/30">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2E7BBE]">

                    <Upload className="h-5 w-5" />

                  </div>

                  <p className="mt-3 text-sm font-bold text-[#273B50]">
                    Upload receipt photo
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    JPG, PNG or HEIC · Max 5MB
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handlePhotoChange(
                        e.target.files?.[0] ||
                          null
                      )
                    }
                    className="hidden"
                  />

                </label>

              ) : (

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                  <img
                    src={photoPreview}
                    alt="Receipt preview"
                    className="max-h-[260px] w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md"
                  >

                    <XCircle className="h-5 w-5" />

                  </button>

                  <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3">

                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                   <span className="truncate text-xs font-semibold text-slate-600">
  {photo?.name}
</span>
                  </div>

                </div>

              )}

            </div>

            {/* Submit */}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#2E7BBE] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#25659A] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  Submit Receipt
                </>
              )}

            </button>

          </div>

        </section>

        {/* ================================================= */}
        {/* MY RECEIPTS                                        */}
        {/* ================================================= */}

        <section className="mt-7 sm:mt-8">

          <div className="mb-4 px-1">

            <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#2E7BBE] sm:text-[10px]">
              Expense History
            </p>

            <div className="mt-1 flex items-center justify-between">

              <h2 className="text-xl font-bold tracking-tight text-[#172A3F] sm:text-2xl">
                My Receipts
              </h2>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                {receipts.length}
              </span>

            </div>

          </div>

          {receipts.length === 0 ? (

            <div className="rounded-[26px] border border-slate-100 bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2E7BBE]">

                <FileText className="h-7 w-7" />

              </div>

              <h3 className="mt-4 font-bold text-[#172A3F]">
                No receipts yet
              </h3>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
                Receipts you submit will appear
                here with their current status.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {receipts.map((receipt) => {

                const property =
                  properties.find(
                    (p) =>
                      p.id ===
                      receipt.property_id
                  );

                const isPending =
                  receipt.status ===
                  "Pending";

                const isApproved =
                  receipt.status ===
                  "Approved";

                const isRejected =
                  receipt.status ===
                  "Rejected";

                return (

                  <div
                    key={receipt.id}
                    className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_7px_25px_rgba(15,23,42,0.05)]"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2E7BBE]">

                          <Receipt className="h-5 w-5" />

                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-sm font-bold text-[#172A3F]">
                            {property?.name ||
                              "Property"}
                          </h3>

                          <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">

                            <CalendarDays className="h-3 w-3" />

                            {receipt.purchase_date}

                          </p>

                        </div>

                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-base font-black text-[#172A3F]">
                          ${Number(
                            receipt.amount
                          ).toFixed(2)}
                        </p>

                        {isPending && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">

                            <Clock3 className="h-3 w-3" />

                            Pending

                          </span>
                        )}

                        {isApproved && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">

                            <CheckCircle2 className="h-3 w-3" />

                            Approved

                          </span>
                        )}

                        {isRejected && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-bold text-red-600">

                            <XCircle className="h-3 w-3" />

                            Rejected

                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </section>

        {/* ================================================= */}
        {/* FOOTER                                             */}
        {/* ================================================= */}

        <footer className="mt-8 border-t border-slate-200/70 py-6 text-center text-[10px] text-slate-400 sm:flex sm:items-center sm:justify-between sm:text-xs">

          <span>
            PureSpace Cleaning
          </span>

          <span className="mt-1 block sm:mt-0">
            Expense Management · v2.0
          </span>

        </footer>

      </div>

    </main>
  );
}