// 과제 API 라우트 (Application Layer)
import { type NextRequest, NextResponse } from "next/server"
import { assignmentService } from "@/lib/services/assignment.service"
import { createAssignmentSchema } from "@/lib/validations"
import { createApiResponse, handleError } from "@/lib/func"

// GET /api/assignments - 과제 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberIdx = Number(searchParams.get("memberIdx"))
    const query = searchParams.get("query")
    const filter = (searchParams.get("filter") as "all" | "pending" | "completed" | "overdue") || "all"
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 20

    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    let assignments,
      total = 0

    if (query) {
      ;[assignments, total] = await assignmentService.searchAssignments(memberIdx, query, page, limit)
    } else if (filter !== "all") {
      ;[assignments, total] = await assignmentService.getAssignmentsByFilter(memberIdx, filter, page, limit)
    } else {
      assignments = await assignmentService.getAllAssignments(memberIdx)
      total = assignments.length
    }

    return NextResponse.json(
      createApiResponse(true, {
        assignments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
    )
  } catch (error) {
    const errorMessage = handleError(error, "GET /api/assignments")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// POST /api/assignments - 과제 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 입력 검증
    const validatedData = createAssignmentSchema.parse(body)

    const assignment = await assignmentService.createAssignment(validatedData)

    return NextResponse.json(createApiResponse(true, assignment, "과제가 성공적으로 생성되었습니다."), { status: 201 })
  } catch (error) {
    const errorMessage = handleError(error, "POST /api/assignments")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}
