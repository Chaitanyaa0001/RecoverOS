"use client";

import { ChevronDown } from "lucide-react";

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div className="relative min-w-0">

      <label className="mb-1.5 block text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">

        <select
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-9 w-full min-w-0 appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-[10px] text-slate-600 outline-none focus:border-emerald-400"
        >

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}

        </select>

        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

      </div>

    </div>
  );
}