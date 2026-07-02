/**
 * storage.js
 *
 * All localStorage reads/writes live here so the rest of the app never
 * touches localStorage directly. Manual prices are keyed by a lowercased
 * search query so they resurface automatically on repeat searches.
 */

const KEYS = {
  SETTINGS: "pwau.settings",
  MANUAL_PRICES: "pwau.manualPrices",
};

const DEFAULT_SETTINGS = {
  postcode: "",
  disabledRetailers: [],
};

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

// --- Settings ---

export function getSettings() {
  const raw = localStorage.getItem(KEYS.SETTINGS);
  return raw ? { ...DEFAULT_SETTINGS, ...safeParse(raw, {}) } : DEFAULT_SETTINGS;
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// --- Manual prices ---
// Shape: { [queryKey]: ManualPriceEntry[] }
// ManualPriceEntry: { id, productName, retailer, price, size, productUrl, notes, enteredAt }

function normalizeQueryKey(query) {
  return query.trim().toLowerCase();
}

export function getManualPrices(query) {
  const all = safeParse(localStorage.getItem(KEYS.MANUAL_PRICES), {});
  return all[normalizeQueryKey(query)] || [];
}

export function addManualPrice(query, entry) {
  const all = safeParse(localStorage.getItem(KEYS.MANUAL_PRICES), {});
  const key = normalizeQueryKey(query);
  const existing = all[key] || [];
  const newEntry = {
    id: `manual-${Date.now()}`,
    enteredAt: new Date().toISOString(),
    ...entry,
  };
  all[key] = [...existing, newEntry];
  localStorage.setItem(KEYS.MANUAL_PRICES, JSON.stringify(all));
  return newEntry;
}

export function clearManualPrices() {
  localStorage.removeItem(KEYS.MANUAL_PRICES);
}
