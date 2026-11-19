"use client";

import { useEffect, useState } from "react";
import {
  saveSchedule,
  updateSchedule,
} from "@/lib/schedule";

import {
  updateReservation,
  getReservations,
} from "@/lib/reservations";

import {
  getExtras,
  getScheduleExtras,
  saveScheduleExtras,
  deleteScheduleExtras,
} from "@/lib/extras";

type ScheduleFormProps = {
  properties: any[];
  employees: any[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  schedule?: any;
};

export default function ScheduleForm({
  properties,
  employees,
  onClose,
  onSaved,
  schedule,
}: ScheduleFormProps) {
  const [propertyId, setPropertyId] = useState(
    schedule?.property_id?.toString() || ""
  );

  const [employeeId, setEmployeeId] = useState(
    schedule?.employee_id?.toString() || ""
  );

  const [cleaningDate, setCleaningDate] = useState(
    schedule?.cleaning_date || ""
  );

  const [notes, setNotes] = useState(schedule?.notes || "");

  const [serviceType, setServiceType] = useState(
    schedule?.service_type || "Airbnb Cleaning"
  );

  const [billingType, setBillingType] = useState(
    schedule?.billing_type || "flat_rate"
  );

  const [cleanerCount, setCleanerCount] = useState(
    String(schedule?.cleaner_count || 1)
  );

  const [hoursWorked, setHoursWorked] = useState(
    String(schedule?.hours_worked || "")
  );

  const [hourlyRate, setHourlyRate] = useState(
    String(schedule?.hourly_rate ?? 28)
  );

  const [cleanerPay, setCleanerPay] = useState(
    schedule?.cleaner_pay?.toString() || ""
  );

  const [companyCharge, setCompanyCharge] = useState(
    schedule?.company_charge?.toString() || ""
  );

  const [checkoutTime, setCheckoutTime] = useState(
    schedule?.checkout_time || ""
  );

  const [checkinTime, setCheckinTime] = useState(
    schedule?.checkin_time || ""
  );

  const [baseCleanerPay, setBaseCleanerPay] = useState(0);
  const [baseCompanyCharge, setBaseCompanyCharge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [extras, setExtras] = useState<any[]>([]);

  const [selectedExtras, setSelectedExtras] = useState<
    {
      id: number;
      quantity: number;
    }[]
  >([]);

  useEffect(() => {
    async function loadExtras() {
      try {
        const data = await getExtras();
        setExtras(data ?? []);

        if (schedule?.id) {
          const savedExtras = await getScheduleExtras(schedule.id);

          setSelectedExtras(
            (savedExtras ?? [])
              .filter((extra: any) => extra.extra_id != null)
              .map((extra: any) => ({
                id: Number(extra.extra_id),
                quantity: Number(extra.quantity || 1),
              }))
          );
        } else {
          setSelectedExtras([]);
        }
      } catch (error) {
        console.error("Error loading schedule extras:", error);
      }
    }

    loadExtras();
  }, [schedule?.id]);

  useEffect(() => {
    if (!propertyId) return;

    const property = properties.find(
      (p) => Number(p.id) === Number(propertyId)
    );

    if (!property) return;

    setBaseCleanerPay(Number(property.cleaner_price || 0));
    setBaseCompanyCharge(Number(property.company_price || 0));
  }, [propertyId, properties]);

  // Cleaner compensation remains based on the property's existing cleaner rate
  // plus selected extras. The hourly client charge is calculated separately.
  useEffect(() => {
    let cleanerTotal = baseCleanerPay;

    selectedExtras.forEach((selected) => {
      const extra = extras.find(
        (item) => Number(item.id) === Number(selected.id)
      );

      if (!extra) return;

      cleanerTotal +=
        Number(extra.cleaner_price || 0) * selected.quantity;
    });

    setCleanerPay(cleanerTotal.toFixed(2));
  }, [selectedExtras, extras, baseCleanerPay]);

  // Only flat-rate services inherit the property's standard company price.
  // Custom prices must remain editable and must never be overwritten here.
  useEffect(() => {
    if (billingType === "hourly") {
      const count = Math.max(0, Number(cleanerCount) || 0);
      const hours = Math.max(0, Number(hoursWorked) || 0);
      const rate = Math.max(0, Number(hourlyRate) || 0);

      setCompanyCharge((count * hours * rate).toFixed(2));
      return;
    }

    if (billingType === "custom") return;

    let ownerTotal = baseCompanyCharge;

    selectedExtras.forEach((selected) => {
      const extra = extras.find(
        (item) => Number(item.id) === Number(selected.id)
      );

      if (!extra) return;

      ownerTotal +=
        Number(extra.owner_price || 0) * selected.quantity;
    });

    setCompanyCharge(ownerTotal.toFixed(2));
  }, [
    billingType,
    cleanerCount,
    hoursWorked,
    hourlyRate,
    selectedExtras,
    extras,
    baseCompanyCharge,
  ]);

  async function handleSave() {
    try {
      if (!propertyId || !employeeId || !cleaningDate) {
        alert("Please select a property, cleaner, and cleaning date.");
        return;
      }

      if (billingType === "hourly") {
        const count = Number(cleanerCount);
        const hours = Number(hoursWorked);
        const rate = Number(hourlyRate);

        if (!Number.isInteger(count) || count < 1) {
          alert("Please enter at least 1 cleaner.");
          return;
        }

        if (!Number.isFinite(hours) || hours <= 0) {
          alert("Please enter the hours worked per cleaner.");
          return;
        }

        if (!Number.isFinite(rate) || rate <= 0) {
          alert("Please enter a valid hourly rate.");
          return;
        }
      }

      if (billingType === "custom") {
        const customPrice = Number(companyCharge);

        if (!Number.isFinite(customPrice) || customPrice < 0) {
          alert("Please enter a valid custom price.");
          return;
        }
      }

      setLoading(true);

      const scheduleData = {
        property_id: Number(propertyId),
        employee_id: Number(employeeId),
        cleaning_date: cleaningDate,
        checkout_time: checkoutTime,
        checkin_time: checkinTime,
        cleaner_pay: Number(cleanerPay),
        company_charge: Number(companyCharge),
        service_type: serviceType,
        billing_type: billingType,
        cleaner_count:
          billingType === "hourly" ? Number(cleanerCount) : 1,
        hours_worked:
          billingType === "hourly" ? Number(hoursWorked) : null,
        hourly_rate:
          billingType === "hourly" ? Number(hourlyRate) : null,
        status: "Scheduled",
        notes,
      };

      if (schedule) {
        await updateSchedule(schedule.id, scheduleData);

        await deleteScheduleExtras(schedule.id);
        await saveScheduleExtras(schedule.id, selectedExtras);
      } else {
        const newSchedule = await saveSchedule(scheduleData);

        await deleteScheduleExtras(newSchedule.id);
        await saveScheduleExtras(newSchedule.id, selectedExtras);

        const reservations = await getReservations();

        const reservation = reservations.find(
          (r: any) =>
            Number(r.property_id) === Number(propertyId) &&
            r.check_out === cleaningDate
        );

        if (reservation) {
          const cleaner = employees.find(
            (e) => Number(e.id) === Number(employeeId)
          );

          await updateReservation(reservation.id, {
            assigned_cleaner_id: Number(employeeId),
            assigned_cleaner_name: cleaner?.name || "",
            cleaning_status: "Assigned",
          });
        }
      }

      await onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Unable to save the cleaning.");
    } finally {
      setLoading(false);
    }
  }
    return (
    <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-[#2E7BBE]">
        {schedule ? "Edit Cleaning" : "Add Cleaning"}
      </h2>

      <div className="grid grid-cols-2 gap-5">
        <input
          type="time"
          value={checkoutTime}
          onChange={(e) => setCheckoutTime(e.target.value)}
          className="rounded-xl border p-3"
          placeholder="Checkout"
        />

        <input
          type="time"
          value={checkinTime}
          onChange={(e) => setCheckinTime(e.target.value)}
          className="rounded-xl border p-3"
          placeholder="Check-in"
        />

        <input
          type="date"
          value={cleaningDate}
          onChange={(e) => setCleaningDate(e.target.value)}
          className="rounded-xl border p-3"
        />

        <select
          value={propertyId}
          onChange={(e) => {
            const id = e.target.value;
            setPropertyId(id);

            const property = properties.find(
              (p) => Number(p.id) === Number(id)
            );

            if (property) {
              const cleaner = Number(property.cleaner_price || 0);
              const owner = Number(property.company_price || 0);

              setBaseCleanerPay(cleaner);
              setBaseCompanyCharge(owner);

              setCleanerPay(cleaner.toString());

              if (billingType === "flat_rate") {
                setCompanyCharge(owner.toString());
              }

              setSelectedExtras([]);
            }
          }}
          className="rounded-xl border p-3"
        >
          <option value="">Select Property</option>

          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>

        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="rounded-xl border p-3"
        >
          <option value="">Select Cleaner</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>

        <select
          value={serviceType}
          onChange={(e) => {
            const nextType = e.target.value;
            setServiceType(nextType);

            if (
              nextType === "Airbnb Cleaning" ||
              nextType === "Regular Cleaning"
            ) {
              setBillingType("flat_rate");

              const property = properties.find(
                (p) => Number(p.id) === Number(propertyId)
              );

              if (property) {
                const standardCharge = Number(
                  property.company_price || 0
                );

                setBaseCompanyCharge(standardCharge);
                setCompanyCharge(standardCharge.toFixed(2));
              }
            } else if (
              nextType === "Deep Cleaning" ||
              nextType === "Move-Out Cleaning"
            ) {
              setBillingType("hourly");

              if (!hourlyRate || Number(hourlyRate) <= 0) {
                setHourlyRate("28");
              }
            } else {
              setBillingType("custom");
              setCompanyCharge(
                (baseCompanyCharge || 0).toFixed(2)
              );
            }
          }}
          className="rounded-xl border p-3"
        >
          <option value="Airbnb Cleaning">Airbnb Cleaning</option>
          <option value="Regular Cleaning">Regular Cleaning</option>
          <option value="Deep Cleaning">Deep Cleaning</option>
          <option value="Move-Out Cleaning">Move-Out Cleaning</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={billingType}
          onChange={(e) => setBillingType(e.target.value)}
          className="rounded-xl border p-3"
        >
          <option value="flat_rate">Flat Rate</option>
          <option value="hourly">Hourly (per cleaner)</option>
          <option value="custom">Custom Price</option>
        </select>

        {billingType === "hourly" && (
          <div className="col-span-2 grid grid-cols-2 gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <label className="text-sm font-semibold text-slate-700">
              Number of cleaners
              <input
                type="number"
                min="1"
                step="1"
                value={cleanerCount}
                onChange={(e) => setCleanerCount(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white p-3"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Hours per cleaner
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white p-3"
                placeholder="e.g. 5"
              />
            </label>

            <label className="col-span-2 text-sm font-semibold text-slate-700">
              Hourly rate per cleaner ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white p-3"
              />
            </label>

            <div className="col-span-2 rounded-lg bg-white p-3 text-sm">
              <div className="flex justify-between">
                <span>Calculation</span>
                <strong>
                  {Number(cleanerCount) || 0} cleaners ×{" "}
                  {Number(hoursWorked) || 0} hours × $
                  {Number(hourlyRate || 0).toFixed(2)}
                </strong>
              </div>

              <div className="mt-2 flex justify-between text-base">
                <span className="font-bold">Client total</span>

                <strong className="text-blue-700">
                  $
                  {(
                    Math.max(0, Number(cleanerCount) || 0) *
                    Math.max(0, Number(hoursWorked) || 0) *
                    Math.max(0, Number(hourlyRate) || 0)
                  ).toFixed(2)}
                </strong>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Hours are entered per cleaner. The property&apos;s
                Airbnb flat rate is not changed.
              </p>
            </div>
          </div>
        )}

        {billingType === "custom" && (
          <label className="col-span-2 text-sm font-semibold text-slate-700">
            Agreed custom price ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={companyCharge}
              onChange={(e) => setCompanyCharge(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            />
          </label>
        )}

        <input
          value={cleanerPay}
          disabled
          placeholder="Cleaner Pay"
          className="rounded-xl border bg-gray-100 p-3"
        />

        {billingType !== "custom" && (
          <input
            value={companyCharge}
            disabled
            placeholder="Company Charge"
            className="rounded-xl border bg-gray-100 p-3"
          />
        )}
                <div className="col-span-2">
          <h3 className="mb-3 text-lg font-bold">Extras</h3>

          <div className="grid grid-cols-2 gap-3">
            {extras.map((extra) => {
              const selected = selectedExtras.find(
                (item) => Number(item.id) === Number(extra.id)
              );

              return (
                <label
                  key={extra.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(selected)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExtras((current) => [
                          ...current,
                          {
                            id: Number(extra.id),
                            quantity: 1,
                          },
                        ]);
                      } else {
                        setSelectedExtras((current) =>
                          current.filter(
                            (item) =>
                              Number(item.id) !== Number(extra.id)
                          )
                        );
                      }
                    }}
                  />

                  <div className="flex-1">
                    <p className="font-medium">{extra.name}</p>

                    <p className="text-sm text-gray-500">
                      👤 +$
                      {Number(extra.cleaner_price || 0).toFixed(2)}
                      {" • "}
                      🏠 +$
                      {Number(extra.owner_price || 0).toFixed(2)}
                    </p>

                    {selected && (
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Decrease ${extra.name} quantity`}
                          className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            setSelectedExtras((current) =>
                              current.map((item) =>
                                Number(item.id) === Number(extra.id)
                                  ? {
                                      ...item,
                                      quantity: Math.max(
                                        1,
                                        item.quantity - 1
                                      ),
                                    }
                                  : item
                              )
                            );
                          }}
                        >
                          −
                        </button>

                        <span className="text-lg font-bold">
                          {selected.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${extra.name} quantity`}
                          className="h-8 w-8 rounded-full bg-[#2E7BBE] text-white hover:bg-[#23649D]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            setSelectedExtras((current) =>
                              current.map((item) =>
                                Number(item.id) === Number(extra.id)
                                  ? {
                                      ...item,
                                      quantity: item.quantity + 1,
                                    }
                                  : item
                              )
                            );
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
          className="col-span-2 h-32 rounded-xl border p-3"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-[#2E7BBE] py-4 font-semibold text-white transition-all duration-300 hover:bg-[#23649D] disabled:bg-gray-400"
      >
        {loading
          ? "Saving..."
          : schedule
            ? "Update Cleaning"
            : "Save Cleaning"}
      </button>
    </div>
  );
}