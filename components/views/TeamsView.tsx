"use client"

import type React from "react"
import type { Team, Assignment, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Briefcase, ExternalLink, CheckCircle, XCircle, MailQuestion } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TeamsViewProps {
  teams: Team[]
  assignments: Assignment[]
  currentUser: User // To check if current user has pending invitations
  allUsers: User[] // To get user details for pending members
  onCreateTeam: () => void
  onNavigateToTeamWorkspace: (teamId: string, assignmentId?: number) => void
  onInviteMembers: (team: Team) => void
  onAcceptInvitation: (teamId: string, userId: string) => void
  onRejectInvitation: (teamId: string, userId: string) => void
  isDarkMode: boolean
  isMobile: boolean
}

const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  assignments,
  currentUser,
  allUsers,
  onCreateTeam,
  onNavigateToTeamWorkspace,
  onInviteMembers,
  onAcceptInvitation,
  onRejectInvitation,
  isDarkMode,
  isMobile,
}) => {
  const getAssignmentsForTeam = (teamId: string): Assignment[] => {
    return assignments.filter((assignment) => assignment.isTeamAssignment && assignment.teamId === teamId)
  }

  const getUserById = (userId: string): User | undefined => {
    return allUsers.find((u) => u.id === userId)
  }

  const cardClass = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  const textClass = isDarkMode ? "text-white" : "text-gray-900"
  const mutedTextClass = isDarkMode ? "text-gray-400" : "text-gray-500"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold ${textClass} flex items-center`}>
            <Users className={`mr-2 h-6 w-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />팀 관리
          </h1>
          <p className={`text-sm ${mutedTextClass}`}>팀을 생성하고 관리하며, 팀 과제 진행 상황을 확인하세요.</p>
        </div>
        <Button onClick={onCreateTeam} className={`${isMobile ? "w-full" : ""} bg-purple-600 hover:bg-purple-700`}>
          <UserPlus className="mr-2 h-4 w-4" /> 새 팀 만들기
        </Button>
      </div>

      {teams.length === 0 && (
        <div className="text-center py-16">
          <Users className={`w-16 h-16 mx-auto mb-6 ${mutedTextClass}`} />
          <h3 className={`text-xl font-semibold ${textClass} mb-2`}>아직 생성된 팀이 없습니다.</h3>
          <p className={`${mutedTextClass} mb-4`}>첫 번째 팀을 만들어 협업을 시작해보세요!</p>
          <Button onClick={onCreateTeam} size="lg" className="bg-purple-600 hover:bg-purple-700">
            <UserPlus className="mr-2 h-5 w-5" /> 팀 만들기
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const teamAssignments = getAssignmentsForTeam(team.id)
          return (
            <Card key={team.id} className={`${cardClass} flex flex-col`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className={`${textClass} text-lg flex items-center`}>
                    <Users className="w-5 h-5 mr-2 text-purple-500" />
                    {team.name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onInviteMembers(team)}
                      className="text-green-500 hover:text-green-600"
                      aria-label="팀원 초대"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div>
                  <h4 className={`text-sm font-medium ${mutedTextClass} mb-1`}>팀원 ({team.members.length}명)</h4>
                  <div className="flex flex-wrap gap-1">
                    {team.members.slice(0, 5).map((member) => (
                      <Avatar
                        key={member.id}
                        className={`w-7 h-7 border-2 ${isDarkMode ? "border-gray-700" : "border-white"}`}
                      >
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="text-xs">{member.name.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{team.members.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>

                {team.pendingMemberIds.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-medium ${mutedTextClass} mb-1 flex items-center`}>
                      <MailQuestion className="w-4 h-4 mr-1.5 text-yellow-500" />
                      초대 대기중 ({team.pendingMemberIds.length}명)
                    </h4>
                    <div className="space-y-1 text-xs">
                      {team.pendingMemberIds.map((pendingId) => {
                        const pendingUser = getUserById(pendingId)
                        return (
                          <div
                            key={pendingId}
                            className={`flex items-center justify-between p-1.5 rounded ${isDarkMode ? "bg-gray-700/50" : "bg-gray-100/70"}`}
                          >
                            <div className="flex items-center space-x-1.5">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={pendingUser?.avatar || "/placeholder.svg"} alt={pendingUser?.name} />
                                <AvatarFallback className="text-[10px]">
                                  {pendingUser?.name.substring(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className={`${textClass}`}>{pendingUser?.name || "알 수 없는 사용자"}</span>
                            </div>
                            {pendingId === currentUser.id && ( // Simulate only current user can accept/reject their own invite
                              <div className="flex space-x-1">
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="p-1 h-auto text-green-500 hover:text-green-600"
                                  onClick={() => onAcceptInvitation(team.id, pendingId)}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="p-1 h-auto text-red-500 hover:text-red-600"
                                  onClick={() => onRejectInvitation(team.id, pendingId)}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className={`text-sm font-medium ${mutedTextClass} mb-1`}>
                    진행중인 팀 과제 ({teamAssignments.length}개)
                  </h4>
                  {teamAssignments.length > 0 ? (
                    <ul className="space-y-1 text-xs">
                      {teamAssignments.slice(0, 3).map((assignment) => (
                        <li
                          key={assignment.id}
                          className={`flex items-center justify-between p-1.5 rounded ${isDarkMode ? "bg-gray-700/50" : "bg-gray-100/70"}`}
                        >
                          <span className={`${textClass} truncate`}>{assignment.title}</span>
                          <Button
                            variant="link"
                            size="xs"
                            className="p-0 h-auto text-purple-500 hover:text-purple-600"
                            onClick={() => onNavigateToTeamWorkspace(team.id, assignment.id)}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </li>
                      ))}
                      {teamAssignments.length > 3 && (
                        <li className={`text-xs ${mutedTextClass}`}>...외 {teamAssignments.length - 3}개</li>
                      )}
                    </ul>
                  ) : (
                    <p className={`text-xs ${mutedTextClass}`}>진행중인 팀 과제가 없습니다.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onNavigateToTeamWorkspace(team.id, teamAssignments[0]?.id)}
                >
                  <Briefcase className="mr-2 h-4 w-4" /> 팀 작업 공간 보기
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default TeamsView
