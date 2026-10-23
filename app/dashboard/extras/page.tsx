"use client";

import { useEffect, useState } from "react";
import { createExtra, getExtras, updateExtra } from "@/lib/extras";

type Extra = {
  id: number;
  name: string;
  owner_price: number;
  cleaner_price: number;
  per_hour: boolean;
};

export default function ExtrasPricingPage() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [name, setName] = useState("");
  const [ownerPrice, setOwnerPrice] = useState("");
  const [cleanerPrice, setCleanerPrice] = useState("");
  const [perHour, setPerHour] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadExtras() {
    try {
      setExtras(await getExtras());
    } catch {
      setMessage("Could not load extras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExtras();
  }, []);

  async function createExtraHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      await createExtra({
        name: name.trim(),
        owner_price: Number(ownerPrice),
        cleaner_price: Number(cleanerPrice),
        per_hour: perHour,
      });

      setName("");
      setOwnerPrice("");
      setCleanerPrice("");
      setPerHour(false);
      setMessage("Extra saved successfully.");
      await loadExtras();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save extra."
      );
    }
  }

  async function saveExtraHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const values = {
        name: name.trim(),
        owner_price: Number(ownerPrice),
        cleaner_price: Number(cleanerPrice),
        per_hour: perHour,
      };

      if (editingId !== null) {
        await updateExtra({ id: editingId, ...values });
        setMessage("Extra updated successfully.");
      } else {
        await createExtra(values);
        setMessage("Extra created successfully.");
      }

      setEditingId(null);
      setName("");
      setOwnerPrice("");
      setCleanerPrice("");
      setPerHour(false);
      await loadExtras();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save extra.");
    }
  }

  function editExtra(extra: Extra) {
    setEditingId(extra.id);
    setName(extra.name);
    setOwnerPrice(String(extra.owner_price));
    setCleanerPrice(String(extra.cleaner_price));
    setPerHour(Boolean(extra.per_hour));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB] px-5 py-8 text-[#14213D] md:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/dashboard" className="text-sm font-semibold text-[#2E7BBE]">
          ← Back to dashboard
        </a>

        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#2E7BBE]">
            Office Staff
          </p>
          <h1 className="mt-2 text-3xl font-black">Extras & Pricing</h1>
          <p className="mt-2 text-slate-500">
            Manage additional cleaning services and their separate prices.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            {editingId !== null ? "Edit extra" : "Create a custom extra"}
          </h2>
          <form onSubmit={saveExtraHandler} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Extra name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Heavy Pet Hair"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-semibold">
              Customer charge ($)
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={ownerPrice}
                onChange={(e) => setOwnerPrice(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-semibold">
              Cleaner pay ($)
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={cleanerPrice}
                onChange={(e) => setCleanerPrice(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={perHour}
                onChange={(e) => setPerHour(e.target.checked)}
                className="h-4 w-4"
              />
              Charge per hour
            </label>

            <button
              type="submit"
              className="rounded-xl bg-[#2E7BBE] px-5 py-3 font-bold text-white sm:col-span-2"
            >
              {editingId !== null ? "Save changes" : "Save extra"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              {message}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Existing extras</h2>
          {loading ? (
            <p className="mt-4 text-slate-500">Loading extras...</p>
          ) : extras.length === 0 ? (
            <p className="mt-4 text-slate-500">No extras found.</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {extras.map((extra) => (
                <div
                  key={extra.id}
                  className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-bold">{extra.name}</p>
                    <p className="text-sm text-slate-500">
                      {extra.per_hour ? "Per hour" : "Fixed price"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm sm:text-right">
                      <p>Customer: ${Number(extra.owner_price).toFixed(2)}</p>
                      <p>Cleaner: ${Number(extra.cleaner_price).toFixed(2)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => editExtra(extra)}
                      className="rounded-xl border border-[#2E7BBE] px-4 py-2 text-sm font-bold text-[#2E7BBE] hover:bg-[#EAF4FE]"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
