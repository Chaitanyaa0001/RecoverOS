export async function getGuardrails() {
  return {
    summary: {
      percentage: 8.4,
      heldEvents: 142,
      totalEvents: 1689,

      description:
        "events in the last 30 days were held back by retry caps, opt-outs, quiet hours or incentive limits.",
    },

    events: [
      {
        id: "EVT-48155",
        customer: {
          id: "cus_10101",
          name: "Sana Qureshi",
          email: "sana@example.com",
        },

        rule: "Incentive cap reached",

        status: "Exhausted",

        reason:
          "Recovery incentive limit reached for this customer.",
      },

      {
        id: "EVT-48130",
        customer: {
          id: "cus_10102",
          name: "Priya Raghavan",
          email: "priya@example.com",
        },

        rule: "Max retries reached",

        status: "Exhausted",

        reason:
          "Maximum number of payment recovery attempts has been reached.",
      },

      {
        id: "EVT-48088",
        customer: {
          id: "cus_10103",
          name: "Nikhil Bose",
          email: "nikhil@example.com",
        },

        rule: "Customer opted out",

        status: "No action",

        reason:
          "Customer has opted out of recovery communications.",
      },

      {
        id: "EVT-48061",
        customer: {
          id: "cus_10104",
          name: "Ritu Agarwal",
          email: "ritu@example.com",
        },

        rule: "Quiet hours policy",

        status: "Deferred",

        reason:
          "Recovery action was deferred because the customer is currently within quiet hours.",
      },

      {
        id: "EVT-48040",
        customer: {
          id: "cus_10105",
          name: "Manish Grover",
          email: "manish@example.com",
        },

        rule: "Max retries reached",

        status: "Exhausted",

        reason:
          "Maximum retry threshold has already been reached.",
      },

      {
        id: "EVT-48022",
        customer: {
          id: "cus_10106",
          name: "Lakshmi Rao",
          email: "lakshmi@example.com",
        },

        rule: "Chargeback risk threshold",

        status: "No action",

        reason:
          "Further recovery attempts could increase chargeback risk.",
      },

      {
        id: "EVT-47998",
        customer: {
          id: "cus_10107",
          name: "Imran Shaikh",
          email: "imran@example.com",
        },

        rule: "Customer opted out",

        status: "No action",

        reason:
          "Customer communication preference blocks autonomous outreach.",
      },

      {
        id: "EVT-47971",
        customer: {
          id: "cus_10108",
          name: "Tara Bhatia",
          email: "tara@example.com",
        },

        rule: "Incentive cap reached",

        status: "Exhausted",

        reason:
          "Maximum recovery incentive allocation has been consumed.",
      },
    ],
  };
}