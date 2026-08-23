export default function ReportSummary({
  summary,
}) {
  return (
    <section
      id="report-summary"
      className="rounded-lg border border-slate-200 bg-white p-5"
    >

      <div>

        <h2 className="text-[12px] font-semibold text-slate-800">
          Report summary
        </h2>

        <p className="mt-1 text-[9px] text-slate-400">
          Auto-generated narrative for the selected period
        </p>

      </div>

      <div className="mt-5 space-y-3 text-[11px] leading-6 text-slate-500">

        <p>
          The agent handled{" "}
          <strong className="font-semibold text-slate-700">
            {summary.eventsHandled.toLocaleString("en-IN")} events
          </strong>{" "}
          during this period, recovering{" "}
          <strong className="font-semibold text-emerald-600">
            {summary.recoveredAmount}
          </strong>{" "}
          of{" "}
          <strong className="font-semibold text-slate-700">
            {summary.atRiskAmount}
          </strong>{" "}
          at risk.
        </p>

        <p>

          <strong className="font-semibold text-slate-700">
            {summary.topCauses.join(", ")}
          </strong>{" "}
          accounted for{" "}
          <strong className="font-semibold text-slate-700">
            {summary.failureShare}
          </strong>{" "}
          of all payment failures.

        </p>

        <p>

          Recovery rate held at{" "}
          <strong className="font-semibold text-slate-700">
            {summary.recoveryRate}
          </strong>{" "}
          against a{" "}
          <strong className="font-semibold text-slate-700">
            {summary.baseline}
          </strong>{" "}
          rules-based baseline, with a median resolution time of{" "}
          <strong className="font-semibold text-slate-700">
            {summary.medianResolutionTime}
          </strong>
          .

        </p>

      </div>

    </section>
  );
}