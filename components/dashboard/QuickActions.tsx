"use client";

import { useRouter } from "next/navigation";

export default function QuickActions() {

  const router = useRouter();

  return (

    <div className="bg-white rounded-[32px] shadow-xl p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-3xl font-bold">

            ⚡ Quick Actions

          </h2>

          <p className="text-gray-500 mt-1">

            Frequently used actions

          </p>

        </div>

      </div>

      <div className="grid gap-4">

        <button
          onClick={() => router.push("/dashboard/properties")}
          className="group bg-[#2E7BBE] hover:bg-[#23649D] rounded-3xl p-5 flex justify-between items-center transition hover:scale-[1.02]"
        >

          <div className="text-left">

            <h3 className="text-white text-xl font-bold">
              Add Property
            </h3>

            <p className="text-blue-100">
              Register a new Airbnb
            </p>

          </div>

          <span className="text-4xl group-hover:translate-x-1 transition">
            ➜
          </span>

        </button>

        <button
          onClick={() => router.push("/dashboard/team")}
          className="group bg-[#54B7AE] hover:bg-[#43A49B] rounded-3xl p-5 flex justify-between items-center transition hover:scale-[1.02]"
        >

          <div className="text-left">

            <h3 className="text-white text-xl font-bold">
              Employees
            </h3>

            <p className="text-teal-100">
              Manage your cleaners
            </p>

          </div>

          <span className="text-4xl group-hover:translate-x-1 transition">
            ➜
          </span>

        </button>

        <button
          onClick={() => router.push("/dashboard/schedule")}
          className="group bg-[#69B8F0] hover:bg-[#58A8E8] rounded-3xl p-5 flex justify-between items-center transition hover:scale-[1.02]"
        >

          <div className="text-left">

            <h3 className="text-white text-xl font-bold">
              Schedule
            </h3>

            <p className="text-blue-100">
              Assign today's cleanings
            </p>

          </div>

          <span className="text-4xl group-hover:translate-x-1 transition">
            ➜
          </span>

        </button>

        <button
          onClick={() => router.push("/dashboard/receipts")}
          className="group bg-[#F5B23A] hover:bg-[#E5A321] rounded-3xl p-5 flex justify-between items-center transition hover:scale-[1.02]"
        >

          <div className="text-left">

            <h3 className="text-white text-xl font-bold">
              Receipts
            </h3>

            <p className="text-yellow-100">
              Approve employee receipts
            </p>

          </div>

          <span className="text-4xl group-hover:translate-x-1 transition">
            ➜
          </span>

        </button>

      </div>

    </div>

  );

}