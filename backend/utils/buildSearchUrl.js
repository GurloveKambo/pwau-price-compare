/**
 * buildSearchUrl.js
 *
 * Builds the fallback (manual) search URL for a retailer by substituting
 * the {query} placeholder in retailers.json with the URL-encoded query.
 */

function buildSearchUrl(retailerConfig, query) {
  const encoded = encodeURIComponent(query.trim());
  return retailerConfig.searchUrl.replace("{query}", encoded);
}

module.exports = { buildSearchUrl };
