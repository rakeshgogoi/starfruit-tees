/**
 * /api/inventory-admin
 * Admin endpoint for inventory management.
 *
 * GET  — Returns all inventory (requires x-admin-password header)
 * POST — Upserts stock levels (requires x-admin-password header)
 *
 * POST body: { updates: [{ productId, size, quantity }] }
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Auth: same pattern as admin-orders.js
  const adminSecret = process.env.ADMIN_SECRET || process.env.VITE_ADMIN_PASSWORD;
  const providedPw = req.headers['x-admin-password'];

  if (!adminSecret) {
    return res.status(500).json({ error: 'No admin password configured on server.' });
  }
  if (!providedPw || providedPw !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(dbUrl);

  // ── GET: return all inventory ──────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT product_id, size, quantity, updated_at
        FROM inventory
        ORDER BY product_id, size
      `;
      return res.status(200).json({ ok: true, inventory: rows });
    } catch (e) {
      console.error('Admin inventory fetch failed:', e.message);
      return res.status(500).json({ error: 'Failed to load inventory' });
    }
  }

  // ── POST: upsert stock levels ──────────────────────────────────────
  if (req.method === 'POST') {
    const { updates } = req.body || {};
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Missing updates array' });
    }

    try {
      const results = [];

      for (const item of updates) {
        const { productId, size, quantity } = item;
        if (!productId || !size || quantity == null) {
          results.push({ productId, size, updated: false, reason: 'missing_fields' });
          continue;
        }

        await sql`
          INSERT INTO inventory (product_id, size, quantity, updated_at)
          VALUES (${productId}, ${size}, ${quantity}, NOW())
          ON CONFLICT (product_id, size)
          DO UPDATE SET quantity = ${quantity}, updated_at = NOW()
        `;
        results.push({ productId, size, quantity, updated: true });
      }

      return res.status(200).json({ ok: true, results });
    } catch (e) {
      console.error('Admin inventory update failed:', e.message);
      return res.status(500).json({ error: 'Failed to update inventory' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
