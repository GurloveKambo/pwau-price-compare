export default function RetailerStatus({ failedRetailers, totalRetailers, lastChecked, cacheHit }) {
  if (!totalRetailers) return null;

  const checkedCount = totalRetailers - (failedRetailers?.length || 0);

  return (
    <div className="retailer-status">
      <span>
        Checked {checkedCount} of {totalRetailers} retailers
      </span>
      {cacheHit && <span className="retailer-status__cached">· from cache</span>}
      {lastChecked && (
        <span className="retailer-status__time">
          · as of {new Date(lastChecked).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
      {failedRetailers?.length > 0 && (
        <p className="retailer-status__failed">
          Couldn't check: {failedRetailers.join(", ")}
        </p>
      )}
    </div>
  );
}
