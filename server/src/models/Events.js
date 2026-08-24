import mongoose from "mongoose";

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
        "outcome"
      ],
      required: true
    },

    title: {
      type: String,
      required: true
    },

    time: {
      type: Date,
      default: Date.now
    },

    description: {
      type: String,
      required: true
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    }
  },
  { _id: false }
);

const GuardrailSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["ALLOWED", "BLOCKED"],
      required: true
    },

    rule: {
      type: String,
      required: true
    },

    reason: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const CustomerSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    email: String,
    phone: String
  },
  { _id: false }
);

const MerchantSchema = new mongoose.Schema(
  {
    id: String,
    name: String
  },
  { _id: false }
);

const PaymentLinkSchema = new mongoose.Schema(
  {
    linkId: String,
    url: String,
    amount: Number,
    expiresInHours: Number
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    merchant: {
      type: MerchantSchema,
      required: true
    },

    customer: {
      type: CustomerSchema,
      required: true
    },

    companyName: {
      type: String,
      default: null
    },

    invoiceNumber: {
      type: String,
      default: null
    },

    type: {
      type: String,
      enum: [
        "Payment Failure",
        "Checkout Abandonment",
        "Subscription Failure",
        "Overdue Invoice",
        "B2B Payment Due"
      ],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    // ==========================
    // RAW EVENT
    // ==========================

    errorCode: {
      type: String,
      default: null
    },

    retryCount: {
      type: Number,
      default: 0
    },

    customerOptedOut: {
      type: Boolean,
      default: false
    },

    // ==========================
    // AI DIAGNOSIS
    // ==========================

    rootCause: {
      type: String,
      default: null
    },

    rootCauseLabel: {
      type: String,
      default: null
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },

    // ==========================
    // AI DECISION
    // ==========================

    proposedAction: {
      type: String,
      default: null
    },

    recommendedAction: {
      type: String,
      default: null
    },

    actionLabel: {
      type: String,
      default: null
    },

    actionReason: {
      type: String,
      default: null
    },

    alternatives: {
      type: [String],
      default: []
    },

    // ==========================
    // GUARDRAIL
    // ==========================

    guardrail: {
      type: GuardrailSchema,
      default: null
    },

    // ==========================
    // ACTION
    // ==========================

    action: {
      type: String,
      default: null
    },

    actionStatus: {
      type: String,
      enum: [
        "PENDING",
        "BLOCKED",
        "EXECUTING",
        "EXECUTED",
        "FAILED"
      ],
      default: "PENDING"
    },

    actionResult: {
      type: String,
      default: null
    },

    paymentLink: {
      type: PaymentLinkSchema,
      default: null
    },

    // ==========================
    // RECOVERY
    // ==========================

    status: {
      type: String,
      enum: [
        "In Progress",
        "Recovery Pending",
        "Recovered",
        "Exhausted"
      ],
      default: "In Progress"
    },

    recoveredAmount: {
      type: Number,
      default: 0
    },

    detectedAt: {
      type: Date,
      default: Date.now
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    outcome: {
      type: String,
      default: null
    },

    // ==========================
    // AUDIT / TIMELINE
    // ==========================

    timeline: {
      type: [TimelineStepSchema],
      default: []
    },

    batchId: {
      type: String,
      required: true
    },

    isLiveDemoEvent: {
      type: Boolean,
      default: false
    },

    // AI debugging/evidence
    rawLlmDiagnosis: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    rawLlmIntervention: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Event =
  mongoose.models.Event ||
  mongoose.model("Event", EventSchema);

export default Event;