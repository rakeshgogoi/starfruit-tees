export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment gateway not configured. Please order via WhatsApp.' });
  }

  const { receipt } = req.body;

  // 40% launch offer is active — always charge ₹479 regardless of client payload
  const OFFER_PRICE_PAISE = 47900; // ₹479 × 100

  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: OFFER_PRICE_PAISE,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.status(200).json(order);
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500).json({ error: 'Failed to create payment order. Please try again or order via WhatsApp.' });
  }
}
