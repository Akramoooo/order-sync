const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhone } = require('../lib/normalizePhone');

describe('normalizePhone', () => {
  it('normalizes common Russian formats to +7XXXXXXXXXX', () => {
    assert.equal(normalizePhone('+7 999 123-45-67'), '+79991234567');
    assert.equal(normalizePhone('8 (999) 123 45 67'), '+79991234567');
    assert.equal(normalizePhone('79991234567'), '+79991234567');
    assert.equal(normalizePhone('+79219998877'), '+79219998877');
    assert.equal(normalizePhone('9005551212'), '+79005551212');
  });

  it('drops invalid phones', () => {
    assert.equal(normalizePhone('123'), null);
    assert.equal(normalizePhone(''), null);
    assert.equal(normalizePhone('не указан'), null);
    assert.equal(normalizePhone('+7 999'), null);
    assert.equal(normalizePhone(null), null);
  });
});
