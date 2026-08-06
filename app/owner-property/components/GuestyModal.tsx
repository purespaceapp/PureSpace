"use client";

import { useState } from "react";
import { saveIntegration } from "@/lib/integrations";

type Props = {
  ownerId: number;
  onClose: () => void;
  onSaved: () => void;
};

export default function GuestyModal({
  ownerId,
  onClose,
  onSaved,
}: Props) {

  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [loading, setLoading] = useState(false);

  async function connect() {

    try {

      setLoading(true);

      await saveIntegration({

        owner_id: ownerId,
        provider: "Guesty",
        connected: true,
        api_key: apiKey,
        account_id: accountId,
        organization_id: organizationId,

      });

      onSaved();

      onClose();

    } catch {

      alert("Error connecting Guesty.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-[500px]">

        <h2 className="text-3xl font-bold text-[#2E7BBE]">

          Connect Guesty

        </h2>

        <p className="text-gray-500 mt-2">

          Enter your Guesty credentials.

        </p>

        <div className="mt-8 space-y-5">

          <input
            placeholder="API Key"
            value={apiKey}
            onChange={(e)=>setApiKey(e.target.value)}
            className="w-full border rounded-xl p-4"
          />

          <input
            placeholder="Account ID"
            value={accountId}
            onChange={(e)=>setAccountId(e.target.value)}
            className="w-full border rounded-xl p-4"
          />

          <input
            placeholder="Organization ID"
            value={organizationId}
            onChange={(e)=>setOrganizationId(e.target.value)}
            className="w-full border rounded-xl p-4"
          />

        </div>

        <div className="flex gap-4 mt-8">

          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-4"
          >

            Cancel

          </button>

          <button
            onClick={connect}
            disabled={loading}
            className="flex-1 bg-[#2E7BBE] text-white rounded-xl py-4"
          >

            {loading ? "Connecting..." : "Connect"}

          </button>

        </div>

      </div>

    </div>

  );

}