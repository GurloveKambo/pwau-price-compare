/**
 * connectors/index.js
 *
 * Maps each retailer id to its connector module, and runs all enabled
 * connectors in parallel via Promise.allSettled so one slow/broken
 * retailer can never block or crash the others (Section 19).
 */

const woolworths = require("./woolworths");
const coles = require("./coles");
const chemistWarehouse = require("./chemistWarehouse");
const priceline = require("./priceline");
const hillStreetGrocer = require("./hillStreetGrocer");
const salamancaFresh = require("./salamancaFresh");
const aldi = require("./aldi");
const iga = require("./iga");
const bigW = require("./bigW");
const { buildFallbackResult } = require("./_helpers");

const CONNECTORS = {
  woolworths,
  coles,
  chemistWarehouse,
  priceline,
  hillStreetGrocer,
  salamancaFresh,
  aldi,
  iga,
  bigW,
};

/**
 * Runs search() for every enabled retailer in retailersConfig, in parallel.
 * Never throws — any connector error becomes a fallback result instead.
 *
 * Returns { results: Product[], failedRetailers: string[] }
 */
async function searchAllRetailers(query, retailersConfig, options = {}) {
  const enabledRetailers = retailersConfig.filter((r) => r.enabled);

  const settled = await Promise.allSettled(
    enabledRetailers.map((retailerConfig) => {
      const connector = CONNECTORS[retailerConfig.id];
      if (!connector) {
        // No connector file registered for this id — return a fallback
        // instead of crashing the whole search.
        return Promise.resolve([
          buildFallbackResult(
            query,
            retailerConfig,
            `No connector implemented for "${retailerConfig.id}"`
          ),
        ]);
      }
      return connector.search(query, retailerConfig, options);
    })
  );

  const results = [];
  const failedRetailers = [];

  settled.forEach((outcome, i) => {
    const retailerConfig = enabledRetailers[i];
    if (outcome.status === "fulfilled") {
      results.push(...outcome.value);
    } else {
      failedRetailers.push(retailerConfig.id);
      results.push(
        buildFallbackResult(query, retailerConfig, outcome.reason?.message || "Unknown error")
      );
    }
  });

  return { results, failedRetailers };
}

module.exports = { searchAllRetailers, CONNECTORS };
