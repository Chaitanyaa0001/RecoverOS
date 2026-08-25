import mongoose from "mongoose";

/* =========================================================
   TIMELINE
========================================================= */

const TimelineStepSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: [
        "detected",
        "started",
        "diagnosing",
        "diagnosed",
        "planning",
        "guardrail",
        "action",
        "outcome",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    time: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   GUARDRAIL
========================================================= */

const GuardrailSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["ALLOWED", "BLOCKED"],
      required: true,
    },

    rule: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   CUSTOMER
========================================================= */

const CustomerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   MERCHANT
========================================================= */

const MerchantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   PAYMENT LINK
========================================================= */

const PaymentLinkSchema = new mongoose.Schema(
  {
    linkId: {
      type: String,
      default: null,
    },

    url: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      default: null,
    },

    expiresInHours: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   EVENT
========================================================= */

const EventSchema = new mongoose.Schema(
  {
    /*
     * Permanent event identity.
     *
     * NO batchId.
     * NO runId.
     */
    _id: {
      type: String,
      required: true,
    },

    merchant: {
      type: MerchantSchema,
      required: true,
    },

    customer: {
      type: CustomerSchema,
      required: true,
    },

    companyName: {
      type: String,
      default: null,
    },

    invoiceNumber: {
      type: String,
      default: null,
    },

    /* =====================================================
       EVENT TYPE
    ===================================================== */

    type: {
      type: String,
      enum: [
        "Payment Failure",
        "Checkout Abandonment",
        "Subscription Failure",
        "Overdue Invoice",
        "B2B Payment Due",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    /* =====================================================
       RAW PAYMENT FAILURE
    ===================================================== */

    errorCode: {
      type: String,
      default: null,
    },

    customerOptedOut: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       AI DIAGNOSIS
    ===================================================== */

    rootCause: {
      type: String,
      default: null,
    },

    rootCauseLabel: {
      type: String,
      default: null,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    /* =====================================================
       AI DECISION
    ===================================================== */

    proposedAction: {
      type: String,
      default: null,
    },

    recommendedAction: {
      type: String,
      default: null,
    },

    actionLabel: {
      type: String,
      default: null,
    },

    actionReason: {
      type: String,
      default: null,
    },

    alternatives: {
      type: [String],
      default: [],
    },

    /* =====================================================
       GUARDRAIL
    ===================================================== */

    guardrail: {
      type: GuardrailSchema,
      default: null,
    },

    /* =====================================================
       ACTION
    ===================================================== */

    action: {
      type: String,
      default: null,
    },

    /*
     * PENDING
     *   Eligible for processing.
     *
     * PROCESSING
     *   Atomically claimed by a worker.
     *
     * BLOCKED
     *   Autonomous action blocked.
     *
     * EXECUTING
     *   External action executing.
     *
     * EXECUTED
     *   Action completed.
     *
     * FAILED
     *   Action failed and can be retried.
     */

    actionStatus: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "BLOCKED",
        "EXECUTING",
        "EXECUTED",
        "FAILED",
      ],
      default: "PENDING",
    },

    actionResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    paymentLink: {
      type: PaymentLinkSchema,
      default: null,
    },

    /* =====================================================
       BUSINESS / RECOVERY STATUS
    ===================================================== */

    status: {
      type: String,
      enum: [
        "In Progress",
        "Recovery Pending",
        "Recovered",
        "Exhausted",
      ],
      default: "In Progress",
    },

    recoveredAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    detectedAt: {
      type: Date,
      default: Date.now,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    outcome: {
      type: String,
      default: null,
    },

    /* =====================================================
       TIMELINE
    ===================================================== */

    timeline: {
      type: [TimelineStepSchema],
      default: [],
    },

    /* =====================================================
       DEMO
    ===================================================== */

    isLiveDemoEvent: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       AI DEBUGGING
    ===================================================== */

    rawLlmDiagnosis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    rawLlmIntervention: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    testPreset: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

EventSchema.index({
  status: 1,
  actionStatus: 1,
});

EventSchema.index({
  action: 1,
  actionStatus: 1,
});

EventSchema.index({
  "merchant.id": 1,
});

/* =========================================================
   MODEL
========================================================= */

const Event =
  mongoose.models.Event ||
  mongoose.model("Event", EventSchema);

export default Event;