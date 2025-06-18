// 팀 태스크 API 라우트
import { type NextRequest, NextResponse } from "next/server"
import { teamTaskService } from "@/lib/services/team-task.service"
import { createTeamTaskSchema } from "@/lib/validations"
import { createApiResponse, handleError } from "@/lib/func"

// GET /api/teams/[teamId]/tasks - 팀 태스크 목록 조회
export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const memberIdx = Number(searchParams.get("memberIdx"))
    const { teamId } = params

    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    const tasks = await teamTaskService.getTeamTasks(teamId, memberIdx)

    return NextResponse.json(createApiResponse(true, { tasks }))
  } catch (error) {
    const errorMessage = handleError(error, `GET /api/teams/${params.teamId}/tasks`)
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// POST /api/teams/[teamId]/tasks - 팀 태스크 생성
export async function POST(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const body = await request.json()
    const { teamId } = params

    // 입력 검증
    const validatedData = createTeamTaskSchema.parse({ ...body, teamId })

    const memberIdx = Number(body.memberIdx)
    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    const task = await teamTaskService.createTask(validatedData, memberIdx)

    return NextResponse.json(createApiResponse(true, task, "태스크가 성공적으로 생성되었습니다."), { status: 201 })
  } catch (error) {
    const errorMessage = handleError(error, `POST /api/teams/${params.teamId}/tasks`)
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}
