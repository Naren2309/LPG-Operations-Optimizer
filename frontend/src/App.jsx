import React, { useEffect, useState } from "react";
import logoUrl from "../assets/Logo.avif";
import "./styles.css";
import {
  getStoredAuth,
  setStoredAuth,
  loginUser,
  fetchStations,
  fetchTrucks,
  fetchSources,
  fetchLatestRoutePlan,
  fetchAnalyticsLatest,
  generateRoutePlan
} from "./services/api";

import { Sidebar } from "./components/common/Sidebar";
import { TopHeader } from "./components/common/TopHeader";
import { FeatureLaunchpad } from "./components/common/FeatureLaunchpad";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
import { DriverPortal } from "./components/driver/DriverPortal";
import { IotTelemetrySimulator } from "./components/iot/IotTelemetrySimulator";

export function App() {
  const [auth, setAuth] = useState(getStoredAuth());
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("hub");
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Global Data State
  const [planBundle, setPlanBundle] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [stations, setStations] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [sources, setSources] = useState([]);
  const [sourceComparison, setSourceComparison] = useState([]);

  const loadAllData = async () => {
    if (!auth) return;
    setLoading(true);

    try {
      if (auth.role === "admin") {
        const [stRes, trRes, srcRes, planRes, anaRes] = await Promise.allSettled([
          fetchStations(),
          fetchTrucks(),
          fetchSources(),
          fetchLatestRoutePlan(),
          fetchAnalyticsLatest()
        ]);

        if (stRes.status === "fulfilled") setStations(stRes.value.data || []);
        if (trRes.status === "fulfilled") setTrucks(trRes.value.data || []);
        if (srcRes.status === "fulfilled") setSources(srcRes.value.data || []);
        if (planRes.status === "fulfilled") setPlanBundle(planRes.value.data || null);
        if (anaRes.status === "fulfilled") {
          setAnalytics(anaRes.value.data || null);
          setSourceComparison(anaRes.value.data?.source_comparison || []);
        }
      }
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth) {
      loadAllData();
      if (auth.role === "station_manager") setActiveTab("manager");
      if (auth.role === "driver") setActiveTab("driver");
      if (auth.role === "admin") setActiveTab("hub");
    }
  }, [auth]);

  useEffect(() => {
    let interval = null;
    if (isAutoRefresh && auth) {
      interval = setInterval(loadAllData, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, auth]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await loginUser(loginForm);
      const authData = {
        token: res.data.token,
        role: res.data.role,
        name: res.data.name,
        station: res.data.station || ""
      };
      setStoredAuth(authData);
      setAuth(authData);
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setStoredAuth(null);
    setAuth(null);
    setActiveTab("hub");
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      await generateRoutePlan();
      alert("✅ Automated Route Plan computed successfully!");
      await loadAllData();
      setActiveTab("routes");
    } catch (err) {
      alert("Route plan generation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  if (!auth) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
        <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: "440px", width: "100%" }}>
          <div className="text-center mb-4">
            <img src={logoUrl} alt="KR Fuels" width="70" height="70" className="rounded-3 bg-white p-2 border shadow-sm mb-2" />
            <h3 className="fw-bold text-dark mb-0">KR FUELS</h3>
            <p className="text-muted small">LPG Operations Optimization Platform</p>
          </div>

          {loginError && <div className="alert alert-danger py-2 small">{loginError}</div>}

          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold small text-muted">Username / Email</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="admin@krfuels.com or manager username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-muted">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" disabled={loginLoading}>
              {loginLoading ? "Authenticating..." : "Sign In to Operations Portal"}
            </button>
          </form>

          <div className="mt-4 p-3 bg-light rounded text-center small text-muted border">
            <p className="mb-1"><strong>Default Demo Credentials:</strong></p>
            <p className="mb-0">Admin: <code>admin@krfuels.com</code> / <code>Admin@123</code></p>
          </div>
        </div>
      </div>
    );
  }

  const unservedCount = planBundle?.unserved?.unserved?.length || 0;

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <TopHeader
        auth={auth}
        activeTab={activeTab}
        onBackToHub={() => setActiveTab("hub")}
        onLogout={handleLogout}
        isAutoRefresh={isAutoRefresh}
        setIsAutoRefresh={setIsAutoRefresh}
        onRefresh={loadAllData}
        loading={loading}
      />

      <main className="flex-grow-1 overflow-auto">
        {auth.role === "admin" && (
          <>
            {activeTab === "hub" && (
              <FeatureLaunchpad
                role={auth.role}
                onSelectFeature={(featureKey) => setActiveTab(featureKey)}
                planBundle={planBundle}
                stations={stations}
                trucks={trucks}
                sourceComparison={sourceComparison}
                onGeneratePlan={handleGeneratePlan}
                generating={generating}
              />
            )}

            {["overview", "routes", "swaps", "terminals", "fleet", "sumo", "mldemand", "map"].includes(activeTab) && (
              <AdminDashboard
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                planBundle={planBundle}
                analytics={analytics}
                stations={stations}
                trucks={trucks}
                sources={sources}
                sourceComparison={sourceComparison}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === "iot" && (
              <div className="container-fluid p-4">
                <IotTelemetrySimulator stations={stations} onTelemetrySent={loadAllData} />
              </div>
            )}

            {activeTab === "driver" && <DriverPortal />}
            {activeTab === "manager" && <ManagerDashboard />}
          </>
        )}

        {auth.role === "station_manager" && (
          <>
            {activeTab === "hub" && (
              <FeatureLaunchpad
                role={auth.role}
                onSelectFeature={(featureKey) => setActiveTab(featureKey)}
                planBundle={planBundle}
                stations={stations}
                trucks={trucks}
                sourceComparison={sourceComparison}
                onGeneratePlan={handleGeneratePlan}
                generating={generating}
              />
            )}
            {activeTab === "manager" && <ManagerDashboard />}
            {activeTab === "iot" && (
              <div className="container-fluid p-4">
                <IotTelemetrySimulator stations={stations} onTelemetrySent={loadAllData} />
              </div>
            )}
          </>
        )}

        {auth.role === "driver" && <DriverPortal />}
      </main>
    </div>
  );
}

export default App;
