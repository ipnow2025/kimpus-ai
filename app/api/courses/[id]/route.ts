// 개별 과목 API 라우트
import { type NextRequest, NextResponse } from "next/server"
import { courseService } from "@/lib/services/course.service"
import { updateCourseSchema } from "@/lib/validations"
import { createApiResponse, handleError } from "@/lib/func"

// GET /api/courses/[id] - 특정 과목 조회
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const memberIdx = Number(searchParams.get("memberIdx"))
    const courseId = Number(params.id)

    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    const course = await courseService.getCourseById(courseId, memberIdx)

    if (!course) {
      return NextResponse.json(createApiResponse(false, null, "", "과목을 찾을 수 없습니다."), { status: 404 })
    }

    return NextResponse.json(createApiResponse(true, course))
  } catch (error) {
    const errorMessage = handleError(error, `GET /api/courses/${params.id}`)
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// PUT /api/courses/[id] - 과목 업데이트
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const courseId = Number(params.id)

    // 입력 검증
    const validatedData = updateCourseSchema.parse({ ...body, id: courseId })

    // 과목 존재 확인
    const existingCourse = await courseService.getCourseById(courseId, validatedData.memberIdx!)

    if (!existingCourse) {
      return NextResponse.json(createApiResponse(false, null, "", "과목을 찾을 수 없습니다."), { status: 404 })
    }

    // 과목 코드 중복 확인 (자신 제외)
    if (validatedData.code) {
      const isDuplicate = await courseService.checkCodeDuplicate(validatedData.code, validatedData.memberIdx!, courseId)

      if (isDuplicate) {
        return NextResponse.json(createApiResponse(false, null, "", "이미 존재하는 과목 코드입니다."), { status: 409 })
      }
    }

    const updatedCourse = await courseService.updateCourse(courseId, validatedData, validatedData.memberIdx!)

    return NextResponse.json(createApiResponse(true, updatedCourse, "과목이 성공적으로 업데이트되었습니다."))
  } catch (error) {
    const errorMessage = handleError(error, `PUT /api/courses/${params.id}`)
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// DELETE /api/courses/[id] - 과목 삭제 (Soft Delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const memberIdx = Number(searchParams.get("memberIdx"))
    const courseId = Number(params.id)

    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    // 과목 존재 확인
    const existingCourse = await courseService.getCourseById(courseId, memberIdx)

    if (!existingCourse) {
      return NextResponse.json(createApiResponse(false, null, "", "과목을 찾을 수 없습니다."), { status: 404 })
    }

    await courseService.deleteCourse(courseId, memberIdx)

    return NextResponse.json(createApiResponse(true, null, "과목이 성공적으로 삭제되었습니다."))
  } catch (error) {
    const errorMessage = handleError(error, `DELETE /api/courses/${params.id}`)
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}
