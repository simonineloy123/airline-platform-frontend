'use client'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/store/useAppStore'
import { getStatusColor } from '@/lib/utils'
import { Map } from 'lucide-react'

const FlightMap = dynamic(() => import('@/components/map/FlightMap'), { ssr: false })

export default function MapPage() {
  const { flights } = useAppStore()

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-400" />
            Mapa de Vuelos
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {flights.length} vuelos monitoreados en tiempo real
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          {[
            { status: 'SCHEDULED', label: 'Programado' },
            { status: 'DEPARTED',  label: 'En vuelo' },
            { status: 'DELAYED',   label: 'Retrasado' },
            { status: 'CANCELLED', label: 'Cancelado' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5 text-slate-400">
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status as any)}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="h-[calc(100vh-200px)] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <FlightMap />
      </div>
    </div>
  )
}
