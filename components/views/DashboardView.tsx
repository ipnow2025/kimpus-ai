"use client"

import type React from "react"
import { memo } from "react"
import { FileText, Clock, CheckCircle, BarChart3 } from "lucide-react"
import type { Assignment, AssignmentStatistics } from "@/lib/types"

interface StatCardProps {
  icon: React.ElementType
  title: string
  value: string | number
  color: string
  isDarkMode: boolean
}

const StatCard = memo(({ icon: Icon, title, value, color, isDarkMode }: StatCardProps) => (
  <div
    className={`rounded-lg p-3 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
  >
    <div className="flex items-center">
      <div className={`p-1.5 rounded-md ${color}`}>
        <Icon className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
      </div>
      <div className="ml-2">
        <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{title}</p>
        <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
      </div>
    </div>
  </div>
))
StatCard.displayName = "StatCard"

interface DashboardViewProps {
  assignments: Assignment[]
  statistics: AssignmentStatistics
  isMobile: boolean
  isDarkMode: boolean
  onViewAssignmentDetails: (assignment: Assignment) => void
  onNavigate: (view: string) => void
}

const DashboardView: React.FC<DashboardViewProps> = ({
  assignments,
  statistics,
  isMobile,
  isDarkMode,
  onViewAssignmentDetails,
  onNavigate,
}) => {
  const recentAssignments = assignments.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1
          className={`${isMobile ? "text-xl" : "text-3xl"} font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-2`}
        >
          🎓 김조교 (Frontend) 대시보드
        </h1>
        <p className={`${isMobile ? "text-sm" : "text-lg"} ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          학습 관리 플랫폼에 오신 것을 환영합니다! (클라이언트 전용 버전)
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <StatCard
          icon={FileText}
          title="전체 과제"
          value={statistics.totalAssignments}
          color={isDarkMode ? "bg-blue-900" : "bg-blue-100"}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={Clock}
          title="진행중"
          value={statistics.pendingAssignments}
          color={isDarkMode ? "bg-yellow-900" : "bg-yellow-100"}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={CheckCircle}
          title="완료"
          value={statistics.completedAssignments}
          color={isDarkMode ? "bg-green-900" : "bg-green-100"}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={BarChart3}
          title="완료율"
          value={`${statistics.completionRate}%`}
          color={isDarkMode ? "bg-purple-900" : "bg-purple-100"}
          isDarkMode={isDarkMode}
        />
      </div>
      <div
        className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div
          className={`px-4 py-3 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}
        >
          <h3
            className={`${isMobile ? "text-base" : "text-lg"} font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            최근 과제
          </h3>
          <button
            onClick={() => onNavigate("assignments")}
            className={`text-xs ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors`}
          >
            전체보기
          </button>
        </div>
        <div className="p-3 space-y-2">
          {recentAssignments.length > 0 ? (
            recentAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`p-2.5 rounded-lg ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"} transition-colors cursor-pointer`}
                onClick={() => onViewAssignmentDetails(assignment)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onViewAssignmentDetails(assignment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`${isMobile ? "text-sm" : "text-base"} font-medium ${isDarkMode ? "text-white" : "text-gray-900"} truncate`}
                    >
                      {assignment.title}
                    </h4>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {assignment.course} • {new Date(assignment.dueDate).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 whitespace-nowrap ${assignment.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}
                  >
                    {assignment.status === "completed" ? "완료" : "진행중"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-xs text-center py-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              최근 과제가 없습니다.
            </p>
          )}
        </div>
      </div>
      {/* You can add more sections like upcoming schedule items here */}
    </div>
  )
}

export default memo(DashboardView)
