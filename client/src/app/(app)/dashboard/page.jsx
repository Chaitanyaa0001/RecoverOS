import MetricCard from "../../../components/dashboard/MetricCard";

import AIvsBaselineChart from "../../../components/dashboard/AIvsLineChart";

import RecoveryByTypeChart from "../../../components/dashboard/RecoveryByTypeChart";

import CumulativeRecoveryChart from "../../../components/dashboard/CumulativeRecoveryChart";

import MerchantPerformance from "../../../components/dashboard/merchantPerformance";

import DashboardHeader from "../../../components/dashboard/Dashboard";

import { getDashboardData } from "../../../lib/dashboard";

export default async function DashboardPage({
  searchParams,
}) {
  const params =
    await searchParams;

  const range =
    params?.range || "30d";

  const data =
    await getDashboardData(range);

  return (
    <div
      className="
        min-h-screen
        w-full
        min-w-0
        overflow-x-hidden
        bg-[#f8fafb]

        mt-14

        md:mt-0
        md:ml-[64px]
        md:w-[calc(100%-64px)]

        lg:ml-[250px]
        lg:w-[calc(100%-250px)]
      "
    >

      {/* HEADER */}

      <DashboardHeader
        agentStatus={
          data.agentStatus
        }
      />

      {/* CONTENT */}

      <main className="w-full min-w-0 space-y-4 p-3 sm:p-4 lg:p-5">

        {/* KPI */}

        <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            metric={
              data.metrics.atRisk
            }
          />

          <MetricCard
            metric={
              data.metrics.recovered
            }
          />

          <MetricCard
            metric={
              data.metrics.recoveryRate
            }
          />

          <MetricCard
            metric={
              data.metrics.activeEvents
            }
          />

        </section>

        {/* AI VS BASELINE */}

        <section className="w-full min-w-0">

          <AIvsBaselineChart
            data={
              data.recoveryComparison
            }
          />

        </section>

        {/* LOWER CHARTS */}

        <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">

          <RecoveryByTypeChart
            data={
              data.recoveryByType
            }
          />

          <CumulativeRecoveryChart
            data={
              data.cumulativeRecovery
            }
          />

        </section>

        {/* MERCHANT PERFORMANCE */}

        <section className="w-full min-w-0">

          <MerchantPerformance
            data={data.merchants}
          />

        </section>

      </main>

    </div>
  );
}