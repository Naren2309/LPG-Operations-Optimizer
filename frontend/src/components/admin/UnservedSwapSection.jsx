import React from "react";

export const UnservedSwapSection = ({ unservedBundle, planId, onDecideSwap, loading }) => {
  if (!unservedBundle || (!unservedBundle.unserved?.length && !unservedBundle.resolutions?.length)) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body bg-light text-center py-4">
          <h5 className="text-success mb-0">🎉 All Fuel Stations Fully Served! No Unserved Fleet Constraints.</h5>
        </div>
      </div>
    );
  }

  const resolutions = unservedBundle.resolutions || [];

  return (
    <div className="card shadow-sm border-danger mb-4">
      <div className="card-header bg-danger text-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">⚠️ Unserved Station Resolution & Algorithmic Route Swap Suggestions</h5>
        <span className="badge bg-white text-danger font-weight-bold">
          {unservedBundle.unserved?.length || 0} Stations Unserved
        </span>
      </div>

      <div className="card-body">
        <p className="text-muted small">
          Fleet capacity was insufficient to serve all retail stations on standard runs. Below are automated algorithmic swap proposals (swapping out non-critical stops for unserved stations):
        </p>

        {!resolutions.length ? (
          <div className="alert alert-warning">No candidate route swap suggestions generated.</div>
        ) : (
          <div className="row g-3">
            {resolutions.map((res) => {
              const swap = res.swap_detail || {};
              const decision = res.decision || "PENDING";
              const isPending = decision === "PENDING";

              return (
                <div key={res.resolution_id} className="col-md-6">
                  <div className={`card border-${isPending ? "warning" : decision === "ACCEPTED" ? "success" : "secondary"} h-100`}>
                    <div className="card-header d-flex justify-content-between align-items-center bg-light">
                      <span className="fw-bold">Target Station: {res.station}</span>
                      <span className={`badge bg-${isPending ? "warning text-dark" : decision === "ACCEPTED" ? "success" : "danger"}`}>
                        {decision}
                      </span>
                    </div>

                    <div className="card-body">
                      <p className="mb-1"><strong>Required Fuel:</strong> {res.needed_lt?.toLocaleString()} L ({res.needed_mt} MT)</p>
                      <p className="mb-1"><strong>Required Window:</strong> <span className="badge bg-secondary">{res.when}</span></p>
                      
                      {swap.truck_id && (
                        <div className="p-2 my-2 bg-light border rounded small">
                          <p className="mb-1"><strong>Truck Run:</strong> {swap.truck_id}</p>
                          <p className="mb-1 text-danger">❌ Drop Non-Critical Stop: <strong>{swap.drop_station}</strong></p>
                          <p className="mb-0 text-success">➕ Add Unserved Stop: <strong>{res.station}</strong> ({res.needed_lt?.toLocaleString()} L)</p>
                        </div>
                      )}

                      <p className="small text-muted mb-3">{res.summary}</p>

                      {isPending && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm flex-fill"
                            disabled={loading}
                            onClick={() => onDecideSwap(planId, res.resolution_id, "ACCEPT")}
                          >
                            ✅ Accept & Apply Route Swap
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm flex-fill"
                            disabled={loading}
                            onClick={() => onDecideSwap(planId, res.resolution_id, "REJECT")}
                          >
                            ❌ Reject Suggestion
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
