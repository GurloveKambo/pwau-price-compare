/**
 * coles.js
 *
 * Connector for Coles.
 *
 * Per MASTER_DESIGN.md's architecture note: Coles's live site may be
 * JS-rendered and/or bot-protected, so automated fetching is treated as
 * best-effort and out of scope for the initial build. This connector
 * currently always returns a fallback (manual-check) result, which is
 * fast, reliable, and never crashes the backend.
 *
 * TO ADD AUTOMATED FETCHING LATER:
 * 1. Try a timeoutFetch() against retailerConfig.searchUrl.
 * 2. Parse the HTML/JSON response for product name, price, size.
 * 3. On any failure (network, parsing, blocked, timeout), fall back to
 *    buildFallbackResult() below — never let this connector throw.
 * 4. Keep all Coles-specific parsing logic in this file only.
 */

const { buildFallbackResult } = require("./_helpers");

async function search(query, retailerConfig, options = {}) {
  try {
    // Automated fetch not yet implemented for Coles — see note above.
    return [buildFallbackResult(query, retailerConfig)];
  } catch (error) {
    return [buildFallbackResult(query, retailerConfig, error.message)];
  }
}

module.exports = { search };
