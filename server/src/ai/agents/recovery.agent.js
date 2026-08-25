import { callNvidia } from "../nvedia.client.js";

const ACTIONS = [
  "EMAIL",
  "VOICE",
  "PAYMENT_LINK",
  "ACCOUNT_MANAGER",
];

/* =========================================================
   HELPERS
========================================================= */

const isB2BEvent = (event) => {
  return (
    event?.type === "Overdue Invoice" ||
    event?.type === "B2B Payment Due"
  );
};

/*
 * This is ONLY a safety fallback.
 *
 * Normally NVIDIA decides the action.
 * We use this only when:
 * - NVIDIA is unavailable
 * - NVIDIA returns invalid JSON
 * - NVIDIA returns an invalid action
 */
const deterministicFallback = (event, diagnosis) => {
  const isB2B = isB2BEvent(event);

  /* -------------------------------------------------------
     CUSTOMER OPT-OUT
  ------------------------------------------------------- */

  if (event?.customerOptedOut) {
    return "ACCOUNT_MANAGER";
  }

  /* -------------------------------------------------------
     LOW CONFIDENCE
  ------------------------------------------------------- */

  if (
    !diagnosis ||
    Number(diagnosis.confidence || 0) < 60 ||
    diagnosis.rootCause === "other"
  ) {
    return "ACCOUNT_MANAGER";
  }

  /* -------------------------------------------------------
     B2B
  ------------------------------------------------------- */

  if (isB2B) {
    if (Number(event.amount || 0) > 500000) {
      return "ACCOUNT_MANAGER";
    }

    return "EMAIL";
  }

  /* -------------------------------------------------------
     CUSTOMER EVENTS
  ------------------------------------------------------- */

  switch (diagnosis.rootCause) {
    case "insufficient_funds":
      return "PAYMENT_LINK";

    case "gateway_timeout":
      return "PAYMENT_LINK";

    case "otp_timeout":
      return "PAYMENT_LINK";

    case "session_dropped":
      return "PAYMENT_LINK";

    case "3ds_failure":
      return "PAYMENT_LINK";

    case "issuer_declined":
      return "VOICE";

    case "card_expired":
      return "EMAIL";

    case "mandate_revoked":
      return "ACCOUNT_MANAGER";

    default:
      return "ACCOUNT_MANAGER";
  }
};

/* =========================================================
   PARSE AI RESPONSE
========================================================= */

const parseJsonResponse = (raw) => {
  if (!raw) {
    throw new Error("Empty NVIDIA response");
  }

  const cleaned = String(raw)
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const jsonMatch = cleaned.match(/{[\s\S]*}/);

  if (!jsonMatch) {
    throw new Error(
      "No JSON object found in NVIDIA response"
    );
  }

  return JSON.parse(jsonMatch[0]);
};

/* =========================================================
   RECOVERY DECISION AGENT
========================================================= */

