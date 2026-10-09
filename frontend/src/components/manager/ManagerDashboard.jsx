import React, { useEffect, useState } from "react";
import { fetchManagerOverview, updateManagerStationStock } from "../../services/api";
import { IotTelemetrySimulator } from "../iot/IotTelemetrySimulator";

export const ManagerDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deadStock, setDeadStock] = useState("");
  const [usableLt, setUsableLt] = useState("");
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetchManagerOverview();
      setOverview(res.data);
      if (res.data.station) {
        setDeadStock(res.data.station.dead_stock_in_lt ?? "");
        setUsableLt(res.data.station.usable_lt ?? "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await updateManagerStationStock({
        dead_stock_in_lt: deadStock ? Number(deadStock) : null,
        usable_lt: usableLt ? Number(usableLt) : null
      });

      setMessage({ type: "success", text: "Station stock levels updated successfully!" });
      setOverview((prev) => ({ ...prev, station: res.data.station }));
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update stock." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading Station Manager Overview...</div>;
  }

  const station = overview?.station;

  return (
    <div className="container-fluid p-3">
      {/* IoT Telemetry Simulation Panel */}
      <IotTelemetrySimulator
        stations={station ? [station] : []}
        onTelemetrySent={loadOverview}
      />

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">⛽ Station Manager Portal - {station?.station || "Assigned Station"}</h4>
          <span className={`badge bg-${station?.sufficient_fuel === "YES" ? "success" : "danger"} fs-6`}>
            Fuel Status: {station?.sufficient_fuel === "YES" ? "Sufficient Fuel" : "LOW FUEL - REPLENISHMENT REQUIRED"}
          </span>
        </div>

        <div className="card-body">
          {message && (
            <div className={`alert alert-${message.type === "success" ? "success" : "danger"}`}>
              {message.text}
            </div>
          )}

          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="p-3 bg-light border rounded">
                <span className="text-muted small">Total Capacity</span>
                <h3 className="fw-bold text-primary mb-0">{station?.capacity_in_lt?.toLocaleString()} L</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light border rounded">
                <span className="text-muted small">Dead Stock</span>
                <h3 className="fw-bold text-danger mb-0">{station?.dead_stock_in_lt?.toLocaleString()} L</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light border rounded">
                <span className="text-muted small">Usable Fuel Stock</span>
                <h3 className="fw-bold text-success mb-0">{station?.usable_lt?.toLocaleString()} L</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light border rounded">
                <span className="text-muted small">Current Assigned Trucks</span>
                <h3 className="fw-bold text-dark mb-0">{overview?.trucks?.length || 0} Trucks</h3>
              </div>
            </div>
          </div>

          <div className="card border">
            <div className="card-header bg-light fw-bold">Manual Station Stock Update Form</div>
            <div className="card-body">
              <form onSubmit={handleStockSubmit} className="row g-3">
                <div className="col-md-5">
                  <label className="form-label">Dead Stock (Liters)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={deadStock}
                    onChange={(e) => setDeadStock(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Usable Stock (Liters)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={usableLt}
                    onChange={(e) => setUsableLt(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-success w-100" disabled={submitting}>
                    {submitting ? "Saving..." : "💾 Update Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
