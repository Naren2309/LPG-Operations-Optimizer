import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "krfuels_auth";

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (data) => {
  if (!data) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const fetchSources = () => api.get("/sources");
export const fetchStations = () => api.get("/stations");
export const fetchTrucks = () => api.get("/trucks");
export const fetchLatestRoutePlan = () => api.get("/route-plan/latest");
export const generateRoutePlan = () => api.post("/route-plan");
export const decideSwapResolution = (planId, resolutionId, decision) =>
  api.post(`/route-plan/${planId}/unserved/${resolutionId}/decision`, { decision });
export const fetchAnalyticsLatest = () => api.get("/analytics/latest");
export const fetchLpgNewsFeed = () => api.get("/news/feed");
export const fetchStationChangeReport = (params) => api.get("/reports/station-changes", { params });
export const runDataImport = () => api.post("/import");

// Automation endpoints
export const sendIotTelemetry = (telemetryData) => api.post("/automation/iot/telemetry", telemetryData);
export const fetchMarketTerminalPrices = () => api.post("/automation/sources/fetch-market-prices");
export const fetchDriverRoutes = () => api.get("/automation/driver/my-routes");
export const updateDriverTruckStatus = (truckId, payload) => api.patch(`/automation/driver/trucks/${truckId}/status`, payload);

// Manager API
export const fetchManagerOverview = () => api.get("/manager/overview");
export const updateManagerStationStock = (payload) => api.patch("/manager/stock", payload);
