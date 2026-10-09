import React from "react";

const buildDirectionsUrl = (sourceId, stops = []) => {
  if (!stops.length) return "#";
  const stopNames = stops.map((s) => s.station).join("/");
  return `https://www.google.com/maps/dir/${encodeURIComponent(sourceId)}/${stopNames.split("/").map(encodeURIComponent).join("/")}`;
};

export const RoutePlanCard = ({ planBundle }) => {
  if (!planBundle || !planBundle.delivery) {
    return (
      <div className="card shadow-sm border-0 mb-4 p-4 text-center text-muted">
        No computed route plan available. Click "Generate Automated Route Plan" to run optimization.
      </div>
    );
  }

  const deliveryPlans = planBundle.delivery.delivery_plans || [];
  const costSummary = planBundle.tentativeCost?.cost_summary || [];

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🛣️ Automated Route Dispatch Plan (Plan ID: {planBundle.plan_id?.slice(0, 8)})</h5>
        <span className="badge bg-success">{deliveryPlans.length} Truck Runs Scheduled</span>
      </div>

      <div className="card-body">
        <div className="row g-3">
          {deliveryPlans.map((run, idx) => {
            const costRow = costSummary.find((c) => c.truck_id === run.truck_id);
            const mapUrl = buildDirectionsUrl(run.source_id, run.stops);

            return (
              <div key={idx} className="col-12 col-xl-6">
                <div className="card h-100 border">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">🚛 Truck: {run.truck_id} ({run.truck_type})</span>
                    <span className="badge bg-dark">Supply Terminal: {run.source_id}</span>
                  </div>

                  <div className="card-body">
                    <div className="row mb-2 small">
                      <div className="col-6"><strong>Total Load:</strong> {run.total_load_lt?.toLocaleString()} L ({run.total_mt} MT)</div>
                      <div className="col-6 text-end"><strong>Est. Distance:</strong> {run.total_distance_km || costRow?.tot_rtkm || 0} km</div>
                    </div>

                    <h6 className="fw-bold text-muted border-bottom pb-1 small">Stops & Sequence:</h6>
                    <ul className="list-group list-group-flush mb-3 small">
                      {run.stops?.map((stop, sIdx) => (
                        <li key={sIdx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-1">
                          <span>📍 Stop {sIdx + 1}: <strong>{stop.station}</strong></span>
                          <span className="badge bg-info text-dark">{stop.needed_lt?.toLocaleString()} L</span>
                        </li>
                      ))}
                    </ul>

                    {costRow && (
                      <div className="p-2 bg-light border rounded small mb-2">
                        <div className="d-flex justify-content-between">
                          <span>Purchase Cost: ₹{costRow.tot_purchase?.toLocaleString()}</span>
                          <span>Transport: ₹{costRow.tot_transport_cost?.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold text-primary mt-1">
                          <span>Total Landed Cost:</span>
                          <span>₹{costRow.grand_total?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-end">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        🗺️ Open Google Maps Route
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
