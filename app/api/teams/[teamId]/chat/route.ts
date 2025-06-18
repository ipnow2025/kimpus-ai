// 팀 채팅 API 라우트
import { type NextRequest, NextResponse } from "next/server"
import { teamChatService } from "@/lib/services/team-chat.service"
import { createTeamChatMessageSchema } from "@/lib/validations"
import { createApiResponse, handleError } from "@/lib/func"

// GET /api/teams/[teamId]/chat - 팀 채팅 메시지 조회
export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const memberIdx = Number(searchParams.get("memberIdx"))
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 50
    const since = searchParams.get("since") ? Number(searchParams.get("since")) : undefined
    const { teamId } = params

    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    let messages,
      total = 0

    if (since) {
      messages = await teamChatService.getRecentMessages(teamId, memberIdx, since)
      total = messages.length
    } else {
      ;[messages, total] = await teamChatService.getTeamMessages(teamId, memberIdx, page, limit)
    }

    return NextResponse.json(
      createApiResponse(true, {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
    )
  } catch (error) {
    const errorMessage = handleError(error, `GET /api/teams/${params.teamId}/chat`)
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// POST /api/teams/[teamId]/chat - 팀 채팅 메시지 전송
export async function POST(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const body = await request.json()
    const { teamId } = params

    // 입력 검증
    const validatedData = createTeamChatMessageSchema.parse({ ...body, teamId })

    const memberIdx = Number(body.memberIdx)
    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    const message = await teamChatService.sendMessage(validatedData, memberIdx)

    return NextResponse.json(createApiResponse(true, message, "메시지가 성공적으로 전송되었습니다."), { status: 201 })
  } catch (error) {
    const errorMessage = handleError(error, `POST /api/teams/${params.teamId}/chat`)
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}
