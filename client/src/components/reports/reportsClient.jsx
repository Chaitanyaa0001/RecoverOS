"use client";

import { useState } from "react";

import DateRangePicker from "./dataRangePicker";
import ReportMetrics from "./reportsMatrix";
import ReportSummary from "./reportSummary";
import DownloadReport from "./downloadReport";

export default function ReportsClient({
  initialData,
}) {
  const [dateRange, setDateRange] = useState({
    from: initialData.period.from,
    to: initialData.period.to,
  });

  const [data] = useState(initialData);

  return (
    <main className="min-h-screen w-full min-w-0 bg-[#f8fafb]">

      {/* HEADER */}

      <header className="flex min-h-[78px] w-full items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">

        <div className="min-w-0">

          <h1 className="text-[15px] font-semibold text-slate-800">
            Reports
          </h1>

          <p className="mt-1 text-[10px] text-slate-400">
            Period summaries ready to share with finance leadership
          </p>

        </div>

        <div className="flex shrink-0 items-center gap-2">

          <DownloadReport
            data={data}
            dateRange={dateRange}
          />

          <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-medium text-emerald-600 sm:flex">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Live

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <div className="w-full min-w-0 space-y-5 p-4 sm:p-5">

        {/* DATE RANGE */}

        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />

        {/* METRICS */}

        <ReportMetrics
          metrics={data.metrics}
          changes={data.changes}
        />

        {/* SUMMARY */}

        <ReportSummary
          summary={data.summary}
        />

      </div>

    </main>
  );
}