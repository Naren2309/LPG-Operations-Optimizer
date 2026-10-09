import React, { useState } from "react";
import { fetchMarketTerminalPrices } from "../../services/api";

export const MarketPriceSyncWidget = ({ onPricesUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSyncPrices = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetchMarketTerminalPrices();
      setResult(res.data.result);
      if (onPricesUpdated) onPricesUpdated();
    } catch (err) {
      alert("Failed to auto-sync market terminal prices: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-primary mb-4">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
        <span className="fw-bold">📈 Automation 2: Automated Ex-Terminal Fuel Rate Auto-Ingestion</span>
        <button
          className="btn btn-light btn-sm font-weight-bold"
          onClick={handleSyncPrices}
          disabled={loading}
        >
          {loading ? "Fetching Market Rates..." : "⚡ Sync Daily Ex-Terminal Market Rates"}
        </button>
      </div>

      {result && (
        <div className="card-body py-2 bg-light">
          <p className="mb-2 text-success small font-weight-bold">
            ✅ Automatically updated ex-terminal fuel rates for {result.updatedCount} supply terminals:
          </p>
          <div className="table-responsive">
            <table className="table table-sm table-striped mb-0 text-center small">
              <thead>
                <tr>
                  <th>Terminal ID</th>
                  <th>Terminal Name</th>
                  <th>Previous Price (₹/MT)</th>
                  <th>Updated Market Price (₹/MT)</th>
                  <th>Price Drift</th>
                </tr>
              </thead>
              <tbody>
                {result.sources.map((src) => (
                  <tr key={src.source_id}>
                    <td><strong>{src.source_id}</strong></td>
                    <td>{src.source_name}</td>
                    <td>₹{src.old_price?.toLocaleString()}</td>
                    <td className="text-primary fw-bold">₹{src.new_price?.toLocaleString()}</td>
                    <td className={src.change >= 0 ? "text-danger" : "text-success"}>
                      {src.change >= 0 ? `+₹${src.change}` : `-₹${Math.abs(src.change)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
