"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { teamApi } from "@/lib/api-client"
import type { Team, TeamFormData, User } from "@/lib/types"

const TEAMS_QUERY_KEY = ["teams"]

// Mock users (실제로는 별도 API에서 가져와야 함)
const MOCK_USERS: User[] = [
  { id: "user_current_123", name: "현재사용자", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user1", name: "김민준", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user2", name: "이서연", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user3", name: "박도윤", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user4", name: "최지우", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user5", name: "강하은", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user6", name: "정태현", avatar: "/placeholder.svg?width=32&height=32" },
  { id: "user7", name: "윤지민", avatar: "/placeholder.svg?width=32&height=32" },
]

export function useTeamsQuery() {
  const queryClient = useQueryClient()

  // 팀 목록 조회
  const {
    data: teams = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: TEAMS_QUERY_KEY,
    queryFn: teamApi.getAll,
  })

  // 특정 팀 조회
  const useTeamQuery = (teamId: string) => {
    return useQuery({
      queryKey: [...TEAMS_QUERY_KEY, teamId],
      queryFn: () => teamApi.getById(teamId),
      enabled: !!teamId,
    })
  }

  // 팀 생성
  const createTeamMutation = useMutation({
    mutationFn: teamApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })

  // 팀 수정
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamFormData> }) => teamApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })

  // 팀 삭제
  const deleteTeamMutation = useMutation({
    mutationFn: teamApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })

  // 팀원 초대
  const inviteMembersMutation = useMutation({
    mutationFn: ({ teamId, memberIds }: { teamId: string; memberIds: string[] }) =>
      teamApi.inviteMembers(teamId, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })

  // 초대 수락
  const acceptInvitationMutation = useMutation({
    mutationFn: teamApi.acceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })

  // 초대 거절
  const rejectInvitationMutation = useMutation({
    mutationFn: teamApi.rejectInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })

  // 유틸리티 함수들
  const getTeamById = (teamId: string) => {
    return teams.find((team: Team) => team.id === teamId)
  }

  const getUserById = (userId: string) => {
    return MOCK_USERS.find((user) => user.id === userId)
  }

  return {
    // 데이터
    teams,
    mockUsers: MOCK_USERS,

    // 로딩 상태
    isLoading,
    error,

    // 액션
    addTeam: (data: TeamFormData) => createTeamMutation.mutateAsync(data),
    updateTeam: (id: string, data: Partial<TeamFormData>) => updateTeamMutation.mutateAsync({ id, data }),
    deleteTeam: (id: string) => deleteTeamMutation.mutateAsync(id),
    inviteMembersToTeam: (teamId: string, memberIds: string[]) =>
      inviteMembersMutation.mutateAsync({ teamId, memberIds }),
    acceptTeamInvitation: (teamId: string) => acceptInvitationMutation.mutateAsync(teamId),
    rejectTeamInvitation: (teamId: string) => rejectInvitationMutation.mutateAsync(teamId),
    refetch,

    // 유틸리티
    getTeamById,
    getUserById,
    useTeamQuery,

    // 뮤테이션 상태
    isCreating: createTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
    isDeleting: deleteTeamMutation.isPending,
    isInviting: inviteMembersMutation.isPending,
  }
}
