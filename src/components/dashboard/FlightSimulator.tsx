"use client";
import { useState } from "react";
import { Plane, Zap, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

const ROUTES = [
  { from: "EZE", to: "MAD", airline: "AR" },
  { from: "EZE", to: "MIA", airline: "AA" },
  { from: "GRU", to: "LHR", airline: "LA" },
  { from: "SCL", to: "JFK", airline: "LA" },
  { from: "BOG", to: "MAD", airline: "IB" },
  { from: "LIM", to: "MIA", airline: "CM" },
  { from: "MIA", to: "EZE", airline: "AA" },
  { from: "MAD", to: "GRU", airline: "IB" },
  { from: "JFK", to: "LHR", airline: "BA" },
  { from: "CDG", to: "EZE", airline: "AF" },
  { from: "FRA", to: "BOG", airline: "LH" },
  { from: "AMS", to: "LIM", airline: "KL" },
  { from: "DXB", to: "GRU", airline: "EK" },
  { from: "EZE", to: "SCL", airline: "AR" },
  { from: "MEX", to: "BOG", airline: "AM" },
  { from: "GRU", to: "EZE", airline: "LA" },
];

const AIRCRAFT = ["LV-HKP", "LV-GVP", "LV-FUJ", "LV-BXQ"];
const DELAYS = [30, 45, 60, 90, 120, 180];

export function FlightSimulator() {
  const [loading, setLoading] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [lastFN, setLastFN] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<number | "">("");

  // Crea el vuelo y devuelve { id, fn } o null si falla
  const doCreateFlight = async (
    routeIdx: number,
  ): Promise<{ id: string; fn: string } | null> => {
    const route = ROUTES[routeIdx];
    const suffix = Math.floor(Math.random() * 9000 + 1000);
    const fn = `${route.airline}${suffix}`;
    const dep = new Date(Date.now() + 86400000).toISOString().slice(0, 19);
    const arr = new Date(Date.now() + 100800000).toISOString().slice(0, 19);
    const pax = Math.floor(Math.random() * 200 + 80);
    const gate = `${String.fromCharCode(65 + Math.floor(Math.random() * 8))}${Math.floor(Math.random() * 20 + 1)}`;

    const res = await fetch(`${API_URL}/api/v1/flights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flightNumber: fn,
        origin: route.from,
        destination: route.to,
        aircraftId: AIRCRAFT[Math.floor(Math.random() * AIRCRAFT.length)],
        scheduledDep: dep,
        scheduledArr: arr,
        passengers: pax,
        gate,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, fn };
  };

  // Aplica retraso a un ID específico
  const doApplyDelay = async (id: string, fn: string): Promise<boolean> => {
    const minutes = DELAYS[Math.floor(Math.random() * DELAYS.length)];
    const res = await fetch(`${API_URL}/api/v1/flights/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DELAYED", delayMinutes: minutes }),
    });
    if (!res.ok) return false;
    toast.warning(`⏱️ ${fn} retrasado ${minutes} min — pipeline IA activado!`);
    return true;
  };

  const createFlight = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const idx =
        selectedRoute !== ""
          ? selectedRoute
          : Math.floor(Math.random() * ROUTES.length);
      const result = await doCreateFlight(idx);
      if (!result) {
        toast.error("Error creando vuelo");
        return;
      }
      setLastId(result.id);
      setLastFN(result.fn);
      const route = ROUTES[idx];
      toast.success(
        `✈️ Vuelo ${result.fn} creado — ${route.from} → ${route.to}`,
      );
    } catch {
      toast.error("Error creando vuelo");
    } finally {
      setLoading(false);
    }
  };

  const applyDelay = async () => {
    if (loading) return;
    if (!lastId || !lastFN) return toast.warning("Primero creá un vuelo");
    setLoading(true);
    try {
      const ok = await doApplyDelay(lastId, lastFN);
      if (!ok) toast.error("Error aplicando retraso");
    } catch {
      toast.error("Error aplicando retraso");
    } finally {
      setLoading(false);
    }
  };

  const cancelFlight = async () => {
    if (loading) return;
    if (!lastId || !lastFN) return toast.warning("Primero creá un vuelo");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/flights/${lastId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", delayMinutes: 0 }),
      });
      if (!res.ok) throw new Error();
      toast.error(`❌ Vuelo ${lastFN} cancelado`);
      setLastId(null);
      setLastFN(null);
    } catch {
      toast.error("Error cancelando vuelo");
    } finally {
      setLoading(false);
    }
  };

  const runFullScenario = async () => {
    if (loading) return;
    setLoading(true);
    try {
      toast.info("🎬 Ejecutando escenario completo...");
      const idx =
        selectedRoute !== ""
          ? selectedRoute
          : Math.floor(Math.random() * ROUTES.length);
      const result = await doCreateFlight(idx);
      if (!result) {
        toast.error("Error en escenario — no se pudo crear el vuelo");
        return;
      }
      setLastId(result.id);
      setLastFN(result.fn);
      const route = ROUTES[idx];
      toast.success(`✈️ ${result.fn} creado — ${route.from} → ${route.to}`);

      await new Promise((r) => setTimeout(r, 2000));

      const ok = await doApplyDelay(result.id, result.fn);
      if (!ok) {
        toast.error("Error aplicando retraso en escenario");
        return;
      }
      toast.success("🎬 Escenario completo — mirá el pipeline en acción!");
    } catch {
      toast.error("Error en escenario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        Simulador de Eventos
      </h3>

      <div className="mb-3">
        <label className="text-xs text-slate-400 mb-1 block">
          Ruta (opcional)
        </label>
        <select
          value={selectedRoute}
          onChange={(e) =>
            setSelectedRoute(
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          className="w-full bg-slate-700 text-white text-xs rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
        >
          <option value="">Aleatoria</option>
          {ROUTES.map((r, i) => (
            <option key={i} value={i}>
              {r.from} → {r.to} ({r.airline})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <button
          onClick={createFlight}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
        >
          <Plane className="w-4 h-4" />
          {loading ? "Procesando..." : "Crear vuelo"}
        </button>

        <button
          onClick={applyDelay}
          disabled={loading || !lastId}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Aplicar retraso aleatorio
        </button>

        <button
          onClick={cancelFlight}
          disabled={loading || !lastId}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Cancelar vuelo
        </button>

        <button
          onClick={runFullScenario}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? "Ejecutando..." : "Escenario completo ⚡"}
        </button>
      </div>

      {lastFN && (
        <p className="text-xs text-slate-500 mt-3">
          Último vuelo:{" "}
          <span className="text-blue-400 font-medium">{lastFN}</span>
        </p>
      )}
    </div>
  );
}
