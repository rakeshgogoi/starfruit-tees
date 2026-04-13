/**
 * POST /api/inventory-decrement
 * Decrements stock for purchased items.
 * Uses WHERE quantity >= N to prevent negative stock (race condition guard).
 *
 * Body: { items: [{ productId, size, quantity }] }
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing items array' });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    const results = [];

    for (const item of items) {
      const { productId, size, quantity } = item;
      if (!productId || !size || !quantity) {
        results.push({ productId, size, decremented: false, reason: 'missing_fields' });
        continue;
      }

      // Atomic decrement with race condition guard
      const rows = await sql`
        UPDATE inventory
        SET quantity = quantity - ${quantity}, updated_at = NOW()
        WHERE product_id = ${productId} AND size = ${size} AND quantity >= ${quantity}
        RETURNING quantity
      `;

      if (rows.length > 0) {
        results.push({ productId, size, decremented: true, remaining: rows[0].quantity });
      } else {
        results.push({ productId, size, decremented: false, reason: 'insufficient_stock' });
      }
    }

    return res.status(200).json({ ok: true, results });
  } catch (e) {
    console.error('Inventory decrement failed:', e.message);
    return res.status(500).json({ error: 'Failed to update inventory' });
  }
}
