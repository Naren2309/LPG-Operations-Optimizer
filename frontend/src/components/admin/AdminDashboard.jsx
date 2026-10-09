import React, { useState } from "react";
import { StatCard } from "../common/StatCard";
import { InteractiveMap } from "../common/InteractiveMap";
import { LpgNewsWidget } from "./LpgNewsWidget";
import { TruckFuelEditorModal } from "./TruckFuelEditorModal";
import { CostOptimizationVerifier } from "./CostOptimizationVerifier";
import { StationsDirectoryModal } from "./StationsDirectoryModal";
import { MarketPriceSyncWidget } from "./MarketPriceSyncWidget";
import { SumoTrafficSimulator } from "./SumoTrafficSimulator";
import { MlDemandPredictor } from "./MlDemandPredictor";
import { DispatchManifestPrinter } from "./DispatchManifestPrinter";
import { IotTelemetrySimulator } from "../iot/IotTelemetrySimulator";
import { UnservedSwapSection } from "./UnservedSwapSection";
import { RoutePlanCard } from "./RoutePlanCard";
import { FleetTable } from "./FleetTable";
import { SourceComparisonTable } from "./SourceComparisonTable";
import { generateRoutePlan, decideSwapResolution } from "../../services/api";

export const AdminDashboard = ({
  activeTab = "overview",
  setActiveTab,
  planBundle,
  analytics,
  stations,
  trucks,
  sources,
  sourceComparison,
  onRefresh
}) => {
  const [generating, setGenerating] = useState(false);
  const [deciding, setDeciding] = useState(false);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      await generateRoutePlan();
      alert("✅ Automated Route Plan computed successfully!");
      if (onRefresh) onRefresh();
      if (setActiveTab) setActiveTab("routes");
    } catch (err) {
      alert("Route plan generation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDecideSwap = async (planId, resolutionId, decision) => {
    setDeciding(true);
    try {
      await decideSwapResolution(planId, resolutionId, decision);
      alert(`Swap decision '${decision}' applied successfully.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to apply swap decision: " + (err.response?.data?.message || err.message));
    } finally {
      setDeciding(false);
    }
  };

  const deliveryPlans = planBundle?.delivery?.delivery_plans || [];
  const unservedBundle = planBundle?.unserved || null;

  // PAGE 1: OVERVIEW CONTROL CENTER (First screen on login)
  if (activeTab === "overview") {
    return (
      <div className="container-fluid p-4">
        {/* Main Action Banner */}
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h4 className="fw-bold text-primary mb-1">⚡ Automated Landed-Cost Route Optimization Engine</h4>
              <p className="text-muted mb-0">
                Runs multi-stop station clustering, returns ton-kilometer (RTKM) freight calculations, and assigns optimal 12MT / 7MT trucks.
              </p>
            </div>
            <div>
              <button
                className="btn btn-success btn-lg fw-bold shadow-sm px-4 py-3"
                onClick={handleGeneratePlan}
                disabled={generating}
              >
                {generating ? "⚙️ Computing Landed Cost Optimization..." : "🚀 Generate Automated Route Plan"}
              </button>
            </div>
          </div>
        </div>

        {/* Executive KPI Metrics Grid */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <StatCard
              title="Scheduled Truck Runs"
              value={deliveryPlans.length || 0}
              subtitle="Active Route Allocations"
              type="primary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Total Stations"
              value={stations.length || 0}
              subtitle={`${stations.filter(s => s.sufficient_fuel === "NO").length} Need Fuel Replenishment`}
              type="danger"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Active Fleet"
              value={trucks.length || 0}
              subtitle={`${trucks.filter(t => t.type === "12MT").length} 12MT | ${trucks.filter(t => t.type === "7MT").length} 7MT`}
              type="warning"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Cheapest Terminal"
              value={sourceComparison[0]?.source_id || "CPCL"}
              subtitle={`₹${sourceComparison[0]?.price_per_mt?.toLocaleString() || 58000} / MT`}
              type="success"
            />
          </div>
        </div>

        {/* Feature 2: Interactive OpenStreetMap Geospatial Canvas */}
        <InteractiveMap
          stations={stations}
          sources={sources}
          trucks={trucks}
          deliveryPlans={deliveryPlans}
        />

        {/* Cost Optimization & Formula Breakdown Verifier */}
        <CostOptimizationVerifier planBundle={planBundle} />

        <div className="row g-4 mb-4">
          {/* Live Auto LPG Industry News Feed */}
          <div className="col-lg-6">
            <LpgNewsWidget />
          </div>

          {/* Scalable Truck Fleet & Fuel Level Manager */}
          <div className="col-lg-6">
            <TruckFuelEditorModal
              trucks={trucks}
              stations={stations}
              sources={sources}
              onTrucksUpdated={onRefresh}
            />
          </div>
        </div>

        {/* Stations & Supply Terminals Directory */}
        <StationsDirectoryModal stations={stations} sources={sources} />
      </div>
    );
  }

  // PAGE 2: ROUTE DISPATCH PLANS & PDF EXPORTER
  if (activeTab === "routes") {
    return (
      <div className="container-fluid p-4">
        {/* Feature 5: Formal Dispatch Manifest & PDF Exporter */}
        <DispatchManifestPrinter planBundle={planBundle} />
        
        {/* Feature 2: Interactive Map */}
        <InteractiveMap
          stations={stations}
          sources={sources}
          trucks={trucks}
          deliveryPlans={deliveryPlans}
        />

        <RoutePlanCard planBundle={planBundle} />
      </div>
    );
  }

  // GEOSPATIAL MAP CANVAS PAGE
  if (activeTab === "map") {
    return (
      <div className="container-fluid p-4">
        <InteractiveMap
          stations={stations}
          sources={sources}
          trucks={trucks}
          deliveryPlans={deliveryPlans}
        />
      </div>
    );
  }

  // PAGE 3: UNSERVED & SWAP DECISIONS
  if (activeTab === "swaps") {
    return (
      <div className="container-fluid p-4">
        <UnservedSwapSection
          unservedBundle={unservedBundle}
          planId={planBundle?.plan_id}
          onDecideSwap={handleDecideSwap}
          loading={deciding}
        />
      </div>
    );
  }

  // PAGE 4: SUPPLY TERMINALS & PRICING
  if (activeTab === "terminals") {
    return (
      <div className="container-fluid p-4">
        <MarketPriceSyncWidget onPricesUpdated={onRefresh} />
        <SourceComparisonTable sourceComparison={sourceComparison} />
      </div>
    );
  }

  // PAGE 5: FLEET TRACKER
  if (activeTab === "fleet") {
    return (
      <div className="container-fluid p-4">
        <FleetTable trucks={trucks} />
      </div>
    );
  }

  // FEATURE 1 PAGE: SUMO TRAFFIC SIMULATION
  if (activeTab === "sumo") {
    return (
      <div className="container-fluid p-4">
        <SumoTrafficSimulator planBundle={planBundle} />
      </div>
    );
  }

  // FEATURE 3 PAGE: ML DEMAND PREDICTOR (FILE UPLOAD)
  if (activeTab === "mldemand") {
    return (
      <div className="container-fluid p-4">
        <MlDemandPredictor />
      </div>
    );
  }

  // PAGE 6: IOT TANK TELEMETRY
  if (activeTab === "iot") {
    return (
      <div className="container-fluid p-4">
        <IotTelemetrySimulator stations={stations} onTelemetrySent={onRefresh} />
      </div>
    );
  }

  return null;
};