export const decideRecoveryAction = async (
  event,
  diagnosis
) => {
  const isB2B = isB2BEvent(event);

  /*
   * B2B events are intentionally restricted.
   *
   * AI cannot choose VOICE or PAYMENT_LINK
   * for these events.
   */
  const allowedActions = isB2B
    ? ["EMAIL", "ACCOUNT_MANAGER"]
    : ACTIONS;

  /* =======================================================
     DETERMINISTIC TEST PRESET
  ======================================================= */

  if (event?.testPreset?.action) {
    const presetAction = allowedActions.includes(
      event.testPreset.action
    )
      ? event.testPreset.action
      : "ACCOUNT_MANAGER";

    const alternatives = Array.isArray(
      event.testPreset.alternatives
    )
      ? event.testPreset.alternatives.filter(
          (action) =>
            allowedActions.includes(action) &&
            action !== presetAction
        )
      : [];

    return {
      action: presetAction,

      reasoning:
        event.testPreset.actionReasoning ||
        "Recovery action selected by the configured test scenario.",

      alternatives,

      rawResponse: null,
    };
  }

  /* =======================================================
     AI PROMPT
  ======================================================= */

  const prompt = `
You are the RecoverJS Recovery Decision Agent.

Your task is to select the safest and most useful recovery action for this revenue-loss event.

DIAGNOSIS:
${JSON.stringify(
  {
    rootCause: diagnosis?.rootCause,
    confidence: diagnosis?.confidence,
    reasoning: diagnosis?.reasoning,
  },
  null,
  2
)}

EVENT:
${JSON.stringify(
  {
    type: event?.type,
    amount: event?.amount,
    currency: event?.currency,
    customerOptedOut: Boolean(
      event?.customerOptedOut
    ),
    errorCode: event?.errorCode,
  },
  null,
  2
)}

ALLOWED ACTIONS:
${allowedActions.join(", ")}

Consider:
- diagnosed root cause
- diagnosis confidence
- transaction amount
- event type
- whether the failure is transient
- whether the customer opted out
- whether the event is B2B
- whether autonomous recovery is appropriate

Return ONLY ONE valid JSON object.

Required structure:

{
  "action": "one allowed action",
  "reasoning": "one concise sentence",
  "alternatives": ["allowed action"]
}

Rules:
- Select exactly one action.
- The action MUST be from the allowed actions list.
- Never invent an action.
- Never return markdown.
- Never return analysis.
- Never return instructions.
- Never return text outside the JSON object.
- Respect customer opt-out.
- Do not include the selected action in alternatives.
- Alternatives must contain only allowed actions.
`;

  let raw;

  /* =======================================================
     NVIDIA CALL
  ======================================================= */

  try {
    raw = await callNvidia({
      system:
        "You are the RecoverJS Recovery Decision Agent. Return only one valid JSON object. Never return analysis or instructions.",
      prompt,
    });
  } catch (error) {
    const fallbackAction =
      deterministicFallback(event, diagnosis);

    return {
      action: fallbackAction,

      reasoning:
        "The AI decision service was unavailable, so a safe fallback action was selected.",

      alternatives: [],

      rawResponse: null,
    };
  }

  /* =======================================================
     PARSE
  ======================================================= */

  let result;

  try {
    result = parseJsonResponse(raw);
  } catch (error) {
    console.error(
      "Recovery decision JSON parse failed:",
      error?.message
    );

    console.error(
      "Raw NVIDIA recovery response:",
      raw
    );

    const fallbackAction =
      deterministicFallback(event, diagnosis);

    return {
      action: fallbackAction,

      reasoning:
        "The AI decision could not be interpreted, so a safe fallback action was selected.",

      alternatives: [],

      rawResponse: raw,
    };
  }

  /* =======================================================
     VALIDATE ACTION
  ======================================================= */

  let action = result?.action;

  if (!allowedActions.includes(action)) {
    action = deterministicFallback(
      event,
      diagnosis
    );
  }

  /* =======================================================
     CUSTOMER OPT-OUT SAFETY
  ======================================================= */

  if (event?.customerOptedOut) {
    action = "ACCOUNT_MANAGER";
  }

  /* =======================================================
     B2B SAFETY
  ======================================================= */

  if (
    isB2B &&
    action !== "EMAIL" &&
    action !== "ACCOUNT_MANAGER"
  ) {
    action = "ACCOUNT_MANAGER";
  }

  /* =======================================================
     HIGH VALUE B2B SAFETY
  ======================================================= */

  if (
    isB2B &&
    Number(event?.amount || 0) > 500000
  ) {
    action = "ACCOUNT_MANAGER";
  }

  /* =======================================================
     REASONING
  ======================================================= */

  let reasoning =
    typeof result?.reasoning === "string"
      ? result.reasoning.trim()
      : "";

  if (!reasoning) {
    reasoning =
      "Recovery action selected based on the diagnosis and event context.";
  }

  /*
   * If the action was changed by a safety rule,
   * don't expose the original AI reasoning as if
   * it justified the final action.
   */

  if (event?.customerOptedOut) {
    reasoning =
      "Customer opted out of recovery communication, so human account management is required.";
  } else if (
    isB2B &&
    Number(event?.amount || 0) > 500000
  ) {
    reasoning =
      "High-value B2B recovery requires human account management.";
  }

  /* =======================================================
     ALTERNATIVES
  ======================================================= */

  const alternatives = Array.isArray(
    result?.alternatives
  )
    ? result.alternatives.filter(
        (candidate) =>
          allowedActions.includes(candidate) &&
          candidate !== action
      )
    : [];

  /* =======================================================
     FINAL RESULT
  ======================================================= */

  return {
    action,
    reasoning,
    alternatives,
    rawResponse: raw,
  };
};