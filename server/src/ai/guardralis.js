const HIGH_VALUE_B2B_THRESHOLD = 500000;

const MAX_RETRIES = 3;

const QUIET_START = 21;
const QUIET_END = 8;

const isB2BEvent = (event) =>
  event.type === "Overdue Invoice" ||
  event.type === "B2B Payment Due";

const isQuietHours = () => {
  const hour = Number(
    new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }
    ).format(new Date())
  );

  return (
    hour >= QUIET_START ||
    hour < QUIET_END
  );
};

export const applyGuardrails = (
  proposedAction,
  event,
  diagnosis
) => {
  const isB2B =
    isB2BEvent(event);

  // ==================================
  // 1. LOW CONFIDENCE
  // ==================================

  if (
    !diagnosis ||
    diagnosis.rootCause === "other" ||
    diagnosis.confidence < 60
  ) {
    return {
      finalAction: null,

      guardrail: {
        status: "BLOCKED",

        rule:
          "Low-Confidence Diagnosis",

        reason:
          "Diagnosis confidence is insufficient for autonomous recovery.",
      },
    };
  }

  // ==================================
  // 2. HIGH VALUE B2B
  // ==================================

  if (
    isB2B &&
    event.amount >
      HIGH_VALUE_B2B_THRESHOLD
  ) {
    return {
      finalAction:
        "ACCOUNT_MANAGER",

      guardrail: {
        status: "BLOCKED",

        rule:
          "B2B High-Value Approval",

        reason:
          "Transaction exceeds ₹5L. Human approval is required.",
      },
    };
  }

  // ==================================
  // 3. VOICE OPT-OUT
  // ==================================

  if (
    proposedAction === "VOICE" &&
    event.customerOptedOut
  ) {
    return {
      finalAction: "EMAIL",

      guardrail: {
        status: "ALLOWED",

        rule:
          "Do-Not-Call Fallback",

        reason:
          "Voice recovery was blocked because the customer opted out. Email fallback selected.",
      },
    };
  }

  // ==================================
  // 4. RETRY LIMIT
  // ==================================

  if (
    proposedAction === "SMART_RETRY" &&
    event.retryCount >= MAX_RETRIES
  ) {
    return {
      finalAction: "EMAIL",

      guardrail: {
        status: "ALLOWED",

        rule:
          "Maximum Retry Fallback",

        reason:
          `Maximum retry limit of ${MAX_RETRIES} reached. Email fallback selected.`,
      },
    };
  }

  // ==================================
  // 5. QUIET HOURS
  // ==================================

  if (
    (
      proposedAction === "VOICE" ||
      proposedAction === "EMAIL"
    ) &&
    isQuietHours()
  ) {
    return {
      finalAction: null,

      guardrail: {
        status: "BLOCKED",

        rule:
          "Quiet Hours",

        reason:
          "Customer communication is deferred during 9 PM–8 AM IST.",
      },
    };
  }

  // ==================================
  // 6. CUSTOMER OPT-OUT
  // ==================================

  if (
    event.customerOptedOut &&
    (
      proposedAction === "EMAIL" ||
      proposedAction === "PAYMENT_LINK"
    )
  ) {
    return {
      finalAction: null,

      guardrail: {
        status: "BLOCKED",

        rule:
          "Customer Opt-Out",

        reason:
          "Customer opted out of recovery communications.",
      },
    };
  }

  // ==================================
  // 7. APPROVED
  // ==================================

  return {
    finalAction:
      proposedAction,

    guardrail: {
      status: "ALLOWED",

      rule:
        "Recovery Policy Passed",

      reason:
        "The proposed recovery action passed all configured guardrails.",
    },
  };
};