// 스케줄 API 라우트 (Application Layer)
import { type NextRequest, NextResponse } from "next/server"
import { scheduleService } from "@/lib/services/schedule.service"
import { createScheduleSchema } from "@/lib/validations"
import { createApiResponse, handleError } from "@/lib/func"

// GET /api/schedules - 스케줄 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberIdx = Number(searchParams.get("memberIdx"))
    const dayOfWeek = searchParams.get("dayOfWeek")
    const courseId = searchParams.get("courseId")
    const weekly = searchParams.get("weekly") === "true"

    if (!memberIdx) {
      return NextResponse.json(createApiResponse(false, null, "", "memberIdx is required"), { status: 400 })
    }

    let schedules

    if (weekly) {
      schedules = await scheduleService.getWeeklySchedule(memberIdx)
    } else if (dayOfWeek) {
      schedules = await scheduleService.getSchedulesByDay(memberIdx, dayOfWeek)
    } else if (courseId) {
      schedules = await scheduleService.getSchedulesByCourse(memberIdx, Number(courseId))
    } else {
      schedules = await scheduleService.getAllSchedules(memberIdx)
    }

    return NextResponse.json(createApiResponse(true, { schedules }))
  } catch (error) {
    const errorMessage = handleError(error, "GET /api/schedules")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}

// POST /api/schedules - 스케줄 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 입력 검증
    const validatedData = createScheduleSchema.parse(body)

    const schedule = await scheduleService.createSchedule(validatedData)

    return NextResponse.json(createApiResponse(true, schedule, "스케줄이 성공적으로 생성되었습니다."), { status: 201 })
  } catch (error) {
    const errorMessage = handleError(error, "POST /api/schedules")
    return NextResponse.json(createApiResponse(false, null, "", errorMessage), { status: 500 })
  }
}
