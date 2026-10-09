import React, { useState } from "react";
import { api } from "../../services/api";

export const FleetTable = ({ trucks = [], onTrucksUpdated }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTruckId, setNewTruckId] = useState("");
  const [newType, setNewType] = useState("12MT");
  const [loading, setLoading] = useState(false);

  const handleCreateTruck = async (e) => {
    e.preventDefault();
    if (!newTruckId) return;
    setLoading(true);

    try {
      await api.post("/trucks", {
        truck_id: newTruckId,
        type: newType,
        state: "travelling"
      });

      alert(`✅ Truck ${newTruckId} created successfully!`);
      setNewTruckId("");
      setShowAddModal(false);
      if (onTrucksUpdated) onTrucksUpdated();
    } catch (err) {
      alert("Failed to create truck: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTruck = async (id, truckId) => {
    if (!window.confirm(`Are you sure you want to delete truck ${truckId}?`)) return;
    try {
      await api.delete(`/trucks/${id}`);
      if (onTrucksUpdated) onTrucksUpdated();
    } catch (err) {
      alert("Failed to delete truck: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0">🚛 Fleet Status & Operational Tracking</h5>
          <span className="badge bg-primary">{trucks.length} Trucks Deployed</span>
        </div>
        <button className="btn btn-success btn-sm fw-bold" onClick={() => setShowAddModal(!showAddModal)}>
          {showAddModal ? "✖ Close Form" : "➕ Add New Truck to Fleet"}
        </button>
      </div>

      {showAddModal && (
        <div className="card-body bg-light border-bottom p-3">
          <h6 className="fw-bold mb-2">Create New Truck Entry:</h6>
          <form onSubmit={handleCreateTruck} className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Truck ID (e.g. TRK-131)"
                value={newTruckId}
                onChange={(e) => setNewTruckId(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="12MT">12MT (21,720 Liters)</option>
                <option value="7MT">7MT (12,670 Liters)</option>
              </select>
            </div>
            <div className="col-md-4">
              <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
                {loading ? "Adding Truck..." : "💾 Save Truck"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead className="table-light">
              <tr>
                <th>Truck ID</th>
                <th>Capacity Type</th>
                <th>Current State</th>
                <th>Onboard Fuel</th>
                <th>Assigned Station</th>
                <th>Assigned Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trucks.map((truck) => (
                <tr key={truck._id || truck.truck_id}>
                  <td><strong>{truck.truck_id}</strong></td>
                  <td><span className="badge bg-secondary">{truck.type}</span></td>
                  <td>
                    <span className={`badge bg-${truck.state === "atSource" ? "primary" : truck.state === "atStation" ? "success" : "warning text-dark"}`}>
                      {truck.state || "travelling"}
                    </span>
                  </td>
                  <td>{truck.current_fuel_lt ? `${truck.current_fuel_lt.toLocaleString()} L` : "Full"}</td>
                  <td>{truck.station || "-"}</td>
                  <td>{truck.source || "-"}</td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm py-0 px-2"
                      onClick={() => handleDeleteTruck(truck._id, truck.truck_id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
