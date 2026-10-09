import React, { useState } from "react";
import { sendIotTelemetry } from "../../services/api";

export const IotTelemetrySimulator = ({ stations = [], onTelemetrySent }) => {
  const [selectedStation, setSelectedStation] = useState(stations[0]?.station || "");
  const [deadStock, setDeadStock] = useState("");
  const [usableLt, setUsableLt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [temp, setTemp] = useState("31.5");
  const [pressure, setPressure] = useState("8.4");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleStationChange = (e) => {
    const stName = e.target.value;
    setSelectedStation(stName);
    const match = stations.find((s) => s.station === stName);
    if (match) {
      setCapacity(match.capacity_in_lt || "");
      setDeadStock(match.dead_stock_in_lt || "");
      setUsableLt(match.usable_lt || "");
    }
  };

  const handleTransmit = async (e) => {
    e.preventDefault();
    if (!selectedStation) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await sendIotTelemetry({
        station_name: selectedStation,
        capacity_in_lt: capacity ? Number(capacity) : undefined,
        dead_stock_in_lt: deadStock ? Number(deadStock) : undefined,
        usable_lt: usableLt ? Number(usableLt) : undefined,
        temperature: Number(temp),
        pressure: Number(pressure)
      });

      setMessage({ type: "success", text: res.data.message || "IoT Telemetry ingested successfully!" });
      if (onTelemetrySent) onTelemetrySent();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to transmit IoT telemetry." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">📡 Automation 1: IoT Automatic Tank Gauge (ATG) Telemetry Simulator</h5>
        <span className="badge bg-info text-dark">Real-Time Sensor Ingestion</span>
      </div>
      <div className="card-body">
        <p className="text-muted small">
          Simulates live automatic tank gauge sensor data transmitted directly from retail stations into the optimization backend without manual operator input.
        </p>

        {message && (
          <div className={`alert alert-${message.type === "success" ? "success" : "danger"} py-2`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleTransmit} className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-bold">Select Tank Sensor</label>
            <select
              className="form-select"
              value={selectedStation}
              onChange={handleStationChange}
              required
            >
              <option value="">-- Choose Station Tank --</option>
              {stations.map((s) => (
                <option key={s._id || s.station} value={s.station}>
                  {s.station} (Cap: {s.capacity_in_lt?.toLocaleString()} L)
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Tank Capacity (L)</label>
            <input
              type="number"
              className="form-control"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Capacity"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Dead Stock (L)</label>
            <input
              type="number"
              className="form-control"
              value={deadStock}
              onChange={(e) => setDeadStock(e.target.value)}
              placeholder="Dead Stock"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Usable Stock (L)</label>
            <input
              type="number"
              className="form-control"
              value={usableLt}
              onChange={(e) => setUsableLt(e.target.value)}
              placeholder="Usable"
            />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Transmitting..." : "⚡ Transmit IoT Telemetry Signal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
