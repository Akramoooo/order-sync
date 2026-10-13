const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { syncOrders } = require('../lib/syncOrders');

describe('syncOrders (live source)', () => {
  it('returns schema, valid phones, and expected merge stats', async () => {
    const first = await syncOrders();
    const second = await syncOrders();

    assert.ok(Array.isArray(first.clients));
    assert.equal(typeof first.stats.received, 'number');
    assert.equal(typeof first.stats.unique, 'number');
    assert.equal(typeof first.stats.duplicates_merged, 'number');
    assert.equal(typeof first.stats.invalid_dropped, 'number');

    assert.equal(
      first.stats.received,
      first.stats.unique + first.stats.duplicates_merged + first.stats.invalid_dropped,
    );

    for (const client of first.clients) {
      assert.match(client.phone, /^\+7\d{10}$/);
      assert.equal(Object.keys(client).sort().join(','), 'amount,email,name,phone');
    }

    // Idempotency: same clients/stats on re-run
    assert.deepEqual(second, first);

    // Known sample expectations (from test.ooobs.ru fixture)
    assert.equal(first.stats.received, 17);
    assert.equal(first.stats.invalid_dropped, 4);
    assert.equal(first.stats.unique, 8);
    assert.equal(first.stats.duplicates_merged, 5);

    const byPhone = Object.fromEntries(first.clients.map((c) => [c.phone, c]));
    assert.equal(byPhone['+79991234567'].amount, 5000);
    assert.equal(byPhone['+79160000001'].amount, 200);
    assert.equal(byPhone['+79160000001'].name, 'Мария С.');
    assert.equal(byPhone['+79219998877'].amount, 1500);
    assert.equal(byPhone['+79261234567'].amount, 9000);
  });
});
