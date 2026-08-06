"use client";

import { useState } from "react";

import {
  saveEmployee,
  updateEmployee,
} from "@/lib/employees";

type EmployeeFormProps = {
  onClose: () => void;
  onSaved: () => Promise<void>;
  employee?: any;
};

export default function EmployeeForm({
  onClose,
  onSaved,
  employee,
}: EmployeeFormProps) {

  const [name, setName] = useState(employee?.name || "");
  const [phone, setPhone] = useState(employee?.phone || "");
  const [email, setEmail] = useState(employee?.email || "");
  const [pin, setPin] = useState(employee?.pin || "");
  const [status, setStatus] = useState(employee?.status || "Active");
  const [notes, setNotes] = useState(employee?.notes || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {

    try {

      setLoading(true);

      const employeeData = {
        name,
        phone,
        email,
        pin,
        status,
        notes,
      };

      if (employee) {
        await updateEmployee(employee.id, employeeData);
      } else {
        console.log(employeeData);
        await saveEmployee(employeeData);
      }

      await onSaved();

      onClose();

    } catch (error: any) {
  console.error(error);

  alert(error.message);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <h2 className="text-2xl font-bold text-[#2E7BBE] mb-6">
        {employee ? "Edit Cleaner" : "Add Cleaner"}
      </h2>

      <div className="grid grid-cols-2 gap-5">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="border rounded-xl p-3"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="border rounded-xl p-3"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border rounded-xl p-3"
        />

        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN (4 digits)"
          className="border rounded-xl p-3"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-xl p-3"
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <div></div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
          className="border rounded-xl p-3 col-span-2 h-32"
        />

      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 w-full bg-[#2E7BBE] hover:bg-[#23649D] disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
      >

        {loading
          ? "Saving..."
          : employee
          ? "Update Cleaner"
          : "Save Cleaner"}

      </button>

    </div>

  );

}