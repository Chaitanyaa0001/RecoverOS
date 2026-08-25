import Razorpay from "razorpay";

import {
  env,
} from "../../config/env.config.js";

/* =========================================================
   RAZORPAY CLIENT
========================================================= */

const razorpay =
  !env.DEMO_MODE &&
  env.RAZORPAY_KEY_ID &&
  env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id:
          env.RAZORPAY_KEY_ID,

        key_secret:
          env.RAZORPAY_KEY_SECRET,
      })
    : null;

/* =========================================================
   CREATE PAYMENT LINK
========================================================= */

export const createPaymentLink =
  async (event) => {
    if (
      !event.amount ||
      event.amount <= 0
    ) {
      throw new Error(
        "Invalid payment amount"
      );
    }

    if (
      !event.customer?.email
    ) {
      throw new Error(
        "Customer email is missing"
      );
    }

    /* =====================================================
       DEMO MODE
    ===================================================== */

    if (env.DEMO_MODE) {
      const fakeLink = {
        linkId:
          `demo_pl_${event._id}`,

        url:
          `${
            env.CLIENT_URL ||
            "http://localhost:3000"
          }/payment/demo/${event._id}`,

        amount:
          event.amount,

        expiresInHours: 48,
      };

      return {
        link: fakeLink,

        providerResponse: {
          demo: true,
        },
      };
    }

    /* =====================================================
       RAZORPAY
    ===================================================== */

    if (!razorpay) {
      throw new Error(
        "Razorpay credentials are not configured"
      );
    }

    const paymentLink =
      await razorpay.paymentLink.create({
        amount:
          Math.round(
            event.amount * 100
          ),

        currency:
          event.currency || "INR",

        description:
          `RecoverJS recovery for ${event._id}`,

        reference_id:
          event._id,

        customer: {
          name:
            event.customer.name,

          email:
            event.customer.email,

          ...(event.customer.phone
            ? {
                contact:
                  event.customer.phone,
              }
            : {}),
        },

        notes: {
          recoverEventId:
            event._id,
        },

        /*
         * IMPORTANT:
         *
         * Razorpay does NOT send the email.
         *
         * Brevo handles email delivery.
         */
        notify: {
          email: false,
          sms: false,
        },

        reminder_enable: false,

        callback_url:
          `${env.CLIENT_URL}/payment/success`,

        callback_method: "get",
      });

    const link = {
      linkId:
        paymentLink.id,

      url:
        paymentLink.short_url,

      amount:
        event.amount,

      expiresInHours: 48,
    };

    return {
      link,

      providerResponse:
        paymentLink,
    };
  };