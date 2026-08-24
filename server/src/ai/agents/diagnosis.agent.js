import { callNvidia } from "../nvedia.client.js";

const ROOT_CAUSES = {
  "Payment Failure": [
    "insufficient_funds",
    "card_expired",
    "otp_timeout",
    "issuer_declined",
    "gateway_timeout",
    "other",
  ],

  "Checkout Abandonment": [
    "otp_timeout",
    "session_dropped",
    "3ds_failure",
    "other",
  ],

  "Subscription Failure": [
    "card_expired",
    "mandate_revoked",
    "insufficient_funds",
    "other",
  ],

  "Overdue Invoice": [
    "client_cash_flow_hold",
    "disputed_invoice",
    "other",
  ],

  "B2B Payment Due": [
    "client_cash_flow_hold",
    "disputed_invoice",
    "other",
  ],
};

const ROOT_CAUSE_LABELS = {
  insufficient_funds: "Insufficient funds",
  card_expired: "Card expired",
  otp_timeout: "OTP timeout",
  issuer_declined: "Issuer declined",
  gateway_timeout: "Gateway timeout",
  session_dropped: "Session dropped",
  "3ds_failure": "3DS failure",
  mandate_revoked: "Mandate revoked",
  client_cash_flow_hold: "Client cash-flow hold",
  disputed_invoice: "Disputed invoice",
  other: "Unrecognized pattern",
};

export const diagnoseEvent = async (event) => {
  const allowedCauses =
    ROOT_CAUSES[event.type] || ["other"];

  const prompt = `
Analyze this revenue recovery event.

EVENT:
${JSON.stringify(
  {
    type: event.type,
    amount: event.amount,
    currency: event.currency,
    errorCode: event.errorCode,
    retryCount: event.retryCount,
    customerOptedOut: event.customerOptedOut,
    detectedAt: event.detectedAt,
  },
  null,
  2
)}

ALLOWED ROOT CAUSES:
${allowedCauses.join(", ")}

IMPORTANT OUTPUT RULE:

Return ONLY ONE JSON OBJECT.

Do NOT provide:
- a thinking process
- analysis
- explanations before the JSON
- markdown
- code fences
- text before or after the JSON

Your response MUST have exactly this structure:

{
  "rootCause": "one allowed value",
  "confidence": 0,
  "reasoning": "one concise sentence"
}

RULES:

1. rootCause MUST be one of the allowed root causes.
2. confidence MUST be a number from 0 to 100.
3. If errorCode directly matches an allowed root cause, use that root cause.
4. If evidence is insufficient, use "other".
5. Do not invent information.
6. Keep reasoning to one concise sentence.
`;

  let raw;

  try {
    raw = await callNvidia({
      system:
        "You are the RecoverJS Diagnosis Agent. Identify the most likely root cause of a revenue-loss event. Return only the requested JSON object.",
      prompt,
    });
  } catch (error) {
    return {
      rootCause: "other",
      rootCauseLabel: ROOT_CAUSE_LABELS.other,
      confidence: 0,
      reasoning:
        `NVIDIA diagnosis failed: ${error.message}`,
      rawResponse: null,
    };
  }

  let result;

  try {
    /*
     * Nemotron may return reasoning text
     * before the final JSON.
     *
     * Extract the JSON object.
     */
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(
        "No JSON object found in NVIDIA response"
      );
    }

    result = JSON.parse(jsonMatch[0]);
  } catch (error) {
    return {
      rootCause: "other",
      rootCauseLabel: ROOT_CAUSE_LABELS.other,
      confidence: 0,
      reasoning:
        `The AI response could not be parsed: ${error.message}`,
      rawResponse: raw,
    };
  }

  /*
   * Validate root cause.
   */
  if (!allowedCauses.includes(result.rootCause)) {
    result.rootCause = "other";
    result.confidence = 0;
  }

  /*
   * Normalize confidence.
   */
  const confidence = Math.min(
    Math.max(
      Number(result.confidence) || 0,
      0
    ),
    100
  );

  return {
    rootCause: result.rootCause,

    rootCauseLabel:
      ROOT_CAUSE_LABELS[result.rootCause] ||
      "Unrecognized pattern",

    confidence,

    reasoning:
      result.reasoning ||
      "No reasoning provided.",

    rawResponse: raw,
  };
};