import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { WebSocketProvider } from '@/components/dashboard/WebSocketProvider'
import { Toaster } from 'sonner'
import { DataLoader } from '@/components/dashboard/DataLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Airline Operations Intelligence Platform',
  description: 'Monitoreo de vuelos en tiempo real con IA',
  icons: {
    icon: '/icon',
    apple: '/icon',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <WebSocketProvider>
          <DataLoader>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col ml-64">
                <TopBar />
                <main className="flex-1 overflow-auto p-6">
                  {children}
                </main>
              </div>
            </div>
          </DataLoader>
          <Toaster theme="dark" position="top-right" richColors />
        </WebSocketProvider>
      </body>
    </html>
  )
}