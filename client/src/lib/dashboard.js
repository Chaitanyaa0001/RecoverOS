const dashboardData = {
  "7d": {
    agentStatus: "LIVE",

    metrics: {
      atRisk: {
        label: "₹ AT RISK",
        value: "₹42.8 L",
        change: "4.2%",
        direction: "down",
      },

      recovered: {
        label: "₹ RECOVERED",
        value: "₹27.4 L",
        change: "14.8%",
        direction: "up",
      },

      recoveryRate: {
        label: "RECOVERY RATE",
        value: "64.0%",
        change: "4.1%",
        direction: "up",
      },

      activeEvents: {
        label: "ACTIVE RECOVERY EVENTS",
        value: "48",
        change: "12",
        direction: "up",
      },
    },

    recoveryComparison: [
      {
        type: "Payment Failure",
        baseline: 39.2,
        agent: 64.8,
      },
      {
        type: "Checkout Abandonment",
        baseline: 28.4,
        agent: 55.2,
      },
      {
        type: "Subscription Failure",
        baseline: 45.1,
        agent: 70.3,
      },
      {
        type: "Overdue Invoice",
        baseline: 35.6,
        agent: 61.4,
      },
      {
        type: "B2B Payment Due",
        baseline: 38.8,
        agent: 65.7,
      },
      {
        type: "All Events",
        baseline: 38.9,
        agent: 64.0,
      },
    ],

    recoveryByType: [
      {
        type: "Payment Failure",
        recovery: 64.8,
      },
      {
        type: "Checkout Abandonment",
        recovery: 55.2,
      },
      {
        type: "Subscription Failure",
        recovery: 70.3,
      },
      {
        type: "Overdue Invoice",
        recovery: 61.4,
      },
      {
        type: "B2B Payment Due",
        recovery: 65.7,
      },
    ],

    cumulativeRecovery: [
      {
        day: "17 Aug",
        amount: 3.2,
      },
      {
        day: "18 Aug",
        amount: 7.4,
      },
      {
        day: "19 Aug",
        amount: 12.1,
      },
      {
        day: "20 Aug",
        amount: 16.8,
      },
      {
        day: "21 Aug",
        amount: 21.3,
      },
      {
        day: "22 Aug",
        amount: 24.9,
      },
      {
        day: "23 Aug",
        amount: 27.4,
      },
    ],

    merchants: [
      {
        id: "mrc_001",
        name: "ABC Enterprises",
        atRisk: "8.2",
        recovered: "5.7",
        recoveryRate: 69.5,
        events: 12,
      },
      {
        id: "mrc_002",
        name: "XYZ Solutions",
        atRisk: "5.4",
        recovered: "4.1",
        recoveryRate: 75.9,
        events: 9,
      },
      {
        id: "mrc_003",
        name: "Acme Technologies",
        atRisk: "3.1",
        recovered: "2.8",
        recoveryRate: 90.3,
        events: 7,
      },
      {
        id: "mrc_004",
        name: "Nova Retail",
        atRisk: "4.7",
        recovered: "2.9",
        recoveryRate: 61.7,
        events: 13,
      },
      {
        id: "mrc_005",
        name: "Orbit Services",
        atRisk: "2.9",
        recovered: "2.1",
        recoveryRate: 72.4,
        events: 7,
      },
    ],
  },

  "30d": {
    agentStatus: "LIVE",

    metrics: {
      atRisk: {
        label: "₹ AT RISK",
        value: "₹2.42 Cr",
        change: "3.2%",
        direction: "down",
      },

      recovered: {
        label: "₹ RECOVERED",
        value: "₹1.62 Cr",
        change: "11.8%",
        direction: "up",
      },

      recoveryRate: {
        label: "RECOVERY RATE",
        value: "66.9%",
        change: "7.1%",
        direction: "up",
      },

      activeEvents: {
        label: "ACTIVE RECOVERY EVENTS",
        value: "128",
        change: "8.4%",
        direction: "up",
      },
    },

    recoveryComparison: [
      {
        type: "Payment Failure",
        baseline: 41.2,
        agent: 68.4,
      },
      {
        type: "Checkout Abandonment",
        baseline: 27.6,
        agent: 54.9,
      },
      {
        type: "Subscription Failure",
        baseline: 48.3,
        agent: 72.1,
      },
      {
        type: "Overdue Invoice",
        baseline: 34.5,
        agent: 61.8,
      },
      {
        type: "B2B Payment Due",
        baseline: 39.2,
        agent: 67.4,
      },
      {
        type: "All Events",
        baseline: 38.5,
        agent: 64.8,
      },
    ],

    recoveryByType: [
      {
        type: "Payment Failure",
        recovery: 68.4,
      },
      {
        type: "Checkout Abandonment",
        recovery: 54.9,
      },
      {
        type: "Subscription Failure",
        recovery: 72.1,
      },
      {
        type: "Overdue Invoice",
        recovery: 61.7,
      },
      {
        type: "B2B Payment Due",
        recovery: 66.2,
      },
    ],

    cumulativeRecovery: [
      {
        day: "01 Aug",
        amount: 5,
      },
      {
        day: "05 Aug",
        amount: 19,
      },
      {
        day: "09 Aug",
        amount: 35,
      },
      {
        day: "13 Aug",
        amount: 58,
      },
      {
        day: "17 Aug",
        amount: 77,
      },
      {
        day: "21 Aug",
        amount: 104,
      },
      {
        day: "23 Aug",
        amount: 162,
      },
    ],

    merchants: [
      {
        id: "mrc_001",
        name: "ABC Enterprises",
        atRisk: "8.2",
        recovered: "5.7",
        recoveryRate: 69.5,
        events: 42,
      },
      {
        id: "mrc_002",
        name: "XYZ Solutions",
        atRisk: "5.4",
        recovered: "4.1",
        recoveryRate: 75.9,
        events: 31,
      },
      {
        id: "mrc_003",
        name: "Acme Technologies",
        atRisk: "3.1",
        recovered: "2.8",
        recoveryRate: 90.3,
        events: 24,
      },
      {
        id: "mrc_004",
        name: "Nova Retail",
        atRisk: "4.7",
        recovered: "2.9",
        recoveryRate: 61.7,
        events: 37,
      },
      {
        id: "mrc_005",
        name: "Orbit Services",
        atRisk: "2.9",
        recovered: "2.1",
        recoveryRate: 72.4,
        events: 19,
      },
    ],
  },

  "3m": {
    agentStatus: "LIVE",

    metrics: {
      atRisk: {
        label: "₹ AT RISK",
        value: "₹5.42 Cr",
        change: "5.1%",
        direction: "down",
      },

      recovered: {
        label: "₹ RECOVERED",
        value: "₹3.46 Cr",
        change: "18.2%",
        direction: "up",
      },

      recoveryRate: {
        label: "RECOVERY RATE",
        value: "63.8%",
        change: "5.4%",
        direction: "up",
      },

      activeEvents: {
        label: "ACTIVE RECOVERY EVENTS",
        value: "318",
        change: "12.4%",
        direction: "up",
      },
    },

    recoveryComparison: [
      {
        type: "Payment Failure",
        baseline: 40.1,
        agent: 67.2,
      },
      {
        type: "Checkout Abandonment",
        baseline: 28.1,
        agent: 55.7,
      },
      {
        type: "Subscription Failure",
        baseline: 46.4,
        agent: 71.5,
      },
      {
        type: "Overdue Invoice",
        baseline: 35.8,
        agent: 62.9,
      },
      {
        type: "B2B Payment Due",
        baseline: 38.7,
        agent: 66.8,
      },
      {
        type: "All Events",
        baseline: 38.2,
        agent: 64.2,
      },
    ],

    recoveryByType: [
      {
        type: "Payment Failure",
        recovery: 67.2,
      },
      {
        type: "Checkout Abandonment",
        recovery: 55.7,
      },
      {
        type: "Subscription Failure",
        recovery: 71.5,
      },
      {
        type: "Overdue Invoice",
        recovery: 62.9,
      },
      {
        type: "B2B Payment Due",
        recovery: 66.8,
      },
    ],

    cumulativeRecovery: [
      {
        day: "Month 1",
        amount: 86,
      },
      {
        day: "Month 2",
        amount: 174,
      },
      {
        day: "Month 3",
        amount: 346,
      },
    ],

    merchants: [
      {
        id: "mrc_001",
        name: "ABC Enterprises",
        atRisk: "21.4",
        recovered: "14.8",
        recoveryRate: 69.2,
        events: 124,
      },
      {
        id: "mrc_002",
        name: "XYZ Solutions",
        atRisk: "16.8",
        recovered: "12.5",
        recoveryRate: 74.4,
        events: 97,
      },
      {
        id: "mrc_003",
        name: "Acme Technologies",
        atRisk: "12.4",
        recovered: "10.9",
        recoveryRate: 87.9,
        events: 76,
      },
      {
        id: "mrc_004",
        name: "Nova Retail",
        atRisk: "15.7",
        recovered: "9.8",
        recoveryRate: 62.4,
        events: 112,
      },
      {
        id: "mrc_005",
        name: "Orbit Services",
        atRisk: "9.7",
        recovered: "7.2",
        recoveryRate: 74.2,
        events: 64,
      },
    ],
  },

  "6m": {
    agentStatus: "LIVE",

    metrics: {
      atRisk: {
        label: "₹ AT RISK",
        value: "₹10.8 Cr",
        change: "7.4%",
        direction: "down",
      },

      recovered: {
        label: "₹ RECOVERED",
        value: "₹6.92 Cr",
        change: "21.6%",
        direction: "up",
      },

      recoveryRate: {
        label: "RECOVERY RATE",
        value: "64.1%",
        change: "6.2%",
        direction: "up",
      },

      activeEvents: {
        label: "ACTIVE RECOVERY EVENTS",
        value: "504",
        change: "15.2%",
        direction: "up",
      },
    },

    recoveryComparison: [
      {
        type: "Payment Failure",
        baseline: 40.8,
        agent: 67.8,
      },
      {
        type: "Checkout Abandonment",
        baseline: 27.9,
        agent: 55.1,
      },
      {
        type: "Subscription Failure",
        baseline: 47.2,
        agent: 71.8,
      },
      {
        type: "Overdue Invoice",
        baseline: 35.1,
        agent: 62.4,
      },
      {
        type: "B2B Payment Due",
        baseline: 39.0,
        agent: 66.9,
      },
      {
        type: "All Events",
        baseline: 38.4,
        agent: 64.5,
      },
    ],

    recoveryByType: [
      {
        type: "Payment Failure",
        recovery: 67.8,
      },
      {
        type: "Checkout Abandonment",
        recovery: 55.1,
      },
      {
        type: "Subscription Failure",
        recovery: 71.8,
      },
      {
        type: "Overdue Invoice",
        recovery: 62.4,
      },
      {
        type: "B2B Payment Due",
        recovery: 66.9,
      },
    ],

    cumulativeRecovery: [
      {
        day: "Jan",
        amount: 86,
      },
      {
        day: "Feb",
        amount: 174,
      },
      {
        day: "Mar",
        amount: 281,
      },
      {
        day: "Apr",
        amount: 389,
      },
      {
        day: "May",
        amount: 528,
      },
      {
        day: "Jun",
        amount: 692,
      },
    ],

    merchants: [
      {
        id: "mrc_001",
        name: "ABC Enterprises",
        atRisk: "42.4",
        recovered: "28.6",
        recoveryRate: 67.5,
        events: 286,
      },
      {
        id: "mrc_002",
        name: "XYZ Solutions",
        atRisk: "36.8",
        recovered: "27.1",
        recoveryRate: 73.6,
        events: 214,
      },
      {
        id: "mrc_003",
        name: "Acme Technologies",
        atRisk: "31.2",
        recovered: "27.4",
        recoveryRate: 87.8,
        events: 187,
      },
      {
        id: "mrc_004",
        name: "Nova Retail",
        atRisk: "28.7",
        recovered: "18.1",
        recoveryRate: 63.1,
        events: 241,
      },
      {
        id: "mrc_005",
        name: "Orbit Services",
        atRisk: "21.9",
        recovered: "16.2",
        recoveryRate: 74.0,
        events: 153,
      },
    ],
  },

  "12m": {
    /*
     * Demonstration of an inactive agent.
     *
     * Because activeEvents = 0 and the agent is not
     * processing anything, the UI will show OFFLINE.
     */
    agentStatus: "OFFLINE",

    metrics: {
      atRisk: {
        label: "₹ AT RISK",
        value: "₹21.6 Cr",
        change: "9.2%",
        direction: "down",
      },

      recovered: {
        label: "₹ RECOVERED",
        value: "₹13.82 Cr",
        change: "24.8%",
        direction: "up",
      },

      recoveryRate: {
        label: "RECOVERY RATE",
        value: "64.0%",
        change: "7.1%",
        direction: "up",
      },

      activeEvents: {
        label: "ACTIVE RECOVERY EVENTS",
        value: "0",
        change: "0%",
        direction: "neutral",
      },
    },

    recoveryComparison: [
      {
        type: "Payment Failure",
        baseline: 40.4,
        agent: 67.1,
      },
      {
        type: "Checkout Abandonment",
        baseline: 28.2,
        agent: 55.3,
      },
      {
        type: "Subscription Failure",
        baseline: 47.0,
        agent: 71.4,
      },
      {
        type: "Overdue Invoice",
        baseline: 35.4,
        agent: 62.1,
      },
      {
        type: "B2B Payment Due",
        baseline: 38.9,
        agent: 66.5,
      },
      {
        type: "All Events",
        baseline: 38.1,
        agent: 64.0,
      },
    ],

    recoveryByType: [
      {
        type: "Payment Failure",
        recovery: 67.1,
      },
      {
        type: "Checkout Abandonment",
        recovery: 55.3,
      },
      {
        type: "Subscription Failure",
        recovery: 71.4,
      },
      {
        type: "Overdue Invoice",
        recovery: 62.1,
      },
      {
        type: "B2B Payment Due",
        recovery: 66.5,
      },
    ],

    cumulativeRecovery: [
      {
        day: "Q1",
        amount: 284,
      },
      {
        day: "Q2",
        amount: 648,
      },
      {
        day: "Q3",
        amount: 1012,
      },
      {
        day: "Q4",
        amount: 1382,
      },
    ],

    merchants: [
      {
        id: "mrc_001",
        name: "ABC Enterprises",
        atRisk: "84.2",
        recovered: "57.4",
        recoveryRate: 68.2,
        events: 621,
      },
      {
        id: "mrc_002",
        name: "XYZ Solutions",
        atRisk: "71.4",
        recovered: "53.2",
        recoveryRate: 74.5,
        events: 498,
      },
      {
        id: "mrc_003",
        name: "Acme Technologies",
        atRisk: "62.7",
        recovered: "54.8",
        recoveryRate: 87.4,
        events: 421,
      },
      {
        id: "mrc_004",
        name: "Nova Retail",
        atRisk: "58.3",
        recovered: "36.4",
        recoveryRate: 62.4,
        events: 534,
      },
      {
        id: "mrc_005",
        name: "Orbit Services",
        atRisk: "43.9",
        recovered: "32.7",
        recoveryRate: 74.5,
        events: 361,
      },
    ],
  },
};

export async function getDashboardData(
  range = "30d"
) {
  return (
    dashboardData[range] ||
    dashboardData["30d"]
  );
}