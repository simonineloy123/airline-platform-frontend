import { useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketEvent } from '@/types'

interface UseWebSocketOptions {
  url: string
  onEvent?: (event: WebSocketEvent) => void
  reconnectInterval?: number
}

interface UseWebSocketReturn {
  isConnected: boolean
  lastEvent: WebSocketEvent | null
  events: WebSocketEvent[]
  connectionError: string | null
}

export function useWebSocket({
  url,
  onEvent,
  reconnectInterval = 3000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null)
  const [events, setEvents] = useState<WebSocketEvent[]>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(false)

  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const connectRef = useRef<() => void>(() => {})

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!mountedRef.current) return
        setIsConnected(true)
        setConnectionError(null)
      }

      ws.onmessage = (event) => {
        if (!mountedRef.current) return
        try {
          const data: WebSocketEvent = JSON.parse(event.data)
          setLastEvent(data)
          setEvents(prev => [data, ...prev].slice(0, 100))
          onEventRef.current?.(data)
        } catch (err) {
          console.error('[WebSocket] Error parseando mensaje:', err)
        }
      }

      ws.onclose = () => {
        if (!mountedRef.current) return
        setIsConnected(false)
        reconnectTimerRef.current = setTimeout(() => {
          connectRef.current()
        }, reconnectInterval)
      }

      ws.onerror = () => {
        if (!mountedRef.current) return
        setConnectionError('Error de conexión con el servidor')
      }

    } catch {
      setConnectionError('No se pudo conectar al servidor')
      reconnectTimerRef.current = setTimeout(() => {
        connectRef.current()
      }, reconnectInterval)
    }
  }, [url, reconnectInterval])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    mountedRef.current = true

    const id = setTimeout(() => {
      connectRef.current()
    }, 0)

    return () => {
      mountedRef.current = false
      clearTimeout(id)
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  return { isConnected, lastEvent, events, connectionError }
}