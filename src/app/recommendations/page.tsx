'use client'
import { useAppStore } from '@/store/useAppStore'
import { RecommendationCard } from '@/components/recommendations/RecommendationCard'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function RecommendationsPage() {
  const { recommendations } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Recomendaciones IA
        </h2>
        <p className="text-slate-400 text-sm mt-1">Sugerencias generadas por Groq LLaMA en tiempo real</p>
      </div>
      {recommendations.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No hay recomendaciones aún</p>
          <p className="text-slate-600 text-sm mt-1">La IA generará recomendaciones cuando detecte disrupciones</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {recommendations.map(rec => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  )
}
