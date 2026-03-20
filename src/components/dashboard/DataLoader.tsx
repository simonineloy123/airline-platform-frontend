'use client'
import { useInitialData } from '@/hooks/useInitialData'

export function DataLoader({ children }: { children: React.ReactNode }) {
  useInitialData()
  return <>{children}</>
}
