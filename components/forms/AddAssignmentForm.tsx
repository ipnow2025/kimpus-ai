"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Calendar, AlertCircle, FileText, LinkIcon, Users, PlusCircle } from "lucide-react"
import type { Assignment, AssignmentFormData, Course, Team } from "@/lib/types" // Added Team
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface AddAssignmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AssignmentFormData, existingId?: number) => void
  courses: Array<Course>
  teams: Team[] // Pass available teams
  onCreateNewTeam: () => void // Callback to open create team modal
  isDarkMode: boolean
  initialAssignment?: Assignment | null
}

export default function AddAssignmentForm({
  isOpen,
  onClose,
  onSubmit,
  courses,
  teams,
  onCreateNewTeam,
  isDarkMode,
  initialAssignment,
}: AddAssignmentFormProps) {
  const isEditing = !!initialAssignment

  const getInitialFormData = (): AssignmentFormData => ({
    title: "",
    course: "",
    dueDate: "",
    priority: "medium",
    description: "",
    submitLink: "",
    notes: "",
    isTeamAssignment: false,
    teamId: "", // Will store selected team ID
    newTeamName: "", // Not used directly for submission, but for UI flow
  })

  const [formData, setFormData] = useState<AssignmentFormData>(getInitialFormData())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialAssignment) {
        setFormData({
          title: initialAssignment.title,
          course: initialAssignment.course,
          dueDate: initialAssignment.dueDate.split("T")[0],
          priority: initialAssignment.priority,
          description: initialAssignment.description,
          submitLink: initialAssignment.submitLink,
          notes: initialAssignment.notes || "",
          isTeamAssignment: initialAssignment.isTeamAssignment || false,
          teamId: initialAssignment.teamId || "",
          newTeamName: "", // Reset this
        })
      } else {
        setFormData(getInitialFormData())
      }
      setErrors({})
    }
  }, [isOpen, initialAssignment, isEditing])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "과제 제목을 입력해주세요"
    if (!formData.course) newErrors.course = "과목을 선택해주세요"
    if (!formData.dueDate) newErrors.dueDate = "마감일을 선택해주세요"
    if (formData.isTeamAssignment && !formData.teamId) {
      newErrors.teamId = "팀 과제인 경우 팀을 선택하거나 새로 만들어주세요."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // If a new team was "created" via this form, it should already be in the `teams` prop
      // The actual team creation is handled by the parent via `onCreateNewTeam` and `useTeams` hook
      const dataToSubmit = { ...formData }
      delete dataToSubmit.newTeamName // Don't submit this temporary field
      onSubmit(dataToSubmit, initialAssignment?.id)
      onClose()
    }
  }

  const handleChange = (field: keyof AssignmentFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))

    // If user unchecks team assignment, clear teamId
    if (field === "isTeamAssignment" && value === false) {
      setFormData((prev) => ({ ...prev, teamId: "" }))
      if (errors.teamId) setErrors((prev) => ({ ...prev, teamId: "" }))
    }
  }

  if (!isOpen) return null

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-md ${hasError ? "border-red-500 focus:ring-red-500" : isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"} focus:outline-none focus:ring-2`
  const labelClass = `block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center space-x-3">
            <FileText className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {isEditing ? "과제 수정" : "새 과제 추가"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title, Course, Priority, Due Date - remain largely the same */}
          <div>
            <Label htmlFor="title" className={labelClass}>
              과제 제목 *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="예: 데이터베이스 설계 프로젝트"
              className={inputClass(!!errors.title)}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course" className={labelClass}>
                과목 *
              </Label>
              <Select value={formData.course} onValueChange={(val) => handleChange("course", val)}>
                <SelectTrigger id="course" className={inputClass(!!errors.course)}>
                  <SelectValue placeholder="과목을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.course}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="priority" className={labelClass}>
                우선순위
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(val) => handleChange("priority", val as "low" | "medium" | "high")}
              >
                <SelectTrigger id="priority" className={inputClass(false)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="dueDate" className={labelClass}>
              마감일 *
            </Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className={inputClass(!!errors.dueDate)}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Team Assignment Section */}
          <div className="space-y-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="isTeamAssignment"
                checked={formData.isTeamAssignment}
                onCheckedChange={(checked) => handleChange("isTeamAssignment", !!checked)}
                className={
                  isDarkMode
                    ? "border-gray-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    : ""
                }
              />
              <Label htmlFor="isTeamAssignment" className={`${labelClass} mb-0 cursor-pointer flex items-center`}>
                <Users className="w-4 h-4 mr-2" /> 팀 과제입니다
              </Label>
            </div>

            {formData.isTeamAssignment && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="teamId" className={labelClass}>
                  팀 선택 또는 생성 *
                </Label>
                <div className="flex items-center gap-2">
                  <Select value={formData.teamId} onValueChange={(val) => handleChange("teamId", val)}>
                    <SelectTrigger id="teamId" className={`${inputClass(!!errors.teamId)} flex-grow`}>
                      <SelectValue placeholder="기존 팀 선택..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.length === 0 && (
                        <SelectItem value="no-teams" disabled>
                          사용 가능한 팀 없음
                        </SelectItem>
                      )}
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={onCreateNewTeam} className="shrink-0">
                    <PlusCircle className="w-4 h-4 mr-2" /> 새 팀 만들기
                  </Button>
                </div>
                {errors.teamId && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.teamId}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description, Submit Link, Notes - remain largely the same */}
          <div>
            <Label htmlFor="description" className={labelClass}>
              과제 설명 *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder="과제에 대한 자세한 설명을 입력하세요..."
              className={inputClass(!!errors.description)}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="submitLink" className={labelClass}>
              제출 링크 (선택사항)
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="submitLink"
                type="url"
                value={formData.submitLink}
                onChange={(e) => handleChange("submitLink", e.target.value)}
                placeholder="https://lms.example.com/submit/123"
                className={`${inputClass(false)} pl-10`}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes" className={labelClass}>
              메모 (선택사항)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
              placeholder="추가 메모나 참고사항을 입력하세요..."
              className={inputClass(false)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              {isEditing ? "과제 수정" : "과제 추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
