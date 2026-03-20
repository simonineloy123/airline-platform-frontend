'use client'
import { useAppStore } from '@/store/useAppStore'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#f97316', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
  const { flights, disruptions, stats } = useAppStore()

  const statusData = [
    { name: 'Programados', value: flights.filter(f => f.status === 'SCHEDULED').length },
    { name: 'Retrasados',  value: flights.filter(f => f.status === 'DELAYED').length },
    { name: 'Cancelados',  value: flights.filter(f => f.status === 'CANCELLED').length },
    { name: 'En vuelo',    value: flights.filter(f => f.status === 'DEPARTED').length },
  ].filter(d => d.value > 0)

  const disruptionData = disruptions.slice(0, 8).map(d => ({
    name:  d.flightNumber,
    delay: d.delayMinutes,
    pax:   d.passengers,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          Analytics
        </h2>
        <p className="text-slate-400 text-sm mt-1">Métricas operativas en tiempo real</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Vuelos',   value: stats.totalFlights,    icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Pasajeros Est.', value: flights.reduce((a, f) => a + f.passengers, 0), icon: Users, color: 'text-green-400' },
          { label: 'Min. Retraso',  value: disruptions.reduce((a, d) => a + d.delayMinutes, 0), icon: Clock, color: 'text-orange-400' },
          { label: 'Disrupciones',  value: stats.totalDisruptions, icon: BarChart3, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Retrasos por Vuelo</h3>
          {disruptionData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={disruptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="delay" fill="#f97316" radius={[4, 4, 0, 0]} name="Minutos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Estado de Vuelos</h3>
          {statusData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
