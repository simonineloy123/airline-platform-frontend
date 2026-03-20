'use client'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentEvents } from '@/components/dashboard/RecentEvents'
import { FlightTable } from '@/components/dashboard/FlightTable'
import { FlightSimulator } from '@/components/dashboard/FlightSimulator'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard Operativo</h2>
        <p className="text-slate-400 text-sm mt-1">Monitoreo en tiempo real — Airline Operations Intelligence Platform</p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <FlightTable />
        </div>
        <div className="space-y-4">
          <FlightSimulator />
          <RecentEvents />
        </div>
      </div>
    </div>
  )
}
