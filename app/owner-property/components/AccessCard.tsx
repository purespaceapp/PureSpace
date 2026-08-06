"use client";

import { useState } from "react";

type Props = {
  property: any;
};

export default function AccessCard({
  property,
}: Props) {

  const [showPassword, setShowPassword] =
    useState(false);

  return (

    <div className="bg-white rounded-3xl shadow-lg p-6">

      <h2 className="font-bold text-xl mb-5">

        🔑 Access

      </h2>

      <div className="space-y-3">

        <p>

          <strong>Door Code:</strong>

          {" "}

          {property.door_code}

        </p>

        <p>

          <strong>WiFi:</strong>

          {" "}

          {property.wifi_name}

        </p>

        <p>

          <strong>Password:</strong>

          {" "}

          {showPassword
            ? property.wifi_password
            : "••••••••"}

        </p>

        <button
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
          className="mt-3 bg-[#2E7BBE] text-white px-4 py-2 rounded-xl"
        >

          {showPassword
            ? "Hide Password"
            : "Show Password"}

        </button>

      </div>

    </div>

  );

}