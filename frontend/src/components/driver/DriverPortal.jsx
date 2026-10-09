import React, { useEffect, useState } from "react";
import { fetchDriverRoutes, updateDriverTruckStatus } from "../../services/api";

export const DriverPortal = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadDriverData = async () => {
    setLoading(true);
    try {
      const res = await fetchDriverRoutes();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  const handleStatusUpdate = async (truckId, newStatus) => {
    setUpdatingId(truckId);
    try {
      await updateDriverTruckStatus(truckId, { status: newStatus });
      await loadDriverData();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading Driver Dispatch Data...</div>;
  }

  const trucks = data?.trucks || [];
  const activePlans = data?.delivery_plans || [];

  return (
    <div className="container-fluid p-3">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-success text-white d-flex align-items-center justify-content-between">
          <h4 className="mb-0">🚛 Automation 3: Driver Dispatch Portal & Real-Time Delivery Tracker</h4>
          <button className="btn btn-light btn-sm" onClick={loadDriverData}>🔄 Refresh Active Dispatch Routes</button>
        </div>
        <div className="card-body">
          <p className="text-muted">
            Allows drivers and field operators to update truck state step-by-step in real-time, syncing transit progress automatically across the central optimization platform.
          </p>

          {!trucks.length ? (
            <div className="alert alert-info">No active trucks registered in fleet.</div>
          ) : (
            <div className="row g-3">
              {trucks.map((truck) => {
                const plan = activePlans.find((p) => p.truck_id === truck.truck_id);
                const isUpdating = updatingId === truck._id;

                return (
                  <div key={truck._id || truck.truck_id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border shadow-sm">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5 text-primary">🚛 Truck: {truck.truck_id}</span>
                        <span className="badge bg-secondary">{truck.type}</span>
                      </div>
                      <div className="card-body">
                        <p className="mb-1"><strong>Current State:</strong> <span className="badge bg-warning text-dark">{truck.state || "travelling"}</span></p>
                        <p className="mb-1"><strong>Assigned Route:</strong> {plan ? `${plan.source_id} ➔ ${plan.stops?.map(s => s.station).join(" ➔ ") || "Destination"}` : "No Active Route Assigned"}</p>
                        <p className="mb-3 text-muted small">
                          <strong>Location:</strong> {truck.station ? `At Station ${truck.station}` : truck.source ? `At Source Terminal ${truck.source}` : "In Transit"}
                        </p>

                        <div className="d-grid gap-2">
                          <label className="fw-bold small text-muted">Update Real-Time Operational State:</label>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(truck._id, "atSource")}
                          >
                            📍 Arrived at Source Terminal
                          </button>
                          <button
                            className="btn btn-outline-warning btn-sm text-dark"
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(truck._id, "travelling")}
                          >
                            🚚 Departed / En Route to Station
                          </button>
                          <button
                            className="btn btn-outline-success btn-sm"
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(truck._id, "atStation")}
                          >
                            ✅ Arrived at Retail Station / Fuel Delivered
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
