"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assignmentApi } from "@/lib/api-client"
import type { Assignment, AssignmentFormData, AssignmentStatistics } from "@/lib/types"
import { useMemo, useState } from "react"

const ASSIGNMENTS_QUERY_KEY = ["assignments"]

export function useAssignmentsQuery() {
  const [assignmentFilter, setAssignmentFilter] = useState("all")
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("")
  const queryClient = useQueryClient()

  // 과제 목록 조회
  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, assignmentFilter],
    queryFn: () => assignmentApi.getAll(assignmentFilter),
  })

  // 과제 생성
  const createAssignmentMutation = useMutation({
    mutationFn: assignmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY })
    },
  })

  // 과제 수정
  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssignmentFormData> }) => assignmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY })
    },
  })

  // 과제 삭제
  const deleteAssignmentMutation = useMutation({
    mutationFn: assignmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY })
    },
  })

  // 과제 상태 토글
  const toggleStatusMutation = useMutation({
    mutationFn: assignmentApi.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY })
    },
  })

  // 필터링된 과제 목록
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((assignment: Assignment) => {
        const searchTermLower = assignmentSearchTerm.toLowerCase()
        const matchesSearch =
          assignment.title.toLowerCase().includes(searchTermLower) ||
          assignment.course.toLowerCase().includes(searchTermLower)
        return matchesSearch
      })
      .sort((a: Assignment, b: Assignment) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [assignments, assignmentSearchTerm])

  // 통계 계산
  const assignmentStatistics = useMemo((): AssignmentStatistics => {
    const totalAssignments = assignments.length
    const completedAssignments = assignments.filter((a: Assignment) => a.status === "completed").length
    const pendingAssignments = totalAssignments - completedAssignments
    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

    return { totalAssignments, completedAssignments, pendingAssignments, completionRate }
  }, [assignments])

  return {
    // 데이터
    assignments: filteredAssignments,
    statistics: assignmentStatistics,

    // 로딩 상태
    isLoading,
    error,

    // 필터 상태
    assignmentFilter,
    setAssignmentFilter,
    assignmentSearchTerm,
    setAssignmentSearchTerm,

    // 액션
    addAssignment: (data: AssignmentFormData) => createAssignmentMutation.mutateAsync(data),
    updateAssignment: (id: number, data: Partial<AssignmentFormData>) =>
      updateAssignmentMutation.mutateAsync({ id, data }),
    deleteAssignment: (id: number) => deleteAssignmentMutation.mutateAsync(id),
    toggleAssignmentStatus: (id: number) => toggleStatusMutation.mutateAsync(id),
    refetch,

    // 뮤테이션 상태
    isCreating: createAssignmentMutation.isPending,
    isUpdating: updateAssignmentMutation.isPending,
    isDeleting: deleteAssignmentMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
  }
}
