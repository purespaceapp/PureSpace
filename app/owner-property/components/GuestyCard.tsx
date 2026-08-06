"use client";

import { useState } from "react";
import GuestyModal from "./GuestyModal";

type Props = {
  ownerId: number;
};

export default function GuestyCard({
  ownerId,
}: Props) {

  const [showModal, setShowModal] = useState(false);

  return (

    <>

      <div className="bg-white rounded-3xl shadow-lg p-6">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-bold">

              🔗 Guesty

            </h2>

            <p className="text-gray-500 mt-2">

              Connect your Airbnb reservations.

            </p>

          </div>

          <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">

            Not Connected

          </span>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-8 w-full bg-[#2E7BBE] hover:bg-[#23649D] text-white py-4 rounded-2xl transition"
        >

          Connect Guesty

        </button>

      </div>

      {showModal && (

        <GuestyModal
          ownerId={ownerId}
          onClose={() => setShowModal(false)}
          onSaved={() => {

            alert("Guesty connected successfully!");

          }}
        />

      )}

    </>

  );

}