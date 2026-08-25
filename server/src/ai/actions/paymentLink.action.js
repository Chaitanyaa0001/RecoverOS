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

    const amount =
      Number(event.amount);

    /* =====================================================
       VALIDATE AMOUNT
    ===================================================== */

    if (
      !Number.isFinite(amount) ||
      amount <= 0
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

        amount,

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
       RAZORPAY CONFIG
    ===================================================== */

    if (!razorpay) {
      throw new Error(
        "Razorpay credentials are not configured"
      );
    }

    /* =====================================================
       CONVERT INR → PAISE

       IMPORTANT:
       Razorpay expects the smallest currency unit.

       ₹33,099
       →
       3,309,900 paise
    ===================================================== */

    const amountInPaise =
      Math.round(
        amount * 100
      );

    if (
      !Number.isSafeInteger(
        amountInPaise
      )
    ) {
      throw new Error(
        "Payment amount is too large."
      );
    }

    console.log(
      "[Razorpay] Creating payment link:",
      {
        eventId: event._id,
        amountINR: amount,
        amountPaise:
          amountInPaise,
      }
    );

    /* =====================================================
       CREATE PAYMENT LINK
    ===================================================== */

    const paymentLink =
      await razorpay.paymentLink.create(
        {
          amount:
            amountInPaise,

          currency:
            event.currency ||
            "INR",

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

          notify: {
            email: false,
            sms: false,
          },

          reminder_enable:
            false,

          callback_url:
            `${env.CLIENT_URL}/payment/success`,

          callback_method:
            "get",
        }
      );

    /* =====================================================
       NORMALIZE RESPONSE
    ===================================================== */

    const link = {
      linkId:
        paymentLink.id,

      url:
        paymentLink.short_url,

      amount,

      expiresInHours: 48,
    };

    return {
      link,

      providerResponse:
        paymentLink,
    };
  };