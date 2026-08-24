import {
  sendRecoveryEmail,
  sendDunningEmail,
} from "./email.actions.js";

import {
  createAndSendPaymentLink,
} from "./paymentLink.action.js";

export const executeAction =
  async (
    action,
    event
  ) => {
    try {
      switch (action) {

        case "EMAIL": {
          const isB2B =
            event.type ===
              "Overdue Invoice" ||
            event.type ===
              "B2B Payment Due";

          if (isB2B) {
            return await sendDunningEmail(
              event
            );
          }

          return await sendRecoveryEmail(
            event
          );
        }

        case "PAYMENT_LINK":
          return await createAndSendPaymentLink(
            event
          );

        case "VOICE":
          return {
            status: "PENDING",

            action: "VOICE",

            message:
              "Voice recovery has been queued for a voice provider.",
          };

        case "SMART_RETRY":
          return {
            status: "PENDING",

            action:
              "SMART_RETRY",

            message:
              "Smart payment retry has been scheduled.",
          };

        case "ACCOUNT_MANAGER":
          return {
            status: "BLOCKED",

            action:
              "ACCOUNT_MANAGER",

            message:
              "Case escalated to an account manager.",
          };

        default:
          return {
            status: "FAILED",

            action,

            message:
              `Unknown action: ${action}`,
          };
      }
    } catch (error) {
      return {
        status: "FAILED",

        action,

        message:
          error.message,
      };
    }
  };