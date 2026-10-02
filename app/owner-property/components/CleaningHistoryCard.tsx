"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

type CleaningHistoryCardProps = {
  schedules: any[];
};

export default function CleaningHistoryCard({
  schedules,
}: CleaningHistoryCardProps) {
  const [showAll, setShowAll] = useState(false);

  const completedCleanings = (schedules || [])
    .filter(
      (schedule: any) =>
        schedule?.status === "Completed"
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.cleaning_date).getTime() -
        new Date(a.cleaning_date).getTime()
    );

  const visibleCleanings = showAll
    ? completedCleanings
    : completedCleanings.slice(0, 5);

  function formatDate(date: string) {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function getCleanerName(schedule: any) {
    return (
      schedule?.employees?.name ||
      schedule?.employee?.name ||
      schedule?.cleaner_name ||
      "PureSpace Cleaner"
    );
  }

  return (
    <section className="rounded-[28px] bg-white border border-slate-100 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center gap-4 px-7 pt-7 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>

        <div>
          <h2 className="text-[22px] font-bold text-[#173B63]">
            Cleaning History
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Recently completed cleanings
          </p>
        </div>
      </div>

      {/* HISTORY */}
      <div className="px-7 pb-6">
        {completedCleanings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5 text-slate-300" />
            </div>

            <p className="text-sm font-semibold text-slate-600">
              No completed cleanings yet
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Completed cleaning visits will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* FIXED HEIGHT HISTORY AREA */}
            <div
              className={`
                rounded-2xl border border-slate-100 bg-slate-50/40
                overflow-y-auto
                ${showAll ? "max-h-[360px]" : "max-h-[360px]"}
              `}
            >
              {visibleCleanings.map(
                (schedule: any, index: number) => (
                  <div
                    key={schedule?.id ?? index}
                    className={`
                      flex items-center gap-4 px-5 py-4
                      ${
                        index !==
                        visibleCleanings.length - 1
                          ? "border-b border-slate-200/80"
                          : ""
                      }
                    `}
                  >
                    {/* CHECK */}
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" />
                    </div>

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-[#173B63]">
                        {formatDate(schedule?.cleaning_date)}
                      </p>

                      <p className="text-sm text-slate-500 mt-0.5 truncate">
                        Completed by{" "}
                        {getCleanerName(schedule)}
                      </p>
                    </div>

                    {/* STATUS */}
                    <div className="hidden sm:flex shrink-0">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                        Completed
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* VIEW MORE */}
            {completedCleanings.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-[#2E7BBE] hover:bg-slate-50 transition"
              >
                {showAll
                  ? "Show Recent Cleanings"
                  : `View Full History (${completedCleanings.length})`}

                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showAll ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}