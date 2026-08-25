import { randomUUID } from "crypto";

/* =========================================================
   EVENT ERROR CODES
========================================================= */

const EVENT_TYPE_ERROR_CODES = {
  "Payment Failure": [
    "insufficient_funds",
    "card_expired",
    "otp_timeout",
    "issuer_declined",
    "gateway_timeout",
  ],

  "Checkout Abandonment": [
    "otp_timeout",
    "session_dropped",
    "3ds_failure",
  ],

  "Subscription Failure": [
    "card_expired",
    "mandate_revoked",
    "insufficient_funds",
  ],

  "Overdue Invoice": [
    "client_cash_flow_hold",
    "disputed_invoice",
  ],

  "B2B Payment Due": [
    "client_cash_flow_hold",
    "disputed_invoice",
  ],
};

/* =========================================================
   DEMO DATA
========================================================= */

const FIRST_NAMES = [
  "Ananya",
  "Rohit",
  "Priya",
  "Rahul",
  "Sana",
  "Nikhil",
  "Ritu",
  "Manish",
  "Lakshmi",
  "Imran",
  "Tara",
  "Arjun",
  "Meera",
  "Vikram",
  "Kabir",
  "Divya",
  "Harshad",
  "Sneha",
  "Aditya",
  "Pooja",
];

const LAST_NAMES = [
  "Iyer",
  "Deshmukh",
  "Mehta",
  "Sharma",
  "Qureshi",
  "Bose",
  "Agarwal",
  "Grover",
  "Rao",
  "Shaikh",
  "Bhatia",
  "Nair",
  "Krishnan",
  "Sethi",
  "Malhotra",
  "Menon",
  "Patel",
  "Reddy",
  "Kapoor",
  "Joshi",
];

const COMPANY_NAMES = [
  "ABC Enterprises",
  "XYZ Solutions Pvt Ltd",
  "TechNova Solutions",
  "Global Traders Ltd",
  "Skyline Logistics",
  "Meridian Textiles",
  "Bluewave Exports",
  "Northstar Industries",
  "Crestline Pvt Ltd",
  "Vantage Retail Group",
];

/*
 * Demo inbox.
 */
const DEMO_EMAIL =
  "chaitanyakhurana.workk@gmail.com";

/* =========================================================
   HELPERS
========================================================= */

function randomChoice(array) {
  return array[
    Math.floor(Math.random() * array.length)
  ];
}

function randomInt(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}

function randomPastDate(maxHoursAgo) {
  const hoursAgo = randomInt(0, maxHoursAgo);

  return new Date(
    Date.now() - hoursAgo * 60 * 60 * 1000
  );
}

/* =========================================================
   GENERATE ONE EVENT
========================================================= */

function generateOneEvent(isLiveDemoEvent = false) {
  const types = Object.keys(
    EVENT_TYPE_ERROR_CODES
  );

  const type = randomChoice(types);

  const isB2B =
    type === "Overdue Invoice" ||
    type === "B2B Payment Due";

  const errorCode = randomChoice(
    EVENT_TYPE_ERROR_CODES[type]
  );

  const amount = isB2B
    ? randomInt(50000, 900000)
    : randomInt(500, 150000);

  const id = `EVT-${randomUUID()}`;

  const detectedAt = randomPastDate(720);

  const baseEvent = {
    _id: id,

    type,

    amount,

    currency: "INR",

    errorCode,

    customerOptedOut: false,

    detectedAt,

    isLiveDemoEvent,

    status: "In Progress",

    actionStatus: "PENDING",

    timeline: [
      {
        stage: "detected",

        title: "Detected",

        time: detectedAt,

        description:
          `${type} of ₹${amount.toLocaleString(
            "en-IN"
          )} detected.`,
      },
    ],
  };

  /* =======================================================
     B2B EVENT
  ======================================================= */

  if (isB2B) {
    const companyName =
      randomChoice(COMPANY_NAMES);

    return {
      ...baseEvent,

      companyName,

      invoiceNumber:
        `INV-2026-${randomInt(1000, 9999)}`,

      merchant: {
        id: `mrc_${randomInt(100, 999)}`,
        name: companyName,
      },

      customer: {
        id: `cus_${randomUUID()}`,
        name: companyName,
        email: DEMO_EMAIL,
      },
    };
  }

  /* =======================================================
     CUSTOMER EVENT
  ======================================================= */

  const firstName =
    randomChoice(FIRST_NAMES);

  const lastName =
    randomChoice(LAST_NAMES);

  return {
    ...baseEvent,

    merchant: {
      id: `mrc_${randomInt(100, 999)}`,
      name: randomChoice(COMPANY_NAMES),
    },

    customer: {
      id: `cus_${randomUUID()}`,
      name: `${firstName} ${lastName}`,
      email: DEMO_EMAIL,
    },
  };
}

/* =========================================================
   GENERATE EVENTS
========================================================= */

export function generateSyntheticBatch(
  count,
  isLiveDemoEvent = false
) {
  const safeCount = Math.min(
    Math.max(Number(count) || 10, 1),
    500
  );

  return Array.from(
    { length: safeCount },
    () => generateOneEvent(isLiveDemoEvent)
  );
}