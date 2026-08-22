"use client";

import MetricCard from "./MetricCard";
import AIvsBaselineChart from "./AIvsBaselineChart";
import RecoveryByTypeChart from "./RecoveryByTypeChart";
import CumulativeRecoveryChart from "./CumulativeRecoveryChart";

export default function Dashboard({ data }) {
  return (
    <div className="min-h-screen bg-[#f8fafb]">
      
      {/* ================= HEADER ================= */}

      <header className="flex h-[58px] items-center justify-between border-b border-slate-200 bg-white px-5">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-800">
            Overview
          </h1>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Recovery performance across all failed revenue events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-600">
            Last 30 days
          </button>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <div className="space-y-4 p-5">

        {/* KPI CARDS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            metric={data.metrics.atRisk}
          />

          <MetricCard
            metric={data.metrics.recovered}
          />

          <MetricCard
            metric={data.metrics.recoveryRate}
          />

          <MetricCard
            metric={data.metrics.avgRecoveryTime}
          />
        </div>

        {/* AI VS BASELINE */}

        <AIvsBaselineChart
          data={data.recoveryComparison}
        />

        {/* LOWER CHARTS */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          
          <RecoveryByTypeChart
            data={data.recoveryByType}
          />

          <CumulativeRecoveryChart
            data={data.cumulativeRecovery}
          />

        </div>
      </div>
    </div>
  );
}