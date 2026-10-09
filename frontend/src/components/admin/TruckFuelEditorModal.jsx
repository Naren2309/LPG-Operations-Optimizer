import React, { useState } from "react";
import { api } from "../../services/api";

export const TruckFuelEditorModal = ({ trucks = [], stations = [], sources = [], onTrucksUpdated }) => {
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [currentFuel, setCurrentFuel] = useState("");
  const [state, setState] = useState("atSource");
  const [stationName, setStationName] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSelectTruck = (e) => {
    const trId = e.target.value;
    setSelectedTruckId(trId);
    const match = trucks.find((t) => t._id === trId || t.truck_id === trId);
    if (match) {
      setCurrentFuel(match.current_fuel_lt ?? (match.type === "12MT" ? 21720 : 12670));
      setState(match.state || "atSource");
      setStationName(match.station || "");
      setSourceName(match.source || "");
    }
  };

  const handleSaveTruck = async (e) => {
    e.preventDefault();
    if (!selectedTruckId) return;
    setLoading(true);
    setMessage(null);

    const match = trucks.find((t) => t._id === selectedTruckId || t.truck_id === selectedTruckId);
    if (!match) return;

    try {
      await api.patch(`/trucks/${match._id}`, {
        truck_id: match.truck_id,
        type: match.type,
        current_fuel_lt: Number(currentFuel),
        station: state === "atStation" ? stationName : "",
        source: state === "atSource" ? sourceName : "",
        state
      });

      setMessage({ type: "success", text: `Truck ${match.truck_id} updated successfully!` });
      if (onTrucksUpdated) onTrucksUpdated();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update truck." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">🚚 Scalable Truck Fleet & Fuel Level Manager</h5>
        <span className="badge bg-warning text-dark">Live Fleet Inventory</span>
      </div>
      <div className="card-body">
        <p className="text-muted small">
          Allows Admin dispatchers to dynamically manage current fuel onboard, operational state, and position for each 12MT / 7MT truck in the fleet.
        </p>

        {message && (
          <div className={`alert alert-${message.type === "success" ? "success" : "danger"} py-2`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveTruck} className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-bold">Select Truck</label>
            <select
              className="form-select"
              value={selectedTruckId}
              onChange={handleSelectTruck}
              required
            >
              <option value="">-- Choose Truck --</option>
              {trucks.map((t) => (
                <option key={t._id || t.truck_id} value={t._id || t.truck_id}>
                  {t.truck_id} ({t.type}) - Fuel: {t.current_fuel_lt?.toLocaleString() || 0} L
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Current Fuel (L)</label>
            <input
              type="number"
              className="form-control"
              value={currentFuel}
              onChange={(e) => setCurrentFuel(e.target.value)}
              placeholder="Fuel in Liters"
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Operational State</label>
            <select
              className="form-select"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="atSource">At Source Terminal</option>
              <option value="atStation">At Retail Station</option>
              <option value="travelling">Travelling / En Route</option>
              <option value="atMaintenance">At Maintenance</option>
            </select>
          </div>

          {state === "atStation" ? (
            <div className="col-md-2">
              <label className="form-label">Station Name</label>
              <select className="form-select" value={stationName} onChange={(e) => setStationName(e.target.value)}>
                <option value="">Select Station</option>
                {stations.map((s) => (
                  <option key={s.station} value={s.station}>{s.station}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="col-md-2">
              <label className="form-label">Source Terminal</label>
              <select className="form-select" value={sourceName} onChange={(e) => setSourceName(e.target.value)}>
                <option value="">Select Terminal</option>
                {sources.map((src) => (
                  <option key={src.source_id} value={src.source_name || src.source_id}>{src.source_name || src.source_id}</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Saving..." : "💾 Update Truck"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
