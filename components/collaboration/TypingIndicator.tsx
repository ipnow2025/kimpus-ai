"use client"

interface TypingUser {
  userId: string
  userName: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
  currentUserId: string
  isDarkMode?: boolean
}

export function TypingIndicator({ typingUsers, currentUserId, isDarkMode = false }: TypingIndicatorProps) {
  const filteredUsers = typingUsers.filter((user) => user.userId !== currentUserId)

  if (filteredUsers.length === 0) return null

  const textClass = isDarkMode ? "text-gray-400" : "text-gray-500"

  const getTypingText = () => {
    if (filteredUsers.length === 1) {
      return `${filteredUsers[0].userName}님이 입력 중입니다...`
    } else if (filteredUsers.length === 2) {
      return `${filteredUsers[0].userName}님과 ${filteredUsers[1].userName}님이 입력 중입니다...`
    } else {
      return `${filteredUsers[0].userName}님 외 ${filteredUsers.length - 1}명이 입력 중입니다...`
    }
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 ${textClass}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
      <span className="text-sm">{getTypingText()}</span>
    </div>
  )
}
