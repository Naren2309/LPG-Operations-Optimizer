import React from "react";

export const FeatureNavMenu = ({ role, activeTab, setActiveTab }) => {
  if (role === "station_manager") {
    return (
      <div className="bg-white border-bottom shadow-sm px-3 py-2">
        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button
              className={`nav-link fw-bold ${activeTab === "manager" ? "active bg-primary" : "text-dark"}`}
              onClick={() => setActiveTab("manager")}
            >
              ⛽ Station Stock Manager
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-bold ${activeTab === "iot" ? "active bg-primary" : "text-dark"}`}
              onClick={() => setActiveTab("iot")}
            >
              📡 IoT Tank Gauge Simulator
            </button>
          </li>
        </ul>
      </div>
    );
  }

  if (role === "driver") {
    return (
      <div className="bg-white border-bottom shadow-sm px-3 py-2">
        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button
              className={`nav-link fw-bold ${activeTab === "driver" ? "active bg-primary" : "text-dark"}`}
              onClick={() => setActiveTab("driver")}
            >
              🚛 Driver Dispatch Tracker
            </button>
          </li>
        </ul>
      </div>
    );
  }

  // Admin Role - Multi-page Feature Tabs
  return (
    <div className="bg-white border-bottom shadow-sm px-3 py-2">
      <ul className="nav nav-pills gap-2 flex-wrap">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "overview" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Control Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "routes" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("routes")}
          >
            🛣️ Route Dispatch Plans
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "swaps" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("swaps")}
          >
            ⚠️ Unserved & Swap Decisions
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "terminals" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("terminals")}
          >
            🏭 Terminals & Market Prices
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "fleet" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("fleet")}
          >
            🚛 Fleet Tracker
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "iot" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("iot")}
          >
            📡 IoT Tank Telemetry
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "driver" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("driver")}
          >
            🚚 Driver Dispatch Portal
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "manager" ? "active bg-primary" : "text-dark"}`}
            onClick={() => setActiveTab("manager")}
          >
            ⛽ Station Manager View
          </button>
        </li>
      </ul>
    </div>
  );
};
