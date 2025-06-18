// 팀 API 라우트 (Application Layer)
import { type NextRequest, NextResponse } from "next/server"
import { teamService } from "@/lib/services/team.service"
import { createTeamSchema } from "@/lib/validations"
import { createApiResponse, handleError } from "@/lib/func"

// GET /api/teams - 팀 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberIdx = Number(searchParams.get("memberIdx"))
    const query = searchParams.get("query")
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 20

    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    let teams,
      total = 0

    if (query) {
      ;[teams, total] = await teamService.searchTeams(memberIdx, query, page, limit)
    } else {
      teams = await teamService.getAllTeams(memberIdx)
      total = teams.length
    }

    return NextResponse.json(
      createApiResponse(true, {
        teams,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
    )
  } catch (error) {
    const errorMessage = handleError(error, "GET /api/teams")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// POST /api/teams - 팀 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 입력 검증
    const validatedData = createTeamSchema.parse(body)

    const team = await teamService.createTeam(validatedData)

    return NextResponse.json(createApiResponse(true, team, "팀이 성공적으로 생성되었습니다."), { status: 201 })
  } catch (error) {
    const errorMessage = handleError(error, "POST /api/teams")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}
