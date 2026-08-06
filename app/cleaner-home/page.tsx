"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CleanerHomePage() {

  const router = useRouter();

  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {

    const data =
      sessionStorage.getItem("employee");

    if (!data) {

      router.push("/cleaner-login");

      return;

    }

    setEmployee(JSON.parse(data));

  }, []);

  return (

    <div className="min-h-screen bg-[#F5F7FA] flex justify-center items-center">

      <div className="w-[650px]">

        <h1 className="text-5xl font-bold text-[#2E7BBE]">

          👋 Hello {employee?.name}

        </h1>

        <p className="text-gray-500 mt-3 text-lg">

          What would you like to do today?

        </p>

        <div className="mt-12 space-y-6">

          <button

            onClick={() =>
              router.push("/cleaner")
            }

            className="w-full bg-white rounded-3xl shadow-xl p-8 text-left hover:scale-[1.02] transition"

          >

            <div className="text-5xl">

              💰

            </div>

            <h2 className="text-3xl font-bold mt-4">

              My Earnings

            </h2>

            <p className="text-gray-500 mt-2">

              View schedule, payroll and invoice.

            </p>

          </button>

          <button

            onClick={() =>
              router.push("/receipt")
            }

            className="w-full bg-white rounded-3xl shadow-xl p-8 text-left hover:scale-[1.02] transition"

          >

            <div className="text-5xl">

              🧾

            </div>

            <h2 className="text-3xl font-bold mt-4">

              Submit Receipt

            </h2>

            <p className="text-gray-500 mt-2">

              Upload purchases for reimbursement.

            </p>

          </button>
          <button

  onClick={() =>
    router.push("/cleaner/inventory")
  }

  className="w-full bg-white rounded-3xl shadow-xl p-8 text-left hover:scale-[1.02] transition"

>

  <div className="text-5xl">

    📦

  </div>

  <h2 className="text-3xl font-bold mt-4">

    Inventory

  </h2>

  <p className="text-gray-500 mt-2">

    Check supplies and generate inventory PDF.

  </p>

</button>

        </div>

      </div>

    </div>

  );

}