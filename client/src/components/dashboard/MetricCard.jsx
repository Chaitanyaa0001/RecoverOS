"use client";

import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function MetricCard({ metric }) {
  const isUp = metric.direction === "up";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {metric.label}
      </p>

      <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-slate-800">
        {metric.value}
      </h2>

      <div
        className={`mt-1 flex items-center gap-1 text-[10px] ${
          isUp
            ? "text-emerald-600"
            : "text-slate-500"
        }`}
      >
        {isUp ? (
          <TrendingUp size={11} />
        ) : (
          <TrendingDown size={11} />
        )}

        <span>{metric.change}</span>

        <span className="text-slate-400">
          vs previous period
        </span>
      </div>
    </div>
  );
}