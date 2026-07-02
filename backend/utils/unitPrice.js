/**
 * unitPrice.js
 *
 * Attempts to calculate a unit price ("$x.xx / unit") from a price and a
 * free-text size string, per MASTER_DESIGN.md Section 14.
 *
 * Supported units: L, ml, kg, g, tablets, capsules, pack, each.
 * If the size text can't be parsed confidently, returns null rather than
 * guessing — a wrong unit price is worse than no unit price.
 */

const UNIT_ALIASES = {
  l: "L",
  litre: "L",
  litres: "L",
  liter: "L",
  liters: "L",
  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  g: "g",
  gram: "g",
  grams: "g",
  tablet: "tablets",
  tablets: "tablets",
  tab: "tablets",
  tabs: "tablets",
  capsule: "capsules",
  capsules: "capsules",
  cap: "capsules",
  caps: "capsules",
  pack: "pack",
  pk: "pack",
  each: "each",
  ea: "each",
};

// Base units used for normalising volume/weight to a standard "per L" / "per kg"
const BASE_UNIT_FOR = {
  L: "L",
  ml: "L",
  kg: "kg",
  g: "kg",
  tablets: "tablet",
  capsules: "capsule",
  pack: "each",
  each: "each",
};

// Conversion factor to the base unit (ml -> L, g -> kg)
const TO_BASE_FACTOR = {
  L: 1,
  ml: 0.001,
  kg: 1,
  g: 0.001,
  tablets: 1,
  capsules: 1,
  pack: 1,
  each: 1,
};

/**
 * Parses a size string like "2L", "500g", "100 tablets", "24 pack",
 * "12 x 375ml" into { quantity, unit } in base units, or null.
 */
function parseSize(sizeText) {
  if (!sizeText || typeof sizeText !== "string") return null;
  const text = sizeText.trim().toLowerCase();

  // Multi-pack pattern: "12 x 375ml", "24 x 30g"
  const multiMatch = text.match(
    /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*([a-z]+)/i
  );
  if (multiMatch) {
    const packCount = parseFloat(multiMatch[1]);
    const eachQty = parseFloat(multiMatch[2]);
    const unitRaw = multiMatch[3].toLowerCase();
    const unit = UNIT_ALIASES[unitRaw];
    if (!unit) return null;
    const totalQty = packCount * eachQty;
    return toBaseUnits(totalQty, unit);
  }

  // Simple pattern: "2L", "500 g", "100 tablets", "24 pack"
  const simpleMatch = text.match(/(\d+(?:\.\d+)?)\s*([a-z]+)/i);
  if (simpleMatch) {
    const qty = parseFloat(simpleMatch[1]);
    const unitRaw = simpleMatch[2].toLowerCase();
    const unit = UNIT_ALIASES[unitRaw];
    if (!unit) return null;
    return toBaseUnits(qty, unit);
  }

  return null;
}

function toBaseUnits(qty, unit) {
  const baseUnit = BASE_UNIT_FOR[unit];
  const factor = TO_BASE_FACTOR[unit];
  if (!baseUnit || factor === undefined) return null;
  return { quantity: qty * factor, baseUnit };
}

/**
 * calculateUnitPrice(price, sizeText) -> string like "$2.25 / L" or null
 */
function calculateUnitPrice(price, sizeText) {
  if (typeof price !== "number" || price <= 0) return null;
  const parsed = parseSize(sizeText);
  if (!parsed || !parsed.quantity || parsed.quantity <= 0) return null;

  const perUnit = price / parsed.quantity;
  return `$${perUnit.toFixed(2)} / ${parsed.baseUnit}`;
}

module.exports = { calculateUnitPrice, parseSize };
