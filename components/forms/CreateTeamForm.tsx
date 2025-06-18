"use client"

import type React from "react"
import { useState } from "react"
import type { TeamFormData, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Users, UserPlus, AlertCircle, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreateTeamFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TeamFormData) => Promise<any> // Returns promise to handle async
  isDarkMode: boolean
  mockUsers: User[] // For member selection
}

export default function CreateTeamForm({ isOpen, onClose, onSubmit, isDarkMode, mockUsers }: CreateTeamFormProps) {
  const [teamName, setTeamName] = useState("")
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMemberToggle = (userId: string) => {
    setSelectedMemberIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      setError("팀 이름을 입력해주세요.")
      return
    }
    if (selectedMemberIds.length === 0) {
      setError("최소 한 명 이상의 팀원을 선택해주세요.")
      return
    }
    setError(null)
    setIsSubmitting(true)

    const selectedMembers = mockUsers.filter((user) => selectedMemberIds.includes(user.id))

    try {
      await onSubmit({ name: teamName, memberNames: selectedMembers.map((m) => m.name) }) // Pass names for simplicity
      setTeamName("")
      setSelectedMemberIds([])
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "팀 생성에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const baseInputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2`
  const darkModeInputClass = `bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500`
  const lightModeInputClass = `bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500`
  const inputClass = isDarkMode ? darkModeInputClass : lightModeInputClass
  const labelClass = `block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl w-full max-w-md ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <div
          className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center space-x-2">
            <Users className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>새 팀 만들기</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="teamName" className={labelClass}>
              팀 이름 *
            </Label>
            <Input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: 캡스톤 디자인 A팀"
              className={`${baseInputClass} ${inputClass}`}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label className={labelClass}>팀원 선택 *</Label>
            <ScrollArea className="h-40 border rounded-md p-2 bg-opacity-50 ${isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50/30'}">
              <div className="space-y-2">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${user.id}`}
                      checked={selectedMemberIds.includes(user.id)}
                      onCheckedChange={() => handleMemberToggle(user.id)}
                      disabled={isSubmitting}
                      className={
                        isDarkMode
                          ? "border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          : ""
                      }
                    />
                    <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-6 h-6 rounded-full" />
                    <Label htmlFor={`member-${user.id}`} className={`${labelClass} font-normal cursor-pointer`}>
                      {user.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {error && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 생성 중...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> 팀 생성
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
