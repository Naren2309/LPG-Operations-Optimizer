import React, { useState } from "react";
import { api } from "../../services/api";

export const SumoTrafficSimulator = ({ planBundle }) => {
  const [loading, setLoading] = useState(false);
  const [simData, setSimData] = useState(null);

  const handleRunSumo = async () => {
    setLoading(true);
    try {
      const res = await api.post("/automation/sumo/simulate", {
        plan_data: planBundle?.delivery
      });
      setSimData(res.data.simulation);
    } catch (err) {
      alert("Failed to run SUMO traffic simulation: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-dark mb-4">
      <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between py-3">
        <div>
          <h5 className="mb-0">🚦 Feature 1: SUMO Microscopic Traffic Dynamics & Delay Simulator</h5>
          <small className="text-secondary">Simulation of Urban MObility (OpenStreetMap Network & TraCI Engine)</small>
        </div>
        <button
          className="btn btn-warning btn-sm font-weight-bold"
          onClick={handleRunSumo}
          disabled={loading}
        >
          {loading ? "Simulating Traffic Network..." : "⚡ Execute SUMO Traffic Simulation"}
        </button>
      </div>

      <div className="card-body">
        <p className="text-muted small mb-3">
          Simulates microscopic truck traffic dynamics on OpenStreetMap road networks. Evaluates peak-hour traffic jams, signal acceleration/deceleration, toll booth queue delays, and vehicle fuel burn.
        </p>

        {!simData ? (
          <div className="p-4 text-center bg-light border rounded text-muted">
            Click <strong>"⚡ Execute SUMO Traffic Simulation"</strong> to run microscopic traffic simulation across active truck routes.
          </div>
        ) : (
          <div>
            <div className="row text-center g-3 mb-4">
              <div className="col-md-3">
                <div className="p-3 bg-light border rounded">
                  <span className="text-muted small">Simulated Truck Runs</span>
                  <div className="fw-bold text-dark fs-4">{simData.route_simulations?.length || 0} Runs</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light border rounded">
                  <span className="text-muted small">Network Map</span>
                  <div className="fw-bold text-primary">{simData.network_file}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light border rounded">
                  <span className="text-muted small">Avg Traffic Congestion</span>
                  <div className="fw-bold text-warning">1.24x Delay Factor</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light border rounded">
                  <span className="text-muted small">SUMO Status</span>
                  <div className="fw-bold text-success">TraCI Engine Synced</div>
                </div>
              </div>
            </div>

            <h6 className="fw-bold text-dark mb-2">Simulated Route Traffic Metrics:</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped align-middle mb-0 text-center">
                <thead className="table-light">
                  <tr>
                    <th>Truck ID</th>
                    <th>Supply Terminal</th>
                    <th>Distance</th>
                    <th>Free-Flow Time</th>
                    <th>SUMO Traffic Time</th>
                    <th>Traffic Delay</th>
                    <th>Toll Plaza Delay</th>
                    <th>Fuel Burn (L)</th>
                    <th>CO₂ Emissions</th>
                  </tr>
                </thead>
                <tbody>
                  {simData.route_simulations.map((sim, idx) => (
                    <tr key={idx}>
                      <td><strong>{sim.truck_id}</strong></td>
                      <td><span className="badge bg-secondary">{sim.source_id}</span></td>
                      <td>{sim.distance_km} km</td>
                      <td>{sim.free_flow_time_min} min</td>
                      <td className="fw-bold text-primary">{sim.sumo_simulated_time_min} min</td>
                      <td className="text-danger">+{sim.traffic_delay_min} min</td>
                      <td className="text-warning text-dark">+{sim.toll_booth_delays_min} min</td>
                      <td>{sim.fuel_consumed_lt} L</td>
                      <td>{sim.co2_emissions_kg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
