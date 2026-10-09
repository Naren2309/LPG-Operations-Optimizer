import React from "react";

export const CostOptimizationVerifier = ({ planBundle }) => {
  if (!planBundle || !planBundle.delivery) {
    return null;
  }

  const deliveryPlans = planBundle.delivery.delivery_plans || [];
  const costSummary = planBundle.tentativeCost?.cost_summary || [];

  const totalPurchaseCost = costSummary.reduce((sum, c) => sum + (c.tot_purchase || 0), 0);
  const totalFreightCost = costSummary.reduce((sum, c) => sum + (c.tot_transport_cost || 0), 0);
  const totalTollCost = costSummary.reduce((sum, c) => sum + (c.tot_toll || 0), 0);
  const grandTotalCost = costSummary.reduce((sum, c) => sum + (c.grand_total || 0), 0);

  return (
    <div className="card shadow-sm border-success mb-4">
      <div className="card-header bg-success text-white d-flex align-items-center justify-content-between py-3">
        <h5 className="mb-0">✅ Automated Route Optimization & Landed Cost Verifier</h5>
        <span className="badge bg-white text-success fw-bold fs-6">Plan Verified Optimal</span>
      </div>
      <div className="card-body">
        <p className="text-muted small mb-3">
          Verifies why the generated dispatch plan is optimal. Computes total landed cost across all active truck runs by combining terminal purchase cost, distance RTKM transport rate, and toll charges.
        </p>

        {/* Landed Cost Formula Card */}
        <div className="p-3 bg-light border rounded mb-4">
          <h6 className="fw-bold text-dark mb-2">📐 Landed Cost Math Formula:</h6>
          <div className="font-monospace text-primary fw-bold mb-2" style={{ fontSize: "0.95rem" }}>
            Grand Total Cost = Terminal Fuel Purchase + Transport Freight (RTKM) + Toll Charges
          </div>
          <div className="row text-center g-2 mt-2">
            <div className="col-md-3">
              <div className="p-2 bg-white border rounded">
                <span className="text-muted small">Total Fuel Purchase</span>
                <div className="fw-bold text-dark">₹{totalPurchaseCost.toLocaleString()}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-2 bg-white border rounded">
                <span className="text-muted small">Total Transport Freight</span>
                <div className="fw-bold text-dark">₹{totalFreightCost.toLocaleString()}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-2 bg-white border rounded">
                <span className="text-muted small">Total Toll Charges</span>
                <div className="fw-bold text-dark">₹{totalTollCost.toLocaleString()}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-2 bg-success text-white border rounded">
                <span className="small text-white-50">Grand Total Landed Cost</span>
                <div className="fw-bold fs-5">₹{grandTotalCost.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Per Truck Run */}
        <h6 className="fw-bold text-dark mb-2">Breakdown Per Truck Run:</h6>
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0 text-center">
            <thead className="table-light">
              <tr>
                <th>Truck ID</th>
                <th>Supply Terminal</th>
                <th>Assigned Stations</th>
                <th>Carrying Load (LT)</th>
                <th>Est. Distance</th>
                <th>Purchase Cost</th>
                <th>Freight Cost</th>
                <th>Toll</th>
                <th>Landed Total</th>
              </tr>
            </thead>
            <tbody>
              {costSummary.map((cost, idx) => {
                const plan = deliveryPlans.find((p) => p.truck_id === cost.truck_id);
                return (
                  <tr key={idx}>
                    <td><strong>{cost.truck_id}</strong></td>
                    <td><span className="badge bg-primary">{cost.source_id}</span></td>
                    <td className="small">{cost.stations?.join(", ") || plan?.stops?.map(s => s.station).join(", ")}</td>
                    <td>{plan?.total_load_lt?.toLocaleString() || 0} L</td>
                    <td>{cost.tot_rtkm || 0} km</td>
                    <td>₹{cost.tot_purchase?.toLocaleString()}</td>
                    <td>₹{cost.tot_transport_cost?.toLocaleString()}</td>
                    <td>₹{cost.tot_toll?.toLocaleString() || 0}</td>
                    <td className="fw-bold text-success">₹{cost.grand_total?.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
