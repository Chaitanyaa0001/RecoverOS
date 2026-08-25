import { env } from "../../config/env.config.js";
import { createPaymentLink } from "./paymentLink.action.js";

/* =========================================================
   BREVO
========================================================= */

const BREVO_API_URL =
  "https://api.brevo.com/v3/smtp/email";

/* =========================================================
   BREVO EMAIL CLIENT
========================================================= */

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
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": env.BREVO_API_KEY,
      },

      body: JSON.stringify({
        sender: {
          name:
            env.BREVO_SENDER_NAME ||
            "RecoverOS",

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

/* =========================================================
   PLAIN RECOVERY EMAIL

   IMPORTANT:
   This function DOES NOT create a Razorpay link.

   It is used as:
   - normal EMAIL action
   - PAYMENT_LINK fallback
========================================================= */

export const sendPlainRecoveryEmail =
  async (event) => {
    const customerName =
      event.customer?.name ||
      "there";

    const amount =
      `₹${Number(
        event.amount || 0
      ).toLocaleString("en-IN")}`;

    /* =====================================================
       DEMO MODE
    ===================================================== */

    if (env.DEMO_MODE) {
      return {
        status: "EXECUTED",

        action: "EMAIL",

        demo: true,

        message:
          "Demo recovery email simulated successfully.",
      };
    }

    /* =====================================================
       SEND BREVO EMAIL
    ===================================================== */

    const result =
      await sendBrevoEmail({
        to:
          event.customer?.email,

        subject:
          `Payment recovery needed for ${amount}`,

        htmlContent: `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>RecoverOS Payment Recovery</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3f6f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#17211f;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>

<tr>

<td
  align="center"
  style="padding:40px 16px;"
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    max-width:580px;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #e3ebe7;
  "
>

<!-- HEADER -->

<tr>

<td
  style="
    background:#10231d;
    padding:26px 30px;
  "
>

<div
  style="
    font-size:23px;
    font-weight:700;
    color:#ffffff;
  "
>
  Recover<span style="color:#38d996;">OS</span>
</div>

<div
  style="
    margin-top:5px;
    font-size:10px;
    color:#9eaea8;
    letter-spacing:1.2px;
  "
>
  REVENUE RECOVERY
</div>

</td>

</tr>

<!-- BODY -->

<tr>

<td
  style="padding:36px 30px;"
>

<h1
  style="
    margin:0 0 12px;
    font-size:26px;
    line-height:1.3;
    color:#17211f;
  "
>
  Payment needs your attention
</h1>

<p
  style="
    margin:0;
    color:#697671;
    font-size:14px;
    line-height:1.7;
  "
>
  Hi ${customerName},
</p>

<p
  style="
    margin:14px 0 0;
    color:#697671;
    font-size:14px;
    line-height:1.7;
  "
>
  We noticed that your recent payment
  could not be completed.
</p>

<div
  style="
    margin-top:26px;
    padding:20px;
    background:#f7faf8;
    border:1px solid #e1eae6;
    border-radius:12px;
  "
>

<div
  style="
    font-size:10px;
    color:#87938f;
    text-transform:uppercase;
    letter-spacing:1px;
  "
>
  Payment amount
</div>

<div
  style="
    margin-top:6px;
    font-size:30px;
    font-weight:700;
    color:#17211f;
  "
>
  ${amount}
</div>

</div>

<p
  style="
    margin:24px 0 0;
    color:#697671;
    font-size:13px;
    line-height:1.7;
  "
>
  Please try your usual payment method again
  or contact the merchant if you need assistance.
</p>

<p
  style="
    margin:28px 0 0;
    color:#697671;
    font-size:13px;
  "
>
  Regards,<br/>

  <strong style="color:#17211f;">
    RecoverOS
  </strong>
</p>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td
  style="
    padding:22px 30px;
    background:#f8faf9;
    border-top:1px solid #edf1ef;
  "
>

<div
  style="
    font-size:13px;
    font-weight:bold;
    color:#26332f;
  "
>
  RecoverOS
</div>

<div
  style="
    margin-top:5px;
    font-size:10px;
    color:#9aa5a1;
  "
>
  Automated revenue recovery notification.
</div>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
        `,
      });

    console.log(
      "[EMAIL] Plain recovery email sent successfully"
    );

    return {
      status: "EXECUTED",

      action: "EMAIL",

      message:
        "Recovery email sent successfully.",

      providerResponse:
        result,
    };
  };

/* =========================================================
   PAYMENT LINK EMAIL

   This function ONLY sends a link.
   Razorpay link must already exist.
========================================================= */

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

        action: "PAYMENT_LINK",

        demo: true,

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
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
RecoverOS Payment Link
</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3f6f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#17211f;
  "
>

<table width="100%" cellpadding="0" cellspacing="0">

<tr>

<td align="center" style="padding:40px 16px;">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    max-width:580px;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #e3ebe7;
  "
>

<tr>

<td
  style="
    background:#10231d;
    padding:26px 30px;
  "
>

<div
  style="
    font-size:23px;
    font-weight:700;
    color:#ffffff;
  "
>
Recover<span style="color:#38d996;">OS</span>
</div>

<div
  style="
    margin-top:5px;
    font-size:10px;
    color:#9eaea8;
    letter-spacing:1.2px;
  "
>
SECURE PAYMENT RECOVERY
</div>

</td>

</tr>

<tr>

<td style="padding:36px 30px;">

<h1
  style="
    margin:0 0 12px;
    font-size:26px;
  "
>
Complete your payment
</h1>

<p
  style="
    color:#697671;
    font-size:14px;
    line-height:1.7;
  "
>
Hi ${customerName},
</p>

<p
  style="
    color:#697671;
    font-size:14px;
    line-height:1.7;
  "
>
Your payment of
<strong style="color:#17211f;">
${amount}
</strong>
is currently pending.
</p>

<div
  style="
    margin-top:26px;
    padding:20px;
    background:#f7faf8;
    border:1px solid #e1eae6;
    border-radius:12px;
  "
>

<div
  style="
    font-size:10px;
    color:#87938f;
    text-transform:uppercase;
    letter-spacing:1px;
  "
>
Secure Payment Link
</div>

<div
  style="
    margin-top:10px;
    font-size:13px;
    line-height:1.7;
  "
>

<a
  href="${paymentLink.url}"
  target="_blank"
  rel="noopener noreferrer"
  style="
    color:#16875a;
    text-decoration:underline;
    word-break:break-all;
  "
>
${paymentLink.url}
</a>

</div>

<div
  style="
    margin-top:10px;
    color:#8a9691;
    font-size:11px;
  "
>
This link expires in
${paymentLink.expiresInHours}
hours.
</div>

</div>

<p
  style="
    margin-top:24px;
    color:#929d99;
    font-size:11px;
    line-height:1.6;
  "
>
For your security, always verify the
payment URL before completing your payment.
</p>

<p
  style="
    margin-top:28px;
    color:#697671;
    font-size:13px;
  "
>
Regards,<br/>

<strong style="color:#17211f;">
RecoverOS
</strong>
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
        `,
      });

    console.log(
      "[EMAIL] Payment-link email sent successfully"
    );

    return {
      status: "EXECUTED",

      action: "PAYMENT_LINK",

      message:
        "Payment link sent successfully by email.",

      paymentLink,

      providerResponse:
        result,
    };
  };

/* =========================================================
   B2B DUNNING EMAIL

   IMPORTANT:
   Razorpay is attempted first.
   If you want the B2B email to ALWAYS work even when
   Razorpay rejects the link, handle that at executor level.
========================================================= */

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

    const paymentResult =
      await createPaymentLink(event);

    const paymentLink =
      paymentResult.link;

    if (!paymentLink?.url) {
      throw new Error(
        "Payment link was not generated"
      );
    }

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
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
RecoverOS Payment Reminder
</title>

</head>

<body
style="
margin:0;
padding:0;
background:#f3f6f5;
font-family:Arial,Helvetica,sans-serif;
color:#17211f;
"
>

<div style="padding:40px 16px;">

<div
style="
max-width:600px;
margin:auto;
background:#ffffff;
border-radius:18px;
padding:34px 30px;
border:1px solid #e3ebe7;
"
>

<h2>
Recover<span style="color:#38d996;">OS</span>
</h2>

<h1>
Invoice payment is due
</h1>

<p>
Dear ${companyName},
</p>

<p>
This is a friendly reminder that the
following invoice is awaiting payment.
</p>

<p>
<strong>Invoice:</strong>
${event.invoiceNumber || "Invoice"}
</p>

<p>
<strong>Amount due:</strong>
${amount}
</p>

<p>
<a
href="${paymentLink.url}"
target="_blank"
rel="noopener noreferrer"
>
Complete payment
</a>
</p>

<p>
Regards,<br/>
<strong>RecoverOS</strong>
</p>

</div>

</div>

</body>

</html>
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