// 과제 서비스 (Domain Layer)
import { BaseService } from "./base.service"
import type { CreateAssignment, UpdateAssignment, Assignment } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { getActiveFilter, getDaysUntilDue } from "@/lib/func"

export class AssignmentService extends BaseService<Assignment, CreateAssignment, UpdateAssignment> {
  protected tableName = "assignment"

  /**
   * 사용자의 모든 과제 조회 (개인 + 팀 과제)
   */
  async getAllAssignments(memberIdx: number): Promise<any[]> {
    // 개인 과제
    const personalAssignments = await prisma.assignment.findMany({
      where: {
        memberIdx,
        isTeamAssignment: 0,
        ...getActiveFilter(),
      },
      include: {
        course: true,
      },
      orderBy: { dueDate: "asc" },
    })

    // 팀 과제 (사용자가 속한 팀의 과제)
    const teamAssignments = await prisma.assignment.findMany({
      where: {
        isTeamAssignment: 1,
        team: {
          members: {
            some: {
              memberIdx,
              status: "accepted",
              ...getActiveFilter(),
            },
          },
        },
        ...getActiveFilter(),
      },
      include: {
        course: true,
        team: {
          include: {
            members: {
              where: getActiveFilter(),
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    })

    return [...personalAssignments, ...teamAssignments]
  }

  /**
   * 과제 ID로 조회
   */
  async getAssignmentById(id: number, memberIdx: number): Promise<any | null> {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
        OR: [
          { memberIdx }, // 개인 과제
          {
            // 팀 과제 (사용자가 팀 멤버인 경우)
            isTeamAssignment: 1,
            team: {
              members: {
                some: {
                  memberIdx,
                  status: "accepted",
                  ...getActiveFilter(),
                },
              },
            },
          },
        ],
        ...getActiveFilter(),
      },
      include: {
        course: true,
        team: {
          include: {
            members: {
              where: getActiveFilter(),
            },
          },
        },
        tasks: {
          where: getActiveFilter(),
        },
      },
    })

    return assignment
  }

  /**
   * 과제 생성
   */
  async createAssignment(data: CreateAssignment): Promise<any> {
    return this.createRecord(data)
  }

  /**
   * 과제 업데이트
   */
  async updateAssignment(id: number, data: Partial<UpdateAssignment>, memberIdx: number): Promise<any> {
    // 권한 확인
    const assignment = await this.getAssignmentById(id, memberIdx)
    if (!assignment) {
      throw new Error("과제를 찾을 수 없거나 수정 권한이 없습니다.")
    }

    return this.updateRecord(id, data, assignment.memberIdx)
  }

  /**
   * 과제 삭제 (Soft Delete)
   */
  async deleteAssignment(id: number, memberIdx: number): Promise<any> {
    // 권한 확인
    const assignment = await this.getAssignmentById(id, memberIdx)
    if (!assignment) {
      throw new Error("과제를 찾을 수 없거나 삭제 권한이 없습니다.")
    }

    return this.softDelete(id, assignment.memberIdx)
  }

  /**
   * 과제 상태 토글
   */
  async toggleAssignmentStatus(id: number, memberIdx: number): Promise<any> {
    const assignment = await this.getAssignmentById(id, memberIdx)
    if (!assignment) {
      throw new Error("과제를 찾을 수 없습니다.")
    }

    const newStatus = assignment.status === "pending" ? "completed" : "pending"

    return this.updateRecord(id, { status: newStatus }, assignment.memberIdx)
  }

  /**
   * 과제 검색
   */
  async searchAssignments(memberIdx: number, query: string, page = 1, limit = 20): Promise<[any[], number]> {
    const offset = (page - 1) * limit

    const where = {
      OR: [
        { memberIdx }, // 개인 과제
        {
          // 팀 과제
          isTeamAssignment: 1,
          team: {
            members: {
              some: {
                memberIdx,
                status: "accepted" as const,
                ...getActiveFilter(),
              },
            },
          },
        },
      ],
      AND: [
        {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { courseName: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        },
      ],
      ...getActiveFilter(),
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          course: true,
          team: {
            include: {
              members: {
                where: getActiveFilter(),
              },
            },
          },
        },
        orderBy: { dueDate: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ])

    return [assignments, total]
  }

  /**
   * 필터별 과제 조회
   */
  async getAssignmentsByFilter(
    memberIdx: number,
    filter: "all" | "pending" | "completed" | "overdue",
    page = 1,
    limit = 20,
  ): Promise<[any[], number]> {
    let additionalWhere: any = {}

    switch (filter) {
      case "pending":
        additionalWhere.status = "pending"
        break
      case "completed":
        additionalWhere.status = "completed"
        break
      case "overdue":
        additionalWhere = {
          status: "pending",
          dueDate: { lt: new Date() },
        }
        break
    }

    const offset = (page - 1) * limit

    const where = {
      OR: [
        { memberIdx },
        {
          isTeamAssignment: 1,
          team: {
            members: {
              some: {
                memberIdx,
                status: "accepted" as const,
                ...getActiveFilter(),
              },
            },
          },
        },
      ],
      ...additionalWhere,
      ...getActiveFilter(),
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          course: true,
          team: {
            include: {
              members: {
                where: getActiveFilter(),
              },
            },
          },
        },
        orderBy: { dueDate: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ])

    return [assignments, total]
  }

  /**
   * 과제 통계
   */
  async getAssignmentStats(memberIdx: number) {
    const assignments = await this.getAllAssignments(memberIdx)

    const totalAssignments = assignments.length
    const completedAssignments = assignments.filter((a) => a.status === "completed").length
    const pendingAssignments = assignments.filter((a) => a.status === "pending").length
    const overdueAssignments = assignments.filter(
      (a) => a.status === "pending" && getDaysUntilDue(a.dueDate) < 0,
    ).length

    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

    return {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      overdueAssignments,
      completionRate,
      upcomingDeadlines: assignments
        .filter((a) => a.status === "pending")
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5),
    }
  }

  /**
   * 우선순위별 과제 조회
   */
  async getAssignmentsByPriority(memberIdx: number, priority: "low" | "medium" | "high"): Promise<any[]> {
    const assignments = await this.getAllAssignments(memberIdx)
    return assignments.filter((a) => a.priority === priority)
  }

  /**
   * 마감일 기준 과제 조회
   */
  async getAssignmentsByDueDate(memberIdx: number, days: number): Promise<any[]> {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + days)

    const assignments = await this.getAllAssignments(memberIdx)
    return assignments.filter((a) => {
      const dueDate = new Date(a.dueDate)
      return dueDate <= targetDate && a.status === "pending"
    })
  }
}

// 싱글톤 인스턴스
export const assignmentService = new AssignmentService()
