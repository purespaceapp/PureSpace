"use client";

import { useEffect, useState } from "react";

import EmployeeCard from "@/components/cards/EmployeeCard";
import EmployeeForm from "@/components/forms/EmployeeForm";

import {
  getEmployees,
  deleteEmployee,
} from "@/lib/employees";

export default function TeamPage() {

  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showView, setShowView] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  async function loadEmployees() {

    const data = await getEmployees();

    setEmployees(data);

  }

  useEffect(() => {

    loadEmployees();

  }, []);

  return (

    <div className="min-h-screen bg-[#F2F5F7] p-10">

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-5xl font-bold text-[#2E7BBE]">
            Team
          </h1>

          <p className="text-gray-500 mt-2">
            Manage all your cleaners
          </p>

        </div>

        <button
          onClick={() => {
            setEditingEmployee(null);
            setShowForm(true);
          }}
          className="bg-[#2E7BBE] hover:bg-[#23649D] text-white font-semibold px-7 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
        >

          + Add Cleaner

        </button>

      </div>

      <div className="grid gap-6">

        {employees.length === 0 ? (

          <div className="bg-white rounded-3xl shadow-md p-16 text-center">

            <h2 className="text-2xl font-bold text-[#2E7BBE]">
              No cleaners yet
            </h2>

            <p className="text-gray-500 mt-3">
              Click "Add Cleaner" to create your first employee.
            </p>

          </div>

        ) : (

          employees.map((employee) => (

            <EmployeeCard
              key={employee.id}
              id={employee.id}
              name={employee.name}
              phone={employee.phone}
              email={employee.email}
              status={employee.status}
              onView={() => {
                setSelectedEmployee(employee);
                setShowView(true);
              }}
              onEdit={() => {
                setEditingEmployee(employee);
                setShowForm(true);
              }}
              onDelete={async () => {

                const confirmed = confirm(
                  `Delete "${employee.name}"?`
                );

                if (!confirmed) return;

                await deleteEmployee(employee.id);

                await loadEmployees();

              }}
            />

          ))

        )}

      </div>

      {showForm && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">

            <button
              onClick={() => {
                setShowForm(false);
                setEditingEmployee(null);
              }}
              className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-red-500"
            >
              ✕
            </button>

            <EmployeeForm
              employee={editingEmployee}
              onClose={() => {
                setShowForm(false);
                setEditingEmployee(null);
              }}
              onSaved={async () => {
                await loadEmployees();
                setShowForm(false);
                setEditingEmployee(null);
              }}
            />

          </div>

        </div>

      )}

      {showView && selectedEmployee && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-3xl shadow-2xl w-[650px] p-8 relative">

            <button
              onClick={() => setShowView(false)}
              className="absolute top-5 right-5 text-3xl text-gray-400 hover:text-red-500"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-[#2E7BBE] mb-6">
              {selectedEmployee.name}
            </h2>

            <div className="space-y-4">

              <p><strong>Phone:</strong> {selectedEmployee.phone}</p>

              <p><strong>Email:</strong> {selectedEmployee.email}</p>

              <p><strong>PIN:</strong> {selectedEmployee.pin}</p>

              <p><strong>Status:</strong> {selectedEmployee.status}</p>

              <p><strong>Notes:</strong></p>

              <div className="bg-gray-100 rounded-xl p-4">
                {selectedEmployee.notes || "No notes"}
              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}