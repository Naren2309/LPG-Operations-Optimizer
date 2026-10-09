import React from "react";
import logoUrl from "../../../assets/Logo.avif";

export const Navbar = ({ auth, onLogout, activeTab, setActiveTab, isAutoRefresh, setIsAutoRefresh, onRefresh, loading }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-2">
      <div className="container-fluid px-3">
        <a className="navbar-brand d-flex align-items-center gap-2" href="#" onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}>
          <img src={logoUrl} alt="KR Fuels Logo" width="40" height="40" className="rounded bg-white p-1" />
          <div>
            <div className="fw-bold fs-5 text-white leading-tight">KR FUELS</div>
            <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>LPG Operations Optimization Platform</div>
          </div>
        </a>

        {auth && (
          <div className="d-flex align-items-center gap-3 ms-auto">
            <div className="text-end d-none d-md-block">
              <div className="badge bg-primary text-wrap">{auth.role === "admin" ? "Admin Dispatcher" : auth.role === "driver" ? "Truck Driver" : "Station Manager"}</div>
              <div className="text-light small fw-bold">{auth.name} {auth.station ? `(${auth.station})` : ""}</div>
            </div>

            <button className="btn btn-outline-light btn-sm" onClick={onRefresh} disabled={loading}>
              {loading ? "Syncing..." : "🔄 Sync"}
            </button>

            <div className="form-check form-switch text-light small m-0 d-none d-lg-block">
              <input
                className="form-check-input"
                type="checkbox"
                id="autoSyncSwitch"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
              />
              <label className="form-check-label text-secondary" htmlFor="autoSyncSwitch">Auto Sync</label>
            </div>

            <button className="btn btn-danger btn-sm fw-bold" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
