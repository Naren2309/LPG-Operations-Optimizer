import React, { useEffect, useRef } from "react";

export const InteractiveMap = ({ stations = [], sources = [], trucks = [], deliveryPlans = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      // Default center: Tamil Nadu / South India center (11.1271, 78.6569)
      const map = window.L.map(mapRef.current).setView([11.1271, 78.6569], 7);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old layers
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const bounds = [];

    // 1. Add Source Terminals (Red Markers)
    sources.forEach((src) => {
      if (src.coordinates?.lat && src.coordinates?.lng) {
        const lat = Number(src.coordinates.lat);
        const lng = Number(src.coordinates.lng);
        bounds.push([lat, lng]);

        const marker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            className: "custom-pin-source",
            iconSize: null,
            html: `<div style="background-color:#dc3545; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3); white-space:nowrap; display:inline-block;">🏭 ${src.source_id}</div>`
          })
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width:180px;">
            <h6 style="margin:0; font-weight:bold; color:#dc3545;">🏭 ${src.source_name || src.source_id}</h6>
            <p style="margin:4px 0; font-size:12px;"><strong>Price:</strong> ₹${src.price_per_mt_ex_terminal?.toLocaleString() || 58000} / MT</p>
            <p style="margin:0; font-size:11px; color:#666;">Lat: ${lat}, Lng: ${lng}</p>
          </div>
        `);
      }
    });

    // 2. Add Retail Stations (Green / Red Markers)
    stations.forEach((st) => {
      if (st.coordinates?.lat && st.coordinates?.lng) {
        const lat = Number(st.coordinates.lat);
        const lng = Number(st.coordinates.lng);
        bounds.push([lat, lng]);

        const isLow = st.sufficient_fuel === "NO";
        const pinColor = isLow ? "#dc3545" : "#198754";

        const marker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            className: "custom-pin-station",
            iconSize: null,
            html: `<div style="background-color:${pinColor}; color:white; padding:2px 6px; border-radius:10px; font-weight:bold; font-size:10px; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3); white-space:nowrap; display:inline-block;">⛽ ${st.station}</div>`
          })
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width:200px;">
            <h6 style="margin:0; font-weight:bold; color:${pinColor};">⛽ ${st.station}</h6>
            <p style="margin:4px 0; font-size:12px;"><strong>Capacity:</strong> ${st.capacity_in_lt?.toLocaleString()} L</p>
            <p style="margin:4px 0; font-size:12px;"><strong>Usable Stock:</strong> ${st.usable_lt?.toLocaleString()} L</p>
            <p style="margin:4px 0; font-size:12px;"><strong>Dead Stock:</strong> ${st.dead_stock_in_lt?.toLocaleString()} L</p>
            <span style="background:${pinColor}; color:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">${isLow ? "LOW FUEL ALERT" : "SUFFICIENT FUEL"}</span>
          </div>
        `);
      }
    });

    // 3. Add Dynamic Route Lines for Scheduled Delivery Plans
    const colors = ["#0d6efd", "#6f42c1", "#d63384", "#fd7e14", "#20c997", "#0dcaf0"];
    deliveryPlans.forEach((plan, idx) => {
      const routeColor = colors[idx % colors.length];
      const sourceObj = sources.find((s) => s.source_id === plan.source_id);
      const points = [];

      if (sourceObj?.coordinates?.lat && sourceObj?.coordinates?.lng) {
        points.push([Number(sourceObj.coordinates.lat), Number(sourceObj.coordinates.lng)]);
      }

      (plan.stops || []).forEach((stop) => {
        const stObj = stations.find((s) => s.station === stop.station);
        if (stObj?.coordinates?.lat && stObj?.coordinates?.lng) {
          points.push([Number(stObj.coordinates.lat), Number(stObj.coordinates.lng)]);
        }
      });

      if (points.length >= 2) {
        window.L.polyline(points, {
          color: routeColor,
          weight: 4,
          opacity: 0.8,
          dashArray: "6, 8"
        }).addTo(map);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [stations, sources, trucks, deliveryPlans]);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">🗺️ Feature 2: Interactive OpenStreetMap Geospatial Route & Fleet Canvas</h5>
        <span className="badge bg-primary">Live GIS View</span>
      </div>
      <div className="card-body p-2">
        <div ref={mapRef} style={{ height: "420px", width: "100%", borderRadius: "8px" }} />
      </div>
    </div>
  );
};
