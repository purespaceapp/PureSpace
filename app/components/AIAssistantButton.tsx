
"use client";

import Link from "next/link";
import { useState } from "react";

export default function AIAssistantButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:w-80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">PureSpace AI ✨</p>
              <p className="mt-1 text-sm text-slate-500">
                Your assistant for cleaning operations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant menu"
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <Link
            href="/ai-assistant"
            className="mt-4 flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Open AI Assistant
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open PureSpace AI assistant menu"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-2xl text-white shadow-lg hover:bg-emerald-800"
      >
        {open ? "✕" : "✦"}
      </button>
    </div>
  );
}
