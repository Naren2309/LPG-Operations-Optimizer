import React from "react";

export const DispatchManifestPrinter = ({ planBundle }) => {
  if (!planBundle || !planBundle.delivery) {
    return null;
  }

  const deliveryPlans = planBundle.delivery.delivery_plans || [];
  const costSummary = planBundle.tentativeCost?.cost_summary || [];

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ["Truck ID", "Truck Type", "Terminal ID", "Stops Sequence", "Total Load (LT)", "Total Load (MT)", "Transport Cost (INR)", "Purchase Cost (INR)", "Landed Total (INR)"];
    const rows = deliveryPlans.map((plan) => {
      const cost = costSummary.find((c) => c.truck_id === plan.truck_id) || {};
      return [
        plan.truck_id,
        plan.truck_type,
        plan.source_id,
        `"${plan.stops?.map(s => s.station).join(" -> ")}"`,
        plan.total_load_lt,
        plan.total_mt,
        cost.tot_transport_cost || 0,
        cost.tot_purchase || 0,
        cost.grand_total || 0
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KR_Fuels_Dispatch_Manifest_${planBundle.plan_id?.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card shadow-sm border-primary mb-4">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between py-3">
        <div>
          <h5 className="mb-0">📄 Feature 5: Formal Dispatch Manifest & Invoice Exporter</h5>
          <small className="text-light">Generate Printable Manifest PDFs & CSV/Excel Audit Reports for Project Viva</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light btn-sm fw-bold" onClick={handlePrintPdf}>
            🖨️ Export / Print PDF Manifest
          </button>
          <button className="btn btn-outline-light btn-sm fw-bold" onClick={handleExportCsv}>
            📊 Download CSV / Excel Report
          </button>
        </div>
      </div>

      <div className="card-body p-4" id="printable-manifest">
        <div className="border p-4 bg-white rounded shadow-sm">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <div>
              <h3 className="fw-bold text-dark mb-0">KR FUELS OPERATIONS PORTAL</h3>
              <p className="text-muted mb-0 small">Official LPG Supply Chain Dispatch Manifest & Delivery Invoice</p>
            </div>
            <div className="text-end">
              <span className="badge bg-dark fs-6 font-monospace">PLAN ID: {planBundle.plan_id}</span>
              <div className="text-muted small mt-1">Generated Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Runs Summary */}
          <h5 className="fw-bold text-dark mb-3">Scheduled Truck Runs ({deliveryPlans.length} Deployed):</h5>
          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle text-center small">
              <thead className="table-dark">
                <tr>
                  <th>Truck ID</th>
                  <th>Type</th>
                  <th>Supply Terminal</th>
                  <th>Delivery Stops</th>
                  <th>Load (Liters)</th>
                  <th>Transport Cost</th>
                  <th>Purchase Cost</th>
                  <th>Landed Total</th>
                </tr>
              </thead>
              <tbody>
                {deliveryPlans.map((plan, idx) => {
                  const cost = costSummary.find((c) => c.truck_id === plan.truck_id) || {};
                  return (
                    <tr key={idx}>
                      <td><strong>{plan.truck_id}</strong></td>
                      <td>{plan.truck_type}</td>
                      <td>{plan.source_id}</td>
                      <td>{plan.stops?.map(s => s.station).join(" ➔ ")}</td>
                      <td>{plan.total_load_lt?.toLocaleString()} L</td>
                      <td>₹{cost.tot_transport_cost?.toLocaleString() || 0}</td>
                      <td>₹{cost.tot_purchase?.toLocaleString() || 0}</td>
                      <td className="fw-bold text-success">₹{cost.grand_total?.toLocaleString() || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Driver Sign-off Block */}
          <div className="row pt-4 border-top">
            <div className="col-4 text-center">
              <div className="border-bottom pb-4 mb-1"></div>
              <span className="small text-muted fw-bold">Dispatcher Signature</span>
            </div>
            <div className="col-4 text-center">
              <div className="border-bottom pb-4 mb-1"></div>
              <span className="small text-muted fw-bold">Fleet Manager Approval</span>
            </div>
            <div className="col-4 text-center">
              <div className="border-bottom pb-4 mb-1"></div>
              <span className="small text-muted fw-bold">Driver Acknowledgment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
