import React from "react";
import logoUrl from "../../../assets/Logo.avif";

export const Sidebar = ({ role, activeTab, setActiveTab, unservedCount = 0 }) => {
  return (
    <aside className="bg-dark text-white d-flex flex-column flex-shrink-0 p-3 shadow-lg" style={{ width: "260px", minHeight: "100vh" }}>
      {/* Brand Header */}
      <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom border-secondary">
        <img src={logoUrl} alt="KR Fuels Logo" width="42" height="42" className="rounded-3 bg-white p-1 shadow-sm" />
        <div>
          <h5 className="fw-bold mb-0 text-white leading-tight">KR FUELS</h5>
          <span className="text-secondary small font-monospace" style={{ fontSize: "0.7rem" }}>LOGISTICS V2.0</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-grow-1 overflow-auto">
        {role === "admin" && (
          <>
            <div className="text-uppercase text-secondary fw-bold px-2 mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.08em" }}>
              Main Operations
            </div>
            <ul className="nav nav-pills flex-column mb-4 gap-1">
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "overview" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <span>📊</span> Control Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "routes" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("routes")}
                >
                  <span>GM</span> Route Dispatch Plans
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center justify-content-between fw-medium ${activeTab === "swaps" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("swaps")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span>⚠️</span> Unserved & Swaps
                  </div>
                  {unservedCount > 0 && (
                    <span className="badge bg-danger rounded-pill">{unservedCount}</span>
                  )}
                </button>
              </li>
            </ul>

            <div className="text-uppercase text-secondary fw-bold px-2 mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.08em" }}>
              Logistics & Fleet
            </div>
            <ul className="nav nav-pills flex-column mb-4 gap-1">
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "fleet" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("fleet")}
                >
                  <span>🚛</span> Fleet Inventory
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "terminals" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("terminals")}
                >
                  <span>🏭</span> Supply Terminals
                </button>
              </li>
            </ul>

            <div className="text-uppercase text-secondary fw-bold px-2 mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.08em" }}>
              Advanced AI & Simulation
            </div>
            <ul className="nav nav-pills flex-column gap-1">
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "sumo" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("sumo")}
                >
                  <span>🚦</span> SUMO Traffic Simulator
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "mldemand" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("mldemand")}
                >
                  <span>🤖</span> ML Demand Predictor
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "iot" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("iot")}
                >
                  <span>📡</span> IoT Tank Telemetry
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "driver" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("driver")}
                >
                  <span>🚚</span> Driver Dispatch Portal
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "manager" ? "active bg-primary text-white" : "text-light"}`}
                  onClick={() => setActiveTab("manager")}
                >
                  <span>⛽</span> Station Manager View
                </button>
              </li>
            </ul>
          </>
        )}

        {role === "station_manager" && (
          <ul className="nav nav-pills flex-column gap-2">
            <li className="nav-item">
              <button
                className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "manager" ? "active bg-primary text-white" : "text-light"}`}
                onClick={() => setActiveTab("manager")}
              >
                <span>⛽</span> Station Stock Manager
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "iot" ? "active bg-primary text-white" : "text-light"}`}
                onClick={() => setActiveTab("iot")}
              >
                <span>📡</span> IoT Tank Telemetry
              </button>
            </li>
          </ul>
        )}

        {role === "driver" && (
          <ul className="nav nav-pills flex-column gap-2">
            <li className="nav-item">
              <button
                className={`nav-link w-100 text-start d-flex align-items-center gap-2 fw-medium ${activeTab === "driver" ? "active bg-primary text-white" : "text-light"}`}
                onClick={() => setActiveTab("driver")}
              >
                <span>🚛</span> Driver Dispatch Tracker
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Footer System Status */}
      <div className="pt-3 border-top border-secondary text-secondary small" style={{ fontSize: "0.75rem" }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="spinner-grow spinner-grow-sm text-success" style={{ width: "8px", height: "8px" }}></span>
          <span className="text-light fw-bold">System Online</span>
        </div>
        <div>Engine: Python 3 Landed-Cost</div>
      </div>
    </aside>
  );
};
