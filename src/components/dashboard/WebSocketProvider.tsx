'use client'

import { useEffect, useCallback } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAppStore } from '@/store/useAppStore'
import {
  Flight,
  Disruption,
  ImpactReport,
  Recommendation,
  WebSocketEvent,
} from '@/types'
import { toast } from 'sonner'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8085/ws/events'

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const {
    setConnected,
    setConnectionError,
    addEvent,
    updateFlight,
    addDisruption,
    addImpactReport,
    addRecommendation,
    updateStats,
  } = useAppStore()

  const handleEvent = useCallback(
    (event: WebSocketEvent) => {
      if (event.eventType === 'connected') return

      addEvent(event)

      switch (event.eventType) {
        case 'flight_event': {
          const payload = event.payload as Record<string, unknown>
          if (payload.flightNumber) {
            updateFlight(payload as unknown as Flight)
            if (payload.status === 'DELAYED') {
              toast.warning(
                `✈️ Vuelo ${payload.flightNumber} retrasado ${payload.delayMinutes} min`,
                { duration: 5000 }
              )
            }
          }
          break
        }
        case 'disruption_event': {
          const disruption = event.payload as Disruption
          addDisruption(disruption)
          toast.error(
            `🚨 Disrupción: ${disruption.flightNumber} — ${disruption.severity}`,
            { duration: 8000 }
          )
          break
        }
        case 'impact_event': {
          addImpactReport(event.payload as ImpactReport)
          break
        }
        case 'recommendation_event': {
          const rec = event.payload as Recommendation
          addRecommendation(rec)
          toast.info(
            `🤖 Nueva recomendación IA para ${rec.flightNumber}`,
            { duration: 6000 }
          )
          break
        }
        default:
          break
      }

      updateStats()
    },
    [addEvent, updateFlight, addDisruption, addImpactReport, addRecommendation, updateStats]
  )

  const { isConnected, connectionError } = useWebSocket({
    url: WS_URL,
    onEvent: handleEvent,
  })

  useEffect(() => { setConnected(isConnected) }, [isConnected, setConnected])
  useEffect(() => { setConnectionError(connectionError) }, [connectionError, setConnectionError])

  return <>{children}</>
}