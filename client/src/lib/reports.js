export async function getReportData() {
  return {
    period: {
      from: "2026-08-01",
      to: "2026-08-23",
    },

    metrics: {
      atRisk: "₹1.86Cr",
      recovered: "₹1.19Cr",
      recoveryRate: "63.9%",
      averageRecoveryTime: "5h 04m",
    },

    changes: {
      atRisk: "2.6%",
      recovered: "12.7%",
      recoveryRate: "3.8%",
      averageRecoveryTime: "6.9%",
    },

    summary: {
      eventsHandled: 1689,
      recoveredAmount: "₹1.19Cr",
      atRiskAmount: "₹1.86Cr",

      topCauses: [
        "insufficient_funds",
        "otp_timeout",
        "card_expired",
      ],

      failureShare: "71%",
      recoveryRate: "63.9%",
      baseline: "38.5%",
      medianResolutionTime: "5h 04m",
    },
  };
}