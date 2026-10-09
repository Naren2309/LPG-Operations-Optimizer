import React, { useState } from "react";

export const StationsDirectoryModal = ({ stations = [], sources = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState("stations");
  const [search, setSearch] = useState("");

  const filteredStations = stations.filter((s) =>
    s.station.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSources = sources.filter((src) =>
    (src.source_name || src.source_id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0">⛽ Stations & Source Terminals Directory</h5>
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${activeSubTab === "stations" ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => setActiveSubTab("stations")}
            >
              Stations ({stations.length})
            </button>
            <button
              className={`btn ${activeSubTab === "sources" ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => setActiveSubTab("sources")}
            >
              Terminals ({sources.length})
            </button>
          </div>
        </div>

        <input
          type="text"
          className="form-control form-control-sm"
          style={{ width: "240px" }}
          placeholder="🔍 Search name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card-body p-0">
        {activeSubTab === "stations" ? (
          <div className="table-responsive" style={{ maxHeight: "360px", overflowY: "auto" }}>
            <table className="table table-hover align-middle mb-0 text-center">
              <thead className="table-light sticky-top">
                <tr>
                  <th>#</th>
                  <th>Station Name</th>
                  <th>Tank Capacity (L)</th>
                  <th>Dead Stock (L)</th>
                  <th>Usable Stock (L)</th>
                  <th>Fuel Status</th>
                  <th>Coordinates (Lat, Lng)</th>
                </tr>
              </thead>
              <tbody>
                {filteredStations.map((s, idx) => (
                  <tr key={s._id || s.station}>
                    <td>{idx + 1}</td>
                    <td><strong>{s.station}</strong></td>
                    <td>{s.capacity_in_lt?.toLocaleString()} L</td>
                    <td className="text-danger">{s.dead_stock_in_lt?.toLocaleString()} L</td>
                    <td className="text-success">{s.usable_lt?.toLocaleString()} L</td>
                    <td>
                      <span className={`badge bg-${s.sufficient_fuel === "YES" ? "success" : "danger"}`}>
                        {s.sufficient_fuel === "YES" ? "Sufficient" : "REPLENISHMENT REQ"}
                      </span>
                    </td>
                    <td className="small text-muted">{s.coordinates?.lat}, {s.coordinates?.lng}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "360px", overflowY: "auto" }}>
            <table className="table table-hover align-middle mb-0 text-center">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Terminal ID</th>
                  <th>Terminal Name</th>
                  <th>Ex-Terminal Rate (₹/MT)</th>
                  <th>Coordinates (Lat, Lng)</th>
                  <th>Location Map Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map((src) => (
                  <tr key={src.source_id}>
                    <td><strong>{src.source_id}</strong></td>
                    <td>{src.source_name}</td>
                    <td className="fw-bold text-primary">₹{src.price_per_mt_ex_terminal?.toLocaleString()}</td>
                    <td className="small text-muted">{src.coordinates?.lat}, {src.coordinates?.lng}</td>
                    <td>
                      <a
                        href={`https://www.google.com/maps?q=${src.coordinates?.lat},${src.coordinates?.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm py-0"
                      >
                        📍 View Map
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
