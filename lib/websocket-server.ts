// WebSocket 서버 (실시간 협업 기능)
import { WebSocketServer } from "ws"
import type { IncomingMessage } from "http"

interface WebSocketClient {
  id: string
  userId: string
  userName: string
  teamId: string
  ws: any
  lastSeen: number
  isTyping: boolean
}

interface WebSocketMessage {
  type: "join" | "leave" | "chat" | "typing" | "note-update" | "task-update" | "cursor-move"
  data: any
  userId: string
  userName: string
  teamId: string
  timestamp: number
}

class CollaborationWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WebSocketClient> = new Map()
  private teamRooms: Map<string, Set<string>> = new Map()
  private sharedNotes: Map<string, string> = new Map()
  private typingUsers: Map<string, Set<string>> = new Map()

  initialize(server: any) {
    this.wss = new WebSocketServer({ server })

    this.wss.on("connection", (ws: any, request: IncomingMessage) => {
      const url = new URL(request.url!, `http://${request.headers.host}`)
      const userId = url.searchParams.get("userId")
      const userName = url.searchParams.get("userName")
      const teamId = url.searchParams.get("teamId")

      if (!userId || !userName || !teamId) {
        ws.close(1008, "Missing required parameters")
        return
      }

      const clientId = `${userId}-${Date.now()}`
      const client: WebSocketClient = {
        id: clientId,
        userId,
        userName,
        teamId,
        ws,
        lastSeen: Date.now(),
        isTyping: false,
      }

      this.clients.set(clientId, client)
      this.joinTeamRoom(teamId, clientId)

      // 새 사용자 접속 알림
      this.broadcastToTeam(
        teamId,
        {
          type: "user-joined",
          data: { userId, userName },
          userId,
          userName,
          teamId,
          timestamp: Date.now(),
        },
        clientId,
      )

      // 현재 온라인 사용자 목록 전송
      this.sendOnlineUsers(teamId, clientId)

      ws.on("message", (message: string) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message)
          this.handleMessage(clientId, parsedMessage)
        } catch (error) {
          console.error("Invalid WebSocket message:", error)
        }
      })

      ws.on("close", () => {
        this.handleDisconnect(clientId)
      })

      ws.on("error", (error: Error) => {
        console.error("WebSocket error:", error)
        this.handleDisconnect(clientId)
      })

      // 하트비트
      const heartbeat = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.ping()
          client.lastSeen = Date.now()
        } else {
          clearInterval(heartbeat)
        }
      }, 30000)

      ws.on("pong", () => {
        client.lastSeen = Date.now()
      })
    })

    // 비활성 클라이언트 정리
    setInterval(() => {
      this.cleanupInactiveClients()
    }, 60000)
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (message.type) {
      case "chat":
        this.handleChatMessage(client, message)
        break
      case "typing":
        this.handleTyping(client, message)
        break
      case "note-update":
        this.handleNoteUpdate(client, message)
        break
      case "task-update":
        this.handleTaskUpdate(client, message)
        break
      case "cursor-move":
        this.handleCursorMove(client, message)
        break
    }
  }

  private handleChatMessage(client: WebSocketClient, message: WebSocketMessage) {
    // 채팅 메시지를 팀의 모든 멤버에게 브로드캐스트
    this.broadcastToTeam(client.teamId, {
      type: "chat",
      data: {
        id: `msg-${Date.now()}`,
        message: message.data.message,
        userId: client.userId,
        userName: client.userName,
        timestamp: Date.now(),
      },
      userId: client.userId,
      userName: client.userName,
      teamId: client.teamId,
      timestamp: Date.now(),
    })
  }

  private handleTyping(client: WebSocketClient, message: WebSocketMessage) {
    const { isTyping } = message.data
    client.isTyping = isTyping

    if (!this.typingUsers.has(client.teamId)) {
      this.typingUsers.set(client.teamId, new Set())
    }

    const teamTypingUsers = this.typingUsers.get(client.teamId)!

    if (isTyping) {
      teamTypingUsers.add(client.userId)
    } else {
      teamTypingUsers.delete(client.userId)
    }

    // 타이핑 상태를 다른 사용자들에게 브로드캐스트
    this.broadcastToTeam(
      client.teamId,
      {
        type: "typing-update",
        data: {
          typingUsers: Array.from(teamTypingUsers).map((userId) => {
            const typingClient = Array.from(this.clients.values()).find((c) => c.userId === userId)
            return { userId, userName: typingClient?.userName || "Unknown" }
          }),
        },
        userId: client.userId,
        userName: client.userName,
        teamId: client.teamId,
        timestamp: Date.now(),
      },
      client.id,
    )
  }

  private handleNoteUpdate(client: WebSocketClient, message: WebSocketMessage) {
    const { content, cursorPosition } = message.data

    // 공유 노트 업데이트
    this.sharedNotes.set(client.teamId, content)

    // 다른 사용자들에게 노트 변경사항 브로드캐스트
    this.broadcastToTeam(
      client.teamId,
      {
        type: "note-update",
        data: {
          content,
          cursorPosition,
          updatedBy: client.userName,
        },
        userId: client.userId,
        userName: client.userName,
        teamId: client.teamId,
        timestamp: Date.now(),
      },
      client.id,
    )
  }

  private handleTaskUpdate(client: WebSocketClient, message: WebSocketMessage) {
    // 태스크 업데이트를 다른 사용자들에게 브로드캐스트
    this.broadcastToTeam(
      client.teamId,
      {
        type: "task-update",
        data: message.data,
        userId: client.userId,
        userName: client.userName,
        teamId: client.teamId,
        timestamp: Date.now(),
      },
      client.id,
    )
  }

  private handleCursorMove(client: WebSocketClient, message: WebSocketMessage) {
    // 커서 위치를 다른 사용자들에게 브로드캐스트
    this.broadcastToTeam(
      client.teamId,
      {
        type: "cursor-move",
        data: {
          userId: client.userId,
          userName: client.userName,
          position: message.data.position,
        },
        userId: client.userId,
        userName: client.userName,
        teamId: client.teamId,
        timestamp: Date.now(),
      },
      client.id,
    )
  }

  private joinTeamRoom(teamId: string, clientId: string) {
    if (!this.teamRooms.has(teamId)) {
      this.teamRooms.set(teamId, new Set())
    }
    this.teamRooms.get(teamId)!.add(clientId)
  }

  private leaveTeamRoom(teamId: string, clientId: string) {
    const room = this.teamRooms.get(teamId)
    if (room) {
      room.delete(clientId)
      if (room.size === 0) {
        this.teamRooms.delete(teamId)
      }
    }
  }

  private broadcastToTeam(teamId: string, message: any, excludeClientId?: string) {
    const room = this.teamRooms.get(teamId)
    if (!room) return

    room.forEach((clientId) => {
      if (clientId === excludeClientId) return

      const client = this.clients.get(clientId)
      if (client && client.ws.readyState === client.ws.OPEN) {
        client.ws.send(JSON.stringify(message))
      }
    })
  }

  private sendOnlineUsers(teamId: string, clientId: string) {
    const client = this.clients.get(clientId)
    if (!client) return

    const room = this.teamRooms.get(teamId)
    if (!room) return

    const onlineUsers = Array.from(room)
      .map((id) => this.clients.get(id))
      .filter((c) => c && c.ws.readyState === c.ws.OPEN)
      .map((c) => ({
        userId: c!.userId,
        userName: c!.userName,
        lastSeen: c!.lastSeen,
        isTyping: c!.isTyping,
      }))

    client.ws.send(
      JSON.stringify({
        type: "online-users",
        data: { users: onlineUsers },
        timestamp: Date.now(),
      }),
    )
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId)
    if (!client) return

    // 타이핑 상태 정리
    const teamTypingUsers = this.typingUsers.get(client.teamId)
    if (teamTypingUsers) {
      teamTypingUsers.delete(client.userId)
    }

    // 팀 룸에서 제거
    this.leaveTeamRoom(client.teamId, clientId)

    // 사용자 퇴장 알림
    this.broadcastToTeam(client.teamId, {
      type: "user-left",
      data: { userId: client.userId, userName: client.userName },
      userId: client.userId,
      userName: client.userName,
      teamId: client.teamId,
      timestamp: Date.now(),
    })

    // 클라이언트 제거
    this.clients.delete(clientId)
  }

  private cleanupInactiveClients() {
    const now = Date.now()
    const timeout = 5 * 60 * 1000 // 5분

    this.clients.forEach((client, clientId) => {
      if (now - client.lastSeen > timeout) {
        this.handleDisconnect(clientId)
      }
    })
  }

  // 공유 노트 가져오기
  getSharedNote(teamId: string): string {
    return this.sharedNotes.get(teamId) || ""
  }

  // 공유 노트 설정
  setSharedNote(teamId: string, content: string) {
    this.sharedNotes.set(teamId, content)
  }
}

export const collaborationWS = new CollaborationWebSocketServer()
