"use client"

import type React from "react"
import { memo } from "react"
import { BookOpen, Edit3, Trash2, PlusCircle } from "lucide-react"
import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

interface CoursesViewProps {
  courses: Course[]
  isDarkMode: boolean
  isMobile: boolean
  onAddCourse: () => void
  onEditCourse: (course: Course) => void
  onDeleteCourse: (id: number) => void
  filter: string // Example: 'all', 'major', 'elective' - can be expanded
  setFilter: (filter: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  isDarkMode,
  isMobile,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  filter, // Currently unused, but available for future expansion
  setFilter, // Currently unused
  searchTerm,
  setSearchTerm,
}) => {
  const inputClass = isDarkMode
    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
  // const selectTriggerClass = isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1
            className={`${isMobile ? "text-xl" : "text-2xl"} font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            과목 관리
          </h1>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            수강 과목을 등록하고 관리하세요.
          </p>
        </div>
        <Button onClick={onAddCourse} className={`${isMobile ? "w-full" : ""}`}>
          <PlusCircle className="w-4 h-4 mr-2" /> 새 과목 추가
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="과목명, 코드, 교수 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${inputClass} focus:ring-blue-500`}
          />
        </div>
        {/* Filter Select (can be enabled if needed)
        <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className={`w-full sm:w-[180px] ${selectTriggerClass} focus:ring-blue-500`}>
                <SelectValue placeholder="필터" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                // Add more filter options if needed
            </SelectContent>
        </Select>
        */}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
          <h3 className={`text-lg font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>
            {searchTerm ? "검색된 과목이 없습니다" : "등록된 과목이 없습니다"}
          </h3>
          <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {searchTerm ? "다른 검색어를 사용해보세요." : "새로운 과목을 추가하여 학습 계획을 시작하세요."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card
            key={course.id}
            className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} flex flex-col`}
          >
            <CardHeader>
              <CardTitle className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} text-lg`}>
                {course.name}
              </CardTitle>
              <CardDescription className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {course.code} • {course.credits}학점
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                담당교수: {course.instructor || "미지정"}
              </p>
              {/* Add more course details if needed */}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditCourse(course)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteCourse(course.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default memo(CoursesView)
