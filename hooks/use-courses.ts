"use client"

import { useState, useCallback, useMemo } from "react"
import type { Course, CourseFormData } from "@/lib/types"

const initialCoursesData: Course[] = [
  { id: 1, name: "데이터베이스시스템 (샘플)", code: "CS301S", instructor: "김교수", credits: 3 },
  { id: 2, name: "알고리즘 (샘플)", code: "CS302S", instructor: "이교수", credits: 3 },
  { id: 3, name: "웹프로그래밍 (샘플)", code: "CS303S", instructor: "박교수", credits: 3 },
  { id: 4, name: "소프트웨어공학 (샘플)", code: "CS304S", instructor: "최교수", credits: 3 },
]
const generateId = () => Date.now() + Math.random()

export function useCourses(initialCourses: Course[] = initialCoursesData) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [courseFilter, setCourseFilter] = useState("all") // Example filter, can be expanded
  const [courseSearchTerm, setCourseSearchTerm] = useState("")

  const addCourse = useCallback((newCourseData: CourseFormData) => {
    const newCourse: Course = {
      ...newCourseData,
      id: generateId(),
    }
    setCourses((prev) => [newCourse, ...prev])
  }, [])

  const updateCourse = useCallback((updatedCourseData: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourseData.id ? updatedCourseData : c)))
  }, [])

  const deleteCourse = useCallback((id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Add filter logic if any (e.g., by credits, department)
        // For now, only search term
        const searchTermLower = courseSearchTerm.toLowerCase()
        return (
          course.name.toLowerCase().includes(searchTermLower) ||
          course.code.toLowerCase().includes(searchTermLower) ||
          course.instructor.toLowerCase().includes(searchTermLower)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [courses, courseSearchTerm, courseFilter])

  return {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    filteredCourses,
    courseFilter,
    setCourseFilter,
    courseSearchTerm,
    setCourseSearchTerm,
  }
}
