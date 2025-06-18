// 팀 태스크 서비스 (Domain Layer)
import { BaseService } from "./base.service"
import type { CreateTeamTask, UpdateTeamTask, TeamTask } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { getActiveFilter, generateId, getCurrentUnixTime } from "@/lib/func"
import { teamService } from "./team.service"

export class TeamTaskService extends BaseService<TeamTask, CreateTeamTask, UpdateTeamTask> {
  protected tableName = "teamTask"

  /**
   * 팀의 모든 태스크 조회
   */
  async getTeamTasks(teamId: string, memberIdx: number): Promise<any[]> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("팀 태스크 조회 권한이 없습니다.")
    }

    return prisma.teamTask.findMany({
      where: {
        teamId,
        ...getActiveFilter(),
      },
      include: {
        assignment: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ completed: "asc" }, { regDate: "desc" }],
    })
  }

  /**
   * 태스크 ID로 조회
   */
  async getTaskById(id: string, memberIdx: number): Promise<any | null> {
    const task = await prisma.teamTask.findFirst({
      where: {
        id,
        ...getActiveFilter(),
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                memberIdx,
                status: "accepted",
                ...getActiveFilter(),
              },
            },
          },
        },
        assignment: true,
      },
    })

    // 팀 멤버십 확인
    if (!task || task.team.members.length === 0) {
      return null
    }

    return task
  }

  /**
   * 태스크 생성
   */
  async createTask(data: CreateTeamTask, memberIdx: number): Promise<any> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(data.teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("팀 태스크 생성 권한이 없습니다.")
    }

    const taskId = generateId()

    return prisma.teamTask.create({
      data: {
        id: taskId,
        ...data,
        completed: data.completed ? 1 : 0,
        regDate: getCurrentUnixTime(),
        mdyDate: getCurrentUnixTime(),
      },
    })
  }

  /**
   * 태스크 업데이트
   */
  async updateTask(id: string, data: Partial<UpdateTeamTask>, memberIdx: number): Promise<any> {
    const task = await this.getTaskById(id, memberIdx)
    if (!task) {
      throw new Error("태스크를 찾을 수 없거나 수정 권한이 없습니다.")
    }

    const updateData: any = {
      ...data,
      mdyDate: getCurrentUnixTime(),
    }

    if (data.completed !== undefined) {
      updateData.completed = data.completed ? 1 : 0
    }

    return prisma.teamTask.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * 태스크 삭제 (Soft Delete)
   */
  async deleteTask(id: string, memberIdx: number): Promise<any> {
    const task = await this.getTaskById(id, memberIdx)
    if (!task) {
      throw new Error("태스크를 찾을 수 없거나 삭제 권한이 없습니다.")
    }

    return this.softDelete(id)
  }

  /**
   * 태스크 완료 상태 토글
   */
  async toggleTaskCompletion(id: string, memberIdx: number): Promise<any> {
    const task = await this.getTaskById(id, memberIdx)
    if (!task) {
      throw new Error("태스크를 찾을 수 없습니다.")
    }

    return this.updateTask(id, { completed: !task.completed }, memberIdx)
  }

  /**
   * 과제별 태스크 조회
   */
  async getTasksByAssignment(assignmentId: number, memberIdx: number): Promise<any[]> {
    const tasks = await prisma.teamTask.findMany({
      where: {
        assignmentId,
        ...getActiveFilter(),
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                memberIdx,
                status: "accepted",
                ...getActiveFilter(),
              },
            },
          },
        },
      },
    })

    // 권한이 있는 태스크만 반환
    return tasks.filter((task) => task.team.members.length > 0)
  }

  /**
   * 담당자별 태스크 조회
   */
  async getTasksByAssignee(teamId: string, assigneeIdx: number, memberIdx: number): Promise<any[]> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("태스크 조회 권한이 없습니다.")
    }

    return prisma.teamTask.findMany({
      where: {
        teamId,
        assignedTo: assigneeIdx,
        ...getActiveFilter(),
      },
      include: {
        assignment: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ completed: "asc" }, { regDate: "desc" }],
    })
  }

  /**
   * 팀 태스크 통계
   */
  async getTeamTaskStats(teamId: string, memberIdx: number) {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("태스크 통계 조회 권한이 없습니다.")
    }

    const tasks = await this.getTeamTasks(teamId, memberIdx)

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.completed).length
    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // 담당자별 통계
    const assigneeStats: Record<number, { total: number; completed: number }> = {}
    tasks.forEach((task) => {
      if (task.assignedTo) {
        if (!assigneeStats[task.assignedTo]) {
          assigneeStats[task.assignedTo] = { total: 0, completed: 0 }
        }
        assigneeStats[task.assignedTo].total++
        if (task.completed) {
          assigneeStats[task.assignedTo].completed++
        }
      }
    })

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      assigneeStats,
      recentTasks: tasks.slice(0, 5),
    }
  }

  /**
   * 태스크 검색
   */
  async searchTasks(teamId: string, query: string, memberIdx: number): Promise<any[]> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("태스크 검색 권한이 없습니다.")
    }

    return prisma.teamTask.findMany({
      where: {
        teamId,
        text: {
          contains: query,
          mode: "insensitive",
        },
        ...getActiveFilter(),
      },
      include: {
        assignment: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ completed: "asc" }, { regDate: "desc" }],
    })
  }
}

// 싱글톤 인스턴스
export const teamTaskService = new TeamTaskService()
