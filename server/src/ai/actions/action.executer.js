import {
  sendPlainRecoveryEmail,
  sendDunningEmail,
  sendPaymentLinkEmail,
} from "./email.actions.js";

import {
  createPaymentLink,
} from "./paymentLink.action.js";

import { env } from "../../config/env.config.js";

/* =========================================================
   ACTION EXECUTOR
========================================================= */

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

      /* =====================================================
         EMAIL

         IMPORTANT:
         EMAIL DOES NOT CALL RAZORPAY.
      ===================================================== */

      case "EMAIL": {

        const isB2B =
          event.type === "Overdue Invoice" ||
          event.type === "B2B Payment Due";

        /*
         * B2B currently uses payment link.
         * We will protect it with fallback below.
         */

        if (isB2B) {

          try {

            return await sendDunningEmail(
              event
            );

          } catch (error) {

            console.error(
              "[EMAIL] B2B payment link failed. Falling back to plain email:",
              error
            );

            try {

              const fallback =
                await sendPlainRecoveryEmail(
                  event
                );

              return {
                status: "FALLBACK",

                action: "EMAIL",

                fallbackAction:
                  "PLAIN_EMAIL",

                message:
                  "Payment link could not be generated. Plain B2B recovery email sent.",

                providerError:
                  error?.error?.description ||
                  error?.message ||
                  "Payment provider failed.",

                fallbackResult:
                  fallback,
              };

            } catch (fallbackError) {

              return {
                status: "FAILED",

                action: "EMAIL",

                message:
                  "B2B payment link and fallback email both failed.",

                providerError:
                  error?.error?.description ||
                  error?.message,

                fallbackError:
                  fallbackError?.message,
              };
            }
          }
        }

        /*
         * Normal EMAIL = Brevo only.
         */

        return await sendPlainRecoveryEmail(
          event
        );
      }

      /* =====================================================
         PAYMENT LINK

         Razorpay
             ↓
         success → Brevo + link

         failure
             ↓
         plain Brevo fallback
      ===================================================== */

      case "PAYMENT_LINK": {

        console.log(
          "[ACTION] PAYMENT_LINK started",
          {
            eventId: event?._id,
            amount: event?.amount,
            customer:
              event?.customer?.email,
          }
        );

        try {

          /* -----------------------------------------------
             1. CREATE RAZORPAY LINK
          ------------------------------------------------ */

          console.log(
            "[ACTION] Creating Razorpay payment link..."
          );

          const paymentResult =
            await createPaymentLink(
              event
            );

          console.log(
            "[ACTION] Razorpay payment link created",
            {
              linkId:
                paymentResult.link?.linkId,

              url:
                paymentResult.link?.url,
            }
          );

          /* -----------------------------------------------
             2. SEND PAYMENT LINK THROUGH BREVO
          ------------------------------------------------ */

          console.log(
            "[ACTION] Sending payment link through Brevo..."
          );

          const emailResult =
            await sendPaymentLinkEmail(
              event,
              paymentResult.link
            );

          console.log(
            "[ACTION] Payment link email sent successfully"
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

        } catch (error) {

          /* -----------------------------------------------
             RAZORPAY / PAYMENT-LINK FAILURE
          ------------------------------------------------ */

          console.error(
            "[ACTION] PAYMENT_LINK failed:",
            {
              eventId: event?._id,

              amount:
                event?.amount,

              statusCode:
                error?.statusCode,

              razorpayCode:
                error?.error?.code,

              description:
                error?.error?.description,

              message:
                error?.message,
            }
          );

          /* -----------------------------------------------
             3. FALLBACK TO PLAIN EMAIL

             IMPORTANT:
             This DOES NOT call Razorpay.
          ------------------------------------------------ */

          try {

            console.log(
              "[ACTION] Executing fallback EMAIL..."
            );

            const fallbackResult =
              await sendPlainRecoveryEmail(
                event
              );

            console.log(
              "[ACTION] Fallback email sent successfully"
            );

            return {
              status: "FALLBACK",

              action: "PAYMENT_LINK",

              fallbackAction: "EMAIL",

              message:
                "Razorpay payment link failed. Fallback recovery email sent successfully.",

              providerError: {
                code:
                  error?.error?.code,

                description:
                  error?.error?.description,

                statusCode:
                  error?.statusCode,

                message:
                  error?.message,
              },

              fallbackResult,
            };

          } catch (fallbackError) {

            console.error(
              "[ACTION] PAYMENT_LINK fallback failed:",
              fallbackError
            );

            return {
              status: "FAILED",

              action: "PAYMENT_LINK",

              message:
                "Payment link generation and fallback email both failed.",

              providerError: {
                code:
                  error?.error?.code,

                description:
                  error?.error?.description,

                statusCode:
                  error?.statusCode,

                message:
                  error?.message,
              },

              fallbackError:
                fallbackError?.message ||
                "Fallback email failed.",
            };
          }
        }
      }

      /* =====================================================
         VOICE
      ===================================================== */

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

      /* =====================================================
         ACCOUNT MANAGER
      ===================================================== */

      case "ACCOUNT_MANAGER": {

        return {
          status: "PENDING",

          action:
            "ACCOUNT_MANAGER",

          message:
            "Case escalated to an account manager.",
        };
      }

      /* =====================================================
         UNKNOWN ACTION
      ===================================================== */

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