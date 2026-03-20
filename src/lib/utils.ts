import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { FlightStatus, DisruptionSeverity, RecommendationType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: FlightStatus): string {
  const colors: Record<FlightStatus, string> = {
    SCHEDULED: 'bg-blue-500',
    BOARDING:  'bg-yellow-500',
    DEPARTED:  'bg-green-500',
    DELAYED:   'bg-orange-500',
    CANCELLED: 'bg-red-500',
    LANDED:    'bg-gray-500',
    DIVERTED:  'bg-purple-500',
  }
  return colors[status] ?? 'bg-gray-400'
}

export function getSeverityColor(severity: DisruptionSeverity): string {
  const colors: Record<DisruptionSeverity, string> = {
    LOW:      'bg-green-100 text-green-800 border-green-200',
    MEDIUM:   'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH:     'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[severity] ?? 'bg-gray-100 text-gray-800'
}

export function getRecommendationIcon(type: RecommendationType): string {
  const icons: Record<RecommendationType, string> = {
    DELAY_FLIGHT:        '⏱️',
    CANCEL_FLIGHT:       '❌',
    REBOOK_PASSENGERS:   '🔄',
    CHANGE_AIRCRAFT:     '✈️',
    NOTIFY_PASSENGERS:   '📢',
    OFFER_COMPENSATION:  '💰',
    DIVERT_FLIGHT:       '↗️',
    EXPEDITE_TURNAROUND: '⚡',
  }
  return icons[type] ?? '📋'
}

export function formatDelay(minutes: number): string {
  if (!minutes || minutes <= 0) return '-'
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return '--:--'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '--'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '--'
    return date.toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return '--'
  }
}

export const FLIGHT_STATUS_ES: Record<string, string> = {
  SCHEDULED: 'Programado',
  BOARDING:  'Embarcando',
  DEPARTED:  'En vuelo',
  DELAYED:   'Retrasado',
  CANCELLED: 'Cancelado',
  LANDED:    'Aterrizó',
  DIVERTED:  'Desviado',
}

export const RECOMMENDATION_TYPE_ES: Record<string, string> = {
  DELAY_FLIGHT:        'Retrasar vuelo',
  CANCEL_FLIGHT:       'Cancelar vuelo',
  REBOOK_PASSENGERS:   'Reubicar pasajeros',
  CHANGE_AIRCRAFT:     'Cambiar aeronave',
  NOTIFY_PASSENGERS:   'Notificar pasajeros',
  OFFER_COMPENSATION:  'Ofrecer compensación',
  DIVERT_FLIGHT:       'Desviar vuelo',
  EXPEDITE_TURNAROUND: 'Acelerar rotación',
}
