import { callNvidia } from "../nvidia.client.js";

const ACTIONS = [
  "EMAIL",
  "VOICE",
  "SMART_RETRY",
  "PAYMENT_LINK",
  "ACCOUNT_MANAGER",
];

export const decideRecoveryAction =
  async (
    event,
    diagnosis
  ) => {
    const isB2B =
      event.type ===
        "Overdue Invoice" ||
      event.type ===
        "B2B Payment Due";

    const allowedActions = isB2B
      ? [
          "EMAIL",
          "ACCOUNT_MANAGER",
        ]
      : ACTIONS;

    const prompt = `
You are the RecoverJS Recovery Decision Agent.

Your job is to choose the safest useful recovery action for a failed revenue event.

DIAGNOSIS:
${JSON.stringify(
  {
    rootCause:
      diagnosis.rootCause,

    confidence:
      diagnosis.confidence,

    reasoning:
      diagnosis.reasoning,
  },
  null,
  2
)}

EVENT:
${JSON.stringify(
  {
    type: event.type,
    amount: event.amount,
    currency: event.currency,
    retryCount: event.retryCount,
    customerOptedOut:
      event.customerOptedOut,
  },
  null,
  2
)}

ALLOWED ACTIONS:

${allowedActions.join(", ")}

Return ONLY valid JSON:

{
  "action": "one allowed action",
  "reasoning": "one concise sentence",
  "alternatives": ["allowed action"]
}

Rules:

- Choose exactly one action.
- Never invent an action.
- Respect customerOptedOut.
- Consider retryCount.
- Consider transaction amount.
- Consider whether this is B2B.
- If autonomous recovery is not appropriate, choose ACCOUNT_MANAGER.
`;

    let raw;

    try {
      raw = await callNvidia({
        system:
          "You are the RecoverJS Recovery Decision Agent. You select bounded recovery actions and never bypass safety policies.",

        prompt,
      });
    } catch (error) {
      return {
        action:
          "ACCOUNT_MANAGER",

        reasoning:
          `NVIDIA decision failed: ${error.message}`,

        alternatives: [],

        rawResponse: null,
      };
    }

    let result;

    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        action:
          "ACCOUNT_MANAGER",

        reasoning:
          "The AI response could not be parsed.",

        alternatives: [],
      };
    }

    if (
      !allowedActions.includes(
        result.action
      )
    ) {
      result.action =
        "ACCOUNT_MANAGER";
    }

    const alternatives =
      Array.isArray(
        result.alternatives
      )
        ? result.alternatives.filter(
            (action) =>
              allowedActions.includes(
                action
              ) &&
              action !== result.action
          )
        : [];

    return {
      action: result.action,

      reasoning:
        result.reasoning ||
        "No reasoning provided.",

      alternatives,

      rawResponse: raw,
    };
  };