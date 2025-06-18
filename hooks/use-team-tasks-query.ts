"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { teamTaskApi } from "@/lib/api-client"
import type { TeamTask } from "@/lib/types"

const TEAM_TASKS_QUERY_KEY = ["team-tasks"]

export function useTeamTasksQuery(teamId: string) {
  const queryClient = useQueryClient()

  // 팀 태스크 목록 조회
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...TEAM_TASKS_QUERY_KEY, teamId],
    queryFn: () => teamTaskApi.getAll(teamId),
    enabled: !!teamId,
  })

  // 태스크 생성
  const createTaskMutation = useMutation({
    mutationFn: (data: Partial<TeamTask>) => teamTaskApi.create(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TEAM_TASKS_QUERY_KEY, teamId] })
    },
  })

  // 태스크 수정
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<TeamTask> }) =>
      teamTaskApi.update(teamId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TEAM_TASKS_QUERY_KEY, teamId] })
    },
  })

  // 태스크 삭제
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => teamTaskApi.delete(teamId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TEAM_TASKS_QUERY_KEY, teamId] })
    },
  })

  return {
    // 데이터
    tasks,

    // 로딩 상태
    isLoading,
    error,

    // 액션
    addTask: (data: Partial<TeamTask>) => createTaskMutation.mutateAsync(data),
    updateTask: (taskId: string, data: Partial<TeamTask>) => updateTaskMutation.mutateAsync({ taskId, data }),
    deleteTask: (taskId: string) => deleteTaskMutation.mutateAsync(taskId),
    refetch,

    // 뮤테이션 상태
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}
