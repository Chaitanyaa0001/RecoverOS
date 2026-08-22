import MetricCard from "../../components/dashboard/MetricCard";

import AIvsBaselineChart from "../../components/dashboard/AIvsLineChart";

import RecoveryByTypeChart from "../../components/dashboard/RecoveryByTypeChart";

import CumulativeRecoveryChart from "../../components/dashboard/CumulativeRecoveryChart";

import MerchantPerformance from "../../components/dashboard/merchantPerformance";

import { getDashboardData } from "../../lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
     <div
      className="
        min-h-screen
        bg-[#f8fafb]

        mt-14

        md:mt-0
        md:ml-[64px]

        lg:ml-[250px]
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="flex min-h-[58px] w-full items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-5">
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold text-slate-800">
            Razorpay AI Revenue Recovery
          </h1>

          <p className="mt-0.5 truncate text-[10px] text-slate-400">
            Revenue recovery performance across all connected merchants
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="hidden rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-600 sm:block">
            Last 30 days
          </button>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Live
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <main className="w-full min-w-0 space-y-4 p-3 sm:p-4 lg:p-5">

        {/* ===================================================
            KPI CARDS
            =================================================== */}

        <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

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
            metric={data.metrics.activeEvents}
          />

        </section>

        {/* ===================================================
            AI VS BASELINE

            Keep this.

            It proves the AI agent improves recovery
            compared with a traditional rules-based system.
            =================================================== */}

        <section className="w-full min-w-0">
          <AIvsBaselineChart
            data={data.recoveryComparison}
          />
        </section>

        {/* ===================================================
            EVENT TYPE + CUMULATIVE RECOVERY
            =================================================== */}

        <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">

          <RecoveryByTypeChart
            data={data.recoveryByType}
          />

          <CumulativeRecoveryChart
            data={data.cumulativeRecovery}
          />

        </section>

        {/* ===================================================
            MERCHANT PERFORMANCE

            NEW SECTION.

            This makes it clear that Razorpay is managing
            recovery across multiple merchants.
            =================================================== */}

        <section className="w-full min-w-0">

          <MerchantPerformance
            data={data.merchants}
          />

        </section>

      </main>
    </div>
  );
}