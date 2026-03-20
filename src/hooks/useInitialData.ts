import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

const API_URL         = process.env.NEXT_PUBLIC_API_URL         ?? 'http://localhost:8081'
const DISRUPTION_URL  = process.env.NEXT_PUBLIC_DISRUPTION_URL  ?? 'http://localhost:8082'
const IMPACT_URL      = process.env.NEXT_PUBLIC_IMPACT_URL      ?? 'http://localhost:8083'
const AI_URL          = process.env.NEXT_PUBLIC_AI_URL          ?? 'http://localhost:8084'
const GATEWAY_URL     = process.env.NEXT_PUBLIC_GATEWAY_URL     ?? 'http://localhost:8085'

const SERVICES = [
  { name: 'Flight Data',   url: API_URL },
  { name: 'Disruption',    url: DISRUPTION_URL },
  { name: 'Impact',        url: IMPACT_URL },
  { name: 'AI',            url: AI_URL },
  { name: 'Gateway',       url: GATEWAY_URL },
]

export function useInitialData() {
  const { updateFlight, addDisruption, addImpactReport, addRecommendation, updateStats } = useAppStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [flightsRes, disruptionsRes, impactsRes, recsRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/v1/flights`),
          fetch(`${DISRUPTION_URL}/api/v1/disruptions`),
          fetch(`${IMPACT_URL}/api/v1/impact-reports`),
          fetch(`${AI_URL}/api/v1/recommendations`),
        ])

        if (flightsRes.status === 'fulfilled' && flightsRes.value.ok) {
          const data = await flightsRes.value.json()
          data.forEach((f: any) => updateFlight(f))
        }
        if (disruptionsRes.status === 'fulfilled' && disruptionsRes.value.ok) {
          const data = await disruptionsRes.value.json()
          data.forEach((d: any) => addDisruption(d))
        }
        if (impactsRes.status === 'fulfilled' && impactsRes.value.ok) {
          const data = await impactsRes.value.json()
          data.forEach((r: any) => addImpactReport(r))
        }
        if (recsRes.status === 'fulfilled' && recsRes.value.ok) {
          const data = await recsRes.value.json()
          data.forEach((r: any) => addRecommendation(r))
        }

        updateStats()
      } catch (e) {
        console.warn('Error cargando datos iniciales:', e)
      }
    }

    load()
  }, [])

  useEffect(() => {
    const ping = async () => {
      await Promise.allSettled(
        SERVICES.map(s => fetch(`${s.url}/q/health`, { signal: AbortSignal.timeout(5000) }))
      )
    }

    ping() 
    const interval = setInterval(ping, 30000)
    return () => clearInterval(interval)
  }, [])
}