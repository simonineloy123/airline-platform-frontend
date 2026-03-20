'use client'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Plane, AlertTriangle, Brain, TrendingUp } from 'lucide-react'

export function StatsCards() {
  const { stats } = useAppStore()

  const cards = [
    {
      title:    'Vuelos Totales',
      value:    stats.totalFlights,
      icon:     Plane,
      color:    'from-blue-600 to-blue-700',
      change:   '+12% hoy'
    },
    {
      title:    'Disrupciones',
      value:    stats.totalDisruptions,
      icon:     AlertTriangle,
      color:    'from-orange-600 to-orange-700',
      change:   stats.totalDisruptions > 0 ? '⚠️ Activas' : '✅ Sin disrupciones'
    },
    {
      title:    'Recomendaciones IA',
      value:    stats.pendingRecommendations,
      icon:     Brain,
      color:    'from-purple-600 to-purple-700',
      change:   'Pendientes de acción'
    },
    {
      title:    'Eficiencia',
      value:    `${Math.max(0, 100 - stats.delayedFlights * 5)}%`,
      icon:     TrendingUp,
      color:    'from-green-600 to-green-700',
      change:   'Operativa hoy'
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium opacity-80">{card.title}</p>
            <card.icon className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{card.value}</p>
          <p className="text-xs mt-1 opacity-70">{card.change}</p>
        </motion.div>
      ))}
    </div>
  )
}
