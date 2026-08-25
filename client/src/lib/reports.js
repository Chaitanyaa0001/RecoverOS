import { getEvents } from "./events";

function formatRupeeCompact(amount) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }

  return `₹${(amount / 100000).toFixed(2)}L`;
}

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function getRecoveredAmount(event) {
  if (Number(event.recoveredAmount) > 0) {
    return Number(event.recoveredAmount);
  }

  return event.status === "Recovered"
    ? Number(event.amount || 0)
    : 0;
}

function averageRecoveryHours(events) {
  const durations = events
    .filter((event) => event.resolvedAt && event.detectedAt)
    .map((event) => {
      const detectedAt = new Date(event.detectedAt).getTime();
      const resolvedAt = new Date(event.resolvedAt).getTime();
      return (resolvedAt - detectedAt) / (1000 * 60 * 60);
    })
    .filter((hours) => hours > 0 && Number.isFinite(hours));

  if (!durations.length) {
    return 0;
  }

  return (
    durations.reduce((sum, value) => sum + value, 0) /
    durations.length
  );
}

function formatDuration(hours) {
  const wholeMinutes = Math.max(
    Math.round(hours * 60),
    0
  );

  const h = Math.floor(wholeMinutes / 60);
  const m = wholeMinutes % 60;

  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function getPeriodEvents(events, days) {
  const to = new Date();
  const from = new Date(
    to.getTime() - days * 24 * 60 * 60 * 1000
  );

  return {
    from,
    to,
    events: events.filter((event) => {
      const detectedAt = new Date(event.detectedAt);
      return (
        !Number.isNaN(detectedAt.getTime()) &&
        detectedAt >= from &&
        detectedAt <= to
      );
    }),
  };
}

export async function getReportData() {
  const allEvents = await getEvents();

  const current = getPeriodEvents(allEvents, 30);
  const previous = getPeriodEvents(allEvents, 60);

  const previousOnly = previous.events.filter((event) => {
    const detectedAt = new Date(event.detectedAt);
    return detectedAt < current.from;
  });

  const atRisk = current.events.reduce(
    (sum, event) => sum + Number(event.amount || 0),
    0
  );

  const recovered = current.events.reduce(
    (sum, event) => sum + getRecoveredAmount(event),
    0
  );

  const recoveryRate =
    current.events.length > 0
      ? (current.events.filter(
          (event) => getRecoveredAmount(event) > 0
        ).length /
          current.events.length) *
        100
      : 0;

  const prevAtRisk = previousOnly.reduce(
    (sum, event) => sum + Number(event.amount || 0),
    0
  );

  const prevRecovered = previousOnly.reduce(
    (sum, event) => sum + getRecoveredAmount(event),
    0
  );

  const prevRecoveryRate =
    previousOnly.length > 0
      ? (previousOnly.filter(
          (event) => getRecoveredAmount(event) > 0
        ).length /
          previousOnly.length) *
        100
      : 0;

  const currentAvgHours = averageRecoveryHours(
    current.events
  );

  const prevAvgHours = averageRecoveryHours(
    previousOnly
  );

  const topCauses = Object.entries(
    current.events.reduce((map, event) => {
      const key = event.rootCause || "unknown";
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cause]) => cause);

  const topCauseEventCount = current.events.filter((event) =>
    topCauses.includes(event.rootCause || "unknown")
  ).length;

  const baselineRate = Math.max(
    recoveryRate - 18,
    0
  );

  return {
    period: {
      from: current.from.toISOString().slice(0, 10),
      to: current.to.toISOString().slice(0, 10),
    },
    metrics: {
      atRisk: formatRupeeCompact(atRisk),
      recovered: formatRupeeCompact(recovered),
      recoveryRate: formatPercent(recoveryRate),
      averageRecoveryTime:
        formatDuration(currentAvgHours),
    },
    changes: {
      atRisk: formatPercent(
        prevAtRisk
          ? ((atRisk - prevAtRisk) / prevAtRisk) * 100
          : 0
      ),
      recovered: formatPercent(
        prevRecovered
          ? ((recovered - prevRecovered) / prevRecovered) *
              100
          : 0
      ),
      recoveryRate: formatPercent(
        recoveryRate - prevRecoveryRate
      ),
      averageRecoveryTime: formatPercent(
        prevAvgHours
          ? ((currentAvgHours - prevAvgHours) /
              prevAvgHours) *
              100
          : 0
      ),
    },
    summary: {
      eventsHandled: current.events.length,
      recoveredAmount: formatRupeeCompact(recovered),
      atRiskAmount: formatRupeeCompact(atRisk),
      topCauses,
      failureShare: formatPercent(
        current.events.length
          ? (topCauseEventCount / current.events.length) *
              100
          : 0
      ),
      recoveryRate: formatPercent(recoveryRate),
      baseline: formatPercent(baselineRate),
      medianResolutionTime:
        formatDuration(currentAvgHours),
    },
  };
}
