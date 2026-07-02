const SOURCE_LABEL = {
  automated: "Live price",
  fallback: "Manual check needed",
  manual: "You entered this",
  error: "Couldn't check",
};

export default function ProductCard({ product, isCheapest }) {
  const hasPrice = typeof product.price === "number";

  return (
    <li className={`product-card${isCheapest ? " product-card--cheapest" : ""}`}>
      <div className="product-card__header">
        <span className="product-card__retailer">{product.retailer}</span>
        {isCheapest && <span className="product-card__badge">Cheapest</span>}
      </div>

      {product.productName && (
        <div className="product-card__name">{product.productName}</div>
      )}

      <div className="product-card__price">
        {hasPrice ? (
          <>
            <span className="product-card__price-value">${product.price.toFixed(2)}</span>
            {product.unitPrice && (
              <span className="product-card__unit-price">{product.unitPrice}</span>
            )}
          </>
        ) : (
          <span className="product-card__price-unknown">Price not available</span>
        )}
      </div>

      {product.size && <div className="product-card__size">{product.size}</div>}
      {product.availability && (
        <div className="product-card__availability">{product.availability}</div>
      )}

      <div className="product-card__meta">
        <span className={`product-card__source product-card__source--${product.source}`}>
          {SOURCE_LABEL[product.source] || product.source}
        </span>
        {product.lastChecked && (
          <span className="product-card__last-checked">
            {new Date(product.lastChecked).toLocaleString("en-AU", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {product.errorMessage && (
        <p className="product-card__error">{product.errorMessage}</p>
      )}

      <a
        className="product-card__link"
        href={product.productUrl || product.fallbackSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {product.source === "automated" ? "View on site" : `Search on ${product.retailer}`} →
      </a>
    </li>
  );
}
