"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { courseApi } from "@/lib/api-client"
import type { Course, CourseFormData } from "@/lib/types"
import { useMemo, useState } from "react"

const COURSES_QUERY_KEY = ["courses"]

export function useCoursesQuery() {
  const [courseFilter, setCourseFilter] = useState("all")
  const [courseSearchTerm, setCourseSearchTerm] = useState("")
  const queryClient = useQueryClient()

  // 과목 목록 조회
  const {
    data: courses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: COURSES_QUERY_KEY,
    queryFn: courseApi.getAll,
  })

  // 과목 생성
  const createCourseMutation = useMutation({
    mutationFn: courseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })

  // 과목 수정
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseFormData }) => courseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })

  // 과목 삭제
  const deleteCourseMutation = useMutation({
    mutationFn: courseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })

  // 필터링된 과목 목록
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course: Course) => {
        const searchTermLower = courseSearchTerm.toLowerCase()
        return (
          course.name.toLowerCase().includes(searchTermLower) ||
          course.code.toLowerCase().includes(searchTermLower) ||
          course.instructor.toLowerCase().includes(searchTermLower)
        )
      })
      .sort((a: Course, b: Course) => a.name.localeCompare(b.name))
  }, [courses, courseSearchTerm])

  return {
    // 데이터
    courses: filteredCourses,

    // 로딩 상태
    isLoading,
    error,

    // 필터 상태
    courseFilter,
    setCourseFilter,
    courseSearchTerm,
    setCourseSearchTerm,

    // 액션
    addCourse: (data: CourseFormData) => createCourseMutation.mutateAsync(data),
    updateCourse: (course: Course) =>
      updateCourseMutation.mutateAsync({
        id: course.id,
        data: course,
      }),
    deleteCourse: (id: number) => deleteCourseMutation.mutateAsync(id),
    refetch,

    // 뮤테이션 상태
    isCreating: createCourseMutation.isPending,
    isUpdating: updateCourseMutation.isPending,
    isDeleting: deleteCourseMutation.isPending,
  }
}
