import { useEffect, useState } from "react";
import SearchBox from "./components/SearchBox.jsx";
import ResultsTable from "./components/ResultsTable.jsx";
import RetailerStatus from "./components/RetailerStatus.jsx";
import ManualPriceForm from "./components/ManualPriceForm.jsx";
import Settings from "./components/Settings.jsx";
import Disclaimer from "./components/Disclaimer.jsx";
import { searchProducts, fetchRetailers } from "./services/api.js";
import { getManualPrices, addManualPrice, getSettings } from "./services/storage.js";

function manualEntryToProduct(entry) {
  return {
    retailer: entry.retailer,
    retailerId: `manual-${entry.retailer.toLowerCase().replace(/\s+/g, "-")}`,
    productName: entry.productName,
    brand: null,
    price: entry.price,
    priceText: entry.price != null ? `$${entry.price.toFixed(2)}` : null,
    size: entry.size,
    unitPrice: null,
    availability: null,
    imageUrl: null,
    productUrl: entry.productUrl,
    fallbackSearchUrl: entry.productUrl || "#",
    source: "manual",
    errorMessage: null,
    lastChecked: entry.enteredAt,
  };
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [failedRetailers, setFailedRetailers] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);
  const [cacheHit, setCacheHit] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    fetchRetailers()
      .then(setRetailers)
      .catch(() => setRetailers([]));
  }, []);

  function mergeManualPrices(baseResults, forQuery) {
    const manualEntries = getManualPrices(forQuery).map(manualEntryToProduct);
    return [...manualEntries, ...baseResults].sort((a, b) => {
      const aHas = typeof a.price === "number";
      const bHas = typeof b.price === "number";
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (!aHas && !bHas) return 0;
      return a.price - b.price;
    });
  }

  async function handleSearch(searchQuery) {
    setIsSearching(true);
    setSearchError(null);
    setQuery(searchQuery);

    try {
      const data = await searchProducts(searchQuery, settings.postcode);
      const enabledResults = data.results.filter(
        (r) => !settings.disabledRetailers.includes(r.retailerId)
      );
      setResults(mergeManualPrices(enabledResults, searchQuery));
      setFailedRetailers(data.failedRetailers || []);
      setLastChecked(data.lastChecked);
      setCacheHit(data.cache?.hit || false);
    } catch (err) {
      setSearchError(err.message || "Something went wrong while searching.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSaveManualPrice(entry) {
    addManualPrice(query, entry);
    setResults((prev) => mergeManualPrices(
      prev.filter((r) => r.source !== "manual" || r.productName !== entry.productName),
      query
    ));
    setShowManualForm(false);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>PWAU Price Compare</h1>
        <button className="button--icon" onClick={() => setShowSettings(true)} aria-label="Settings">
          ⚙
        </button>
      </header>

      <SearchBox onSearch={handleSearch} isSearching={isSearching} />

      {searchError && <p className="app__error">{searchError}</p>}

      {query && !isSearching && !searchError && (
        <RetailerStatus
          failedRetailers={failedRetailers}
          totalRetailers={retailers.length}
          lastChecked={lastChecked}
          cacheHit={cacheHit}
        />
      )}

      {results.length > 0 && (
        <>
          <ResultsTable results={results} query={query} />

          {!showManualForm && (
            <button className="button--secondary app__add-manual" onClick={() => setShowManualForm(true)}>
              + Add a price you found
            </button>
          )}

          {showManualForm && (
            <ManualPriceForm
              defaultProductName={query}
              onSave={handleSaveManualPrice}
              onCancel={() => setShowManualForm(false)}
            />
          )}

          <Disclaimer />
        </>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Settings
              retailers={retailers}
              onClose={() => setShowSettings(false)}
              onSettingsChanged={setSettings}
            />
          </div>
        </div>
      )}
    </div>
  );
}
