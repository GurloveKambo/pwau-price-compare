import { useState } from "react";

export default function SearchBox({ onSearch, isSearching }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  }

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <input
        type="search"
        inputMode="search"
        placeholder="Search a product, e.g. milk 2L"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search for a product"
        autoComplete="off"
      />
      <button type="submit" disabled={isSearching || !query.trim()}>
        {isSearching ? "Searching…" : "Compare prices"}
      </button>
    </form>
  );
}
