import { env } from "../../config/env.config.js";
import {
  createPaymentLink,
} from "./paymentLink.action.js";

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
   NORMAL RECOVERY EMAIL

   FLOW:

   AI -> EMAIL
        ↓
   createPaymentLink()
        ↓
   Razorpay payment link
        ↓
   Brevo email
        ↓
   Customer clicks actual URL

   IMPORTANT:
   - NO PAYMENT BUTTON
   - ACTUAL PAYMENT URL IS SHOWN
========================================================= */

export const sendRecoveryEmail =
  async (event) => {
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

    const customerName =
      event.customer?.name ||
      "there";

    const amount =
      `₹${Number(
        event.amount || 0
      ).toLocaleString("en-IN")}`;

    /* =====================================================
       CREATE PAYMENT LINK
    ===================================================== */

    const paymentResult =
      await createPaymentLink(event);

    const paymentLink =
      paymentResult.link;

    if (!paymentLink?.url) {
      throw new Error(
        "Payment link was not generated"
      );
    }

    /* =====================================================
       SEND EMAIL
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

<title>
  RecoverOS Payment Recovery
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

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    background:#f3f6f5;
  "
>

<tr>

<td
  align="center"
  style="
    padding:40px 16px;
  "
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

<!-- =====================================================
     HEADER
===================================================== -->

<tr>

<td
  style="
    background:#10231d;
    padding:26px 30px;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>

<tr>

<td>

<div
  style="
    font-size:23px;
    font-weight:700;
    color:#ffffff;
    letter-spacing:-0.5px;
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

<td align="right">

<div
  style="
    display:inline-block;
    padding:7px 11px;
    background:#17372d;
    border:1px solid #285243;
    border-radius:20px;
    color:#61dfa9;
    font-size:9px;
    font-weight:bold;
    letter-spacing:.5px;
  "
>
  ACTION REQUIRED
</div>

</td>

</tr>

</table>

</td>

</tr>

<!-- =====================================================
     BODY
===================================================== -->

<tr>

<td
  style="
    padding:36px 30px;
  "
>

<!-- STATUS ICON -->

<div
  style="
    width:48px;
    height:48px;
    line-height:48px;
    text-align:center;
    background:#e9faf3;
    border-radius:50%;
    font-size:21px;
    color:#16875a;
    font-weight:bold;
  "
>
  !
</div>

<h1
  style="
    margin:20px 0 8px;
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
  could not be completed. You can try
  the payment again whenever you're ready.
</p>

<!-- =====================================================
     AMOUNT CARD
===================================================== -->

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    margin-top:26px;
    background:#f7faf8;
    border:1px solid #e1eae6;
    border-radius:12px;
  "
>

<tr>

<td
  style="
    padding:20px;
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

</td>

<td
  align="right"
  style="
    padding:20px;
  "
>

<div
  style="
    width:38px;
    height:38px;
    line-height:38px;
    text-align:center;
    background:#dff7ec;
    border-radius:9px;
    color:#16875a;
    font-weight:bold;
  "
>
  ₹
</div>

</td>

</tr>

</table>

<!-- =====================================================
     PAYMENT LINK
===================================================== -->

<div
  style="
    margin-top:26px;
    padding:18px;
    background:#f8faf9;
    border:1px solid #e2ebe7;
    border-radius:11px;
  "
>

<div
  style="
    font-size:10px;
    font-weight:bold;
    color:#53615c;
    text-transform:uppercase;
    letter-spacing:.8px;
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
  This payment link expires in
  ${paymentLink.expiresInHours}
  hours.
</div>

</div>

<!-- =====================================================
     INFORMATION
===================================================== -->

<p
  style="
    margin:24px 0 0;
    color:#929d99;
    font-size:11px;
    line-height:1.6;
  "
>
  If you've already completed this payment,
  you can safely ignore this message.
</p>

<p
  style="
    margin:28px 0 0;
    color:#697671;
    font-size:13px;
    line-height:1.6;
  "
>
  Regards,<br/>

  <strong
    style="
      color:#17211f;
    "
  >
    RecoverOS
  </strong>
</p>

</td>

</tr>

<!-- =====================================================
     FOOTER
===================================================== -->

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

    /* =====================================================
       RETURN RESULT
    ===================================================== */

    return {
      status: "EXECUTED",
      action: "EMAIL",
      message:
        "Recovery email sent successfully with payment link.",
      paymentLink,
      providerResponse: result,
    };
  };

/* =========================================================
   B2B DUNNING EMAIL
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

    /* =====================================================
       CREATE PAYMENT LINK
    ===================================================== */

    const paymentResult =
      await createPaymentLink(event);

    const paymentLink =
      paymentResult.link;

    if (!paymentLink?.url) {
      throw new Error(
        "Payment link was not generated"
      );
    }

    /* =====================================================
       DEMO MODE
    ===================================================== */

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

    /* =====================================================
       SEND EMAIL
    ===================================================== */

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

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>

<tr>

<td
  align="center"
  style="
    padding:40px 16px;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    max-width:600px;
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
  ACCOUNTS RECEIVABLE
</div>

</td>

</tr>

<tr>

<td
  style="
    padding:34px 30px;
  "
