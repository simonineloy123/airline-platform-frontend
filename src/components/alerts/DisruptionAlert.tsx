'use client'
import { motion } from 'framer-motion'
import { Disruption } from '@/types'
import { getSeverityColor, formatDelay, formatDateTime } from '@/lib/utils'
import { AlertTriangle, Clock, Users } from 'lucide-react'

interface DisruptionAlertProps {
  disruption: Disruption
}

export function DisruptionAlert({ disruption }: DisruptionAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-5 border border-slate-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <span className="text-white font-bold">{disruption.flightNumber}</span>
          <span className="text-slate-400 text-sm">
            {disruption.origin} → {disruption.destination}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(disruption.severity)}`}>
          {disruption.severity}
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-3">{disruption.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDelay(disruption.delayMinutes)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {disruption.passengers} pasajeros
        </span>
        <span>{formatDateTime(disruption.detectedAt)}</span>
      </div>
    </motion.div>
  )
}
