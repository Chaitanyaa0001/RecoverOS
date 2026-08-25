import { env } from "../../config/env.config.js";
import {
  createPaymentLink,
} from "./paymentLink.action.js";

const BREVO_API_URL =
  "https://api.brevo.com/v3/smtp/email";

/**
 * =========================================================
 * BREVO EMAIL CLIENT
 * =========================================================
 */

const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
}) => {
  if (!env.BREVO_API_KEY) {
    throw new Error(
      "BREVO_API_KEY is not configured"
    );
  }

  if (!to) {
    throw new Error(
      "Customer email is missing"
    );
  }

  if (!env.BREVO_SENDER_EMAIL) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not configured"
    );
  }

  const response = await fetch(
    BREVO_API_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Accept:
          "application/json",

        "api-key":
          env.BREVO_API_KEY,
      },

      body: JSON.stringify({
        sender: {
          name:
            env.BREVO_SENDER_NAME ||
            "RecoverJS",

          email:
            env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent,
      }),
    }
  );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      `Brevo failed: ${response.status} ${error}`
    );
  }

  return response.json();
};


/**
 * =========================================================
 * NORMAL RECOVERY EMAIL
 * =========================================================
 */

export const sendRecoveryEmail =
  async (event) => {
    if (env.DEMO_MODE) {
      return {
        status: "EXECUTED",

        action: "EMAIL",

        demo: true,

        message:
          "Demo recovery email simulated successfully.",
      };
    }

    const customerName =
      event.customer?.name ||
      "there";

    const amount =
      `₹${Number(
        event.amount || 0
      ).toLocaleString("en-IN")}`;

    const result =
      await sendBrevoEmail({
        to:
          event.customer?.email,

        subject:
          `Payment recovery needed for ${amount}`,

        htmlContent: `
          <div
            style="
              font-family:Arial,sans-serif;
              max-width:600px;
              margin:auto;
              padding:24px;
            "
          >

            <h2>
              Payment Recovery
            </h2>

            <p>
              Hi ${customerName},
            </p>

            <p>
              We noticed that your payment
              of <strong>${amount}</strong>
              could not be completed.
            </p>

            <p>
              Please try the payment again
              at your convenience.
            </p>

            <p>
              Regards,<br/>
              RecoverJS
            </p>

          </div>
        `,
      });

    return {
      status: "EXECUTED",

      action: "EMAIL",

      message:
        "Recovery email sent successfully.",

      providerResponse:
        result,
    };
  };


/**
 * =========================================================
 * B2B DUNNING EMAIL
 * =========================================================
 *
 * FLOW:
 *
 * sendDunningEmail()
 *       ↓
 * createPaymentLink()
 *       ↓
 * Razorpay
 *       ↓
 * paymentLink
 *       ↓
 * Brevo
 *
 * The payment link is embedded directly
 * inside the dunning email.
 */

export const sendDunningEmail =
  async (event) => {
    const companyName =
      event.companyName ||
      event.customer?.name ||
      "there";

    const amount =
      `₹${Number(
        event.amount || 0
      ).toLocaleString("en-IN")}`;

    // =======================================================
    // CREATE PAYMENT LINK
    // =======================================================

    const paymentResult =
      await createPaymentLink(event);

    const paymentLink =
      paymentResult.link;

    if (!paymentLink?.url) {
      throw new Error(
        "Payment link was not generated"
      );
    }

    // =======================================================
    // SEND DUNNING EMAIL
    // =======================================================

    if (env.DEMO_MODE) {
      return {
        status: "EXECUTED",

        action: "EMAIL",

        message:
          "Demo dunning email prepared with payment link.",

        paymentLink,

        providerResponse:
          paymentResult.providerResponse,
      };
    }

    const result =
      await sendBrevoEmail({
        to:
          event.customer?.email,

        subject:
          `Payment reminder — ${
            event.invoiceNumber ||
            "Invoice"
          }`,

        htmlContent: `
          <div
            style="
              font-family:Arial,sans-serif;
              max-width:600px;
              margin:auto;
              padding:24px;
              color:#222;
            "
          >

            <h2>
              Payment Reminder
            </h2>

            <p>
              Dear ${companyName},
            </p>

            <p>
              This is a reminder regarding
              invoice
              <strong>
                ${
                  event.invoiceNumber ||
                  ""
                }
              </strong>
              for
              <strong>
                ${amount}
              </strong>.
            </p>

            <p>
              The invoice is currently due.
              Please arrange payment at your
              earliest convenience.
            </p>

            <!-- PAYMENT BUTTON -->

            <div
              style="
                margin:30px 0;
                text-align:center;
              "
            >

              <a
                href="${paymentLink.url}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  background:#111827;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                Pay Invoice
              </a>

            </div>

            <p>
              You can also use the following
              payment link:
            </p>

            <p>
              <a
                href="${paymentLink.url}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${paymentLink.url}
              </a>
            </p>

            <p
              style="
                color:#666;
                font-size:13px;
              "
            >
              This payment link is valid for
              approximately
              ${paymentLink.expiresInHours}
              hours.
            </p>

            <p>
              Regards,<br/>
              RecoverJS
            </p>

          </div>
        `,
      });

    return {
      status: "EXECUTED",

      action: "EMAIL",

      message:
        "B2B dunning email sent successfully with payment link.",

      paymentLink,

      providerResponse:
        result,
    };
  };


/**
 * =========================================================
 * PAYMENT LINK EMAIL
 * =========================================================
 *
 * Used when AI explicitly chooses:
 *
 * PAYMENT_LINK
 */

export const sendPaymentLinkEmail =
  async (
    event,
    paymentLink
  ) => {
    if (!paymentLink?.url) {
      throw new Error(
        "Payment link is missing"
      );
    }

    const customerName =
      event.customer?.name ||
      "there";

    const amount =
      `₹${Number(
        event.amount || 0
      ).toLocaleString("en-IN")}`;

    if (env.DEMO_MODE) {
      return {
        status: "EXECUTED",

        action:
          "PAYMENT_LINK",

        message:
          "Demo payment-link email simulated successfully.",

        paymentLink,
      };
    }

    const result =
      await sendBrevoEmail({
        to:
          event.customer?.email,

        subject:
          `Complete your payment of ${amount}`,

        htmlContent: `
          <div
            style="
              font-family:Arial,sans-serif;
              max-width:600px;
              margin:auto;
              padding:24px;
            "
          >

            <h2>
              Complete Your Payment
            </h2>

            <p>
              Hi ${customerName},
            </p>

            <p>
              Your payment of
              <strong>
                ${amount}
              </strong>
              is pending.
            </p>

            <p>
              You can securely complete
              your payment using the button
              below.
            </p>

            <div
              style="
                margin:30px 0;
                text-align:center;
              "
            >

              <a
                href="${paymentLink.url}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  background:#111827;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                Complete Payment
              </a>

            </div>

            <p>
              Or use this payment link:
            </p>

            <p>
              <a
                href="${paymentLink.url}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${paymentLink.url}
              </a>
            </p>

            <p
              style="
                color:#666;
                font-size:13px;
              "
            >
              This link expires in
              ${paymentLink.expiresInHours}
              hours.
            </p>

            <p>
              Regards,<br/>
              RecoverJS
            </p>

          </div>
        `,
      });

    return {
      status: "EXECUTED",

      action:
        "PAYMENT_LINK",

      message:
        "Payment link sent successfully by email.",

      paymentLink,

      providerResponse:
        result,
    };
  };