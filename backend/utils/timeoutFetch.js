/**
 * timeoutFetch.js
 *
 * Wraps fetch with a hard timeout so a single slow/hanging retailer can
 * never stall the whole search. Per Section 19: 10-second timeout,
 * no more than one retry.
 */

const DEFAULT_TIMEOUT_MS = 10000;

async function timeoutFetch(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * timeoutFetchWithRetry: attempts once, retries once on failure (max one retry).
 */
async function timeoutFetchWithRetry(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  try {
    return await timeoutFetch(url, options, timeoutMs);
  } catch (firstError) {
    try {
      return await timeoutFetch(url, options, timeoutMs);
    } catch (secondError) {
      throw secondError;
    }
  }
}

module.exports = { timeoutFetch, timeoutFetchWithRetry, DEFAULT_TIMEOUT_MS };
