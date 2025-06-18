// 팀 채팅 서비스 (Domain Layer)
import { BaseService } from "./base.service"
import type { CreateTeamChatMessage, TeamChatMessage } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { getActiveFilter, generateId, getCurrentUnixTime } from "@/lib/func"
import { teamService } from "./team.service"

export class TeamChatService extends BaseService<TeamChatMessage, CreateTeamChatMessage, any> {
  protected tableName = "teamChatMessage"

  /**
   * 팀 채팅 메시지 조회
   */
  async getTeamMessages(teamId: string, memberIdx: number, page = 1, limit = 50): Promise<[any[], number]> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("팀 채팅 조회 권한이 없습니다.")
    }

    const offset = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.teamChatMessage.findMany({
        where: {
          teamId,
          ...getActiveFilter(),
        },
        orderBy: { regDate: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.teamChatMessage.count({
        where: {
          teamId,
          ...getActiveFilter(),
        },
      }),
    ])

    // 최신 메시지가 먼저 오도록 정렬 (UI에서는 역순으로 표시)
    return [messages.reverse(), total]
  }

  /**
   * 메시지 전송
   */
  async sendMessage(data: CreateTeamChatMessage, memberIdx: number): Promise<any> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(data.teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("팀 채팅 전송 권한이 없습니다.")
    }

    // memberIdx 검증
    if (data.memberIdx !== memberIdx) {
      throw new Error("본인만 메시지를 전송할 수 있습니다.")
    }

    const messageId = generateId()

    return prisma.teamChatMessage.create({
      data: {
        id: messageId,
        ...data,
        regDate: getCurrentUnixTime(),
        mdyDate: getCurrentUnixTime(),
      },
    })
  }

  /**
   * 메시지 삭제 (Soft Delete)
   */
  async deleteMessage(id: string, memberIdx: number): Promise<any> {
    const message = await prisma.teamChatMessage.findFirst({
      where: {
        id,
        memberIdx, // 본인이 작성한 메시지만 삭제 가능
        ...getActiveFilter(),
      },
    })

    if (!message) {
      throw new Error("메시지를 찾을 수 없거나 삭제 권한이 없습니다.")
    }

    return this.softDelete(id)
  }

  /**
   * 최근 메시지 조회 (실시간 업데이트용)
   */
  async getRecentMessages(teamId: string, memberIdx: number, since?: number): Promise<any[]> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("팀 채팅 조회 권한이 없습니다.")
    }

    const where: any = {
      teamId,
      ...getActiveFilter(),
    }

    if (since) {
      where.regDate = { gt: since }
    }

    return prisma.teamChatMessage.findMany({
      where,
      orderBy: { regDate: "asc" },
      take: 50,
    })
  }

  /**
   * 메시지 검색
   */
  async searchMessages(
    teamId: string,
    query: string,
    memberIdx: number,
    page = 1,
    limit = 20,
  ): Promise<[any[], number]> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("메시지 검색 권한이 없습니다.")
    }

    const offset = (page - 1) * limit

    const where = {
      teamId,
      message: {
        contains: query,
        mode: "insensitive" as const,
      },
      ...getActiveFilter(),
    }

    const [messages, total] = await Promise.all([
      prisma.teamChatMessage.findMany({
        where,
        orderBy: { regDate: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.teamChatMessage.count({ where }),
    ])

    return [messages, total]
  }

  /**
   * 팀 채팅 통계
   */
  async getChatStats(teamId: string, memberIdx: number) {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("채팅 통계 조회 권한이 없습니다.")
    }

    const messages = await prisma.teamChatMessage.findMany({
      where: {
        teamId,
        ...getActiveFilter(),
      },
    })

    const totalMessages = messages.length
    const memberStats: Record<number, { count: number; name: string }> = {}

    messages.forEach((message) => {
      if (!memberStats[message.memberIdx]) {
        memberStats[message.memberIdx] = {
          count: 0,
          name: message.memberName,
        }
      }
      memberStats[message.memberIdx].count++
    })

    const mostActiveMembers = Object.entries(memberStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)

    // 최근 7일간 메시지 수
    const sevenDaysAgo = getCurrentUnixTime() - 7 * 24 * 60 * 60
    const recentMessages = messages.filter((m) => m.regDate >= sevenDaysAgo).length

    return {
      totalMessages,
      recentMessages,
      memberStats,
      mostActiveMembers,
      averageMessagesPerDay: Math.round(
        totalMessages /
          Math.max(
            1,
            messages.length > 0
              ? (getCurrentUnixTime() - Math.min(...messages.map((m) => m.regDate))) / (24 * 60 * 60)
              : 1,
          ),
      ),
    }
  }

  /**
   * 읽지 않은 메시지 수 (구현 예정 - 읽음 상태 테이블 필요)
   */
  async getUnreadCount(teamId: string, memberIdx: number, lastReadTime?: number): Promise<number> {
    // 팀 멤버십 확인
    const hasPermission = await teamService.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      return 0
    }

    if (!lastReadTime) {
      return 0
    }

    return prisma.teamChatMessage.count({
      where: {
        teamId,
        regDate: { gt: lastReadTime },
        memberIdx: { not: memberIdx }, // 본인 메시지 제외
        ...getActiveFilter(),
      },
    })
  }
}

// 싱글톤 인스턴스
export const teamChatService = new TeamChatService()
