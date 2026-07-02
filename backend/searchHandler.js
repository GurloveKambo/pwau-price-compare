/**
 * searchHandler.js
 *
 * The core /api/search logic, shared between the local Express server
 * (server.js) and the Netlify Function (netlify/functions/search.js) so
 * the behaviour is identical in dev and production.
 */

const retailersConfig = require("./retailers.json");
const { searchAllRetailers } = require("./connectors/index");
const { sortResults } = require("./utils/sortResults");
const { calculateUnitPrice } = require("./utils/unitPrice");
const cache = require("./utils/cache");

async function handleSearch(query, postcode) {
  if (!query || !query.trim()) {
    return {
      status: 400,
      body: { error: "Query parameter 'q' is required and cannot be empty." },
    };
  }

  const trimmedQuery = query.trim();
  const cacheKey = cache.buildCacheKey(trimmedQuery, postcode);

  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      status: 200,
      body: {
        ...cached,
        cache: { hit: true, ttlMinutes: cache.TTL_MINUTES },
      },
    };
  }

  const { results, failedRetailers } = await searchAllRetailers(trimmedQuery, retailersConfig);

  // Fill in unit price where we have both a price and a size.
  const withUnitPrice = results.map((r) => {
    if (r.price !== null && !r.unitPrice && r.size) {
      return { ...r, unitPrice: calculateUnitPrice(r.price, r.size) };
    }
    return r;
  });

  const sorted = sortResults(withUnitPrice);

  const responseBody = {
    query: trimmedQuery,
    results: sorted,
    failedRetailers,
    lastChecked: new Date().toISOString(),
  };

  cache.set(cacheKey, responseBody);

  return {
    status: 200,
    body: {
      ...responseBody,
      cache: { hit: false, ttlMinutes: cache.TTL_MINUTES },
    },
  };
}

module.exports = { handleSearch };
