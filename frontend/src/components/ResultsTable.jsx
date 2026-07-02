import ProductCard from "./ProductCard.jsx";

export default function ResultsTable({ results, query }) {
  if (!results || results.length === 0) return null;

  // Results already arrive sorted (cheapest priced first) from the backend.
  // The cheapest badge goes on the first result that actually has a price.
  const cheapestIndex = results.findIndex((r) => typeof r.price === "number");

  return (
    <section className="results" aria-label={`Results for ${query}`}>
      <h2 className="results__heading">Results for “{query}”</h2>
      <ul className="results__list">
        {results.map((product, i) => (
          <ProductCard
            key={`${product.retailerId}-${i}`}
            product={product}
            isCheapest={i === cheapestIndex}
          />
        ))}
      </ul>
    </section>
  );
}
