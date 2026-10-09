import React from "react";
import logoUrl from "../../../assets/Logo.avif";

export const FeatureLaunchpad = ({ role, onSelectFeature, planBundle, stations, trucks, sourceComparison, onGeneratePlan, generating }) => {
  const deliveryPlans = planBundle?.delivery?.delivery_plans || [];
  const unservedCount = planBundle?.unserved?.unserved?.length || 0;

  const corePillars = [
    {
      key: "iot",
      pillarNumber: "01",
      title: "Automated LPG Stock Level Monitoring",
      desc: "Ingests IoT Automatic Tank Gauge (ATG) telemetry or manual dips. Auto-evaluates 60% dead-stock threshold to trigger emergency replenishment alerts.",
      icon: "📡",
      badge: "IoT & Stock Telemetry",
      color: "info"
    },
    {
      key: "routes",
      pillarNumber: "02",
      title: "Optimized LPG Route & Landed Cost Engine",
      desc: "Finds stations needing LPG, selects cheapest supply terminals, optimizes RTKM freight & FASTag tolls, and dispatches fleet tankers.",
      icon: "🛣️",
      badge: "Route & Cost Optimizer",
      color: "primary"
    },
    {
      key: "mldemand",
      pillarNumber: "03",
      title: "ML Station Demand & Depletion Predictor",
      desc: "Retrains RandomForestRegressor model on multi-year sales history to forecast next month's fuel demand (Liters/MT) and depletion dates.",
      icon: "🤖",
      badge: "ML Demand Forecasting",
      color: "success"
    }
  ];

  const secondaryFeatures = [
    { key: "overview", title: "⚡ Control Center & Plan Generator", icon: "📊", badge: "Optimization Hub" },
    { key: "map", title: "🗺️ Interactive OpenStreetMap GIS Map", icon: "🗺️", badge: "Geospatial Canvas" },
    { key: "sumo", title: "🚦 SUMO Microscopic Traffic Simulator", icon: "🚦", badge: "Traffic Simulation" },
    { key: "swaps", title: "⚠️ Unserved Stations & Route Swaps", icon: "⚠️", badge: unservedCount > 0 ? `${unservedCount} Unserved` : "Swap Engine" },
    { key: "fleet", title: "🚛 Fleet Inventory & Onboard Fuel Manager", icon: "🚛", badge: `${trucks.length} Tankers` },
    { key: "terminals", title: "🏭 Supply Terminals & Market Prices", icon: "🏭", badge: `${sourceComparison.length} Terminals` },
    { key: "driver", title: "🚚 Driver Real-Time Dispatch Portal", icon: "🚚", badge: "Driver App" },
    { key: "manager", title: "⛽ Station Fuel Stock Manager Portal", icon: "⛽", badge: "Manager App" }
  ];

  return (
    <div className="container p-4">
      {/* Main Banner Header */}
      <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 p-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <img src={logoUrl} alt="KR Fuels" width="60" height="60" className="rounded-3 bg-white p-1 border shadow-sm" />
            <div>
              <h2 className="fw-bold text-dark mb-0">KR FUELS OPERATIONS & DISPATCH PLATFORM</h2>
              <p className="text-muted mb-0">Automated LPG Tank Stock Monitoring, Route Optimization & ML Demand Forecasting</p>
            </div>
          </div>
          {role === "admin" && (
            <button
              className="btn btn-success btn-lg fw-bold px-4 shadow-sm"
              onClick={onGeneratePlan}
              disabled={generating}
            >
              {generating ? "Calculating Optimal Routes..." : "⚡ Run Route Optimizer"}
            </button>
          )}
        </div>
      </div>

      {/* 🏆 3 CORE PILLARS SECTION */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold text-dark mb-0">🎯 Core System Pillars</h4>
          <span className="badge bg-primary px-3 py-2 fs-6">Primary Features</span>
        </div>

        <div className="row g-3">
          {corePillars.map((pillar) => (
            <div key={pillar.key} className="col-md-4">
              <div
                className={`card h-100 border-0 shadow-sm rounded-4 p-4 text-start bg-white btn-feature-tile position-relative border-top border-4 border-${pillar.color}`}
                onClick={() => onSelectFeature(pillar.key)}
                style={{ cursor: "pointer", transition: "all 0.2s ease-in-out" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-1">{pillar.icon}</span>
                  <span className={`badge bg-${pillar.color} fs-6`}>{pillar.badge}</span>
                </div>
                <div className="text-muted extra-small uppercase fw-bold mb-1">PILLAR {pillar.pillarNumber}</div>
                <h5 className="fw-bold text-dark mb-2">{pillar.title}</h5>
                <p className="text-muted small mb-0">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADDITIONAL LOGISTICS & SIMULATION MODULES */}
      {role === "admin" && (
        <div>
          <h5 className="fw-bold text-dark mb-3">🛠️ Supporting Logistics & Analytics Modules</h5>
          <div className="row g-3">
            {secondaryFeatures.map((feat) => (
              <div key={feat.key} className="col-md-6 col-lg-3">
                <button
                  className="card h-100 w-100 border-0 shadow-sm rounded-4 p-3 text-start bg-white text-decoration-none btn-feature-tile"
                  onClick={() => onSelectFeature(feat.key)}
                  style={{ transition: "all 0.2s ease-in-out", cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fs-2">{feat.icon}</span>
                    <span className="badge bg-light text-dark border fs-7">{feat.badge}</span>
                  </div>
                  <h6 className="fw-bold text-dark mb-0">{feat.title}</h6>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .btn-feature-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
};
