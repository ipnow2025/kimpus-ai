"use client"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Team, Assignment, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Briefcase,
  FileText,
  ListChecks,
  MessageSquare,
  Send,
  Paperclip,
  PlusCircle,
  Trash2,
  Loader2,
  UserPlus,
  MailQuestion,
  CheckCircle,
  XCircle,
} from "lucide-react"

import { useTeamTasksQuery } from "@/hooks/use-team-tasks-query"
import { useTeamChatQuery } from "@/hooks/use-team-chat-query"
import { useWebSocket } from "@/hooks/use-websocket"
import { OnlineUsers } from "@/components/collaboration/OnlineUsers"
import { TypingIndicator } from "@/components/collaboration/TypingIndicator"
import { CollaborativeTextarea } from "@/components/collaboration/CollaborativeTextarea"

interface TeamWorkspaceViewProps {
  team: Team | null
  assignment: Assignment | null
  currentUser: User
  allUsers: User[] // To get user details for pending members
  isDarkMode: boolean
  isMobile: boolean
  onBack: () => void
  onInviteMembers: (team: Team) => void
  onAcceptInvitation: (teamId: string, userId: string) => void
  onRejectInvitation: (teamId: string, userId: string) => void
}

const TeamWorkspaceView: React.FC<TeamWorkspaceViewProps> = ({
  team,
  assignment,
  currentUser,
  allUsers,
  isDarkMode,
  isMobile,
  onBack,
  onInviteMembers,
  onAcceptInvitation,
  onRejectInvitation,
}) => {
  const [sharedNotes, setSharedNotes] = useState("")
  const [newTaskText, setNewTaskText] = useState("")
  const [newChatMessage, setNewChatMessage] = useState("")
  const chatScrollAreaRef = useRef<HTMLDivElement>(null)

  // 기존 상태들 제거하고 React Query hooks로 교체
  const { tasks, addTask, updateTask, deleteTask } = useTeamTasksQuery(team?.id || "")
  const { messages, sendMessage, isSending } = useTeamChatQuery(team?.id || "")

  // 기존 useState들 제거
  // const [tasks, setTasks] = useState<TeamTask[]>([])
  // const [messages, setMessages] = useState<TeamChatMessage[]>([])
  // const [isSending, setIsSending] = useState(false)

  const scrollToBottom = () => {
    if (chatScrollAreaRef.current) {
      const scrollViewport = chatScrollAreaRef.current.querySelector("div")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }

  const getUserById = (userId: string): User | undefined => {
    return allUsers.find((u) => u.id === userId)
  }

  useEffect(() => {
    if (!team) return
    setSharedNotes(`# ${assignment?.title || team.name} 작업 공간\n\n공동 작업 노트를 여기에 작성하세요.`)
  }, [team, assignment])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // WebSocket 연결
  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendChatMessage: wsSendMessage,
    sendTypingStatus,
    sendNoteUpdate,
    sendTaskUpdate,
  } = useWebSocket({
    userId: currentUser.id,
    userName: currentUser.name,
    teamId: team?.id || "",
    onMessage: (message) => {
      switch (message.type) {
        case "chat":
          // 실시간 채팅 메시지 수신
          setMessages((prev) => [...prev, message.data])
          break
        case "note-update":
          // 실시간 노트 업데이트
          if (message.data.updatedBy !== currentUser.name) {
            setSharedNotes(message.data.content)
          }
          break
        case "task-update":
          // 실시간 태스크 업데이트
          // React Query가 자동으로 처리하므로 invalidate만 수행
          break
      }
    },
  })

  if (!team) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">팀 정보를 불러올 수 없습니다.</h2>
        <Button onClick={onBack}>뒤로가기</Button>
      </div>
    )
  }

  const handleAddTask = async () => {
    if (newTaskText.trim()) {
      try {
        await addTask({ text: newTaskText, completed: false })
        setNewTaskText("")
      } catch (error) {
        console.error("Failed to add task:", error)
      }
    }
  }

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      try {
        await updateTask(taskId, { completed: !task.completed })
      } catch (error) {
        console.error("Failed to toggle task:", error)
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleSendChatMessage = async () => {
    if (!newChatMessage.trim() || isSending) return

    try {
      // WebSocket으로 실시간 전송
      wsSendMessage(newChatMessage)

      // 서버에도 저장
      await sendMessage(newChatMessage)
      setNewChatMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // 타이핑 상태 처리
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const [isTyping, setIsTyping] = useState(false)

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewChatMessage(e.target.value)

    // 타이핑 시작 알림
    if (!isTyping) {
      sendTypingStatus(true)
      setIsTyping(true)
    }

    // 타이핑 중지 타이머 설정
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false)
      setIsTyping(false)
    }, 1000)
  }

  const cardClass = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
  const textClass = isDarkMode ? "text-white" : "text-gray-900"
  const mutedTextClass = isDarkMode ? "text-gray-400" : "text-gray-500"
  const inputClass = isDarkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold ${textClass} flex items-center`}>
            <Briefcase className={`mr-2 h-6 w-6 ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} />팀 작업 공간:{" "}
            {team.name}
          </h1>
          {assignment && <p className={`text-sm ${mutedTextClass}`}>과제: {assignment.title}</p>}
        </div>
        <Button variant="outline" onClick={onBack}>
          팀 목록으로 돌아가기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`${cardClass} lg:col-span-2`}>
          <CardHeader>
            <CardTitle className={`${textClass} flex items-center text-lg`}>
              <FileText className="w-5 h-5 mr-2" /> 공유 노트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CollaborativeTextarea
              value={sharedNotes}
              onChange={setSharedNotes}
              onContentChange={(content, position) => {
                sendNoteUpdate(content, position)
              }}
              rows={isMobile ? 10 : 15}
              className={`${inputClass} text-sm leading-relaxed`}
              placeholder="여기에 팀 노트를 작성하세요..."
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto">노트 저장 (구현 예정)</Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className={`${cardClass}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={`${textClass} flex items-center text-lg`}>
                <Users className="w-5 h-5 mr-2" /> 팀원 ({team.members.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => onInviteMembers(team)}>
                <UserPlus className="w-4 h-4 mr-1.5" /> 초대
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{member.name.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className={`${textClass} text-sm`}>{member.name}</span>
                  {member.id === currentUser.id && (
                    <Badge variant="secondary" className="text-xs">
                      나
                    </Badge>
                  )}
                </div>
              ))}
              {team.pendingMemberIds.length > 0 && (
                <div className="mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                  <h5 className={`text-xs font-semibold ${mutedTextClass} mb-1.5 flex items-center`}>
                    <MailQuestion className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                    초대 대기중 ({team.pendingMemberIds.length})
                  </h5>
                  {team.pendingMemberIds.map((pendingId) => {
                    const pendingUser = getUserById(pendingId)
                    return (
                      <div key={pendingId} className="flex items-center justify-between text-sm py-0.5">
                        <div className="flex items-center space-x-1.5">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={pendingUser?.avatar || "/placeholder.svg"} alt={pendingUser?.name} />
                            <AvatarFallback className="text-[10px]">{pendingUser?.name.substring(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span className={`${textClass}`}>{pendingUser?.name || "알 수 없는 사용자"}</span>
                        </div>
                        {pendingId === currentUser.id && (
                          <div className="flex space-x-1">
                            <Button
                              size="xs"
                              variant="ghost"
                              className="p-1 h-auto text-green-500 hover:text-green-600"
                              onClick={() => onAcceptInvitation(team.id, pendingId)}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="p-1 h-auto text-red-500 hover:text-red-600"
                              onClick={() => onRejectInvitation(team.id, pendingId)}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <OnlineUsers
            users={onlineUsers}
            currentUserId={currentUser.id}
            isConnected={isConnected}
            isDarkMode={isDarkMode}
          />

          <Card className={`${cardClass}`}>
            <CardHeader>
              <CardTitle className={`${textClass} flex items-center text-lg`}>
                <ListChecks className="w-5 h-5 mr-2" /> 팀 작업 목록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ScrollArea className="h-40 pr-2">
                {tasks?.map((task) => (
                  <div key={task.id} className="flex items-center justify-between space-x-2 py-1 group">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                      />
                      <Label
                        htmlFor={`task-${task.id}`}
                        className={`${textClass} text-sm ${task.completed ? "line-through text-gray-500" : ""} cursor-pointer`}
                      >
                        {task.text}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex items-center space-x-2 pt-2">
                <Input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="새 작업 추가..."
                  className={`${inputClass} text-sm flex-grow`}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                />
                <Button size="icon" onClick={handleAddTask}>
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className={`${cardClass}`}>
        <CardHeader>
          <CardTitle className={`${textClass} flex items-center text-lg`}>
            <MessageSquare className="w-5 h-5 mr-2" /> 팀 토론
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TypingIndicator typingUsers={typingUsers} currentUserId={currentUser.id} isDarkMode={isDarkMode} />
          <ScrollArea
            className={`h-64 border rounded-md p-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            ref={chatScrollAreaRef}
          >
            <div className="space-y-3">
              {messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.userId === currentUser.id ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] p-2 rounded-lg ${msg.userId === currentUser.id ? (isDarkMode ? "bg-blue-700" : "bg-blue-500 text-white") : isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <p className="text-xs font-medium mb-0.5">
                      {msg.userName} {msg.userId === currentUser.id && "(나)"}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-[10px] text-right mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              value={newChatMessage}
              onChange={handleChatInputChange}
              placeholder="메시지 입력..."
              className={`${inputClass} flex-grow`}
              onKeyPress={(e) => e.key === "Enter" && handleSendChatMessage()}
              disabled={isSending}
            />
            <Button variant="ghost" size="icon" disabled={isSending}>
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button onClick={handleSendChatMessage} disabled={isSending}>
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default TeamWorkspaceView
