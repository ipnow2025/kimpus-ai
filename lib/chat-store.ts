import type { TeamChatMessage } from "./types"

// This is a simple in-memory store.
// In a real application, you would replace this with a database (e.g., Vercel KV, Upstash, Supabase).
const messageStore = new Map<string, TeamChatMessage[]>()

// Initialize with some mock data for a default team if it doesn't exist
const initialTeamId = "team1"
if (!messageStore.has(initialTeamId)) {
  messageStore.set(initialTeamId, [
    {
      id: "msg1",
      userId: "user2",
      userName: "이서연",
      message: "안녕하세요! 이 과제 어떻게 시작할까요?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "msg2",
      userId: "user1",
      userName: "김민준",
      message: "자료 조사부터 시작하는게 좋을 것 같아요.",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ])
}

export const getMessages = (teamId: string): TeamChatMessage[] => {
  return messageStore.get(teamId) || []
}

export const addMessage = (teamId: string, message: Omit<TeamChatMessage, "id" | "timestamp">): TeamChatMessage => {
  const messages = messageStore.get(teamId) || []
  const newMessage: TeamChatMessage = {
    ...message,
    id: `msg${Date.now()}`,
    timestamp: new Date(),
  }
  messages.push(newMessage)
  messageStore.set(teamId, messages)
  return newMessage
}
