"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface WebSocketMessage {
  type: string
  data: any
  userId: string
  userName: string
  teamId: string
  timestamp: number
}

interface UseWebSocketOptions {
  userId: string
  userName: string
  teamId: string
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket({
  userId,
  userName,
  teamId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    try {
      const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws?userId=${userId}&userName=${encodeURIComponent(userName)}&teamId=${teamId}`

      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        onConnect?.()
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          // 내장 메시지 타입 처리
          switch (message.type) {
            case "online-users":
              setOnlineUsers(message.data.users)
              break
            case "typing-update":
              setTypingUsers(message.data.typingUsers)
              break
            case "user-joined":
            case "user-left":
              // 온라인 사용자 목록 새로고침 요청
              sendMessage("get-online-users", {})
              break
          }

          onMessage?.(message)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.current.onclose = () => {
        setIsConnected(false)
        setOnlineUsers([])
        setTypingUsers([])
        onDisconnect?.()

        // 자동 재연결
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, Math.pow(2, reconnectAttempts.current) * 1000) // 지수 백오프
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        onError?.(error)
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
    }
  }, [userId, userName, teamId, onMessage, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (ws.current) {
      ws.current.close()
      ws.current = null
    }

    setIsConnected(false)
    setOnlineUsers([])
    setTypingUsers([])
  }, [])

  const sendMessage = useCallback(
    (type: string, data: any) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type,
            data,
            userId,
            userName,
            teamId,
            timestamp: Date.now(),
          }),
        )
      }
    },
    [userId, userName, teamId],
  )

  // 특화된 메시지 전송 함수들
  const sendChatMessage = useCallback(
    (message: string) => {
      sendMessage("chat", { message })
    },
    [sendMessage],
  )

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      sendMessage("typing", { isTyping })
    },
    [sendMessage],
  )

  const sendNoteUpdate = useCallback(
    (content: string, cursorPosition?: number) => {
      sendMessage("note-update", { content, cursorPosition })
    },
    [sendMessage],
  )

  const sendTaskUpdate = useCallback(
    (taskData: any) => {
      sendMessage("task-update", taskData)
    },
    [sendMessage],
  )

  const sendCursorMove = useCallback(
    (position: { x: number; y: number }) => {
      sendMessage("cursor-move", { position })
    },
    [sendMessage],
  )

  useEffect(() => {
    if (userId && userName && teamId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [userId, userName, teamId, connect, disconnect])

  return {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendChatMessage,
    sendTypingStatus,
    sendNoteUpdate,
    sendTaskUpdate,
    sendCursorMove,
    connect,
    disconnect,
  }
}
