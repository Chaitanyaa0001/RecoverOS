import { callNvidia } from "../nvidia.client.js";

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
  insufficient_funds:
    "Insufficient funds",
  card_expired:
    "Card expired",
  otp_timeout:
    "OTP timeout",
  issuer_declined:
    "Issuer declined",
  gateway_timeout:
    "Gateway timeout",
  session_dropped:
    "Session dropped",
  "3ds_failure":
    "3DS failure",
  mandate_revoked:
    "Mandate revoked",
  client_cash_flow_hold:
    "Client cash-flow hold",
  disputed_invoice:
    "Disputed invoice",

  other:
    "Unrecognized pattern",
};

export const diagnoseEvent = async (event) => {
  const allowedCauses =
    ROOT_CAUSES[event.type] || [
      "other",
    ];

  const prompt = `Analyze this revenue recovery event.

EVENT:
${JSON.stringify(
  {
    type: event.type,
    amount: event.amount,
    currency: event.currency,
    errorCode: event.errorCode,
    retryCount: event.retryCount,
    customerOptedOut:
      event.customerOptedOut,
    detectedAt: event.detectedAt,
  },
  null,
  2
)}

Allowed root causes:

${allowedCauses.join(", ")}

Return ONLY valid JSON:

{
  "rootCause": "one allowed value",
  "confidence": 0,
  "reasoning": "one concise sentence"
}

Rules:
- rootCause MUST be one of the allowed values.
- confidence MUST be between 0 and 100.
- Do not invent a new category.
- If the evidence is insufficient, use "other".
- Do not pretend to know something that is not present in the event.
`;

  let raw;
  try {
    raw = await callNvidia({
      system:
        "You are the RecoverJS Diagnosis Agent. Your job is to identify the most likely root cause of a revenue-loss event conservatively.",
      prompt,
    });
  } catch (error) {
    return {
      rootCause: "other",
      rootCauseLabel:
        ROOT_CAUSE_LABELS.other,
      confidence: 0,
      reasoning:
        `NVIDIA diagnosis failed: ${error.message}`,
      rawResponse: null,
    };
  }
  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    result = {
      rootCause: "other",
      confidence: 0,
      reasoning:
        "The AI response could not be parsed.",
    };
  }
  if (
    !allowedCauses.includes(
      result.rootCause
    )
  ) {
    result.rootCause = "other";
    result.confidence = 0;
  }
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
      ROOT_CAUSE_LABELS[
        result.rootCause
      ] || "Unrecognized pattern",
    confidence,
    reasoning:
      result.reasoning ||
      "No reasoning provided.",
    rawResponse: raw,
  };
};