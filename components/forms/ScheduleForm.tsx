
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

  const [notes, setNotes] = useState(
    schedule?.notes || ""
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

  useEffect(() => {
    let cleanerTotal = baseCleanerPay;
    let ownerTotal = baseCompanyCharge;

    selectedExtras.forEach((selected) => {
      const extra = extras.find(
        (item) => Number(item.id) === Number(selected.id)
      );

      if (!extra) return;

      cleanerTotal +=
        Number(extra.cleaner_price || 0) * selected.quantity;

      ownerTotal +=
        Number(extra.owner_price || 0) * selected.quantity;
    });

    setCleanerPay(cleanerTotal.toString());
    setCompanyCharge(ownerTotal.toString());
  }, [
    selectedExtras,
    extras,
    baseCleanerPay,
    baseCompanyCharge,
  ]);

  async function handleSave() {
    try {
      if (!propertyId || !employeeId || !cleaningDate) {
        alert("Please select a property, cleaner, and cleaning date.");
        return;
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
              setCompanyCharge(owner.toString());

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

        <input
          value={cleanerPay}
          disabled
          placeholder="Cleaner Pay"
          className="rounded-xl border bg-gray-100 p-3"
        />

        <input
          value={companyCharge}
          disabled
          placeholder="Company Charge"
          className="rounded-xl border bg-gray-100 p-3"
        />

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
                      👤 +${Number(extra.cleaner_price || 0).toFixed(2)}
                      {" • "}
                      🏠 +${Number(extra.owner_price || 0).toFixed(2)}
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
