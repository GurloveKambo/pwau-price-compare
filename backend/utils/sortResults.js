/**
 * sortResults.js
 *
 * Applies the sorting rules from Section 13:
 * 1. Priced results first, cheapest first.
 * 2. price: null results appear last.
 * 3. Ties broken by unit price where available.
 */

function parseUnitPriceValue(unitPrice) {
  if (!unitPrice) return null;
  const match = unitPrice.match(/\$([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

function sortResults(results) {
  return [...results].sort((a, b) => {
    const aHasPrice = typeof a.price === "number";
    const bHasPrice = typeof b.price === "number";

    if (aHasPrice && !bHasPrice) return -1;
    if (!aHasPrice && bHasPrice) return 1;
    if (!aHasPrice && !bHasPrice) return 0;

    if (a.price !== b.price) return a.price - b.price;

    // Same price — compare unit price if both available.
    const aUnit = parseUnitPriceValue(a.unitPrice);
    const bUnit = parseUnitPriceValue(b.unitPrice);
    if (aUnit !== null && bUnit !== null) return aUnit - bUnit;

    return 0;
  });
}

module.exports = { sortResults };
