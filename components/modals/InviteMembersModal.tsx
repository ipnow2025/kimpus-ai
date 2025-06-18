"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Team, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, UserPlus, Send, AlertCircle, Loader2 } from "lucide-react"

interface InviteMembersModalProps {
  isOpen: boolean
  onClose: () => void
  team: Team | null // Renamed from teamToInviteTo for clarity
  allUsers: User[]
  onSubmit: (teamId: string, selectedUserIds: string[]) => Promise<void> | void // This will now call inviteMembersToTeam
  isDarkMode: boolean
}

export default function InviteMembersModal({
  isOpen,
  onClose,
  team, // Renamed
  allUsers,
  onSubmit,
  isDarkMode,
}: InviteMembersModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedUserIds([])
      setError(null)
    }
  }, [isOpen, team])

  if (!isOpen || !team) return null

  const existingMemberIds = new Set(team.members.map((member) => member.id))
  const pendingMemberIds = new Set(team.pendingMemberIds)
  const usersAvailableToInvite = allUsers.filter(
    (user) => !existingMemberIds.has(user.id) && !pendingMemberIds.has(user.id),
  )

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUserIds.length === 0) {
      setError("초대할 사용자를 선택해주세요.")
      return
    }
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(team.id, selectedUserIds) // This now sends invitations
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "초대장 발송 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const labelClass = `block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl w-full max-w-md ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <div
          className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center space-x-2">
            <UserPlus className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              팀원 초대: {team.name}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label className={labelClass}>초대 가능한 사용자</Label>
            {usersAvailableToInvite.length > 0 ? (
              <ScrollArea className="h-60 border rounded-md p-2 bg-opacity-50 ${isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50/30'}">
                <div className="space-y-2">
                  {usersAvailableToInvite.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-1.5 rounded hover:bg-gray-500/10">
                      <Checkbox
                        id={`invite-user-${user.id}`}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                        disabled={isSubmitting}
                        className={
                          isDarkMode
                            ? "border-gray-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            : ""
                        }
                      />
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                      <Label htmlFor={`invite-user-${user.id}`} className={`${labelClass} font-normal cursor-pointer`}>
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                더 이상 초대할 수 있는 사용자가 없습니다.
              </p>
            )}
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
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting || selectedUserIds.length === 0 || usersAvailableToInvite.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 초대장 발송 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> 초대장 발송
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
