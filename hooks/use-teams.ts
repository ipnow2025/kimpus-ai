"use client"

import { useState, useCallback } from "react"
import type { Team, TeamFormData, User } from "@/lib/types"

const MOCK_USERS: User[] = [
  { id: "user_current_123", name: "현재사용자", avatar: "/placeholder.svg?width=32&height=32" }, // Ensure current user is in the list
  { id: "user1", name: "김민준", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user2", name: "이서연", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user3", name: "박도윤", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user4", name: "최지우", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user5", name: "강하은", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user6", name: "정태현", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user7", name: "윤지민", avatar: "/placeholder.svg?width=32&height=32" },
]

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "team_alpha_123",
      name: "알파 팀 (데이터베이스)",
      members: [MOCK_USERS[1], MOCK_USERS[2]],
      pendingMemberIds: [MOCK_USERS[3].id], // Park Doyoon is pending
      assignmentIds: [1],
    },
    {
      id: "team_bravo_456",
      name: "브라보 팀 (운영체제)",
      members: [MOCK_USERS[4], MOCK_USERS[5]],
      pendingMemberIds: [],
      assignmentIds: [],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTeamById = useCallback((teamId: string) => teams.find((t) => t.id === teamId), [teams])
  const getUserById = useCallback((userId: string) => MOCK_USERS.find((u) => u.id === userId), [])

  const addTeam = useCallback((teamData: TeamFormData, assignmentIdToLink?: number) => {
    setIsLoading(true)
    setError(null)
    return new Promise<Team>((resolve, reject) => {
      setTimeout(() => {
        try {
          const initialMembers = teamData.memberNames
            .map(
              (name) =>
                MOCK_USERS.find((u) => u.name === name) || {
                  id: `new_${name}_${Date.now()}`,
                  name,
                  avatar: `/placeholder.svg?width=32&height=32&query=${name}+avatar`,
                },
            )
            .filter(Boolean) as User[]

          const newTeam: Team = {
            id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: teamData.name,
            members: initialMembers,
            pendingMemberIds: [],
            assignmentIds: assignmentIdToLink ? [assignmentIdToLink] : [],
          }
          setTeams((prevTeams) => [...prevTeams, newTeam])
          setIsLoading(false)
          resolve(newTeam)
        } catch (e) {
          const errMessage = e instanceof Error ? e.message : "팀 생성 중 오류 발생"
          setError(errMessage)
          setIsLoading(false)
          reject(new Error(errMessage))
        }
      }, 500)
    })
  }, [])

  const inviteMembersToTeam = useCallback((teamId: string, newUserIds: string[]) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          const existingMemberIds = new Set(team.members.map((m) => m.id))
          const existingPendingIds = new Set(team.pendingMemberIds)
          const idsToInvite = newUserIds.filter((id) => !existingMemberIds.has(id) && !existingPendingIds.has(id))
          return { ...team, pendingMemberIds: [...new Set([...team.pendingMemberIds, ...idsToInvite])] }
        }
        return team
      }),
    )
    console.log(`Simulating inviting members ${newUserIds.join(", ")} to team ${teamId}`)
  }, [])

  const acceptTeamInvitation = useCallback(
    (teamId: string, userId: string) => {
      const userToAccept = getUserById(userId)
      if (!userToAccept) {
        console.error(`User with ID ${userId} not found for accepting invitation.`)
        return
      }

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId && team.pendingMemberIds.includes(userId)) {
            // Ensure user is not already a member
            if (team.members.find((m) => m.id === userId)) {
              return {
                ...team,
                pendingMemberIds: team.pendingMemberIds.filter((id) => id !== userId),
              } // Just remove from pending if already member
            }
            return {
              ...team,
              members: [...team.members, userToAccept],
              pendingMemberIds: team.pendingMemberIds.filter((id) => id !== userId),
            }
          }
          return team
        }),
      )
      console.log(`User ${userId} accepted invitation to team ${teamId}`)
    },
    [getUserById],
  )

  const rejectTeamInvitation = useCallback((teamId: string, userId: string) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, pendingMemberIds: team.pendingMemberIds.filter((id) => id !== userId) } : team,
      ),
    )
    console.log(`User ${userId} rejected invitation to team ${teamId}`)
  }, [])

  const updateTeam = useCallback((teamId: string, updatedData: Partial<TeamFormData>) => {
    console.log("Updating team", teamId, updatedData)
  }, [])

  const deleteTeam = useCallback((teamId: string) => {
    console.log("Deleting team", teamId)
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
  }, [])

  const addAssignmentToTeam = useCallback((teamId: string, assignmentId: number) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, assignmentIds: [...new Set([...team.assignmentIds, assignmentId])] } : team,
      ),
    )
  }, [])

  const removeAssignmentFromTeam = useCallback((teamId: string, assignmentId: number) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, assignmentIds: team.assignmentIds.filter((id) => id !== assignmentId) } : team,
      ),
    )
  }, [])

  return {
    teams,
    mockUsers: MOCK_USERS,
    isLoading,
    error,
    addTeam,
    updateTeam,
    deleteTeam,
    getTeamById,
    getUserById,
    addAssignmentToTeam,
    removeAssignmentFromTeam,
    inviteMembersToTeam,
    acceptTeamInvitation,
    rejectTeamInvitation,
  }
}
