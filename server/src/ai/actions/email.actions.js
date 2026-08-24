import { env } from "../../config/env.config.js";

const BREVO_API_URL =
  "https://api.brevo.com/v3/smtp/email";

const sendBrevoEmail = async ({to,subject,htmlContent,}) => {
  if (!env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }
  if (!to) {
    throw new Error(
      "Customer email is missing"
    );
  }

  const response = await fetch(
    BREVO_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",

        Accept: "application/json",
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
        to: [{ email: to }],

        subject,
        htmlContent,
      }),
    }
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Brevo failed: ${response.status} ${error}`
    );
  }
  return response.json();
};


export const sendRecoveryEmail =
  async (event) => {
    const customerName =
      event.customer?.name ||
      "there";

    const amount =
      `₹${event.amount.toLocaleString(
        "en-IN"
      )}`;

    const result =
      await sendBrevoEmail({
        to: event.customer?.email,

        subject:
          `Payment recovery needed for ${amount}`,

        htmlContent: `
          <div style="font-family:Arial,sans-serif">
            <h2>Payment Recovery</h2>

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
      providerResponse: result,
    };
  };

export const sendDunningEmail =
  async (event) => {
    const companyName =
      event.companyName ||
      event.customer?.name ||
      "there";

    const amount =
      `₹${event.amount.toLocaleString(
        "en-IN"
      )}`;

    const result =
      await sendBrevoEmail({
        to: event.customer?.email,

        subject:
          `Payment reminder — ${event.invoiceNumber || "Invoice"}`,

        htmlContent: `
          <div style="font-family:Arial,sans-serif">
            <h2>Payment Reminder</h2>

            <p>
              Dear ${companyName},
            </p>

            <p>
              Invoice
              <strong>
                ${event.invoiceNumber || ""}
              </strong>
              for
              <strong>${amount}</strong>
              is currently due.
            </p>

            <p>
              Please arrange payment
              at your earliest convenience.
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
        "B2B dunning email sent successfully.",
      providerResponse: result,
    };
  };

export const sendPaymentLinkEmail =
  async (
    event,
    paymentLink
  ) => {
    const customerName =
      event.customer?.name ||
      "there";

    const amount =
      `₹${event.amount.toLocaleString(
        "en-IN"
      )}`;

    const result =
      await sendBrevoEmail({
        to: event.customer?.email,

        subject:
          `Complete your payment of ${amount}`,

        htmlContent: `
          <div style="font-family:Arial,sans-serif">

            <h2>Complete Your Payment</h2>

            <p>
              Hi ${customerName},
            </p>

            <p>
              Your payment of
              <strong>${amount}</strong>
              is pending.
            </p>

            <p>
              You can securely complete
              your payment using the button below.
            </p>

            <p>
              <a
                href="${paymentLink.url}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#111;
                  color:#fff;
                  text-decoration:none;
                  border-radius:6px;
                "
              >
                Complete Payment
              </a>
            </p>

            <p>
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
      action: "PAYMENT_LINK",
      message:
        "Payment link sent successfully by email.",
      providerResponse: result,
    };
  };