export async function getDashboardData() {
  /*
   * =========================================================
   * MOCK RAZORPAY-WIDE DASHBOARD DATA
   *
   * IMPORTANT:
   * This data represents Razorpay's recovery platform
   * across multiple merchants.
   *
   * Later these values should come from the backend/database.
   * =========================================================
   */

  return {
    metrics: {
      /*
       * Total revenue currently at risk across ALL merchants.
       */
      atRisk: {
        label: "₹ AT RISK",
        value: "₹2.42 Cr",
        change: "3.2%",
        direction: "down",
      },

      /*
       * Total money recovered by the AI recovery system.
       */
      recovered: {
        label: "₹ RECOVERED",
        value: "₹1.62 Cr",
        change: "11.8%",
        direction: "up",
      },

      /*
       * Recovery performance across all merchants.
       */
      recoveryRate: {
        label: "RECOVERY RATE",
        value: "66.9%",
        change: "7.1%",
        direction: "up",
      },

      /*
       * Events currently waiting for recovery/approval.
       *
       * This is more useful for the Razorpay control center
       * than showing only average recovery time.
       */
      activeEvents: {
        label: "ACTIVE RECOVERY EVENTS",
        value: "128",
        change: "8.4%",
        direction: "down",
      },
    },

    /*
     * =========================================================
     * AI VS BASELINE
     *
     * Demonstrates that the AI agent performs better than
     * a traditional rules-based recovery system.
     * =========================================================
     */

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

    /*
     * =========================================================
     * RECOVERY BY EVENT TYPE
     * =========================================================
     */

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

    /*
     * =========================================================
     * CUMULATIVE MONEY RECOVERED
     *
     * This is Razorpay-wide recovered revenue.
     * =========================================================
     */

    cumulativeRecovery: [
      {
        day: "01 Aug",
        amount: 5,
      },

      {
        day: "03 Aug",
        amount: 12,
      },

      {
        day: "05 Aug",
        amount: 19,
      },

      {
        day: "07 Aug",
        amount: 28,
      },

      {
        day: "09 Aug",
        amount: 35,
      },

      {
        day: "11 Aug",
        amount: 46,
      },

      {
        day: "13 Aug",
        amount: 58,
      },

      {
        day: "15 Aug",
        amount: 64,
      },

      {
        day: "17 Aug",
        amount: 77,
      },

      {
        day: "19 Aug",
        amount: 88,
      },
    ],

    /*
     * =========================================================
     * MERCHANT PERFORMANCE
     *
     * This is what makes the dashboard Razorpay-wide.
     * Each merchant has its own recovery performance.
     * =========================================================
     */

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
  };
}