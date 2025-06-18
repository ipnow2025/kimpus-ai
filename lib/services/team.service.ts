// 팀 서비스 (Domain Layer)
import { BaseService } from "./base.service"
import type { CreateTeam, UpdateTeam, Team, TeamMember } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { getActiveFilter, generateId, getCurrentUnixTime } from "@/lib/func"

export class TeamService extends BaseService<Team, CreateTeam, UpdateTeam> {
  protected tableName = "team"

  /**
   * 사용자가 속한 모든 팀 조회 (생성한 팀 + 멤버로 참여한 팀)
   */
  async getAllTeams(memberIdx: number): Promise<any[]> {
    // 생성한 팀
    const createdTeams = await prisma.team.findMany({
      where: {
        creatorMemberIdx: memberIdx,
        ...getActiveFilter(),
      },
      include: {
        members: {
          where: getActiveFilter(),
        },
        assignments: {
          where: getActiveFilter(),
          select: { id: true, title: true },
        },
      },
      orderBy: { regDate: "desc" },
    })

    // 멤버로 참여한 팀
    const memberTeams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            memberIdx,
            status: "accepted",
            ...getActiveFilter(),
          },
        },
        ...getActiveFilter(),
      },
      include: {
        members: {
          where: getActiveFilter(),
        },
        assignments: {
          where: getActiveFilter(),
          select: { id: true, title: true },
        },
      },
      orderBy: { regDate: "desc" },
    })

    // 중복 제거 및 병합
    const allTeams = [...createdTeams]
    memberTeams.forEach((team) => {
      if (!createdTeams.find((t) => t.id === team.id)) {
        allTeams.push(team)
      }
    })

    return allTeams
  }

  /**
   * 팀 ID로 조회 (멤버 권한 확인 포함)
   */
  async getTeamById(id: string, memberIdx: number): Promise<any | null> {
    const team = await prisma.team.findFirst({
      where: {
        id,
        ...getActiveFilter(),
        OR: [
          { creatorMemberIdx: memberIdx },
          {
            members: {
              some: {
                memberIdx,
                status: "accepted",
                ...getActiveFilter(),
              },
            },
          },
        ],
      },
      include: {
        members: {
          where: getActiveFilter(),
        },
        assignments: {
          where: getActiveFilter(),
        },
        tasks: {
          where: getActiveFilter(),
        },
        chatMessages: {
          where: getActiveFilter(),
          orderBy: { regDate: "asc" },
          take: 50, // 최근 50개 메시지
        },
      },
    })

    return team
  }

  /**
   * 팀 생성
   */
  async createTeam(data: CreateTeam & { initialMembers?: TeamMember[] }): Promise<any> {
    const teamId = generateId()

    return prisma.$transaction(async (tx) => {
      // 팀 생성
      const team = await tx.team.create({
        data: {
          id: teamId,
          ...data,
          regDate: getCurrentUnixTime(),
          mdyDate: getCurrentUnixTime(),
        },
      })

      // 생성자를 관리자로 추가
      await tx.teamMember.create({
        data: {
          teamId,
          memberIdx: data.creatorMemberIdx,
          memberName: "팀 생성자", // 실제로는 사용자 정보에서 가져와야 함
          status: "accepted",
          role: "admin",
          regDate: getCurrentUnixTime(),
          mdyDate: getCurrentUnixTime(),
        },
      })

      // 초기 멤버 추가 (있는 경우)
      if (data.initialMembers && data.initialMembers.length > 0) {
        await tx.teamMember.createMany({
          data: data.initialMembers.map((member) => ({
            teamId,
            memberIdx: member.memberIdx,
            memberName: member.memberName,
            memberAvatar: member.memberAvatar,
            status: "pending",
            role: "member",
            regDate: getCurrentUnixTime(),
            mdyDate: getCurrentUnixTime(),
          })),
        })
      }

      return team
    })
  }

  /**
   * 팀 업데이트
   */
  async updateTeam(id: string, data: Partial<UpdateTeam>, memberIdx: number): Promise<any> {
    // 권한 확인 (생성자만 수정 가능)
    const team = await prisma.team.findFirst({
      where: {
        id,
        creatorMemberIdx: memberIdx,
        ...getActiveFilter(),
      },
    })

    if (!team) {
      throw new Error("팀을 찾을 수 없거나 수정 권한이 없습니다.")
    }

    return prisma.team.update({
      where: { id },
      data: {
        ...data,
        mdyDate: getCurrentUnixTime(),
      },
    })
  }

  /**
   * 팀 삭제 (Soft Delete)
   */
  async deleteTeam(id: string, memberIdx: number): Promise<any> {
    // 권한 확인 (생성자만 삭제 가능)
    const team = await prisma.team.findFirst({
      where: {
        id,
        creatorMemberIdx: memberIdx,
        ...getActiveFilter(),
      },
    })

    if (!team) {
      throw new Error("팀을 찾을 수 없거나 삭제 권한이 없습니다.")
    }

    return this.softDelete(id)
  }

  /**
   * 팀 멤버 초대
   */
  async inviteMembers(teamId: string, members: TeamMember[], inviterMemberIdx: number): Promise<void> {
    // 권한 확인 (팀 멤버만 초대 가능)
    const hasPermission = await this.checkTeamMembership(teamId, inviterMemberIdx)
    if (!hasPermission) {
      throw new Error("팀 멤버 초대 권한이 없습니다.")
    }

    await prisma.teamMember.createMany({
      data: members.map((member) => ({
        teamId,
        memberIdx: member.memberIdx,
        memberName: member.memberName,
        memberAvatar: member.memberAvatar,
        status: "pending",
        role: "member",
        regDate: getCurrentUnixTime(),
        mdyDate: getCurrentUnixTime(),
      })),
      skipDuplicates: true,
    })
  }

  /**
   * 팀 초대 수락
   */
  async acceptInvitation(teamId: string, memberIdx: number): Promise<void> {
    await prisma.teamMember.updateMany({
      where: {
        teamId,
        memberIdx,
        status: "pending",
        ...getActiveFilter(),
      },
      data: {
        status: "accepted",
        mdyDate: getCurrentUnixTime(),
      },
    })
  }

  /**
   * 팀 초대 거절
   */
  async rejectInvitation(teamId: string, memberIdx: number): Promise<void> {
    await prisma.teamMember.updateMany({
      where: {
        teamId,
        memberIdx,
        status: "pending",
        ...getActiveFilter(),
      },
      data: {
        status: "rejected",
        mdyDate: getCurrentUnixTime(),
      },
    })
  }

  /**
   * 팀 멤버십 확인
   */
  async checkTeamMembership(teamId: string, memberIdx: number): Promise<boolean> {
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        memberIdx,
        status: "accepted",
        ...getActiveFilter(),
      },
    })

    return !!membership
  }

  /**
   * 팀 멤버 목록 조회
   */
  async getTeamMembers(teamId: string, memberIdx: number): Promise<any[]> {
    // 권한 확인
    const hasPermission = await this.checkTeamMembership(teamId, memberIdx)
    if (!hasPermission) {
      throw new Error("팀 멤버 조회 권한이 없습니다.")
    }

    return prisma.teamMember.findMany({
      where: {
        teamId,
        ...getActiveFilter(),
      },
      orderBy: [{ role: "desc" }, { regDate: "asc" }],
    })
  }

  /**
   * 팀 검색
   */
  async searchTeams(memberIdx: number, query: string, page = 1, limit = 20): Promise<[any[], number]> {
    const offset = (page - 1) * limit

    const where = {
      OR: [
        { creatorMemberIdx: memberIdx },
        {
          members: {
            some: {
              memberIdx,
              status: "accepted" as const,
              ...getActiveFilter(),
            },
          },
        },
      ],
      name: {
        contains: query,
        mode: "insensitive" as const,
      },
      ...getActiveFilter(),
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        include: {
          members: {
            where: getActiveFilter(),
          },
          assignments: {
            where: getActiveFilter(),
            select: { id: true, title: true },
          },
        },
        orderBy: { regDate: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.team.count({ where }),
    ])

    return [teams, total]
  }
}

// 싱글톤 인스턴스
export const teamService = new TeamService()
