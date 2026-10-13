const { normalizePhone } = require('./normalizePhone');

const DEFAULT_ORDERS_URL = 'https://test.ooobs.ru/api/orders';

/**
 * Prefer the order with higher amount; on tie, the later created_at.
 */
function isBetter(candidate, current) {
  if (candidate.amount !== current.amount) {
    return candidate.amount > current.amount;
  }
  return new Date(candidate.created_at).getTime() > new Date(current.created_at).getTime();
}

/**
 * Fetch raw orders, normalize phones, dedupe by phone, return clients + stats.
 * Pure transform — re-running always yields the same result (idempotent).
 */
async function syncOrders(ordersUrl = process.env.ORDERS_URL || DEFAULT_ORDERS_URL) {
  const response = await fetch(ordersUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
  }

  const orders = await response.json();
  if (!Array.isArray(orders)) {
    throw new Error('Orders payload must be a JSON array');
  }

  const received = orders.length;
  let invalidDropped = 0;
  const byPhone = new Map();

  for (const order of orders) {
    const phone = normalizePhone(order.phone);
    if (!phone) {
      invalidDropped += 1;
      continue;
    }

    const candidate = {
      name: order.name ?? '',
      phone,
      email: order.email ?? '',
      amount: Number(order.amount) || 0,
      created_at: order.created_at,
    };

    const existing = byPhone.get(phone);
    if (!existing || isBetter(candidate, existing)) {
      byPhone.set(phone, candidate);
    }
  }

  const unique = byPhone.size;
  const duplicatesMerged = received - unique - invalidDropped;

  const clients = Array.from(byPhone.values()).map(({ name, phone, email, amount }) => ({
    name,
    phone,
    email,
    amount,
  }));

  return {
    clients,
    stats: {
      received,
      unique,
      duplicates_merged: duplicatesMerged,
      invalid_dropped: invalidDropped,
    },
  };
}

module.exports = { syncOrders, DEFAULT_ORDERS_URL };
