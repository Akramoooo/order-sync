/**
 * Normalize a Russian phone to +7XXXXXXXXXX.
 * Returns null if the value cannot be turned into exactly 11 digits (7 + 10).
 *
 * Accepted shapes after stripping non-digits:
 * - 11 digits starting with 7
 * - 11 digits starting with 8 (treated as 7)
 * - 10 digits starting with 9 (mobile without country code)
 */
function normalizePhone(raw) {
  if (raw == null) return null;

  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;

  let normalized = digits;

  if (normalized.length === 11 && normalized.startsWith('8')) {
    normalized = `7${normalized.slice(1)}`;
  } else if (normalized.length === 10 && normalized.startsWith('9')) {
    normalized = `7${normalized}`;
  }

  if (normalized.length !== 11 || !normalized.startsWith('7')) {
    return null;
  }

  return `+${normalized}`;
}

module.exports = { normalizePhone };
