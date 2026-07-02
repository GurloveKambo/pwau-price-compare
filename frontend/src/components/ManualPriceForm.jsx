import { useState } from "react";

const EMPTY_FORM = {
  productName: "",
  retailer: "",
  price: "",
  size: "",
  productUrl: "",
  notes: "",
};

export default function ManualPriceForm({ defaultProductName, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, productName: defaultProductName || "" });
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.productName.trim() || !form.retailer.trim()) {
      setError("Product name and retailer are required.");
      return;
    }

    const priceNumber = parseFloat(form.price);
    if (form.price && (Number.isNaN(priceNumber) || priceNumber < 0)) {
      setError("Price must be a positive number.");
      return;
    }

    onSave({
      productName: form.productName.trim(),
      retailer: form.retailer.trim(),
      price: form.price ? priceNumber : null,
      size: form.size.trim() || null,
      productUrl: form.productUrl.trim() || null,
      notes: form.notes.trim() || null,
    });
  }

  return (
    <form className="manual-price-form" onSubmit={handleSubmit}>
      <h3>Add a price you found</h3>

      <label>
        Product name
        <input
          value={form.productName}
          onChange={(e) => update("productName", e.target.value)}
          required
        />
      </label>

      <label>
        Retailer
        <input
          value={form.retailer}
          onChange={(e) => update("retailer", e.target.value)}
          placeholder="e.g. Local pharmacy"
          required
        />
      </label>

      <label>
        Price ($)
        <input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
        />
      </label>

      <label>
        Size
        <input
          value={form.size}
          onChange={(e) => update("size", e.target.value)}
          placeholder="e.g. 500g"
        />
      </label>

      <label>
        Product link
        <input
          type="url"
          value={form.productUrl}
          onChange={(e) => update("productUrl", e.target.value)}
          placeholder="https://…"
        />
      </label>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
        />
      </label>

      {error && <p className="manual-price-form__error">{error}</p>}

      <div className="manual-price-form__actions">
        <button type="button" className="button--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit">Save price</button>
      </div>
    </form>
  );
}
