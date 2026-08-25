const HIGH_VALUE_B2B_THRESHOLD = 500000;

// =========================================================
// QUIET HOURS
// =========================================================

// TESTING MODE
// false = EMAIL / VOICE will NOT be blocked based on time.
// Change to true before the Buildathon/demo.
const ENABLE_QUIET_HOURS = false;

const QUIET_START = 21; // 9 PM
const QUIET_END = 8;    // 8 AM

// =========================================================
// HELPERS
// =========================================================

const isB2BEvent = (event) => {
  return (
    event.type === "Overdue Invoice" ||
    event.type === "B2B Payment Due"
  );
};

const isQuietHours = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );

  return (
    hour >= QUIET_START ||
    hour < QUIET_END
  );
};

// =========================================================
// GUARDRAILS
// =========================================================

export const applyGuardrails = (
  proposedAction,
  event,
  diagnosis
) => {
  const isB2B = isB2BEvent(event);

  // =======================================================
  // 1. LOW CONFIDENCE
  // =======================================================

  if (!diagnosis || diagnosis.rootCause === "other" || Number(diagnosis.confidence || 0) < 0.60
  ) {
    return {
      finalAction: null,

      guardrail: {
        status: "BLOCKED",
        rule: "Low-Confidence Diagnosis",
        reason:
          "Diagnosis confidence is insufficient for autonomous recovery.",
      },
    };
  }

  // =======================================================
  // 2. HIGH VALUE B2B
  // =======================================================

  if (
    isB2B &&
    Number(event.amount || 0) >
      HIGH_VALUE_B2B_THRESHOLD
  ) {
    return {
      finalAction: "ACCOUNT_MANAGER",

      guardrail: {
        status: "BLOCKED",
        rule: "B2B High-Value Approval",
        reason:
          "Transaction exceeds ₹5L. Human approval is required.",
      },
    };
  }

  // =======================================================
  // 3. CUSTOMER OPT-OUT
  // =======================================================

  if (
    event.customerOptedOut &&
    (
      proposedAction === "EMAIL" ||
      proposedAction === "PAYMENT_LINK" ||
      proposedAction === "VOICE"
    )
  ) {
    return {
      finalAction: "ACCOUNT_MANAGER",

      guardrail: {
        status: "BLOCKED",
        rule: "Customer Opt-Out",
        reason:
          "Customer opted out of recovery communication. Human review is required.",
      },
    };
  }

  // =======================================================
  // 4. QUIET HOURS
  // =======================================================

  // IMPORTANT:
  // Quiet hours are disabled while testing.
  //
  // When ENABLE_QUIET_HOURS = false:
  // EMAIL and VOICE are allowed regardless of current time.
  //
  // Before production/buildathon:
  // ENABLE_QUIET_HOURS = true

  if ( ENABLE_QUIET_HOURS && ( proposedAction === "VOICE" || proposedAction === "EMAIL") && isQuietHours()) {
    return {
      finalAction: null,

      guardrail: {
        status: "BLOCKED",
        rule: "Quiet Hours",
        reason:
          "Customer communication is deferred during 9 PM–8 AM IST.",
      },
    };
  }

  // =======================================================
  // 5. APPROVED
  // =======================================================

  return {
    finalAction: proposedAction,

    guardrail: {
      status: "ALLOWED",
      rule: "Recovery Policy Passed",
      reason:
        "The proposed recovery action passed all configured guardrails.",
    },
  };
};