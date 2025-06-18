"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, BookOpen, User, AlertCircle, PlusCircle, Trash2 } from "lucide-react"
import type { Course, CourseFormData, ScheduleSlot } from "@/lib/types" // Import ScheduleSlot
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddCourseFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (course: CourseFormData, existingId?: number) => void
  isDarkMode: boolean
  initialData?: Course | null
}

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"]

export default function AddCourseForm({ isOpen, onClose, onSubmit, isDarkMode, initialData }: AddCourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    code: "",
    instructor: "",
    credits: 3,
    defaultScheduleSlots: [],
  })
  const [errors, setErrors] = useState<Record<string, string | Record<number, Record<string, string>>>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        instructor: initialData.instructor,
        credits: initialData.credits,
        defaultScheduleSlots: initialData.defaultScheduleSlots?.map((slot) => ({ ...slot })) || [],
      })
    } else {
      setFormData({ name: "", code: "", instructor: "", credits: 3, defaultScheduleSlots: [] })
    }
    setErrors({})
  }, [initialData, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string | Record<number, Record<string, string>>> = {}
    if (!formData.name.trim()) newErrors.name = "과목명을 입력해주세요"
    if (!formData.code.trim()) newErrors.code = "과목코드를 입력해주세요"
    if (formData.credits <= 0) newErrors.credits = "학점은 0보다 커야 합니다"

    const slotErrors: Record<number, Record<string, string>> = {}
    formData.defaultScheduleSlots?.forEach((slot, index) => {
      const currentSlotErrors: Record<string, string> = {}
      if (!slot.day) currentSlotErrors.day = "요일 필수"
      if (!slot.startTime) currentSlotErrors.startTime = "시작시간 필수"
      if (!slot.endTime) currentSlotErrors.endTime = "종료시간 필수"
      if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
        currentSlotErrors.endTime = "종료시간은 시작시간 이후여야 합니다."
      }
      if (!slot.room.trim()) currentSlotErrors.room = "강의실 필수"
      if (Object.keys(currentSlotErrors).length > 0) {
        slotErrors[index] = currentSlotErrors
      }
    })
    if (Object.keys(slotErrors).length > 0) {
      newErrors.defaultScheduleSlots = slotErrors
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData, initialData?.id)
    }
  }

  const handleChange = (field: keyof Omit<CourseFormData, "defaultScheduleSlots">, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleSlotChange = (index: number, field: keyof ScheduleSlot, value: string) => {
    const updatedSlots = [...(formData.defaultScheduleSlots || [])]
    updatedSlots[index] = { ...updatedSlots[index], [field]: value }
    setFormData((prev) => ({ ...prev, defaultScheduleSlots: updatedSlots }))

    // Clear specific slot error
    if (
      errors.defaultScheduleSlots &&
      typeof errors.defaultScheduleSlots === "object" &&
      (errors.defaultScheduleSlots as Record<number, Record<string, string>>)[index]?.[field]
    ) {
      const newSlotErrors = { ...(errors.defaultScheduleSlots as Record<number, Record<string, string>>) }
      delete newSlotErrors[index]?.[field]
      if (Object.keys(newSlotErrors[index] || {}).length === 0) {
        delete newSlotErrors[index]
      }
      setErrors((prev) => ({
        ...prev,
        defaultScheduleSlots: Object.keys(newSlotErrors).length > 0 ? newSlotErrors : undefined,
      }))
    }
  }

  const addScheduleSlot = () => {
    const newSlot: ScheduleSlot = {
      day: "월",
      startTime: "09:00",
      endTime: "10:00",
      room: "",
      instructor: formData.instructor,
    }
    setFormData((prev) => ({
      ...prev,
      defaultScheduleSlots: [...(prev.defaultScheduleSlots || []), newSlot],
    }))
  }

  const removeScheduleSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      defaultScheduleSlots: prev.defaultScheduleSlots?.filter((_, i) => i !== index),
    }))
    // Clear errors for removed slots
    if (errors.defaultScheduleSlots && typeof errors.defaultScheduleSlots === "object") {
      const newSlotErrors = { ...(errors.defaultScheduleSlots as Record<number, Record<string, string>>) }
      delete newSlotErrors[index]
      // Re-index subsequent errors if necessary, or simply clear all slot errors if logic gets too complex
      setErrors((prev) => ({
        ...prev,
        defaultScheduleSlots: Object.keys(newSlotErrors).length > 0 ? newSlotErrors : undefined,
      }))
    }
  }

  if (!isOpen) return null
  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-md ${hasError ? "border-red-500 focus:ring-red-500" : isDarkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500" : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"} focus:outline-none focus:ring-2`
  const labelClass = `block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {initialData ? "과목 수정" : "새 과목 추가"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseName" className={labelClass}>
                과목명 *
              </Label>
              <Input
                id="courseName"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputClass(!!errors.name)}
              />
              {errors.name && typeof errors.name === "string" && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="courseCode" className={labelClass}>
                과목코드 *
              </Label>
              <Input
                id="courseCode"
                type="text"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className={inputClass(!!errors.code)}
              />
              {errors.code && typeof errors.code === "string" && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.code}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseInstructor" className={labelClass}>
                담당교수
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="courseInstructor"
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => handleChange("instructor", e.target.value)}
                  placeholder="담당교수명"
                  className={`${inputClass(false)} pl-10`}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="courseCredits" className={labelClass}>
                학점 *
              </Label>
              <Input
                id="courseCredits"
                type="number"
                value={formData.credits}
                onChange={(e) => handleChange("credits", Number.parseInt(e.target.value, 10))}
                min="1"
                className={inputClass(!!errors.credits)}
              />
              {errors.credits && typeof errors.credits === "string" && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.credits}
                </p>
              )}
            </div>
          </div>

          {/* Default Schedule Slots */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className={labelClass}>기본 수업 시간 (선택 사항)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot} className="flex items-center">
                <PlusCircle className="w-4 h-4 mr-1" /> 시간 추가
              </Button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {formData.defaultScheduleSlots?.map((slot, index) => {
                const slotErrorGroup =
                  (errors.defaultScheduleSlots as Record<number, Record<string, string>>)?.[index] || {}
                return (
                  <div
                    key={index}
                    className={`p-3 border rounded-md relative ${isDarkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-200 bg-gray-50/50"}`}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeScheduleSlot(index)}
                      className="absolute top-1 right-1 w-6 h-6 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">
                      <div>
                        <Label htmlFor={`slot-day-${index}`} className={`${labelClass} text-xs`}>
                          요일
                        </Label>
                        <Select value={slot.day} onValueChange={(val) => handleSlotChange(index, "day", val)}>
                          <SelectTrigger
                            id={`slot-day-${index}`}
                            className={`${inputClass(!!slotErrorGroup.day)} text-xs h-9`}
                          >
                            <SelectValue placeholder="요일" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((d) => (
                              <SelectItem key={d} value={d} className="text-xs">
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {slotErrorGroup.day && <p className="mt-0.5 text-xs text-red-500">{slotErrorGroup.day}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`slot-startTime-${index}`} className={`${labelClass} text-xs`}>
                          시작
                        </Label>
                        <Input
                          id={`slot-startTime-${index}`}
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(index, "startTime", e.target.value)}
                          className={`${inputClass(!!slotErrorGroup.startTime)} text-xs h-9`}
                        />
                        {slotErrorGroup.startTime && (
                          <p className="mt-0.5 text-xs text-red-500">{slotErrorGroup.startTime}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`slot-endTime-${index}`} className={`${labelClass} text-xs`}>
                          종료
                        </Label>
                        <Input
                          id={`slot-endTime-${index}`}
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(index, "endTime", e.target.value)}
                          className={`${inputClass(!!slotErrorGroup.endTime)} text-xs h-9`}
                        />
                        {slotErrorGroup.endTime && (
                          <p className="mt-0.5 text-xs text-red-500">{slotErrorGroup.endTime}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`slot-room-${index}`} className={`${labelClass} text-xs`}>
                          강의실
                        </Label>
                        <Input
                          id={`slot-room-${index}`}
                          type="text"
                          value={slot.room}
                          onChange={(e) => handleSlotChange(index, "room", e.target.value)}
                          placeholder="예: 공학관 101호"
                          className={`${inputClass(!!slotErrorGroup.room)} text-xs h-9`}
                        />
                        {slotErrorGroup.room && <p className="mt-0.5 text-xs text-red-500">{slotErrorGroup.room}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`slot-instructor-${index}`} className={`${labelClass} text-xs`}>
                          담당교수 (선택)
                        </Label>
                        <Input
                          id={`slot-instructor-${index}`}
                          type="text"
                          value={slot.instructor || ""}
                          onChange={(e) => handleSlotChange(index, "instructor", e.target.value)}
                          placeholder="기본 교수와 동일"
                          className={`${inputClass(false)} text-xs h-9`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              {initialData ? "과목 저장" : "과목 추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
