import Razorpay from "razorpay";

import { env } from "../../config/env.config.js";

import {
  sendPaymentLinkEmail,
} from "./email.action.js";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createAndSendPaymentLink =
  async (event) => {
    if (
      !env.RAZORPAY_KEY_ID ||
      !env.RAZORPAY_KEY_SECRET
    ) {
      throw new Error(
        "Razorpay credentials are not configured"
      );
    }

    const paymentLink =
      await razorpay.paymentLink.create({
        amount: Math.round(
          event.amount * 100
        ),

        currency:
          event.currency || "INR",

        description:
          `RecoverJS recovery for ${event._id}`,

        // IMPORTANT
        // This connects Razorpay payment
        // back to our RecoverJS event.
        reference_id: event._id,

        customer: {
          name:
            event.customer?.name,

          email:
            event.customer?.email,
        },

        // IMPORTANT
        // We can identify the event
        // from Razorpay webhook.
        notes: {
          recoverEventId: event._id,
          batchId: event.batchId,
        },

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

    const emailResult =
      await sendPaymentLinkEmail(
        event,
        link
      );

    return {
      status: "EXECUTED",

      action: "PAYMENT_LINK",

      message:
        "Razorpay payment link generated and sent to the customer.",

      paymentLink: link,

      providerResponse:
        emailResult.providerResponse,
    };
  };