import { callNvidia } from "../nvedia.client.js";

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

    const allowedActions =
      isB2B
        ? [
            "EMAIL",
            "ACCOUNT_MANAGER",
          ]
        : ACTIONS;

    const prompt = `
You are the RecoverJS Recovery Decision Agent.

Your job is to choose the safest useful recovery action for a failed revenue event.

Choose the action based on:

- root cause
- confidence
- transaction amount
- currency
- retry count
- customer opt-out status
- event type
- whether the failure appears transient
- whether autonomous recovery is appropriate

Do not blindly choose one action.
Choose the action that best matches the event.

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
    type:
      event.type,

    amount:
      event.amount,

    currency:
      event.currency,

    retryCount:
      event.retryCount,

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

RULES:

1. Choose exactly one action.
2. Never invent an action.
3. Respect customerOptedOut.
4. Consider retryCount.
5. Consider transaction amount.
6. Consider whether the failure is transient.
7. Consider whether this is B2B.
8. If autonomous recovery is not appropriate, choose ACCOUNT_MANAGER.
9. Alternatives must contain only allowed actions.
10. Do not include the selected action inside alternatives.
`;

    let raw;

    try {

      raw =
        await callNvidia({
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

      /*
       * Extract JSON in case the model
       * returns additional reasoning.
       */

      const jsonMatch =
        raw.match(
          /\{[\s\S]*\}/
        );

      if (!jsonMatch) {
        throw new Error(
          "No JSON object found in NVIDIA response"
        );
      }

      result =
        JSON.parse(
          jsonMatch[0]
        );

    } catch (error) {

      result = {
        action:
          "ACCOUNT_MANAGER",

        reasoning:
          `The AI response could not be parsed: ${error.message}`,

        alternatives: [],
      };
    }

    /*
     * Validate action.
     */

    if (
      !allowedActions.includes(
        result.action
      )
    ) {
      result.action =
        "ACCOUNT_MANAGER";
    }

    /*
     * Validate alternatives.
     */

    const alternatives =
      Array.isArray(
        result.alternatives
      )
        ? result.alternatives.filter(
            (action) =>
              allowedActions.includes(
                action
              ) &&
              action !==
                result.action
          )
        : [];

    return {
      action:
        result.action,

      reasoning:
        result.reasoning ||
        "No reasoning provided.",

      alternatives,

      rawResponse:
        raw,
    };
  };