>

<div
  style="
    display:inline-block;
    padding:7px 11px;
    background:#fff4e8;
    color:#c45a12;
    border-radius:20px;
    font-size:9px;
    font-weight:bold;
    letter-spacing:.5px;
  "
>
  PAYMENT REMINDER
</div>

<h1
  style="
    margin:18px 0 8px;
    font-size:26px;
    line-height:1.3;
  "
>
  Invoice payment is due
</h1>

<p
  style="
    margin:0;
    color:#697671;
    font-size:14px;
    line-height:1.7;
  "
>
  Dear ${companyName},
</p>

<p
  style="
    margin:14px 0 0;
    color:#697671;
    font-size:14px;
    line-height:1.7;
  "
>
  This is a friendly reminder that the
  following invoice is currently awaiting
  payment.
</p>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    margin-top:26px;
    border:1px solid #e1e9e5;
    border-radius:12px;
    overflow:hidden;
  "
>

<tr>

<td
  colspan="2"
  style="
    padding:13px 18px;
    background:#f7faf8;
    border-bottom:1px solid #e1e9e5;
    font-size:10px;
    font-weight:bold;
    color:#697671;
    letter-spacing:.7px;
  "
>
  INVOICE DETAILS
</td>

</tr>

<tr>

<td
  style="
    padding:17px 18px 7px;
    font-size:11px;
    color:#899590;
  "
>
  Invoice
</td>

<td
  align="right"
  style="
    padding:17px 18px 7px;
    font-size:12px;
    font-weight:bold;
  "
>
  ${event.invoiceNumber || "Invoice"}
</td>

</tr>

<tr>

<td
  style="
    padding:7px 18px 17px;
    font-size:11px;
    color:#899590;
  "
>
  Amount due
</td>

<td
  align="right"
  style="
    padding:7px 18px 17px;
    font-size:20px;
    font-weight:bold;
    color:#16875a;
  "
>
  ${amount}
</td>

</tr>

</table>

<!-- PAYMENT LINK -->

<div
  style="
    margin-top:26px;
    padding:18px;
    background:#f8faf9;
    border:1px solid #e2ebe7;
    border-radius:11px;
  "
>

<div
  style="
    font-size:10px;
    font-weight:bold;
    color:#53615c;
    text-transform:uppercase;
    letter-spacing:.8px;
  "
>
  Payment Link
</div>

<div
  style="
    margin-top:9px;
    font-size:13px;
    line-height:1.6;
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
  This payment link is valid for approximately
  ${paymentLink.expiresInHours} hours.
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
  Please arrange payment at your earliest
  convenience. If the payment has already
  been completed, no further action is
  required.
</p>

<p
  style="
    margin:28px 0 0;
    color:#697671;
    font-size:13px;
    line-height:1.6;
  "
>
  Regards,<br/>

  <strong style="color:#17211f;">
    RecoverOS
  </strong>
</p>

</td>

</tr>

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
  Automated accounts receivable notification.
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

    return {
      status: "EXECUTED",
      action: "EMAIL",
      message:
        "B2B dunning email sent successfully with payment link.",
      paymentLink,
      providerResponse: result,
    };
  };

/* =========================================================
   PAYMENT LINK EMAIL

   AI ACTION:
   PAYMENT_LINK

   NO BUTTON.
   ONLY THE ACTUAL PAYMENT URL.
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

    /* =====================================================
       DEMO MODE
    ===================================================== */

    if (env.DEMO_MODE) {
      return {
        status: "EXECUTED",
        action: "PAYMENT_LINK",
        message:
          "Demo payment-link email simulated successfully.",
        paymentLink,
      };
    }

    /* =====================================================
       SEND EMAIL
    ===================================================== */

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

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
>

<tr>

<td
  align="center"
  style="
    padding:40px 16px;
  "
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

<td
  style="
    padding:36px 30px;
  "
>

<div
  style="
    width:48px;
    height:48px;
    line-height:48px;
    text-align:center;
    background:#e9faf3;
    border-radius:50%;
    color:#16875a;
    font-size:20px;
    font-weight:bold;
  "
>
  ₹
</div>

<h1
  style="
    margin:20px 0 8px;
    font-size:26px;
    line-height:1.3;
  "
>
  Complete your payment
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
  Amount
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

<!-- PAYMENT URL -->

<div
  style="
    margin-top:26px;
    padding:18px;
    background:#f8faf9;
    border:1px solid #e2ebe7;
    border-radius:11px;
  "
>

<div
  style="
    font-size:10px;
    font-weight:bold;
    color:#53615c;
    text-transform:uppercase;
    letter-spacing:.8px;
  "
>
  Secure Payment Link
</div>

<div
  style="
    margin-top:9px;
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
    margin:24px 0 0;
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
    margin:28px 0 0;
    color:#697671;
    font-size:13px;
    line-height:1.6;
  "
>
  Regards,<br/>

  <strong style="color:#17211f;">
    RecoverOS
  </strong>
</p>

</td>

</tr>

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

    return {
      status: "EXECUTED",
      action: "PAYMENT_LINK",
      message:
        "Payment link sent successfully by email.",
      paymentLink,
      providerResponse: result,
    };
  };