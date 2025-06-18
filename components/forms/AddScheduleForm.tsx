"use client"

import type React from "react"
import { useState } from "react"
import { X, Clock, MapPin, User, AlertCircle } from "lucide-react"

interface ScheduleItem {
  id: number
  day: string
  time: string
  subject: string
  room: string
  instructor?: string
}

interface AddScheduleFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (schedule: Omit<ScheduleItem, "id">) => void
  courses: Array<{ id: number; name: string; instructor: string }>
  isDarkMode: boolean
}

export default function AddScheduleForm({ isOpen, onClose, onSubmit, courses, isDarkMode }: AddScheduleFormProps) {
  const [formData, setFormData] = useState({
    day: "",
    startTime: "",
    endTime: "",
    subject: "",
    room: "",
    instructor: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const days = [
    { value: "월", label: "월요일" },
    { value: "화", label: "화요일" },
    { value: "수", label: "수요일" },
    { value: "목", label: "목요일" },
    { value: "금", label: "금요일" },
    { value: "토", label: "토요일" },
    { value: "일", label: "일요일" },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.day) {
      newErrors.day = "요일을 선택해주세요"
    }

    if (!formData.startTime) {
      newErrors.startTime = "시작 시간을 입력해주세요"
    }

    if (!formData.endTime) {
      newErrors.endTime = "종료 시간을 입력해주세요"
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = "종료 시간은 시작 시간보다 늦어야 합니다"
      }
    }

    if (!formData.subject) {
      newErrors.subject = "과목을 선택해주세요"
    }

    if (!formData.room.trim()) {
      newErrors.room = "강의실을 입력해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const timeSlot = `${formData.startTime}-${formData.endTime}`

      onSubmit({
        day: formData.day,
        time: timeSlot,
        subject: formData.subject,
        room: formData.room,
        instructor: formData.instructor,
      })

      // 폼 초기화
      setFormData({
        day: "",
        startTime: "",
        endTime: "",
        subject: "",
        room: "",
        instructor: "",
      })
      setErrors({})
      onClose()
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 과목 선택 시 담당교수 자동 설정
    if (field === "subject") {
      const selectedCourse = courses.find((course) => course.name === value)
      if (selectedCourse) {
        setFormData((prev) => ({ ...prev, instructor: selectedCourse.instructor }))
      }
    }

    // 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center space-x-3">
            <Clock className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>새 수업 추가</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-md transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 요일과 과목 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                요일 *
              </label>
              <select
                value={formData.day}
                onChange={(e) => handleChange("day", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.day
                    ? "border-red-500 focus:ring-red-500"
                    : isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              >
                <option value="">요일을 선택하세요</option>
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              {errors.day && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.day}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                과목 *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.subject
                    ? "border-red-500 focus:ring-red-500"
                    : isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              >
                <option value="">과목을 선택하세요</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.subject}
                </p>
              )}
            </div>
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                시작 시간 *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.startTime
                    ? "border-red-500 focus:ring-red-500"
                    : isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                종료 시간 *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.endTime
                    ? "border-red-500 focus:ring-red-500"
                    : isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* 강의실 */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
              강의실 *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.room}
                onChange={(e) => handleChange("room", e.target.value)}
                placeholder="예: 공학관 301호"
                className={`w-full px-3 py-2 pl-10 border rounded-md ${
                  errors.room
                    ? "border-red-500 focus:ring-red-500"
                    : isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              />
              <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            {errors.room && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.room}
              </p>
            )}
          </div>

          {/* 담당교수 */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
              담당교수
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => handleChange("instructor", e.target.value)}
                placeholder="담당교수명을 입력하세요"
                className={`w-full px-3 py-2 pl-10 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              />
              <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              수업 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
