import React from "react";
import logoUrl from "../../../assets/Logo.avif";

const TAB_TITLES = {
  hub: "KR FUELS Operations Portal",
  overview: "⚡ Control Center & Optimization Engine",
  routes: "🛣️ Route Dispatch Plans & Turn-by-Turn Navigation",
  map: "🗺️ Interactive OpenStreetMap GIS Map",
  swaps: "⚠️ Unserved Station Resolution & Algorithmic Route Swaps",
  terminals: "🏭 Supply Terminals & Daily Market Rate Ranking",
  fleet: "🚛 Operational Fleet Inventory & Truck Tracking",
  sumo: "🚦 SUMO Microscopic Traffic Dynamics Simulator",
  mldemand: "🤖 Machine Learning Fuel Demand Forecasting",
  iot: "📡 Automatic Tank Gauge (ATG) IoT Telemetry Hub",
  driver: "🚚 Driver Real-Time Dispatch Portal",
  manager: "⛽ Station Fuel Stock Management Portal"
};

export const TopHeader = ({ auth, activeTab, onBackToHub, onLogout, isAutoRefresh, setIsAutoRefresh, onRefresh, loading }) => {
  const pageTitle = TAB_TITLES[activeTab] || "KR FUELS Operations Portal";
  const isInsideFeature = activeTab !== "hub";

  return (
    <header className="bg-dark text-white border-bottom shadow px-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3 sticky-top">
      <div className="d-flex align-items-center gap-3">
        {isInsideFeature ? (
          <button
            className="btn btn-outline-light btn-sm fw-bold px-3 shadow-sm"
            onClick={onBackToHub}
          >
            ← Back to All Features
          </button>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <img src={logoUrl} alt="KR Fuels Logo" width="36" height="36" className="rounded-3 bg-white p-1" />
            <span className="fw-bold fs-5 text-white">KR FUELS</span>
          </div>
        )}

        <div className="border-start border-secondary ps-3">
          <h5 className="fw-bold mb-0 text-white leading-tight">{pageTitle}</h5>
          <div className="text-secondary small" style={{ fontSize: "0.78rem" }}>
            User: <strong className="text-white">{auth?.name}</strong> {auth?.station ? `(${auth.station})` : ""} | Role: <span className="badge bg-primary">{auth?.role}</span>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 ms-auto">
        <button className="btn btn-outline-light btn-sm fw-bold px-3" onClick={onRefresh} disabled={loading}>
          {loading ? "Syncing..." : "🔄 Sync Data"}
        </button>

        <div className="form-check form-switch text-white small m-0 d-none d-md-block">
          <input
            className="form-check-input"
            type="checkbox"
            id="topAutoSyncSwitch"
            checked={isAutoRefresh}
            onChange={(e) => setIsAutoRefresh(e.target.checked)}
          />
          <label className="form-check-label text-secondary fw-bold" htmlFor="topAutoSyncSwitch">Auto-Sync (30s)</label>
        </div>

        <button className="btn btn-danger btn-sm fw-bold px-3" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};
