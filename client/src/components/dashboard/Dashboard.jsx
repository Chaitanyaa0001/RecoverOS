"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { ChevronDown } from "lucide-react";

const ranges = [
  {
    value: "7d",
    label: "Last 7 days",
  },
  {
    value: "30d",
    label: "Last 30 days",
  },
  {
    value: "3m",
    label: "Last 3 months",
  },
  {
    value: "6m",
    label: "Last 6 months",
  },
  {
    value: "12m",
    label: "Last 12 months",
  },
];

export default function DashboardHeader({
  agentStatus = "OFFLINE",
}) {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const currentRange =
    searchParams.get("range") ||
    "30d";

  const selectedRange =
    ranges.find(
      (range) =>
        range.value === currentRange
    ) || ranges[1];

  const isLive =
    agentStatus === "LIVE";

  const handleRangeChange = (event) => {
    const range =
      event.target.value;

    router.push(
      `/dashboard?range=${range}`
    );
  };

  return (
    <header className="flex min-h-[58px] w-full items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-5">

      {/* LEFT */}

      <div className="min-w-0">

        <h1 className="text-[15px] font-semibold text-slate-800">
          Razorpay AI Revenue Recovery
        </h1>

        <p className="mt-0.5 truncate text-[10px] text-slate-400">
          Revenue recovery performance across all connected merchants
        </p>

      </div>

      {/* RIGHT */}

      <div className="flex shrink-0 items-center gap-2">

        {/* PERIOD */}

        <div className="relative hidden sm:block">

          <select
            value={selectedRange.value}
            onChange={handleRangeChange}
            className="
              h-8
              appearance-none
              rounded-md
              border
              border-slate-200
              bg-white
              py-1.5
              pl-3
              pr-8
              text-[10px]
              text-slate-600
              outline-none
              focus:border-emerald-400
            "
          >

            {ranges.map(
              (range) => (
                <option
                  key={range.value}
                  value={range.value}
                >
                  {range.label}
                </option>
              )
            )}

          </select>

          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

        </div>

        {/* AGENT STATUS */}

        <div
          className={`
            flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-[10px]
            font-medium

            ${
              isLive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }
          `}
        >

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full

              ${
                isLive
                  ? "animate-pulse bg-emerald-500"
                  : "bg-slate-400"
              }
            `}
          />

          {isLive
            ? "Live"
            : "Agent Offline"}

        </div>

      </div>

    </header>
  );
}