'use client'
import { useAppStore } from '@/store/useAppStore'
import { Plane, AlertTriangle, Clock, XCircle } from 'lucide-react'

export function TopBar() {
  const { stats } = useAppStore()

  const metrics = [
    { label: 'Vuelos Activos',  value: stats.activeFlights,    icon: Plane,          color: 'text-blue-400' },
    { label: 'Retrasados',      value: stats.delayedFlights,   icon: Clock,          color: 'text-orange-400' },
    { label: 'Cancelados',      value: stats.cancelledFlights, icon: XCircle,        color: 'text-red-400' },
    { label: 'Disrupciones',    value: stats.totalDisruptions, icon: AlertTriangle,  color: 'text-yellow-400' },
  ]

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center px-6 gap-8">
      {metrics.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-slate-400 text-sm">{label}:</span>
          <span className="text-white font-bold">{value}</span>
        </div>
      ))}
    </header>
  )
}