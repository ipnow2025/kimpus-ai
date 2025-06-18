import { NextResponse } from "next/server"
import { getMessages, addMessage } from "@/lib/chat-store"
import type { TeamChatMessage } from "@/lib/types"

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = params
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
  }
  const messages = getMessages(teamId)
  return NextResponse.json(messages)
}

export async function POST(request: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = params
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
  }

  try {
    const body = (await request.json()) as Omit<TeamChatMessage, "id" | "timestamp">
    if (!body.message || !body.userId || !body.userName) {
      return NextResponse.json({ error: "Invalid message payload" }, { status: 400 })
    }

    const newMessage = addMessage(teamId, body)
    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 })
  }
}
