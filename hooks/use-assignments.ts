"use client"

import { useState, useCallback, useMemo } from "react"
import type { Assignment, AssignmentFormData, AssignmentStatistics } from "@/lib/types"

const initialAssignmentsData: Assignment[] = [
  {
    id: 1,
    title: "데이터베이스 설계 프로젝트 (샘플)",
    course: "데이터베이스시스템",
    dueDate: "2025-06-15",
    status: "pending",
    priority: "high",
    description: "E-R 다이어그램 작성 및 정규화 과정 포함. 샘플 데이터입니다.",
    attachments: [],
    submitLink: "https://example.com/submit/123",
    notes: "클라이언트 측 샘플 데이터",
  },
  {
    id: 2,
    title: "알고리즘 분석 보고서 (샘플)",
    course: "알고리즘",
    dueDate: "2025-06-10",
    status: "pending",
    priority: "medium",
    description: "정렬 알고리즘 시간복잡도 분석. 샘플 데이터입니다.",
    attachments: [],
    submitLink: "",
    notes: "",
  },
  {
    id: 3,
    title: "웹프로그래밍 과제 (샘플)",
    course: "웹프로그래밍",
    dueDate: "2025-06-01",
    status: "completed",
    priority: "low",
    description: "React를 이용한 SPA 개발. 샘플 데이터입니다.",
    attachments: [],
    submitLink: "https://github.example.com/student/web-project",
    notes: "완료된 샘플 과제",
  },
]

const generateId = () => Date.now() + Math.random()

export function useAssignments(initialAssignments: Assignment[] = initialAssignmentsData) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [assignmentFilter, setAssignmentFilter] = useState("all")
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("")

  const addAssignment = useCallback((newAssignmentData: AssignmentFormData) => {
    const newAssignment: Assignment = {
      ...newAssignmentData,
      id: generateId(),
      status: "pending",
      attachments: [], // Default empty
    }
    setAssignments((prev) => [newAssignment, ...prev])
  }, [])

  const updateAssignment = useCallback((id: number, updatedData: Partial<AssignmentFormData>) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, ...updatedData, dueDate: updatedData.dueDate ? updatedData.dueDate.split("T")[0] : a.dueDate }
          : a,
      ),
    )
  }, [])

  const deleteAssignment = useCallback((id: number) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const toggleAssignmentStatus = useCallback((id: number) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "completed" ? "pending" : "completed" } : a)),
    )
  }, [])

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((assignment) => {
        const matchesFilter = assignmentFilter === "all" || assignment.status === assignmentFilter
        const searchTermLower = assignmentSearchTerm.toLowerCase()
        const matchesSearch =
          assignment.title.toLowerCase().includes(searchTermLower) ||
          assignment.course.toLowerCase().includes(searchTermLower)
        return matchesFilter && matchesSearch
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [assignments, assignmentFilter, assignmentSearchTerm])

  const statistics = useMemo((): AssignmentStatistics => {
    const totalAssignments = assignments.length
    const completedAssignments = assignments.filter((a) => a.status === "completed").length
    const pendingAssignments = totalAssignments - completedAssignments
    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
    return { totalAssignments, completedAssignments, pendingAssignments, completionRate }
  }, [assignments])

  return {
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
    filteredAssignments,
    assignmentFilter,
    setAssignmentFilter,
    assignmentSearchTerm,
    setAssignmentSearchTerm,
    statistics,
  }
}
