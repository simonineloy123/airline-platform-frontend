'use client'
import { useAppStore } from '@/store/useAppStore'
import { getStatusColor, formatTime, formatDelay, FLIGHT_STATUS_ES } from '@/lib/utils'
import { Flight } from '@/types'

export function FlightTable() {
  const { flights } = useAppStore()

  if (flights.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Vuelos Activos</h3>
        <p className="text-slate-500 text-sm text-center py-8">No hay vuelos registrados aún...</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-white font-semibold mb-4">Vuelos Activos</h3>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-2 pr-4">Vuelo</th>
              <th className="text-left py-2 pr-4">Ruta</th>
              <th className="text-left py-2 pr-4">Salida</th>
              <th className="text-left py-2 pr-4">Estado</th>
              <th className="text-left py-2">Retraso</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight: Flight) => (
              <tr key={flight.id ?? flight.flightNumber} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-3 pr-4 text-white font-medium">{flight.flightNumber}</td>
                <td className="py-3 pr-4 text-slate-400">{flight.origin} → {flight.destination}</td>
                <td className="py-3 pr-4 text-slate-300">{formatTime(flight.scheduledDep)}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full text-white ${getStatusColor(flight.status)}`}>
                    {FLIGHT_STATUS_ES[flight.status] ?? flight.status}
                  </span>
                </td>
                <td className="py-3 text-orange-400">
                  {flight.delayMinutes > 0 ? formatDelay(flight.delayMinutes) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}