// 🚨 TODO: ChatGPT API 연결 필수 구현 부분
// 이 API 라우트는 프론트엔드에서 ChatGPT 기능을 사용할 때 호출됩니다.

import { type NextRequest, NextResponse } from "next/server"
import { callChatGPT, type ChatGPTRequest } from "@/lib/openai-client"
import { z } from "zod"

// 요청 검증 스키마
const generateRequestSchema = z.object({
  prompt: z.string().min(1, "프롬프트는 필수입니다"),
  type: z.enum(["assignment", "question", "chat"]),
  context: z
    .object({
      courseName: z.string().optional(),
      assignmentTitle: z.string().optional(),
      teamName: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = generateRequestSchema.parse(body)

    // 🚨 핵심: 실제 ChatGPT API 호출
    const response = await callChatGPT(validatedData as ChatGPTRequest)

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error("AI 생성 API 오류:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "잘못된 요청 형식입니다", details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: "AI 응답 생성 중 오류가 발생했습니다" }, { status: 500 })
  }
}
