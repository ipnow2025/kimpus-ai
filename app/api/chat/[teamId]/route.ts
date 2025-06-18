import { type NextRequest, NextResponse } from "next/server"
import { teamChatService } from "@/service/teamChat"
import { routeWrapper } from "../route-wrapper"
import { z } from "zod"
import { callChatGPT } from "@/lib/openai-client"

const postSchema = z.object({
  content: z.string().min(1),
  teamId: z.string().min(1),
})

export const POST = routeWrapper(async (req: NextRequest) => {
  const body = await req.json()
  const { content, teamId } = postSchema.parse(body)

  const team = await teamChatService.getTeamById(Number.parseInt(teamId))

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  const message = await teamChatService.createMessage({
    teamId: Number.parseInt(teamId),
    senderIdx: 1, // TODO: 유저 ID로 변경
    senderName: "Test User", // TODO: 유저 이름으로 변경
    content,
    messageType: "text",
  })

  if (content.includes("@AI") || content.includes("@김조교")) {
    // 🔧 실제 ChatGPT API 호출로 교체
    try {
      const aiResponse = await callChatGPT({
        prompt: content.replace(/@AI|@김조교/g, "").trim(),
        type: "chat",
        context: {
          teamName: team.name,
        },
      })

      // AI 응답을 채팅에 추가
      await teamChatService.createMessage({
        teamId: Number.parseInt(teamId),
        senderIdx: 0, // AI 봇 ID
        senderName: "김조교 AI",
        content: aiResponse.content,
        messageType: "text",
      })
    } catch (error) {
      console.error("AI 응답 생성 오류:", error)
      // 에러 처리
    }
  }

  return NextResponse.json(message)
})
