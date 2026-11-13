"""
=============================================================================
  PROTOTYPE / FUTURE ROADMAP: GOOGLE OR-TOOLS MULTI-DEPOT CVRP (MD-CVRP)
=============================================================================
Recommended Future Enhancement:
Migrate from the sequential heuristic pipeline (source selection -> clustering -> fleet matching)
to a joint Multi-Depot Capacitated Vehicle Routing Problem (MD-CVRP) using Google OR-Tools.

Interview Framing Note:
- Avoid claiming 'globally optimal in a single optimization pass' because VRP is NP-hard.
- Formulate as 'joint route and fleet optimization' using metaheuristic search
  (e.g., PATH_CHEAPEST_ARC first solution + GUIDED_LOCAL_SEARCH metaheuristic).
=============================================================================
"""

import sys, os, json, math
from collections import defaultdict

try:
    from ortools.constraint_solver import routing_enums_pb2
    from ortools.constraint_solver import pywrapcp
    ORTOOLS_AVAILABLE = True
except ImportError:
    ORTOOLS_AVAILABLE = False


def create_mdcvrp_data_model(stations, sources, fleet):
    """
    Constructs the routing model input structures:
    - Multiple depots (refinery terminals: CPCL, IOCL, BPCL)
    - Customer delivery nodes (depleted retail stations)
    - Demands (needed liters/MT per station)
    - Vehicle capacities and start/end depot locations
    """
    data = {}
    
    # 1. Combined node list: [Depots (Sources)..., Stations...]
    node_names = [s["Source_Name"] for s in sources] + [st["Stations"] for st in stations]
    coords = [(float(s["lat"]), float(s["lon"])) for s in sources] + [(float(st["lat"]), float(st["lon"])) for st in stations]
    
    num_depots = len(sources)
    num_stations = len(stations)
    num_nodes = len(node_names)
    
    # 2. Distance Matrix Calculation (Haversine * 1.3 road factor or OSRM/Google Routes)
    def haversine_km(c1, c2):
        lat1, lon1 = c1; lat2, lon2 = c2
        r = 6371.0; dlat = math.radians(lat2 - lat1); dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
        return round(2 * r * math.asin(math.sqrt(a)) * 1.3, 1)

    dist_matrix = [[0] * num_nodes for _ in range(num_nodes)]
    for i in range(num_nodes):
        for j in range(num_nodes):
            dist_matrix[i][j] = int(haversine_km(coords[i], coords[j]) * 1000) # in meters
    data["distance_matrix"] = dist_matrix

    # 3. Demands: 0 for depots, positive liters for depleted stations
    demands = [0] * num_depots + [int(st.get("Usable Lt", 10000)) for st in stations]
    data["demands"] = demands

    # 4. Fleet Vehicles & Start/End Depots
    # Each vehicle starts and returns to an assigned source terminal
    vehicle_capacities = []
    starts = []
    ends = []
    
    for idx, truck in enumerate(fleet):
        cap = int(truck.get("capacity_lt", 21720))
        vehicle_capacities.append(cap)
        depot_idx = idx % num_depots  # initial placement across candidate depots
        starts.append(depot_idx)
        ends.append(depot_idx)
        
    data["vehicle_capacities"] = vehicle_capacities
    data["starts"] = starts
    data["ends"] = ends
    data["num_vehicles"] = len(fleet)
    data["node_names"] = node_names
    
    return data


def solve_mdcvrp_prototype(data):
    """
    Executes Google OR-Tools Routing Index Manager and Routing Model.
    Solves Joint Route & Fleet Optimization.
    """
    if not ORTOOLS_AVAILABLE:
        return {
            "status": "OR_TOOLS_NOT_INSTALLED",
            "message": "Google OR-Tools is not installed in the environment. Run `pip install ortools` to execute live solver.",
            "formulation": "Multi-Depot Capacitated Vehicle Routing Problem (MD-CVRP) with Guided Local Search"
        }

    # Create the routing index manager
    manager = pywrapcp.RoutingIndexManager(
        len(data["distance_matrix"]),
        data["num_vehicles"],
        data["starts"],
        data["ends"]
    )

    # Create Routing Model
    routing = pywrapcp.RoutingModel(manager)

    # 1. Distance Callback (Transit cost)
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data["distance_matrix"][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # 2. Demand & Capacity Dimension (Zero Overloading Constraint)
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return data["demands"][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        data["vehicle_capacities"],  # vehicle maximum capacities
        True,  # start cumul to zero
        "Capacity"
    )

    # 3. Search Parameters (First Solution Heuristic + Metaheuristic)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 5

    # Solve the problem
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return {"status": "NO_SOLUTION_FOUND"}

    # Extract routes
    routes = []
    for vehicle_id in range(data["num_vehicles"]):
        index = routing.Start(vehicle_id)
        route = []
        route_dist = 0
        route_load = 0
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            route.append(data["node_names"][node])
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_dist += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
            route_load += data["demands"][node]
        node = manager.IndexToNode(index)
        route.append(data["node_names"][node])
        
        if len(route) > 2: # vehicle served at least one customer
            routes.append({
                "vehicle_id": vehicle_id,
                "capacity_lt": data["vehicle_capacities"][vehicle_id],
                "route_path": route,
                "total_distance_km": round(route_dist / 1000.0, 1),
                "total_load_lt": route_load
            })

    return {
        "status": "OPTIMAL_OR_FEASIBLE_FOUND",
        "formulation": "Joint Multi-Depot Capacitated VRP (MD-CVRP)",
        "solver": "Google OR-Tools (Guided Local Search)",
        "active_routes": routes
    }


if __name__ == "__main__":
    print("=" * 70)
    print("  GOOGLE OR-TOOLS MD-CVRP PROTOTYPE & ROADMAP SPECIFICATION")
    print("=" * 70)
    sample_sources = [
        {"Source_Name": "CPCL Manali", "lat": 13.1678, "lon": 80.2642},
        {"Source_Name": "IOCL Ennore", "lat": 13.2215, "lon": 80.3210}
    ]
    sample_stations = [
        {"Stations": "Anna Nagar", "lat": 13.0850, "lon": 80.2101, "Usable Lt": 11000},
        {"Stations": "Ambattur", "lat": 13.1143, "lon": 80.1548, "Usable Lt": 9500},
        {"Stations": "Tambaram", "lat": 12.9249, "lon": 80.1000, "Usable Lt": 12000}
    ]
    sample_fleet = [
        {"truck_id": "TRK-01", "capacity_lt": 21720},
        {"truck_id": "TRK-02", "capacity_lt": 21720}
    ]
    
    data = create_mdcvrp_data_model(sample_stations, sample_sources, sample_fleet)
    res = solve_mdcvrp_prototype(data)
    print(json.dumps(res, indent=2))
