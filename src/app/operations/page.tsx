'use client'
import { useAppStore } from '@/store/useAppStore'
import { DisruptionAlert } from '@/components/alerts/DisruptionAlert'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function OperationsPage() {
  const { disruptions } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          Panel de Operaciones
        </h2>
        <p className="text-slate-400 text-sm mt-1">Disrupciones detectadas en tiempo real</p>
      </div>
      {disruptions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No hay disrupciones activas</p>
          <p className="text-slate-600 text-sm mt-1">El sistema está monitoreando todos los vuelos</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {disruptions.map(disruption => (
            <DisruptionAlert key={disruption.id} disruption={disruption} />
          ))}
        </div>
      )}
    </div>
  )
}
