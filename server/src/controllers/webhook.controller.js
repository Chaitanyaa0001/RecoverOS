import crypto from "crypto";

import Event from "../models/Events.js";

import { env } from "../config/env.config.js";

import {
  emitRecoveryEvent,
} from "../socket/socketEmitter.js";

/* =========================================================
   RAZORPAY WEBHOOK
========================================================= */

export const handleRazorpayWebhook = async (
  req,
  res
) => {
  try {
    /* =====================================================
       1. SIGNATURE
    ===================================================== */

    const signature =
      req.headers[
        "x-razorpay-signature"
      ];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message:
          "Missing Razorpay signature",
      });
    }

    if (
      !env.RAZORPAY_WEBHOOK_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message:
          "RAZORPAY_WEBHOOK_SECRET is not configured",
      });
    }

    /* =====================================================
       2. RAW BODY
    ===================================================== */

    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        success: false,
        message:
          "Webhook body must be raw Buffer",
      });
    }

    /* =====================================================
       3. VERIFY SIGNATURE
    ===================================================== */

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          env.RAZORPAY_WEBHOOK_SECRET
        )
        .update(rawBody)
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        String(signature),
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Razorpay signature",
      });
    }

    const validSignature =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!validSignature) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Razorpay signature",
      });
    }

    /* =====================================================
       4. PARSE PAYLOAD
    ===================================================== */

    let payload;

    try {
      payload = JSON.parse(
        rawBody.toString("utf8")
      );
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON payload",
      });
    }

    console.log(
      "Razorpay webhook:",
      payload.event
    );

    /* =====================================================
       5. EVENT TYPE
    ===================================================== */

    if (
      payload.event !==
      "payment_link.paid"
    ) {
      return res.status(200).json({
        success: true,
        ignored: true,
        event: payload.event,
      });
    }

    /* =====================================================
       6. PAYMENT LINK
    ===================================================== */

    const paymentLink =
      payload.payload
        ?.payment_link
        ?.entity;

    if (!paymentLink) {
      return res.status(200).json({
        success: true,
        ignored: true,
        message:
          "Payment link entity missing",
      });
    }

    /* =====================================================
       7. FIND EVENT
    ===================================================== */

    const eventId =
      paymentLink.notes
        ?.recoverEventId ||
      paymentLink.reference_id;

    if (!eventId) {
      return res.status(200).json({
        success: true,
        ignored: true,
        message:
          "RecoverJS event ID not found",
      });
    }

    /* =====================================================
       8. AMOUNT
    ===================================================== */

    const recoveredAmount =
      Number(
        paymentLink.amount_paid ||
          paymentLink.amount ||
          0
      ) / 100;

    if (recoveredAmount <= 0) {
      return res.status(200).json({
        success: true,
        ignored: true,
        message:
          "Invalid recovered amount",
      });
    }

    /* =====================================================
       9. ATOMIC RECOVERY
    ===================================================== */

    /*
     * This is the important idempotency mechanism.
     *
     * If two identical Razorpay webhooks arrive:
     *
     * webhook A → update succeeds
     * webhook B → filter no longer matches
     *
     * Therefore payment cannot be marked recovered twice.
     */

    const updatedEvent =
      await Event.findOneAndUpdate(
        {
          _id: eventId,

          status: {
            $ne: "Recovered",
          },
        },

        {
          $set: {
            recoveredAmount,

            status: "Recovered",

            resolvedAt: new Date(),

            actionStatus: "EXECUTED",

            outcome:
              `Payment recovered: ₹${recoveredAmount.toLocaleString(
                "en-IN"
              )}`,
          },

          $push: {
            timeline: {
              stage: "outcome",

              title:
                "Payment Recovered",

              time: new Date(),

              description:
                `Razorpay confirmed payment of ₹${recoveredAmount.toLocaleString(
                  "en-IN"
                )}.`,
            },
          },
        },

        {
          new: true,
        }
      );

    /* =====================================================
       10. DUPLICATE WEBHOOK
    ===================================================== */

    if (!updatedEvent) {
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        eventId,
      });
    }

    /* =====================================================
       11. SOCKET UPDATE
    ===================================================== */

    emitRecoveryEvent({
      eventId: updatedEvent._id,

      eventExternalId:
        updatedEvent._id,

      stage: "outcome",

      status:
        updatedEvent.status,

      action:
        updatedEvent.action,

      actionStatus:
        updatedEvent.actionStatus,

      recoveredAmount:
        updatedEvent.recoveredAmount,

      paymentLink:
        updatedEvent.paymentLink,

      outcome:
        updatedEvent.outcome,

      resolvedAt:
        updatedEvent.resolvedAt,

      message:
        `Payment recovered: ₹${recoveredAmount.toLocaleString(
          "en-IN"
        )}`,
    });

    console.log(
      `Payment recovered for ${updatedEvent._id}: ₹${recoveredAmount}`
    );

    /* =====================================================
       12. RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,
      recovered: true,

      eventId:
        updatedEvent._id,

      recoveredAmount,
    });
  } catch (error) {
    console.error(
      "Razorpay webhook error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Webhook processing failed",
      error:
        error?.message ||
        "Unknown webhook error",
    });
  }
};