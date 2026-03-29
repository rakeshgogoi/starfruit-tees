export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment gateway not configured. Please order via WhatsApp.' });
  }

  const { amount, receipt } = req.body;

  // 40% launch offer: ₹479 per item. Validate amount is a positive multiple of 479.
  const OFFER_PRICE = 479;
  if (!amount || typeof amount !== 'number' || amount <= 0 || Math.round(amount) % OFFER_PRICE !== 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.status(200).json(order);
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500).json({ error: 'Failed to create payment order. Please try again or order via WhatsApp.' });
  }
}
