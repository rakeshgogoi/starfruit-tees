/**
 * GET /api/inventory
 * Returns current stock levels for all tracked products.
 * Public endpoint — no auth required.
 *
 * Response shape: { "6": { "S": 1, "M": 2, ... }, ... }
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    const rows = await sql`SELECT product_id, size, quantity FROM inventory`;

    // Transform rows into nested object: { productId: { size: qty } }
    const inventory = {};
    for (const row of rows) {
      if (!inventory[row.product_id]) inventory[row.product_id] = {};
      inventory[row.product_id][row.size] = row.quantity;
    }

    return res.status(200).json(inventory);
  } catch (e) {
    console.error('Inventory fetch failed:', e.message);
    return res.status(500).json({ error: 'Failed to load inventory' });
  }
}
