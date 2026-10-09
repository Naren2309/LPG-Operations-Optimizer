import React from "react";
import logoUrl from "../../../assets/Logo.avif";

export const FeatureLaunchpad = ({ role, onSelectFeature, planBundle, stations, trucks, sourceComparison, onGeneratePlan, generating }) => {
  const deliveryPlans = planBundle?.delivery?.delivery_plans || [];
  const unservedCount = planBundle?.unserved?.unserved?.length || 0;

  const adminFeatures = [
    { key: "overview", title: "⚡ Control Center & Optimization Engine", icon: "📊", color: "primary", badge: null },
    { key: "routes", title: "🛣️ Route Dispatch Plans & PDF Manifest", icon: "🛣️", color: "primary", badge: `${deliveryPlans.length} Runs` },
    { key: "map", title: "🗺️ Interactive OpenStreetMap GIS Map", icon: "🗺️", color: "dark", badge: "Live Map" },
    { key: "sumo", title: "🚦 SUMO Microscopic Traffic Dynamics", icon: "🚦", color: "dark", badge: "TraCI Engine" },
    { key: "mldemand", title: "🤖 ML Fuel Demand & Depletion Predictor", icon: "🤖", color: "info", badge: "AI Predictor" },
    { key: "swaps", title: "⚠️ Unserved Stations & Route Swaps", icon: "⚠️", color: "danger", badge: unservedCount > 0 ? `${unservedCount} Unserved` : null },
    { key: "fleet", title: "🚛 Fleet Inventory & Onboard Fuel Manager", icon: "🚛", color: "warning", badge: `${trucks.length} Trucks` },
    { key: "terminals", title: "🏭 Supply Terminals & Ex-Terminal Rates", icon: "🏭", color: "success", badge: `${sourceComparison.length} Terminals` },
    { key: "iot", title: "📡 Automatic Tank Gauge IoT Telemetry", icon: "📡", color: "secondary", badge: "ATG Sensors" },
    { key: "driver", title: "🚚 Driver Real-Time Dispatch Portal", icon: "🚚", color: "outline-primary", badge: "Driver View" },
    { key: "manager", title: "⛽ Station Fuel Stock Manager Portal", icon: "⛽", color: "outline-success", badge: "Manager View" }
  ];

  const managerFeatures = [
    { key: "manager", title: "⛽ Station Fuel Stock Manager Portal", icon: "⛽", color: "primary", badge: "Manager View" },
    { key: "iot", title: "📡 Automatic Tank Gauge IoT Telemetry Hub", icon: "📡", color: "info", badge: "ATG Sensors" }
  ];

  const driverFeatures = [
    { key: "driver", title: "🚚 Driver Real-Time Dispatch Portal", icon: "🚚", color: "primary", badge: "Driver View" }
  ];

  const featuresList = role === "station_manager" ? managerFeatures : role === "driver" ? driverFeatures : adminFeatures;

  return (
    <div className="container p-4">
      {/* Front Header Banner */}
      <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 p-4 text-center">
        <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
          <img src={logoUrl} alt="KR Fuels" width="60" height="60" className="rounded-3 bg-white p-1 border shadow-sm" />
          <div className="text-start">
            <h2 className="fw-bold text-dark mb-0">KR FUELS OPERATIONS PORTAL</h2>
            <p className="text-muted mb-0">Select any feature below to open its dedicated full-screen page.</p>
          </div>
        </div>
      </div>

      {/* Feature Headings Grid */}
      <div className="row g-3">
        {featuresList.map((feat) => (
          <div key={feat.key} className="col-md-6 col-lg-4">
            <button
              className="card h-100 w-100 border-0 shadow-sm rounded-4 p-4 text-start bg-white text-decoration-none btn-feature-tile"
              onClick={() => onSelectFeature(feat.key)}
              style={{ transition: "all 0.2s ease-in-out", cursor: "pointer" }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="fs-1">{feat.icon}</span>
                {feat.badge && (
                  <span className={`badge bg-${feat.color === "outline-primary" ? "primary" : feat.color === "outline-success" ? "success" : feat.color} fs-6`}>
                    {feat.badge}
                  </span>
                )}
              </div>
              <h5 className="fw-bold text-dark mb-0 leading-tight">{feat.title}</h5>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .btn-feature-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
          border-left: 5px solid #0d6efd !important;
        }
      `}</style>
    </div>
  );
};
