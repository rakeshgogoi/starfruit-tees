export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth: accept ADMIN_SECRET or VITE_ADMIN_PASSWORD (both work — no extra Vercel setup needed)
  const adminSecret = process.env.ADMIN_SECRET || process.env.VITE_ADMIN_PASSWORD;
  const providedPw = req.headers['x-admin-password'];

  if (!adminSecret) {
    return res.status(500).json({ error: 'No admin password configured on server. Set VITE_ADMIN_PASSWORD in Vercel environment variables.' });
  }
  if (!providedPw || providedPw !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized — please sign out and sign back in to the admin panel, then try again.' });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment gateway not configured.' });
  }

  try {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString('base64');

    // Fetch latest 100 payments, expanding linked order to get order-level notes
    const rzRes = await fetch(
      'https://api.razorpay.com/v1/payments?count=100&expand[]=order',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const data = await rzRes.json();

    if (!rzRes.ok) {
      console.error('Razorpay API error:', rzRes.status, data);
      return res.status(502).json({
        error: `Razorpay error ${rzRes.status}: ${data?.error?.description || data?.error?.code || JSON.stringify(data)}`,
      });
    }

    // Merge order notes + DB data into every payment's notes field
    let storedMap = {};
    if (process.env.DATABASE_URL && data.items?.length) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        const paymentIds = data.items.map(p => p.id);
        const stored = await sql`
          SELECT * FROM orders WHERE payment_id = ANY(${paymentIds})
        `;
        storedMap = Object.fromEntries(stored.map(r => [r.payment_id, r]));
      } catch (dbErr) {
        console.error('DB lookup failed (non-fatal):', dbErr.message);
      }
    }

    // Apply merge to all payments: DB > order notes > payment notes
    if (data.items?.length) {
      data.items = data.items.map(p => {
        const db = storedMap[p.id];
        const on = p.order?.notes || {};  // order-level notes (expand[]=order)
        const pn = p.notes || {};         // payment-level notes
        return {
          ...p,
          notes: {
            product:       db?.product        || on.product        || pn.product        || '',
            customer_name: db?.customer_name  || on.customer_name  || pn.customer_name  || '',
            size:          db?.size           || on.size           || pn.size           || '',
            address:       db?.address        || on.address        || pn.address        || '',
            pincode:       db?.pincode        || on.pincode        || pn.pincode        || '',
            customisation: db?.customisation  || on.customisation  || pn.customisation  || '',
            jersey_name:   on.jersey_name     || pn.jersey_name    || '',
            jersey_number: on.jersey_number   || pn.jersey_number  || '',
          },
        };
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('admin-orders error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
