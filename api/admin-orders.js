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

    return res.status(200).json(data);
  } catch (err) {
    console.error('admin-orders error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
