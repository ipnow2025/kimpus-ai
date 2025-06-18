"use client"

import type React from "react"
import { memo } from "react"
import type { Assignment } from "@/lib/types"
// Import chart components if you decide to use a library like Recharts or Chart.js
// For now, this will be a placeholder for statistical display
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, CheckCircle, Clock, TrendingUp, ListChecks } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatisticsViewProps {
  assignments: Assignment[]
  isDarkMode: boolean
  isMobile: boolean
  dateRange: string // e.g., 'week', 'month', 'all'
  setDateRange: (range: string) => void
  view: string // e.g., 'overview', 'completion', 'priority'
  setView: (view: string) => void
}

const StatisticsView: React.FC<StatisticsViewProps> = ({
  assignments,
  isDarkMode,
  isMobile,
  dateRange,
  setDateRange,
  view,
  setView,
}) => {
  // Basic statistics calculation (can be expanded)
  const totalAssignments = assignments.length
  const completedAssignments = assignments.filter((a) => a.status === "completed").length
  const pendingAssignments = totalAssignments - completedAssignments
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

  // Placeholder for more advanced chart data
  // const chartData = useMemo(() => {
  //   // Process assignments based on dateRange and view to generate chart data
  //   return [];
  // }, [assignments, dateRange, view]);

  const cardClass = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  const textClass = isDarkMode ? "text-white" : "text-gray-900"
  const mutedTextClass = isDarkMode ? "text-gray-400" : "text-gray-500"
  const selectTriggerClass = isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold ${textClass}`}>학습 통계</h1>
          <p className={`text-xs ${mutedTextClass}`}>나의 학습 진행 상황을 한눈에 파악하세요.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className={`w-full sm:w-[120px] ${selectTriggerClass}`}>
              <SelectValue placeholder="기간" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">최근 1주</SelectItem>
              <SelectItem value="month">최근 1달</SelectItem>
              <SelectItem value="all">전체 기간</SelectItem>
            </SelectContent>
          </Select>
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className={`w-full sm:w-[150px] ${selectTriggerClass}`}>
              <SelectValue placeholder="보기 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">개요</SelectItem>
              <SelectItem value="completion">완료율 추이</SelectItem>
              <SelectItem value="priority">우선순위별 분석</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats Cards */}
      {view === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={cardClass}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 과제 수</CardTitle>
              <ListChecks className={`h-4 w-4 ${mutedTextClass}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${textClass}`}>{totalAssignments}</div>
              <p className={`text-xs ${mutedTextClass}`}>등록된 전체 과제</p>
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 과제</CardTitle>
              <CheckCircle className={`h-4 w-4 text-green-500`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${textClass}`}>{completedAssignments}</div>
              <p className={`text-xs ${mutedTextClass}`}>기한 내 완료</p>
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">진행중 과제</CardTitle>
              <Clock className={`h-4 w-4 text-yellow-500`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${textClass}`}>{pendingAssignments}</div>
              <p className={`text-xs ${mutedTextClass}`}>아직 완료되지 않음</p>
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">과제 완료율</CardTitle>
              <TrendingUp className={`h-4 w-4 text-blue-500`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${textClass}`}>{completionRate}%</div>
              <p className={`text-xs ${mutedTextClass}`}>전체 과제 대비</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Placeholder for Charts */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-lg">
            {view === "completion"
              ? "과제 완료율 추이"
              : view === "priority"
                ? "우선순위별 과제 분포"
                : "학습 데이터 시각화"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`h-[300px] flex items-center justify-center border-2 border-dashed ${isDarkMode ? "border-gray-700" : "border-gray-300"} rounded-md`}
          >
            <div className="text-center">
              <BarChart3 className={`w-12 h-12 mx-auto mb-2 ${mutedTextClass}`} />
              <p className={`${mutedTextClass}`}>
                {view === "completion"
                  ? "주간/월간 완료율 그래프가 여기에 표시됩니다."
                  : view === "priority"
                    ? "우선순위별 과제 수 파이 차트가 여기에 표시됩니다."
                    : "선택된 통계에 대한 차트가 여기에 표시됩니다."}
              </p>
              <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                (차트 기능은 구현 예정입니다)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add more detailed statistics or tables as needed */}
    </div>
  )
}

export default memo(StatisticsView)
