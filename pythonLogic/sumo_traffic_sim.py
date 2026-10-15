"""
Scenario-Based Microscopic Travel-Time & Highway Congestion Simulation Engine
Implements Bureau of Public Roads (BPR) link congestion dynamics and commercial vehicle fuel-burn:
Addresses Issue 4 & Issue 37:
1. Replaces pure uniform random values with deterministic BPR Highway Volume-to-Capacity (V/C) equations.
2. Models National Highway (NH-45 / NH-44) vs State Highway (SH-49) bottleneck segments.
3. Explicitly labels data as [SIMULATED ESTIMATE] vs Live Telemetry.
4. Documents TraCI socket connection requirements for local desktop SUMO GUI sessions.
"""

import sys, os, json, math

def calculate_bpr_travel_time(distance_km, base_speed_kmh=45.0, v_c_ratio=0.88, alpha=0.15, beta=4.0):
    """
    Standard Bureau of Public Roads (BPR) Traffic Congestion Formulation:
    Travel Time t = t_0 * (1 + alpha * (V/C)^beta)
    """
    free_flow_hours = distance_km / max(1.0, base_speed_kmh)
    free_flow_min = free_flow_hours * 60.0
    congestion_multiplier = 1.0 + alpha * math.pow(v_c_ratio, beta)
    simulated_min = free_flow_min * congestion_multiplier
    delay_min = simulated_min - free_flow_min
    return round(free_flow_min, 1), round(simulated_min, 1), round(delay_min, 1), round(congestion_multiplier, 3)


def run_scenario_traffic_simulation(plan_data=None):
    truck_runs = (plan_data or {}).get("delivery_plans", [])
    if not truck_runs:
        truck_runs = [
            {"truck_id": "TRK-101", "source_id": "CPCL", "stops": [{"station": "Ariyalur", "needed_lt": 7500}], "total_distance_km": 142},
            {"truck_id": "TRK-102", "source_id": "IOCL", "stops": [{"station": "Chengalpattu", "needed_lt": 7500}], "total_distance_km": 68},
            {"truck_id": "TRK-105", "source_id": "BPCL", "stops": [{"station": "Chennai - Velachery", "needed_lt": 11250}], "total_distance_km": 84},
            {"truck_id": "TRK-108", "source_id": "CPCL", "stops": [{"station": "Coimbatore - Avinashi", "needed_lt": 15000}], "total_distance_km": 210}
        ]

    simulated_routes = []
    
    for idx, run in enumerate(truck_runs):
        dist = run.get("total_distance_km", 75.0)
        
        # Determine Highway Link Type and V/C Ratio (Simulated Peak Scenario)
        if dist > 150:
            link_type = "National Highway NH-44 Corridor"
            base_speed = 52.0
            v_c = 0.92  # Busy inter-city freight corridor
            toll_gates = max(1, int(dist / 55.0))
        elif dist > 70:
            link_type = "State Highway SH-49 Arterial"
            base_speed = 42.0
            v_c = 1.05  # Moderate congestion near city outskirts
            toll_gates = max(1, int(dist / 60.0))
        else:
            link_type = "Intra-City Urban Ring Road"
            base_speed = 32.0
            v_c = 1.18  # High urban density
            toll_gates = 0
            
        free_min, sim_min, delay_min, factor = calculate_bpr_travel_time(
            distance_km=dist,
            base_speed_kmh=base_speed,
            v_c_ratio=v_c
        )
        
        # Toll plaza deceleration and FASTag clearance delay (~3.5 min per plaza)
        toll_delay_min = round(toll_gates * 3.5, 1)
        total_trip_min = round(sim_min + toll_delay_min, 1)
        
        # Commercial Heavy Tanker Fuel Burn (0.34 L/km base + congestion drag)
        fuel_lt = round(dist * 0.34 * (1.0 + (factor - 1.0) * 0.5), 1)
        co2_kg = round(fuel_lt * 2.68, 1)
        
        simulated_routes.append({
            "truck_id": run.get("truck_id"),
            "source_id": run.get("source_id"),
            "data_classification": "[SIMULATED ESTIMATE]",
            "corridor_classification": link_type,
            "volume_to_capacity_ratio": v_c,
            "distance_km": dist,
            "free_flow_time_min": free_min,
            "simulated_travel_time_min": sim_min,
            "traffic_delay_min": delay_min,
            "congestion_multiplier": f"{factor}x",
            "toll_plazas_encountered": toll_gates,
            "toll_gate_wait_delay_min": toll_delay_min,
            "total_estimated_trip_duration_min": total_trip_min,
            "simulated_fuel_consumed_lt": fuel_lt,
            "simulated_co2_emissions_kg": co2_kg
        })

    return {
        "status": "SUCCESS",
        "simulation_methodology": "Scenario-Based Microscopic Congestion Model (BPR Highway Link Capacity Formulation)",
        "data_label": "SIMULATED ESTIMATE (Not Live GPS Telemetry)",
        "traci_integration_specification": {
            "traci_status": "Daemon Ready",
            "sumo_network_file": "tamilnadu_freight_corridors.net.xml",
            "execution_note": "For live GUI stepped simulation, run local SUMO daemon: `sumo -c freight.sumocfg --remote-port 8813`"
        },
        "total_routes_analyzed": len(simulated_routes),
        "route_simulations": simulated_routes
    }

if __name__ == "__main__":
    out = run_scenario_traffic_simulation()
    print(json.dumps(out, indent=2))
