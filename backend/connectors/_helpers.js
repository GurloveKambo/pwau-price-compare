/**
 * _helpers.js
 *
 * Shared helper used by every connector to build a fallback ("manual
 * check needed") result. This is generic plumbing, not retailer-specific
 * logic, so it's safe to share without breaking the "one file per
 * retailer" rule in MASTER_DESIGN.md Section 22.
 */

const { buildSearchUrl } = require("../utils/buildSearchUrl");
const { normalizeProduct } = require("../utils/normalizeProduct");

function buildFallbackResult(query, retailerConfig, errorMessage = null) {
  const fallbackSearchUrl = buildSearchUrl(retailerConfig, query);
  return normalizeProduct(
    {
      retailer: retailerConfig.name,
      retailerId: retailerConfig.id,
      productName: query,
      availability: "Manual check needed",
      productUrl: fallbackSearchUrl,
      fallbackSearchUrl,
      source: errorMessage ? "error" : "fallback",
      errorMessage,
      lastChecked: new Date().toISOString(),
    },
    retailerConfig,
    fallbackSearchUrl
  );
}

module.exports = { buildFallbackResult };
