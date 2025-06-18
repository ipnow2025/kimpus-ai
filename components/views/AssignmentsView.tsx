"use client"
import type React from "react"
import { memo } from "react"
import { FileText, CheckCircle, Edit3, Trash2, Users } from "lucide-react" // Added Users
import type { Assignment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AssignmentsViewProps {
  assignments: Assignment[]
  onAdd: () => void
  onViewDetails: (assignment: Assignment) => void
  onEdit: (assignment: Assignment) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
  filter: string
  setFilter: (filter: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  isMobile: boolean
  isDarkMode: boolean
  onOpenTeamWorkspace: (assignment: Assignment) => void // Callback to open team workspace
}

const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  onAdd,
  onViewDetails,
  onEdit,
  onDelete,
  onToggleStatus,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  isMobile,
  isDarkMode,
  onOpenTeamWorkspace,
}) => {
  const getDaysUntilDue = (dueDate: string): number => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24))
  }

  const getPriorityClass = (priority: "low" | "medium" | "high", type: "badge" | "text" = "badge") => {
    const baseClasses = "text-xs px-2 py-0.5 rounded-full font-medium"
    switch (priority) {
      case "high":
        return type === "badge"
          ? `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300`
          : "text-red-500"
      case "medium":
        return type === "badge"
          ? `${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300`
          : "text-yellow-500"
      case "low":
        return type === "badge"
          ? `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300`
          : "text-green-500"
      default:
        return type === "badge"
          ? `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300`
          : "text-gray-500"
    }
  }

  const inputClass = isDarkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
  const selectTriggerClass = isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1
            className={`${isMobile ? "text-xl" : "text-2xl"} font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            과제 관리
          </h1>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            과제를 효율적으로 관리하고 추적하세요
          </p>
        </div>
        <Button onClick={onAdd} className={`${isMobile ? "w-full" : ""}`}>
          + 새 과제 추가
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="과제 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${inputClass} focus:ring-blue-500`}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className={`w-full sm:w-[180px] ${selectTriggerClass} focus:ring-blue-500`}>
            <SelectValue placeholder="필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">진행중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
          <h3 className={`text-lg font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>
            {searchTerm || filter !== "all" ? "검색 결과가 없습니다" : "과제가 없습니다"}
          </h3>
          <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {searchTerm || filter !== "all" ? "다른 검색어나 필터를 사용해보세요." : "새로운 과제를 추가해보세요."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-shadow`}
          >
            <CardContent className={`${isMobile ? "p-3" : "p-4"} flex items-start justify-between`}>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center space-x-2">
                  <h3
                    className={`${isMobile ? "text-sm" : "text-base"} font-medium ${isDarkMode ? "text-white" : "text-gray-900"} truncate cursor-pointer hover:underline`}
                    onClick={() => onViewDetails(assignment)}
                  >
                    {assignment.title}
                  </h3>
                  <Badge className={getPriorityClass(assignment.priority)}>
                    {assignment.priority === "high" ? "높음" : assignment.priority === "medium" ? "보통" : "낮음"}
                  </Badge>
                  {assignment.isTeamAssignment && (
                    <Badge
                      variant="outline"
                      className="text-xs border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
                    >
                      <Users className="w-3 h-3 mr-1" /> 팀
                    </Badge>
                  )}
                </div>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{assignment.course}</p>
                <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"} line-clamp-2`}>
                  {assignment.description}
                </p>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    마감: {new Date(assignment.dueDate).toLocaleDateString("ko-KR")}
                  </span>
                  <span
                    className={`${getDaysUntilDue(assignment.dueDate) < 0 ? "text-red-500 font-semibold" : getDaysUntilDue(assignment.dueDate) <= 3 ? "text-orange-500" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {getDaysUntilDue(assignment.dueDate) > 0
                      ? `${getDaysUntilDue(assignment.dueDate)}일 남음`
                      : getDaysUntilDue(assignment.dueDate) === 0
                        ? "오늘 마감"
                        : `${Math.abs(getDaysUntilDue(assignment.dueDate))}일 지남`}
                  </span>
                </div>
                {assignment.isTeamAssignment && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
                    onClick={() => onOpenTeamWorkspace(assignment)}
                  >
                    팀 작업 공간으로 이동 <Users className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
              <div className={`flex ${isMobile ? "flex-col space-y-1 ml-2" : "items-center space-x-1 ml-3"}`}>
                <Button
                  variant="ghost"
                  size={isMobile ? "icon-sm" : "icon"}
                  onClick={() => onToggleStatus(assignment.id)}
                  className={`${assignment.status === "completed" ? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <CheckCircle className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
                </Button>
                <Button
                  variant="ghost"
                  size={isMobile ? "icon-sm" : "icon"}
                  onClick={() => onEdit(assignment)}
                  className={`${isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                  <Edit3 className={`${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                </Button>
                <Button
                  variant="ghost"
                  size={isMobile ? "icon-sm" : "icon"}
                  onClick={() => onDelete(assignment.id)}
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <Trash2 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
export default memo(AssignmentsView)
