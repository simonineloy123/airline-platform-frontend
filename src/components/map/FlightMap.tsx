"use client";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { AIRPORT_COORDS as AIRPORTS } from "@/lib/airports";
import { FLIGHT_STATUS_ES } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#3b82f6",
  BOARDING: "#eab308",
  DEPARTED: "#22c55e",
  DELAYED: "#f97316",
  CANCELLED: "#ef4444",
  LANDED: "#6b7280",
  DIVERTED: "#a855f7",
};

function getPlaneAngle(from: [number, number], to: [number, number]): number {
  const dy = to[0] - from[0];
  const dx = to[1] - from[1];
  return Math.atan2(dx, dy) * (180 / Math.PI);
}

function createPlaneIcon(L: any, color: string, angle: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" style="transform:rotate(${angle}deg);filter:drop-shadow(0 0 4px ${color})"><path fill="${color}" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: "",
  });
}

export default function FlightMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const linesRef = useRef<any[]>([]);
  const { flights } = useAppStore();

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (mapInstance.current) return;
    if ((mapRef.current as any)._leaflet_id) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const map = L.map(mapRef.current!, {
        center: [-5, -50],
        zoom: 3,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 18,
        },
      ).addTo(map);

      Object.entries(AIRPORTS).forEach(([code, [lat, lng]]) => {
        const dot = L.circleMarker([lat, lng], {
          radius: 4,
          fillColor: "#60a5fa",
          color: "#bfdbfe",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(map);
        dot.bindTooltip(`<b>${code}</b>`, {
          permanent: false,
          direction: "top",
        });
      });

      mapInstance.current = map;
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        if (mapRef.current) delete (mapRef.current as any)._leaflet_id;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (flights.length === 0) return;

    const timer = setTimeout(async () => {
      if (!mapInstance.current) return;

      const L = (await import("leaflet")).default;

      markersRef.current.forEach((m) => m.remove());
      linesRef.current.forEach((l) => l.remove());
      markersRef.current = [];
      linesRef.current = [];

      flights.forEach((flight) => {
        const originCoords = AIRPORTS[flight.origin];
        const destCoords = AIRPORTS[flight.destination];
        if (!originCoords || !destCoords) return;

        const color = STATUS_COLORS[flight.status] ?? "#6b7280";
        const angle = getPlaneAngle(originCoords, destCoords);
        const midLat = (originCoords[0] + destCoords[0]) / 2 + 3;
        const midLng = (originCoords[1] + destCoords[1]) / 2;

        const curve = L.polyline([originCoords, [midLat, midLng], destCoords], {
          color,
          weight: flight.status === "DELAYED" ? 2 : 1.5,
          opacity: flight.status === "CANCELLED" ? 0.2 : 0.5,
          dashArray: flight.status === "DELAYED" ? "8 5" : undefined,
          smoothFactor: 2,
        }).addTo(mapInstance.current);
        linesRef.current.push(curve);

        const progress =
          flight.status === "LANDED"
            ? 1
            : flight.status === "SCHEDULED"
              ? 0
              : 0.5;

        const planeLat =
          originCoords[0] + (destCoords[0] - originCoords[0]) * progress;
        const planeLng =
          originCoords[1] + (destCoords[1] - originCoords[1]) * progress;

        const icon = createPlaneIcon(L, color, angle);
        const marker = L.marker([planeLat, planeLng], { icon }).addTo(
          mapInstance.current,
        );

        marker.bindPopup(
          `
          <div style="font-family:sans-serif;min-width:190px;padding:4px">
            <div style="font-weight:700;font-size:15px;margin-bottom:6px">✈️ ${flight.flightNumber}</div>
            <div style="color:#94a3b8;font-size:12px;margin-bottom:8px">${flight.origin} → ${flight.destination}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="background:${color};color:#fff;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600">${FLIGHT_STATUS_ES[flight.status] ?? flight.status}</span>            </div>
            ${flight.delayMinutes > 0 ? `<div style="color:#f97316;font-size:12px;margin-bottom:4px">⏱ ${flight.delayMinutes} min de retraso</div>` : ""}
            <div style="color:#94a3b8;font-size:11px">👥 ${flight.passengers} pasajeros</div>
          </div>
        `,
          { maxWidth: 220 },
        );

        markersRef.current.push(marker);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [flights]);

  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper { background:#1e293b!important; border:1px solid #334155!important; border-radius:12px!important; color:white!important; box-shadow:0 8px 32px rgba(0,0,0,0.4)!important; }
        .leaflet-popup-tip { background:#1e293b!important; }
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
    </>
  );
}
