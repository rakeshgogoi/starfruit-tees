/**
 * POST /api/notify-customer
 * Sends order confirmation via SMS, WhatsApp, and email.
 *
 * Required env vars (set in Vercel dashboard):
 *   TWILIO_ACCOUNT_SID      — Twilio account SID
 *   TWILIO_AUTH_TOKEN       — Twilio auth token
 *   TWILIO_FROM_PHONE       — Twilio SMS number e.g. +1XXXXXXXXXX
 *   TWILIO_WHATSAPP_FROM    — Twilio WhatsApp sender e.g. +1XXXXXXXXXX
 *                             (use Twilio sandbox number for testing)
 *   RESEND_API_KEY          — Resend.com API key for email
 *   RESEND_FROM_EMAIL       — e.g. orders@houseofstarfruit.in
 */

function buildTextMessage(customer, order) {
  const lines = [
    `Hi ${customer.name}! 🌟`,
    ``,
    `Your order at *Starfruit Tees* has been placed successfully!`,
    ``,
    `📦 *Order Details*`,
    `• Product: ${order.product}`,
    `• Amount Paid: ₹${order.amount}`,
    `• Payment ID: ${order.paymentId}`,
  ];

  if (customer.customise && customer.jerseyName) {
    lines.push(``, `✍️ *Jersey Customisation*`);
    lines.push(`• Name: ${customer.jerseyName}`);
    lines.push(`• Number: ${customer.jerseyNumber}`);
  }

  lines.push(
    ``,
    `🚚 *Delivery Address*`,
    customer.address,
    `Pincode: ${customer.pincode}`,
    ``,
    `We'll process your order within 1–2 business days and share tracking details on this number.`,
    ``,
    `For queries, WhatsApp us: +91 87209 51721`,
    ``,
    `Thank you for shopping with us! 🏏`,
    `— Team Starfruit Tees`,
  );

  return lines.join('\n');
}

function buildEmailHtml(customer, order) {
  const customBlock = customer.customise && customer.jerseyName
    ? `<tr>
        <td style="padding:16px 24px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#888;">✍️ Jersey Customisation</p>
          <p style="margin:0;font-size:14px;color:#333;">Name: <strong>${customer.jerseyName}</strong></p>
          <p style="margin:4px 0 0;font-size:14px;color:#333;">Number: <strong>${customer.jerseyNumber}</strong></p>
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:28px 24px;text-align:center;">
            <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#E0A600;">Starfruit Tees</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.02em;">Order Confirmed! 🎉</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:24px 24px 8px;">
            <p style="margin:0;font-size:15px;color:#333;line-height:1.6;">
              Hi <strong>${customer.name}</strong>, your order has been placed successfully.
              We'll process it within <strong>1–2 business days</strong>.
            </p>
          </td>
        </tr>

        <!-- Order details -->
        <tr>
          <td style="padding:16px 24px 0;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#888;">Order Summary</p>
          </td>
        </tr>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:12px;overflow:hidden;margin:0 24px;width:calc(100% - 48px);">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;background:#fafafa;">
                  <p style="margin:0;font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Product</p>
                  <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#111;">${order.product}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;">
                  <p style="margin:0;font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Amount Paid</p>
                  <p style="margin:4px 0 0;font-size:18px;font-weight:900;color:#111;">₹${order.amount}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;background:#fafafa;">
                  <p style="margin:0;font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Payment ID</p>
                  <p style="margin:4px 0 0;font-size:12px;font-weight:600;color:#555;font-family:monospace;">${order.paymentId}</p>
                </td>
              </tr>
              ${customBlock}
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0;font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">🚚 Delivery Address</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#333;line-height:1.5;">${customer.address}<br/>Pincode: ${customer.pincode}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px;text-align:center;">
            <a href="https://wa.me/918720951721" style="display:inline-block;background:#25D366;color:#fff;font-size:13px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;padding:14px 28px;border-radius:100px;text-decoration:none;">
              💬 WhatsApp Us for Queries
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 24px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.6;">
              © 2026 House of Starfruit · Bengaluru, India<br/>
              <a href="https://tees.houseofstarfruit.in" style="color:#E0A600;text-decoration:none;">tees.houseofstarfruit.in</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendTwilioMessage(to, body, from) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const auth  = Buffer.from(`${sid}:${token}`).toString('base64');

  const r = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: from, To: to, Body: body }),
    }
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || 'Twilio error');
  return data;
}

async function sendResendEmail(customer, order) {
  const html = buildEmailHtml(customer, order);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Starfruit Tees <orders@houseofstarfruit.in>',
      to: [customer.email],
      subject: `Order Confirmed — ${order.product} 🏏`,
      html,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || 'Resend error');
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customer, order } = req.body;

  if (!customer?.phone || !order?.paymentId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const results = {};
  const phone   = `+91${customer.phone.replace(/^\+91/, '')}`;
  const message = buildTextMessage(customer, order);

  // ── SMS ────────────────────────────────────────────────────────────
  const hasTwilioSMS = process.env.TWILIO_ACCOUNT_SID
    && process.env.TWILIO_AUTH_TOKEN
    && process.env.TWILIO_FROM_PHONE;

  if (hasTwilioSMS) {
    try {
      await sendTwilioMessage(phone, message.replace(/\*/g, ''), process.env.TWILIO_FROM_PHONE);
      results.sms = 'sent';
    } catch (e) {
      console.error('SMS failed:', e.message);
      results.sms = `failed: ${e.message}`;
    }
  } else {
    results.sms = 'skipped (TWILIO_FROM_PHONE not set)';
  }

  // ── WhatsApp ────────────────────────────────────────────────────────
  const hasTwilioWA = process.env.TWILIO_ACCOUNT_SID
    && process.env.TWILIO_AUTH_TOKEN
    && process.env.TWILIO_WHATSAPP_FROM;

  if (hasTwilioWA) {
    try {
      const waFrom = process.env.TWILIO_WHATSAPP_FROM.startsWith('whatsapp:')
        ? process.env.TWILIO_WHATSAPP_FROM
        : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;
      await sendTwilioMessage(`whatsapp:${phone}`, message, waFrom);
      results.whatsapp = 'sent';
    } catch (e) {
      console.error('WhatsApp failed:', e.message);
      results.whatsapp = `failed: ${e.message}`;
    }
  } else {
    results.whatsapp = 'skipped (TWILIO_WHATSAPP_FROM not set)';
  }

  // ── Email ───────────────────────────────────────────────────────────
  if (customer.email && process.env.RESEND_API_KEY) {
    try {
      await sendResendEmail(customer, order);
      results.email = 'sent';
    } catch (e) {
      console.error('Email failed:', e.message);
      results.email = `failed: ${e.message}`;
    }
  } else if (!customer.email) {
    results.email = 'skipped (no email provided)';
  } else {
    results.email = 'skipped (RESEND_API_KEY not set)';
  }

  console.log('Notification results for', customer.phone, results);
  return res.status(200).json({ ok: true, results });
}
