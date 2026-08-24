import Razorpay from "razorpay";

import { env } from "../../config/env.config.js";

import {
  sendPaymentLinkEmail,
} from "./email.actions.js";

const razorpay =
  new Razorpay({
    key_id:
      env.RAZORPAY_KEY_ID,

    key_secret:
      env.RAZORPAY_KEY_SECRET,
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
        },

        notes: {
          recoverEventId:
            event._id,

          batchId:
            event.batchId,
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

      expiresInHours:
        48,
    };

    const emailResult =
      await sendPaymentLinkEmail(
        event,
        link
      );

    return {
      status: "EXECUTED",

      action:
        "PAYMENT_LINK",

      message:
        "Razorpay payment link generated and sent to the customer.",

      paymentLink: link,

      providerResponse:
        emailResult.providerResponse,
    };
  };