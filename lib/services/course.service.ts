// 과목 서비스 (Domain Layer)
import { BaseService } from "./base.service"
import type { CreateCourse, UpdateCourse, Course } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { getActiveFilter } from "@/lib/func"

export class CourseService extends BaseService<Course, CreateCourse, UpdateCourse> {
  protected tableName = "course"

  /**
   * 사용자의 모든 과목 조회
   */
  async getAllCourses(memberIdx: number): Promise<Course[]> {
    return this.getActiveRecords(memberIdx)
  }

  /**
   * 과목 ID로 조회
   */
  async getCourseById(id: number, memberIdx: number): Promise<Course | null> {
    return this.getActiveRecordById(id, memberIdx)
  }

  /**
   * 과목 생성
   */
  async createCourse(data: CreateCourse): Promise<Course> {
    return this.createRecord(data)
  }

  /**
   * 과목 업데이트
   */
  async updateCourse(id: number, data: Partial<UpdateCourse>, memberIdx: number): Promise<Course> {
    return this.updateRecord(id, data, memberIdx)
  }

  /**
   * 과목 삭제 (Soft Delete)
   */
  async deleteCourse(id: number, memberIdx: number): Promise<Course> {
    return this.softDelete(id, memberIdx)
  }

  /**
   * 과목 검색
   */
  async searchCourses(memberIdx: number, query: string, page = 1, limit = 20): Promise<[Course[], number]> {
    return this.searchRecords(memberIdx, ["name", "code", "instructor"], query, page, limit)
  }

  /**
   * 과목 코드 중복 확인
   */
  async checkCodeDuplicate(code: string, memberIdx: number, excludeId?: number): Promise<boolean> {
    const where: any = {
      memberIdx,
      code,
      ...getActiveFilter(),
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const existing = await prisma.course.findFirst({ where })
    return !!existing
  }

  /**
   * 사용자의 과목 통계
   */
  async getCourseStats(memberIdx: number) {
    const courses = await this.getAllCourses(memberIdx)

    return {
      totalCourses: courses.length,
      totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
      instructors: [...new Set(courses.map((course) => course.instructor).filter(Boolean))].length,
    }
  }
}

// 싱글톤 인스턴스
export const courseService = new CourseService()
