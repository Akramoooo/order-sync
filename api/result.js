const { syncOrders } = require('../lib/syncOrders');

/**
 * GET /result — synchronized clients + stats (JSON).
 * Always recomputes from the source API → idempotent, no local DB.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await syncOrders();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(result);
  } catch (error) {
    console.error('sync failed', error);
    return res.status(502).json({
      error: 'Failed to synchronize orders',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
