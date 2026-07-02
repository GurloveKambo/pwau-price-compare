import { useEffect, useState } from "react";
import { getSettings, saveSettings, clearManualPrices } from "../services/storage.js";

export default function Settings({ retailers, onClose, onSettingsChanged }) {
  const [settings, setSettings] = useState(getSettings());
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    saveSettings(settings);
    onSettingsChanged?.(settings);
  }, [settings]);

  function toggleRetailer(id) {
    setSettings((prev) => {
      const isDisabled = prev.disabledRetailers.includes(id);
      const disabledRetailers = isDisabled
        ? prev.disabledRetailers.filter((r) => r !== id)
        : [...prev.disabledRetailers, id];
      return { ...prev, disabledRetailers };
    });
  }

  function handleClearManualPrices() {
    clearManualPrices();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  return (
    <div className="settings">
      <div className="settings__header">
        <h2>Settings</h2>
        <button className="button--secondary" onClick={onClose}>
          Close
        </button>
      </div>

      <label className="settings__field">
        Postcode
        <input
          value={settings.postcode}
          onChange={(e) => setSettings((prev) => ({ ...prev, postcode: e.target.value }))}
          placeholder="e.g. 7000"
          maxLength={4}
          inputMode="numeric"
        />
      </label>

      <fieldset className="settings__retailers">
        <legend>Retailers to include</legend>
        {retailers.map((r) => (
          <label key={r.id} className="settings__retailer-toggle">
            <input
              type="checkbox"
              checked={!settings.disabledRetailers.includes(r.id)}
              onChange={() => toggleRetailer(r.id)}
            />
            {r.name}
          </label>
        ))}
      </fieldset>

      <div className="settings__danger">
        <button className="button--secondary" onClick={handleClearManualPrices}>
          {cleared ? "Cleared ✓" : "Clear manual prices"}
        </button>
      </div>
    </div>
  );
}
