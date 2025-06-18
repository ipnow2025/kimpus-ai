// 스케줄 서비스 (Domain Layer)
import { BaseService } from "./base.service"
import type { CreateSchedule, UpdateSchedule, Schedule } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { getActiveFilter } from "@/lib/func"

export class ScheduleService extends BaseService<Schedule, CreateSchedule, UpdateSchedule> {
  protected tableName = "schedule"

  /**
   * 사용자의 모든 스케줄 조회
   */
  async getAllSchedules(memberIdx: number): Promise<any[]> {
    return prisma.schedule.findMany({
      where: {
        memberIdx,
        ...getActiveFilter(),
      },
      include: {
        course: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
  }

  /**
   * 스케줄 ID로 조회
   */
  async getScheduleById(id: number, memberIdx: number): Promise<any | null> {
    return this.getActiveRecordById(id, memberIdx)
  }

  /**
   * 스케줄 생성
   */
  async createSchedule(data: CreateSchedule): Promise<any> {
    // 시간 충돌 확인
    const hasConflict = await this.checkTimeConflict(data.memberIdx, data.dayOfWeek, data.startTime, data.endTime)

    if (hasConflict) {
      throw new Error("해당 시간대에 이미 다른 수업이 있습니다.")
    }

    return this.createRecord(data)
  }

  /**
   * 스케줄 업데이트
   */
  async updateSchedule(id: number, data: Partial<UpdateSchedule>, memberIdx: number): Promise<any> {
    // 시간 충돌 확인 (자신 제외)
    if (data.dayOfWeek || data.startTime || data.endTime) {
      const existing = await this.getScheduleById(id, memberIdx)
      if (!existing) {
        throw new Error("스케줄을 찾을 수 없습니다.")
      }

      const hasConflict = await this.checkTimeConflict(
        memberIdx,
        data.dayOfWeek || existing.dayOfWeek,
        data.startTime || existing.startTime,
        data.endTime || existing.endTime,
        id,
      )

      if (hasConflict) {
        throw new Error("해당 시간대에 이미 다른 수업이 있습니다.")
      }
    }

    return this.updateRecord(id, data, memberIdx)
  }

  /**
   * 스케줄 삭제 (Soft Delete)
   */
  async deleteSchedule(id: number, memberIdx: number): Promise<any> {
    return this.softDelete(id, memberIdx)
  }

  /**
   * 요일별 스케줄 조회
   */
  async getSchedulesByDay(memberIdx: number, dayOfWeek: string): Promise<any[]> {
    return prisma.schedule.findMany({
      where: {
        memberIdx,
        dayOfWeek: dayOfWeek as any,
        ...getActiveFilter(),
      },
      include: {
        course: true,
      },
      orderBy: { startTime: "asc" },
    })
  }

  /**
   * 시간 충돌 확인
   */
  async checkTimeConflict(
    memberIdx: number,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<boolean> {
    const where: any = {
      memberIdx,
      dayOfWeek: dayOfWeek as any,
      ...getActiveFilter(),
      OR: [
        // 새 시작시간이 기존 수업 시간 내에 있는 경우
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        // 새 종료시간이 기존 수업 시간 내에 있는 경우
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        // 새 수업이 기존 수업을 완전히 포함하는 경우
        {
          AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
        },
      ],
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const conflictingSchedule = await prisma.schedule.findFirst({ where })
    return !!conflictingSchedule
  }

  /**
   * 주간 스케줄 조회
   */
  async getWeeklySchedule(memberIdx: number): Promise<Record<string, any[]>> {
    const schedules = await this.getAllSchedules(memberIdx)

    const weeklySchedule: Record<string, any[]> = {
      월: [],
      화: [],
      수: [],
      목: [],
      금: [],
      토: [],
      일: [],
    }

    schedules.forEach((schedule) => {
      weeklySchedule[schedule.dayOfWeek].push(schedule)
    })

    return weeklySchedule
  }

  /**
   * 스케줄 검색
   */
  async searchSchedules(memberIdx: number, query: string, page = 1, limit = 20): Promise<[any[], number]> {
    return this.searchRecords(memberIdx, ["subject", "room", "instructor"], query, page, limit)
  }

  /**
   * 과목별 스케줄 조회
   */
  async getSchedulesByCourse(memberIdx: number, courseId: number): Promise<any[]> {
    return prisma.schedule.findMany({
      where: {
        memberIdx,
        courseId,
        ...getActiveFilter(),
      },
      include: {
        course: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
  }

  /**
   * 스케줄 통계
   */
  async getScheduleStats(memberIdx: number) {
    const schedules = await this.getAllSchedules(memberIdx)

    const totalClasses = schedules.length
    const daysWithClasses = new Set(schedules.map((s) => s.dayOfWeek)).size
    const totalHours = schedules.reduce((sum, schedule) => {
      const start = new Date(`2000-01-01 ${schedule.startTime}`)
      const end = new Date(`2000-01-01 ${schedule.endTime}`)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

    const instructors = [...new Set(schedules.map((s) => s.instructor).filter(Boolean))].length
    const rooms = [...new Set(schedules.map((s) => s.room).filter(Boolean))].length

    return {
      totalClasses,
      daysWithClasses,
      totalHours: Math.round(totalHours * 10) / 10,
      instructors,
      rooms,
      busiestDay: this.getBusiestDay(schedules),
    }
  }

  /**
   * 가장 바쁜 요일 찾기
   */
  private getBusiestDay(schedules: any[]): string {
    const dayCount: Record<string, number> = {}

    schedules.forEach((schedule) => {
      dayCount[schedule.dayOfWeek] = (dayCount[schedule.dayOfWeek] || 0) + 1
    })

    return Object.entries(dayCount).reduce((a, b) => (dayCount[a[0]] > dayCount[b[0]] ? a : b))[0] || "없음"
  }
}

// 싱글톤 인스턴스
export const scheduleService = new ScheduleService()
