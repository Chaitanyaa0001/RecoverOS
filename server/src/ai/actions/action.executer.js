import {
  sendRecoveryEmail,
  sendDunningEmail,
  sendPaymentLinkEmail,
} from "./email.actions.js";

import {
  createPaymentLink,
} from "./paymentLink.action.js";

import { env } from "../../config/env.config.js";

export const executeAction = async (
  action,
  event
) => {
  try {
    if (!action) {
      return {
        status: "FAILED",
        action: null,
        message:
          "No recovery action was provided.",
      };
    }

    switch (action) {

      // =====================================================
      // EMAIL
      // =====================================================

      case "EMAIL": {
        const isB2B =
          event.type === "Overdue Invoice" ||
          event.type === "B2B Payment Due";

        if (isB2B) {
          return await sendDunningEmail(
            event
          );
        }

        return await sendRecoveryEmail(
          event
        );
      }


      // =====================================================
      // PAYMENT LINK
      // =====================================================

      case "PAYMENT_LINK": {
        const paymentResult =
          await createPaymentLink(event);

        const emailResult =
          await sendPaymentLinkEmail(
            event,
            paymentResult.link
          );

        return {
          status: "EXECUTED",

          action: "PAYMENT_LINK",

          message:
            "Payment link generated and sent successfully.",

          paymentLink:
            paymentResult.link,

          providerResponse:
            emailResult.providerResponse,
        };
      }


      // =====================================================
      // VOICE
      // =====================================================

      case "VOICE": {
        return {
          status: "PENDING",

          action: "VOICE",

          message:
            "Voice recovery has been queued for a voice provider.",

          provider:
            env.DEMO_MODE
              ? "DEMO"
              : "VOICE_PROVIDER",
        };
      }


      // =====================================================
      // ACCOUNT MANAGER
      // =====================================================

      case "ACCOUNT_MANAGER": {
        return {
          status: "PENDING",

          action:
            "ACCOUNT_MANAGER",

          message:
            "Case escalated to an account manager.",
        };
      }


      // =====================================================
      // UNKNOWN ACTION
      // =====================================================

      default: {
        return {
          status: "FAILED",

          action,

          message:
            `Unknown recovery action: ${action}`,
        };
      }
    }

  } catch (error) {
    console.error(
      `Action execution failed [${action}]:`,
      error
    );

    return {
      status: "FAILED",

      action,

      message:
        error?.message ||
        "Action execution failed.",
    };
  }
};