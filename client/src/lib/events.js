export async function getEvents() {
  return [
    {
      id: "EVT-48215",

      merchant: {
        id: "mrc_urban_001",
        name: "UrbanCart",
      },

      customer: {
        id: "cus_10021",
        name: "ABC Enterprises",
        email: "finance@abcenterprises.com",
      },

      invoiceNumber: "INV-2026-0815",

      type: "Overdue Invoice",
      amount: 625000,

      rootCause: "client_cash_flow_hold",
      rootCauseLabel: "Client cash-flow hold",

      confidence: 92,

      recommendedAction: "EMAIL",
      actionLabel: "Send Dunning Email",

      actionReason:
        "The invoice is overdue and this customer has historically responded well to email reminders. A payment link provides a low-friction recovery path.",

      alternatives: [
        "VOICE",
        "ACCOUNT_MANAGER",
      ],

      guardrail: {
        status: "BLOCKED",
        rule: "B2B High-Value Approval",
        reason:
          "Invoice exceeds ₹5L. Account manager approval is required before autonomous recovery.",
      },

      actionStatus: "BLOCKED",
      actionResult: null,

      action:
        "Dunning email awaiting approval",

      status: "In Progress",

      detectedAt:
        "2026-08-18T10:21:00.000Z",

      resolvedAt: null,

      outcome:
        "Awaiting approval",

      timeline: [
        {
          stage: "detected",
          title: "Detected",
          time: "18 Aug, 10:21",
          description:
            "Overdue Invoice of ₹6,25,000 detected.",
        },

        {
          stage: "diagnosing",
          title: "Diagnosing",
          time: "18 Aug, 10:21",
          description:
            "Analyzing invoice history, payment behavior and account signals...",
        },

        {
          stage: "diagnosed",
          title: "Diagnosed · 92% confidence",
          time: "18 Aug, 10:22",
          description:
            "Root cause classified as Client cash-flow hold.",
          confidence: 92,
        },

        {
          stage: "guardrail",
          title: "Guardrail Check",
          time: "18 Aug, 10:22",
          description:
            "B2B High-Value Approval triggered because invoice exceeds ₹5L.",
        },

        {
          stage: "planning",
          title: "AI Recovery Decision",
          time: "18 Aug, 10:23",
          description:
            "Dunning email selected as the preferred recovery intervention, pending account manager approval.",
        },
      ],
    },

    {
      id: "EVT-48214",

      merchant: {
        id: "mrc_tech_002",
        name: "TechNova Solutions",
      },

      customer: {
        id: "cus_10022",
        name: "XYZ Solutions Pvt Ltd",
        email: "accounts@xyzsolutions.com",
      },

      invoiceNumber: "INV-2026-0821",

      type: "B2B Payment Due",
      amount: 875000,

      rootCause: "disputed_invoice",
      rootCauseLabel: "Disputed invoice",

      confidence: 88,

      recommendedAction: "ACCOUNT_MANAGER",

      actionLabel:
        "Escalate to Account Manager",

      actionReason:
        "The invoice is high-value and disputed. Autonomous recovery could create customer relationship risk, so the agent escalates the case to the account manager.",

      alternatives: [
        "EMAIL",
        "VOICE",
      ],

      guardrail: {
        status: "BLOCKED",
        rule: "B2B High-Value Approval",
        reason:
          "Invoice exceeds ₹5L and contains a payment dispute. Human approval is required.",
      },

      actionStatus: "BLOCKED",

      actionResult:
        "Escalated to account manager",

      action:
        "Escalated to account manager",

      status: "In Progress",

      detectedAt:
        "2026-08-18T11:04:00.000Z",

      resolvedAt: null,

      outcome:
        "Awaiting account manager",

      timeline: [
        {
          stage: "detected",
          title: "Detected",
          time: "18 Aug, 11:04",
          description:
            "B2B Payment Due of ₹8,75,000 detected.",
        },

        {
          stage: "diagnosing",
          title: "Diagnosing",
          time: "18 Aug, 11:04",
          description:
            "Reviewing invoice dispute history and account context...",
        },

        {
          stage: "diagnosed",
          title: "Diagnosed · 88% confidence",
          time: "18 Aug, 11:05",
          description:
            "Root cause classified as Disputed invoice.",
          confidence: 88,
        },

        {
          stage: "guardrail",
          title: "Guardrail Check",
          time: "18 Aug, 11:05",
          description:
            "B2B High-Value Approval triggered because invoice exceeds ₹5L.",
        },

        {
          stage: "planning",
          title: "AI Recovery Decision",
          time: "18 Aug, 11:06",
          description:
            "Escalation to account manager selected instead of autonomous customer outreach.",
        },

        {
          stage: "action",
          title: "Action Taken",
          time: "18 Aug, 11:06",
          description:
            "Case escalated to account manager.",
        },
      ],
    },

    {
      id: "EVT-48210",

      merchant: {
        id: "mrc_fresh_003",
        name: "FreshMart",
      },

      customer: {
        id: "cus_10023",
        name: "Ananya Iyer",
        email: "ananya@example.com",
      },

      type: "Payment Failure",
      amount: 24999,

      rootCause: "insufficient_funds",
      rootCauseLabel: "Insufficient funds",

      confidence: 94,

      recommendedAction: "SMART_RETRY",

      actionLabel: "Smart Retry",

      actionReason:
        "The agent detected a salary-cycle pattern. Similar payment failures have a high recovery rate when payment is retried after 24–26 hours.",

      alternatives: [
        "PAYMENT_LINK",
        "EMAIL",
      ],

      guardrail: {
        status: "ALLOWED",
        rule: "Payment Retry Limits",
        reason:
          "Retry count is within the configured recovery limit.",
      },

      actionStatus: "EXECUTED",

      actionResult:
        "Payment captured on first retry",

      action:
        "Smart retry scheduled",

      status: "Recovered",

      detectedAt:
        "2026-08-12T09:14:00.000Z",

      resolvedAt:
        "2026-08-13T11:26:00.000Z",

      outcome:
        "Payment captured on first retry",

      timeline: [
        {
          stage: "detected",
          title: "Detected",
          time: "12 Aug, 09:14",
          description:
            "Payment Failure on ₹24,999 — gateway code insufficient_funds.",
        },

        {
          stage: "diagnosing",
          title: "Diagnosing",
          time: "12 Aug, 09:14",
          description:
            "Analyzing gateway response and customer payment history...",
        },

        {
          stage: "diagnosed",
          title: "Diagnosed · 94% confidence",
          time: "12 Aug, 09:14",
          description:
            "Root cause classified as insufficient_funds.",
          confidence: 94,
        },

        {
          stage: "guardrail",
          title: "Guardrail Check",
          time: "12 Aug, 09:15",
          description:
            "Retry limit and customer contact policies evaluated.",
        },

        {
          stage: "planning",
          title: "AI Recovery Decision",
          time: "12 Aug, 09:16",
          description:
            "Smart retry selected based on salary-cycle behavior.",
        },

        {
          stage: "action",
          title: "Action Taken",
          time: "12 Aug, 09:16",
          description:
            "Smart retry scheduled for T+26h.",
        },

        {
          stage: "outcome",
          title: "Outcome",
          time: "13 Aug, 11:26",
          description:
            "Payment captured on first retry. No customer contact required.",
        },
      ],
    },

    {
      id: "EVT-48197",

      merchant: {
        id: "mrc_shop_004",
        name: "StyleSphere",
      },

      customer: {
        id: "cus_10024",
        name: "Rohit Deshmukh",
        email: "rohit@example.com",
      },

      type: "Checkout Abandonment",
      amount: 8450,

      rootCause: "otp_timeout",
      rootCauseLabel: "OTP timeout",

      confidence: 91,

      recommendedAction: "PAYMENT_LINK",

      actionLabel: "Create Payment Link",

      actionReason:
        "The customer abandoned checkout after an OTP timeout. A direct payment link provides a lower-friction recovery path.",

      alternatives: [
        "EMAIL",
        "VOICE",
      ],

      guardrail: {
        status: "ALLOWED",
        rule: "Customer Communication Frequency",
        reason:
          "Customer is eligible for one recovery communication.",
      },

      actionStatus: "PENDING",

      actionResult: null,

      action:
        "Payment link ready to be generated",

      status: "Recovery Pending",

      detectedAt:
        "2026-08-12T08:40:00.000Z",

      resolvedAt: null,

      outcome:
        "Payment link recovery pending",

      paymentLink: null,

      timeline: [
        {
          stage: "detected",
          title: "Detected",
          time: "12 Aug, 08:40",
          description:
            "Checkout abandoned after OTP timeout.",
        },

        {
          stage: "diagnosing",
          title: "Diagnosing",
          time: "12 Aug, 08:40",
          description:
            "Analyzing checkout session and OTP failure signals...",
        },

        {
          stage: "diagnosed",
          title: "Diagnosed · 91% confidence",
          time: "12 Aug, 08:41",
          description:
            "Root cause classified as OTP timeout.",
          confidence: 91,
        },

        {
          stage: "guardrail",
          title: "Guardrail Check",
          time: "12 Aug, 08:41",
          description:
            "Customer communication frequency checked.",
        },

        {
          stage: "planning",
          title: "AI Recovery Decision",
          time: "12 Aug, 08:42",
          description:
            "Direct payment link selected as the recovery intervention.",
        },
      ],
    },

    {
      id: "EVT-48192",

      merchant: {
        id: "mrc_pay_005",
        name: "UrbanCart",
      },

      customer: {
        id: "cus_10025",
        name: "Rahul Sharma",
        email: "rahul@example.com",
      },

      type: "Payment Failure",
      amount: 32999,

      rootCause: "issuer_declined",
      rootCauseLabel: "Issuer declined",

      confidence: 91,

      recommendedAction: "VOICE",

      actionLabel:
        "Hinglish Voice Recovery",

      actionReason:
        "The customer is eligible for voice communication and similar payment failures show strong recovery through conversational assistance.",

      alternatives: [
        "PAYMENT_LINK",
        "EMAIL",
      ],

      guardrail: {
        status: "ALLOWED",
        rule: "Do-Not-Call Registry",
        reason:
          "Customer is not present in the Do-Not-Call registry.",
      },

      actionStatus: "PENDING",

      actionResult: null,

      action:
        "Voice recovery ready",

      status: "Recovery Pending",

      detectedAt:
        "2026-08-19T14:10:00.000Z",

      resolvedAt: null,

      outcome:
        "Voice recovery ready",

      timeline: [
        {
          stage: "detected",
          title: "Detected",
          time: "19 Aug, 14:10",
          description:
            "Payment Failure of ₹32,999 detected.",
        },

        {
          stage: "diagnosing",
          title: "Diagnosing",
          time: "19 Aug, 14:10",
          description:
            "Analyzing gateway response, customer history and recovery preferences...",
        },

        {
          stage: "diagnosed",
          title: "Diagnosed · 91% confidence",
          time: "19 Aug, 14:11",
          description:
            "Root cause classified as issuer declined.",
          confidence: 91,
        },

        {
          stage: "guardrail",
          title: "Guardrail Check",
          time: "19 Aug, 14:11",
          description:
            "Do-Not-Call Registry checked. Customer is eligible for voice recovery.",
        },

        {
          stage: "planning",
          title: "AI Recovery Decision",
          time: "19 Aug, 14:12",
          description:
            "Hinglish Voice Recovery selected as the preferred intervention.",
        },
      ],
    },

    {
      id: "EVT-48188",

      merchant: {
        id: "mrc_food_006",
        name: "FoodRush",
      },

      customer: {
        id: "cus_10026",
        name: "Priya Mehta",
        email: "priya@example.com",
      },

      type: "Payment Failure",
      amount: 18999,

      rootCause: "issuer_declined",
      rootCauseLabel: "Issuer declined",

      confidence: 89,

      recommendedAction: "EMAIL",

      actionLabel:
        "Send Recovery Email",

      actionReason:
        "Voice recovery was initially considered, but the customer is opted out of calls. The agent automatically selected email as the compliant fallback.",

      alternatives: [
        "PAYMENT_LINK",
      ],

      guardrail: {
        status: "BLOCKED",
        rule: "Do-Not-Call Registry",
        reason:
          "Voice recovery was blocked because the customer opted out of calls. Email was selected as the compliant fallback.",
      },

      actionStatus: "BLOCKED",

      actionResult:
        "Voice blocked. Email selected as compliant fallback.",

      action:
        "Recovery email awaiting execution",

      status: "In Progress",

      detectedAt:
        "2026-08-19T15:20:00.000Z",

      resolvedAt: null,

      outcome:
        "Email fallback selected",

      timeline: [
        {
          stage: "detected",
          title: "Detected",
          time: "19 Aug, 15:20",
          description:
            "Payment Failure of ₹18,999 detected.",
        },

        {
          stage: "diagnosing",
          title: "Diagnosing",
          time: "19 Aug, 15:20",
          description:
            "Analyzing payment failure and customer communication preferences...",
        },

        {
          stage: "diagnosed",
          title: "Diagnosed · 89% confidence",
          time: "19 Aug, 15:21",
          description:
            "Root cause classified as issuer declined.",
          confidence: 89,
        },

        {
          stage: "guardrail",
          title: "Guardrail Blocked",
          time: "19 Aug, 15:21",
          description:
            "Do-Not-Call Registry blocked the voice recovery attempt.",
        },

        {
          stage: "planning",
          title: "AI Recovery Decision",
          time: "19 Aug, 15:22",
          description:
            "Email selected as the compliant fallback intervention.",
        },
      ],
    },
  ];
}