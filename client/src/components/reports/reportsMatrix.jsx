export default function ReportMetrics({
  metrics,
  changes,
}) {
  const cards = [
    {
      label: "₹ AT RISK",
      value: metrics.atRisk,
      change: changes.atRisk,
      direction: "down",
      text: "vs previous period",
    },
    {
      label: "₹ RECOVERED",
      value: metrics.recovered,
      change: changes.recovered,
      direction: "up",
      text: "vs previous period",
    },
    {
      label: "RECOVERY RATE",
      value: metrics.recoveryRate,
      change: changes.recoveryRate,
      direction: "up",
      text: "vs previous period",
    },
    {
      label: "AVG TIME TO RECOVERY",
      value: metrics.averageRecoveryTime,
      change: changes.averageRecoveryTime,
      direction: "down",
      text: "vs previous period",
    },
  ];

  return (
    <section className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white px-4 py-4"
        >

          <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
            {card.label}
          </p>

          <p className="mt-2 text-[24px] font-semibold tracking-tight text-slate-800">
            {card.value}
          </p>

          <div className="mt-2 flex items-center gap-1.5">

            <span className="text-[10px] font-medium text-emerald-600">
              {card.direction === "up" ? "↗" : "↘"}{" "}
              {card.change}
            </span>

            <span className="text-[9px] text-slate-400">
              {card.text}
            </span>

          </div>

        </div>
      ))}

    </section>
  );
}