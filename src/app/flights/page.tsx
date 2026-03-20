"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Plus, Search } from "lucide-react";
import { Flight } from "@/types";
import {
  getStatusColor,
  formatTime,
  formatDelay,
  FLIGHT_STATUS_ES,
} from "@/lib/utils";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";
console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);

const AIRPORTS = [
  "EZE",
  "AEP",
  "GRU",
  "SCL",
  "BOG",
  "LIM",
  "MIA",
  "JFK",
  "LAX",
  "MAD",
  "BCN",
  "LHR",
  "CDG",
  "FRA",
  "DXB",
  "SIN",
  "NRT",
  "MVD",
  "MEX",
  "GIG",
];

function toISOWithSeconds(val: string): string {
  if (!val) return "";
  return val.length === 16 ? `${val}:00` : val;
}

function getDefaultDates() {
  const dep = new Date(Date.now() + 86400000);
  const arr = new Date(Date.now() + 100800000);
  return {
    dep: dep.toISOString().slice(0, 16),
    arr: arr.toISOString().slice(0, 16),
  };
}

const emptyForm = () => {
  const { dep, arr } = getDefaultDates();
  return {
    flightNumber: "",
    origin: "EZE",
    destination: "MAD",
    aircraftId: "LV-HKP",
    scheduledDep: dep,
    scheduledArr: arr,
    passengers: 180,
    gate: "A01",
  };
};

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/flights`);
      const data = await res.json();
      setFlights(data);
    } catch {
      toast.error("Error cargando vuelos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const handleSubmit = async () => {
    console.log("POST URL:", `${API_URL}/api/v1/flights`);
    if (!form.flightNumber || !form.scheduledDep || !form.scheduledArr) {
      return toast.warning("Completá todos los campos obligatorios");
    }
    setLoading(true);
    try {
      const body = {
        flightNumber: form.flightNumber,
        origin: form.origin,
        destination: form.destination,
        aircraftId: form.aircraftId,
        scheduledDep: toISOWithSeconds(form.scheduledDep),
        scheduledArr: toISOWithSeconds(form.scheduledArr),
        passengers: form.passengers,
        gate: form.gate,
      };
      const res = await fetch(`${API_URL}/api/v1/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Error backend:", err);
        throw new Error(err);
      }
      toast.success(`✈️ Vuelo ${form.flightNumber} creado!`);
      setShowForm(false);
      setForm(emptyForm());
      loadFlights();
    } catch {
      toast.error("Error creando vuelo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelay = async (id: string, flightNumber: string) => {
    try {
      await fetch(`${API_URL}/api/v1/flights/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELAYED", delayMinutes: 90 }),
      });
      toast.warning(`⏱️ Vuelo ${flightNumber} retrasado 90 min`);
      loadFlights();
    } catch {
      toast.error("Error aplicando retraso");
    }
  };

  const handleCancel = async (id: string, flightNumber: string) => {
    try {
      await fetch(`${API_URL}/api/v1/flights/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", delayMinutes: 0 }),
      });
      toast.error(`❌ Vuelo ${flightNumber} cancelado`);
      loadFlights();
    } catch {
      toast.error("Error cancelando vuelo");
    }
  };

  const filtered = flights.filter(
    (f) =>
      f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.origin.toLowerCase().includes(search.toLowerCase()) ||
      f.destination.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-400" />
            Gestión de Vuelos
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {flights.length} vuelos registrados
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo vuelo
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800 rounded-xl p-6 border border-blue-500/30"
          >
            <h3 className="text-white font-semibold mb-4">Nuevo Vuelo</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Número de vuelo *
                </label>
                <input
                  value={form.flightNumber}
                  onChange={(e) =>
                    setForm({ ...form, flightNumber: e.target.value })
                  }
                  placeholder="AR1234"
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Origen *
                </label>
                <select
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Destino *
                </label>
                <select
                  value={form.destination}
                  onChange={(e) =>
                    setForm({ ...form, destination: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Aeronave
                </label>
                <input
                  value={form.aircraftId}
                  onChange={(e) =>
                    setForm({ ...form, aircraftId: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Salida *
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledDep}
                  onChange={(e) =>
                    setForm({ ...form, scheduledDep: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Llegada *
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledArr}
                  onChange={(e) =>
                    setForm({ ...form, scheduledArr: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Pasajeros
                </label>
                <input
                  type="number"
                  value={form.passengers}
                  onChange={(e) =>
                    setForm({ ...form, passengers: Number(e.target.value) })
                  }
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Gate
                </label>
                <input
                  value={form.gate}
                  onChange={(e) => setForm({ ...form, gate: e.target.value })}
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm transition-colors"
              >
                Crear vuelo
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por vuelo, origen o destino..."
          className="w-full bg-slate-800 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700 bg-slate-800/80">
              <th className="text-left py-3 px-4">Vuelo</th>
              <th className="text-left py-3 px-4">Ruta</th>
              <th className="text-left py-3 px-4">Salida</th>
              <th className="text-left py-3 px-4">Llegada</th>
              <th className="text-left py-3 px-4">Pasajeros</th>
              <th className="text-left py-3 px-4">Gate</th>
              <th className="text-left py-3 px-4">Estado</th>
              <th className="text-left py-3 px-4">Retraso</th>
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((flight) => (
              <tr
                key={flight.id ?? flight.flightNumber}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">
                  {flight.flightNumber}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {flight.origin} → {flight.destination}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {formatTime(flight.scheduledDep)}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {formatTime(flight.scheduledArr)}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {flight.passengers}
                </td>
                <td className="py-3 px-4 text-slate-300">{flight.gate}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(flight.status)}`}
                  >
                    {FLIGHT_STATUS_ES[flight.status] ?? flight.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-orange-400">
                  {flight.delayMinutes > 0
                    ? formatDelay(flight.delayMinutes)
                    : "-"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {flight.status !== "CANCELLED" &&
                      flight.status !== "LANDED" && (
                        <>
                          <button
                            onClick={() =>
                              handleDelay(flight.id, flight.flightNumber)
                            }
                            className="text-xs bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 px-2 py-1 rounded transition-colors"
                          >
                            Retrasar
                          </button>
                          <button
                            onClick={() =>
                              handleCancel(flight.id, flight.flightNumber)
                            }
                            className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 px-2 py-1 rounded transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            No hay vuelos que coincidan
          </p>
        )}
      </div>
    </div>
  );
}
