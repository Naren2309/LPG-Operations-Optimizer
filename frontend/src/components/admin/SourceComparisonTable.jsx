import React from "react";

export const SourceComparisonTable = ({ sourceComparison = [] }) => {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🏭 Supply Terminal Price Ranking & Landed Cost Analysis</h5>
        <span className="badge bg-info text-dark">Ex-Terminal Fuel Rates</span>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0 text-center">
            <thead className="table-light">
              <tr>
                <th>Rank</th>
                <th>Terminal ID</th>
                <th>Terminal Name</th>
                <th>Ex-Terminal Price (₹/MT)</th>
                <th>vs. Cheapest Terminal</th>
                <th>Recommendation</th>
                <th>Scheduled Runs</th>
              </tr>
            </thead>
            <tbody>
              {sourceComparison.map((src, index) => (
                <tr key={src.source_id || index}>
                  <td><strong>#{src.rank || index + 1}</strong></td>
                  <td><strong>{src.source_id}</strong></td>
                  <td>{src.source_name}</td>
                  <td className="fw-bold text-primary">₹{src.price_per_mt?.toLocaleString()}</td>
                  <td className={src.vs_cheapest_per_mt > 0 ? "text-danger" : "text-success fw-bold"}>
                    {src.vs_cheapest_per_mt === 0 ? "Cheapest" : `+₹${src.vs_cheapest_per_mt?.toLocaleString()}`}
                  </td>
                  <td>
                    <span className={`badge bg-${index === 0 ? "success" : index <= 2 ? "info text-dark" : "warning text-dark"}`}>
                      {src.recommendation || (index === 0 ? "Cheapest Preferred" : "Competitive")}
                    </span>
                  </td>
                  <td>{src.runs || 0} runs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
