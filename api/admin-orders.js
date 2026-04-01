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

    // Fetch latest 100 payments from Razorpay
    const rzRes = await fetch(
      'https://api.razorpay.com/v1/payments?count=100',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const data = await rzRes.json();

    if (!rzRes.ok) {
      console.error('Razorpay API error:', rzRes.status, data);
      return res.status(502).json({
        error: `Razorpay error ${rzRes.status}: ${data?.error?.description || data?.error?.code || JSON.stringify(data)}`,
      });
    }

    // Merge with stored order details from our database
    if (process.env.DATABASE_URL && data.items?.length) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        const paymentIds = data.items.map(p => p.id);
        const stored = await sql`
          SELECT * FROM orders WHERE payment_id = ANY(${paymentIds})
        `;
        const storedMap = Object.fromEntries(stored.map(r => [r.payment_id, r]));

        data.items = data.items.map(p => {
          const db = storedMap[p.id];
          if (!db) return p;
          // Merge DB data into notes, preferring DB values over existing notes
          return {
            ...p,
            notes: {
              product:       db.product        || p.notes?.product       || '',
              customer_name: db.customer_name  || p.notes?.customer_name || '',
              size:          db.size           || p.notes?.size          || '',
              address:       db.address        || p.notes?.address       || '',
              pincode:       db.pincode        || p.notes?.pincode       || '',
              customisation: db.customisation  || p.notes?.customisation || '',
              jersey_name:   p.notes?.jersey_name   || '',
              jersey_number: p.notes?.jersey_number || '',
            },
          };
        });
      } catch (dbErr) {
        console.error('DB merge failed (non-fatal):', dbErr.message);
      }
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('admin-orders error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
