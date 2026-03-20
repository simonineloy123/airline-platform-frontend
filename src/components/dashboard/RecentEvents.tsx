'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { formatDateTime, FLIGHT_STATUS_ES } from '@/lib/utils'
import { Plane, AlertTriangle, Brain, Activity } from 'lucide-react'
import { WebSocketEvent } from '@/types'

const eventIcons: Record<string, React.ElementType> = {
  flight_event:         Plane,
  disruption_event:     AlertTriangle,
  recommendation_event: Brain,
  impact_event:         Activity,
}

const eventColors: Record<string, string> = {
  flight_event:         'bg-blue-500/10 border-blue-500/30 text-blue-400',
  disruption_event:     'bg-orange-500/10 border-orange-500/30 text-orange-400',
  recommendation_event: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  impact_event:         'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
}

const eventLabels: Record<string, string> = {
  flight_event:         'Vuelo',
  disruption_event:     'Disrupción',
  recommendation_event: 'Recomendación IA',
  impact_event:         'Impacto',
}

function getEventDescription(event: WebSocketEvent): string {
  const p = event.payload as Record<string, unknown>

  switch (event.eventType) {
    case 'flight_event': {
      const status = FLIGHT_STATUS_ES[p.status as string] ?? p.status
      const delay  = p.delayMinutes && Number(p.delayMinutes) > 0
        ? ` — ${p.delayMinutes} min de retraso`
        : ''
      return `${status}${delay}`
    }
    case 'disruption_event':
      return (p.description as string) ?? `Disrupción ${p.type ?? ''}`
    case 'recommendation_event':
      return (p.description as string) ?? `Recomendación: ${p.type ?? ''}`
    case 'impact_event':
      return `${p.affectedPassengers ?? 0} pasajeros afectados — ${p.severity ?? ''}`
    default:
      return event.topic
  }
}

export function RecentEvents() {
  const { recentEvents } = useAppStore()

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-400" />
        Eventos en Tiempo Real
      </h3>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {recentEvents.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              Esperando eventos...
            </p>
          ) : (
            recentEvents.map((event, i) => {
              const Icon       = eventIcons[event.eventType] ?? Activity
              const colorClass = eventColors[event.eventType] ?? 'bg-slate-700'
              const payload    = event.payload as Record<string, unknown>
              const label      = eventLabels[event.eventType] ?? event.eventType
              const desc       = getEventDescription(event)

              return (
                <motion.div
                  key={`${event.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass}`}
                >
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {(payload.flightNumber as string) ?? label}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{desc}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">
                    {formatDateTime(event.timestamp)}
                  </span>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
