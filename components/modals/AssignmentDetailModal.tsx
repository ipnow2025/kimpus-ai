"use client"

import { useState } from "react"
import {
  X,
  Calendar,
  AlertCircle,
  FileText,
  LinkIcon,
  Edit,
  Trash2,
  CheckCircle,
  Users,
  ArrowRight,
} from "lucide-react" // Added Users, ArrowRight
import type { Assignment, Team } from "@/lib/types" // Added Team
import { Button } from "@/components/ui/button" // Assuming Button is from shadcn

interface AssignmentDetailModalProps {
  assignment: Assignment | null
  team?: Team | null // Optional team details
  isOpen: boolean
  onClose: () => void
  onEdit: (assignment: Assignment) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
  onOpenTeamWorkspace?: (assignment: Assignment) => void // Optional callback
  isDarkMode: boolean
}

export default function AssignmentDetailModal({
  assignment,
  team,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenTeamWorkspace,
  isDarkMode,
}: AssignmentDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!isOpen || !assignment) return null

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24))
  }
  const daysUntilDue = getDaysUntilDue(assignment.dueDate)

  const handleDelete = () => {
    onDelete(assignment.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300"
    }
  }
  const getStatusColor = (status: string) =>
    status === "completed"
      ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300"
      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300"

  const cardBg = isDarkMode ? "bg-gray-800" : "bg-white"
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900"
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600"
  const textMuted = isDarkMode ? "text-gray-400" : "text-gray-500"
  const borderClass = isDarkMode ? "border-gray-700" : "border-gray-200"
  const sectionBg = isDarkMode ? "bg-gray-700/50" : "bg-gray-50"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-5 border-b ${borderClass}`}>
          <div className="flex items-center space-x-3">
            <FileText className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xl font-semibold ${textPrimary}`}>과제 상세정보</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-2xl font-bold ${textPrimary} mb-1`}>{assignment.title}</h3>
              <p className={`text-lg ${textSecondary}`}>{assignment.course}</p>
            </div>
            <div className="flex flex-col items-end space-y-1.5">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(assignment.status)}`}>
                {assignment.status === "completed" ? "완료" : "진행중"}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityColor(assignment.priority)}`}>
                {assignment.priority === "high" ? "높음" : assignment.priority === "medium" ? "보통" : "낮음"}
              </span>
            </div>
          </div>

          {assignment.isTeamAssignment && team && (
            <div className={`p-3 rounded-lg ${sectionBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>팀 과제: {team.name}</p>
                    <p className={`text-xs ${textMuted}`}>팀원: {team.members.map((m) => m.name).join(", ")}</p>
                  </div>
                </div>
                {onOpenTeamWorkspace && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenTeamWorkspace(assignment)}
                    className="text-xs"
                  >
                    작업 공간 <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className={`p-3 rounded-lg ${sectionBg}`}>
            <div className="flex items-center space-x-3">
              <Calendar className={`w-5 h-5 ${textMuted}`} />
              <div>
                <p className={`text-sm font-medium ${textPrimary}`}>
                  마감일: {new Date(assignment.dueDate).toLocaleDateString("ko-KR")}
                </p>
                <p
                  className={`text-sm ${daysUntilDue <= 3 && daysUntilDue >= 0 ? (isDarkMode ? "text-orange-400" : "text-orange-600") : daysUntilDue < 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : textMuted}`}
                >
                  {daysUntilDue > 0
                    ? `${daysUntilDue}일 남음`
                    : daysUntilDue === 0
                      ? "오늘 마감"
                      : `${Math.abs(daysUntilDue)}일 지남`}
                </p>
              </div>
            </div>
          </div>

          {assignment.description && (
            <div>
              <h4 className={`text-base font-medium ${textPrimary} mb-1.5`}>과제 설명</h4>
              <p className={`text-sm ${textSecondary} leading-relaxed whitespace-pre-wrap`}>{assignment.description}</p>
            </div>
          )}

          {assignment.submitLink && (
            <div>
              <h4 className={`text-base font-medium ${textPrimary} mb-1.5`}>제출 링크</h4>
              <a
                href={assignment.submitLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="text-sm underline">{assignment.submitLink}</span>
              </a>
            </div>
          )}

          {assignment.attachments.length > 0 && (
            <div>
              <h4 className={`text-base font-medium ${textPrimary} mb-1.5`}>첨부파일</h4>
              <div className="space-y-1.5">
                {assignment.attachments.map((attachment, index) => (
                  <div key={index} className={`flex items-center space-x-2 p-2 rounded-md ${sectionBg}`}>
                    <FileText className={`w-4 h-4 ${textMuted}`} />
                    <span className={`text-sm ${textSecondary}`}>{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignment.notes && (
            <div>
              <h4 className={`text-base font-medium ${textPrimary} mb-1.5`}>메모</h4>
              <p className={`text-sm ${textSecondary} leading-relaxed whitespace-pre-wrap`}>{assignment.notes}</p>
            </div>
          )}
        </div>

        <div className={`flex justify-between items-center p-5 border-t ${borderClass}`}>
          <Button
            onClick={() => onToggleStatus(assignment.id)}
            className={`flex items-center space-x-1.5 text-sm ${assignment.status === "completed" ? "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700" : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"} text-white`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{assignment.status === "completed" ? "진행중으로 변경" : "완료로 표시"}</span>
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(assignment)} className="text-sm">
              <Edit className="w-3.5 h-3.5 mr-1" /> 수정
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} className="text-sm">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> 삭제
            </Button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className={`${cardBg} rounded-lg p-6 max-w-sm mx-auto shadow-2xl`}>
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className={`text-lg font-semibold ${textPrimary}`}>과제 삭제 확인</h3>
              </div>
              <p className={`text-sm ${textSecondary} mb-5`}>
                정말로 이 과제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  취소
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
