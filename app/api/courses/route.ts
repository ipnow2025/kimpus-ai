// 과목 API 라우트 (Application Layer)
import { type NextRequest, NextResponse } from "next/server"
import { courseService } from "@/lib/services/course.service"
import { createCourseSchema } from "@/lib/validations"
import { createApiResponse, handleError } from "@/lib/func"

// GET /api/courses - 과목 목록 조회
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

    let courses,
      total = 0

    if (query) {
      ;[courses, total] = await courseService.searchCourses(memberIdx, query, page, limit)
    } else {
      courses = await courseService.getAllCourses(memberIdx)
      total = courses.length
    }

    return NextResponse.json(
      createApiResponse(true, {
        courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
    )
  } catch (error) {
    const errorMessage = handleError(error, "GET /api/courses")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// POST /api/courses - 과목 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 입력 검증
    const validatedData = createCourseSchema.parse(body)

    // 과목 코드 중복 확인
    const isDuplicate = await courseService.checkCodeDuplicate(validatedData.code, validatedData.memberIdx)

    if (isDuplicate) {
      return NextResponse.json(createApiResponse(false, null, "", "이미 존재하는 과목 코드입니다."), { status: 409 })
    }

    const course = await courseService.createCourse(validatedData)

    return NextResponse.json(createApiResponse(true, course, "과목이 성공적으로 생성되었습니다."), { status: 201 })
  } catch (error) {
    const errorMessage = handleError(error, "POST /api/courses")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}
