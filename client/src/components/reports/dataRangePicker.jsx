"use client";

import { CalendarDays } from "lucide-react";

export default function DateRangePicker({
  value,
  onChange,
}) {
  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <div className="flex w-full flex-wrap items-end gap-3">

      {/* FROM */}

      <div className="w-full sm:w-[190px]">

        <label className="mb-1.5 block text-[9px] font-medium uppercase tracking-wide text-slate-500">
          From
        </label>

        <div className="relative">

          <CalendarDays
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            value={value.from}
            max={value.to}
            onChange={(event) =>
              handleChange(
                "from",
                event.target.value
              )
            }
            className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[10px] text-slate-600 outline-none transition focus:border-emerald-400"
          />

        </div>

      </div>

      {/* TO */}

      <div className="w-full sm:w-[190px]">

        <label className="mb-1.5 block text-[9px] font-medium uppercase tracking-wide text-slate-500">
          To
        </label>

        <div className="relative">

          <CalendarDays
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            value={value.to}
            min={value.from}
            max="2026-12-31"
            onChange={(event) =>
              handleChange(
                "to",
                event.target.value
              )
            }
            className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[10px] text-slate-600 outline-none transition focus:border-emerald-400"
          />

        </div>

      </div>

      {/* PERIOD LABEL */}

      <div className="flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-[9px] text-slate-500">

        Report period

        <span className="ml-1 font-medium text-slate-700">
          {value.from} → {value.to}
        </span>

      </div>

    </div>
  );
}