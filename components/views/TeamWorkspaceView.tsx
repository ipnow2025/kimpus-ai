"use client"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Team, Assignment, User, TeamTask, TeamChatMessage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  const [tasks, setTasks] = useState<TeamTask[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [messages, setMessages] = useState<TeamChatMessage[]>([])
  const [newChatMessage, setNewChatMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const chatScrollAreaRef = useRef<HTMLDivElement>(null)

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
    setTasks([
      { id: "task1", text: "자료 조사", completed: true, assignedTo: team.members[0]?.id },
      { id: "task2", text: "초안 작성", completed: false },
      { id: "task3", text: "최종 검토", completed: false, assignedTo: team.members[1]?.id },
    ])

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${team.id}`)
        if (response.ok) {
          const data: TeamChatMessage[] = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }

    fetchMessages()
    const intervalId = setInterval(fetchMessages, 3000)
    return () => clearInterval(intervalId)
  }, [team, assignment])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!team) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">팀 정보를 불러올 수 없습니다.</h2>
        <Button onClick={onBack}>뒤로가기</Button>
      </div>
    )
  }

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      setTasks([...tasks, { id: `task${Date.now()}`, text: newTaskText, completed: false }])
      setNewTaskText("")
    }
  }

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const handleSendChatMessage = async () => {
    if (!newChatMessage.trim() || isSending) return
    setIsSending(true)

    const messagePayload = {
      userId: currentUser.id,
      userName: currentUser.name,
      message: newChatMessage,
    }

    try {
      const response = await fetch(`/api/chat/${team.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagePayload),
      })

      if (response.ok) {
        const newMessage: TeamChatMessage = await response.json()
        setMessages((prev) => [...prev, newMessage])
        setNewChatMessage("")
      } else {
        console.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
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
            <Textarea
              value={sharedNotes}
              onChange={(e) => setSharedNotes(e.target.value)}
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

          <Card className={`${cardClass}`}>
            <CardHeader>
              <CardTitle className={`${textClass} flex items-center text-lg`}>
                <ListChecks className="w-5 h-5 mr-2" /> 팀 작업 목록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ScrollArea className="h-40 pr-2">
                {tasks.map((task) => (
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
          <ScrollArea
            className={`h-64 border rounded-md p-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            ref={chatScrollAreaRef}
          >
            <div className="space-y-3">
              {messages.map((msg) => (
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
              onChange={(e) => setNewChatMessage(e.target.value)}
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
