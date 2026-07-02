/**
 * normalizeProduct.js
 *
 * Ensures every connector returns a product object in the exact shared
 * shape described in MASTER_DESIGN.md Section 8, regardless of what the
 * connector itself produced. This is the single place that guarantees
 * shape consistency across all retailers.
 */

function normalizeProduct(raw, retailerConfig, fallbackSearchUrl) {
  return {
    retailer: raw.retailer || retailerConfig.name,
    retailerId: raw.retailerId || retailerConfig.id,
    productName: raw.productName || null,
    brand: raw.brand ?? null,
    price: typeof raw.price === "number" ? raw.price : null,
    priceText: raw.priceText ?? null,
    size: raw.size ?? null,
    unitPrice: raw.unitPrice ?? null,
    availability: raw.availability ?? null,
    imageUrl: raw.imageUrl ?? null,
    productUrl: raw.productUrl ?? null,
    fallbackSearchUrl: raw.fallbackSearchUrl || fallbackSearchUrl,
    source: raw.source || "fallback",
    errorMessage: raw.errorMessage ?? null,
    lastChecked: raw.lastChecked || new Date().toISOString(),
  };
}

module.exports = { normalizeProduct };
