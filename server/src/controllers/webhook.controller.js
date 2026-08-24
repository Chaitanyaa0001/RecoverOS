import crypto from "crypto";

import Event from "../models/Events.js";

import { env } from "../config/env.config.js";

import {
  emitBatchEvent,
} from "../socket/socketEmitter.js";

export const handleRazorpayWebhook =
  async (req, res) => {

    try {

      // =====================================
      // 1. SIGNATURE
      // =====================================

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

      // =====================================
      // 2. RAW BODY
      // =====================================

      const rawBody =
        req.body;

      if (!Buffer.isBuffer(rawBody)) {
        return res.status(400).json({
          success: false,
          message:
            "Webhook body must be raw Buffer",
        });
      }

      // =====================================
      // 3. VERIFY SIGNATURE
      // =====================================

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
          signature,
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

      const isValid =
        crypto.timingSafeEqual(
          expectedBuffer,
          receivedBuffer
        );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Razorpay signature",
        });
      }

      // =====================================
      // 4. PARSE PAYLOAD
      // =====================================

      const payload =
        JSON.parse(
          rawBody.toString("utf8")
        );

      console.log(
        "Razorpay webhook:",
        payload.event
      );

      // =====================================
      // 5. IGNORE OTHER EVENTS
      // =====================================

      if (
        payload.event !==
        "payment_link.paid"
      ) {
        return res.status(200).json({
          success: true,
          ignored: true,
          event:
            payload.event,
        });
      }

      // =====================================
      // 6. PAYMENT LINK
      // =====================================

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

      // =====================================
      // 7. FIND RECOVERJS EVENT
      // =====================================

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

      const event =
        await Event.findById(
          eventId
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message:
            "RecoverJS event not found",
          eventId,
        });
      }

      // =====================================
      // 8. IDEMPOTENCY
      // =====================================

      if (
        event.status === "Recovered" &&
        event.recoveredAmount > 0
      ) {
        return res.status(200).json({
          success: true,
          alreadyProcessed: true,
          eventId,
        });
      }

      // =====================================
      // 9. RECOVERED AMOUNT
      // =====================================

      const recoveredAmount =
        Number(
          paymentLink.amount_paid ||
          paymentLink.amount ||
          0
        ) / 100;

      // =====================================
      // 10. UPDATE EVENT
      // =====================================

      event.recoveredAmount =
        recoveredAmount;

      event.status =
        "Recovered";

      event.resolvedAt =
        new Date();

      event.actionStatus =
        "EXECUTED";

      event.outcome =
        `Payment recovered: ₹${recoveredAmount.toLocaleString(
          "en-IN"
        )}`;

      event.timeline.push({
        stage: "outcome",

        title:
          "Payment Recovered",

        time:
          new Date(),

        description:
          `Razorpay confirmed payment of ₹${recoveredAmount.toLocaleString(
            "en-IN"
          )}.`,
      });

      await event.save();

      console.log(
        `Payment recovered for ${eventId}: ₹${recoveredAmount}`
      );

      // =====================================
      // 11. LIVE SOCKET UPDATE
      // =====================================

      emitBatchEvent(
        event.batchId,
        {
          eventId:
            event._id,

          stage:
            "outcome",

          status:
            "Recovered",

          action:
            event.action,

          actionStatus:
            event.actionStatus,

          recoveredAmount:
            event.recoveredAmount,

          paymentLink:
            event.paymentLink,

          outcome:
            event.outcome,

          message:
            `Payment recovered: ₹${recoveredAmount.toLocaleString(
              "en-IN"
            )}`,
        }
      );

      // =====================================
      // 12. RESPONSE
      // =====================================

      return res.status(200).json({
        success: true,

        recovered: true,

        eventId,

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
          error.message,
      });
    }
  };