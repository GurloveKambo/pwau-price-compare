/**
 * cache.js
 *
 * Simple in-memory cache with a 30-minute TTL, per Section 18.
 *
 * NOTE (per MASTER_DESIGN.md Section 5): on serverless platforms
 * (Netlify Functions / Vercel), this cache is instance-scoped. A cold
 * start can spin up a fresh instance with an empty cache, so hits are
 * best-effort, not guaranteed. That's fine for low-traffic family use.
 * If you need reliable persistence, swap this module for a small KV
 * store (Netlify Blobs / Vercel KV) without changing its interface.
 */

const TTL_MINUTES = 30;
const TTL_MS = TTL_MINUTES * 60 * 1000;

const store = new Map();

function buildCacheKey(query, postcode) {
  const normalizedQuery = query.trim().toLowerCase();
  return postcode ? `search:${normalizedQuery}:${postcode}` : `search:${normalizedQuery}`;
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value) {
  store.set(key, {
    value,
    expiresAt: Date.now() + TTL_MS,
  });
}

module.exports = { get, set, buildCacheKey, TTL_MINUTES };
