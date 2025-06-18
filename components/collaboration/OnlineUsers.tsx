"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wifi, WifiOff } from "lucide-react"

interface OnlineUser {
  userId: string
  userName: string
  lastSeen: number
  isTyping: boolean
}

interface OnlineUsersProps {
  users: OnlineUser[]
  currentUserId: string
  isConnected: boolean
  isDarkMode?: boolean
}

export function OnlineUsers({ users, currentUserId, isConnected, isDarkMode = false }: OnlineUsersProps) {
  const cardClass = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
  const textClass = isDarkMode ? "text-white" : "text-gray-900"

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-3">
        <CardTitle className={`${textClass} flex items-center text-sm`}>
          {isConnected ? (
            <Wifi className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 mr-2 text-red-500" />
          )}
          온라인 ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user) => (
          <div key={user.userId} className="flex items-center space-x-2">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                <AvatarFallback className="text-xs">{user.userName.substring(0, 1)}</AvatarFallback>
              </Avatar>
              {/* 온라인 상태 표시 */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className={`${textClass} text-sm truncate`}>{user.userName}</span>
                {user.userId === currentUserId && (
                  <Badge variant="secondary" className="text-xs">
                    나
                  </Badge>
                )}
              </div>
              {user.isTyping && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-blue-500">입력 중...</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-4">
            <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">온라인 사용자가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
