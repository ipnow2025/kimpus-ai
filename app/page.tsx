"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  Bell,
  Moon,
  Sun,
  FileText,
  Home,
  BookOpen,
  TrendingUp,
  Settings,
  Brain,
  Sparkles,
  Menu,
  UsersIcon,
  DoorClosedIcon as CloseIcon,
} from "lucide-react"

import type { Assignment, Course, Team, TeamFormData, User } from "@/lib/types"
import { useAssignments } from "@/hooks/use-assignments"
import { useCourses } from "@/hooks/use-courses"
import { useSchedule } from "@/hooks/use-schedule"
import { useTeams } from "@/hooks/use-teams"

import AddAssignmentForm, { type AssignmentFormData } from "@/components/forms/AddAssignmentForm"
import AddScheduleForm from "@/components/forms/AddScheduleForm"
import AddCourseForm from "@/components/forms/AddCourseForm"
import CreateTeamForm from "@/components/forms/CreateTeamForm"
import AssignmentDetailModal from "@/components/modals/AssignmentDetailModal"
import InviteMembersModal from "@/components/modals/InviteMembersModal"

import DashboardView from "@/components/views/DashboardView"
import AssignmentsView from "@/components/views/AssignmentsView"
import ScheduleView from "@/components/views/ScheduleView"
import StatisticsView from "@/components/views/StatisticsView"
import CoursesView from "@/components/views/CoursesView"
import AIAssistantView from "@/components/views/AIAssistantView"
import TeamsView from "@/components/views/TeamsView"
import TeamWorkspaceView from "@/components/views/TeamWorkspaceView"

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
              <p className="text-gray-600 mb-4">페이지를 새로고침해주세요.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                새로고침
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

const MOCK_CURRENT_USER: User = {
  id: "user_current_123",
  name: "현재사용자",
  avatar: "/placeholder.svg?width=32&height=32",
}

export default function StudyFlowPage() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const {
    assignments,
    addAssignment: addAssignmentHook,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
    filteredAssignments,
    assignmentFilter,
    setAssignmentFilter,
    assignmentSearchTerm,
    setAssignmentSearchTerm,
    assignmentStatistics,
  } = useAssignments()

  const {
    courses,
    addCourse: addCourseHook,
    updateCourse,
    deleteCourse: deleteCourseHook,
    filteredCourses,
    courseFilter,
    setCourseFilter,
    courseSearchTerm,
    setCourseSearchTerm,
  } = useCourses()

  const { schedule, addScheduleItem, deleteScheduleItem } = useSchedule()
  const teamsHook = useTeams()

  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState<Assignment | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false)
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false)
  const [showAddCourseForm, setShowAddCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false)
  const [showInviteMembersModal, setShowInviteMembersModal] = useState(false)
  const [teamForInvitation, setTeamForInvitation] = useState<Team | null>(null)

  const [activeTeamWorkspace, setActiveTeamWorkspace] = useState<{
    team: Team | null
    assignment?: Assignment | null
  } | null>(null)

  const [statisticsDateRange, setStatisticsDateRange] = useState("week")
  const [statisticsViewType, setStatisticsViewType] = useState("overview")

  const handleError = useCallback((err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
    console.error(`Error in ${context}:`, err)
    setClientError(`${context}: ${errorMessage}`)
    setTimeout(() => setClientError(null), 5000)
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const handleAssignmentFormSubmit = async (formData: AssignmentFormData, existingId?: number) => {
    const assignmentData = { ...formData, teamId: formData.isTeamAssignment ? formData.teamId : undefined }
    let newOrUpdatedAssignment: Assignment | undefined
    if (existingId) {
      newOrUpdatedAssignment = updateAssignment(existingId, assignmentData)
    } else {
      newOrUpdatedAssignment = addAssignmentHook(assignmentData)
    }
    if (newOrUpdatedAssignment?.isTeamAssignment && newOrUpdatedAssignment.teamId) {
      teamsHook.addAssignmentToTeam(newOrUpdatedAssignment.teamId, newOrUpdatedAssignment.id)
    }
    setShowAddAssignmentForm(false)
    setEditingAssignment(null)
  }

  const handleCourseFormSubmit = (courseData: Omit<Course, "id">, existingId?: number) => {
    if (existingId) {
      updateCourse({ ...courseData, id: existingId })
    } else {
      addCourseHook(courseData)
    }
    setShowAddCourseForm(false)
    setEditingCourse(null)
  }

  const handleCreateTeamSubmit = async (teamData: TeamFormData) => {
    try {
      await teamsHook.addTeam(teamData)
      setShowCreateTeamForm(false)
    } catch (error) {
      handleError(error, "Creating team")
    }
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setSelectedAssignmentDetail(null)
    setShowAddAssignmentForm(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowAddCourseForm(true)
  }

  const handleOpenTeamWorkspace = (assignment: Assignment) => {
    if (assignment.isTeamAssignment && assignment.teamId) {
      const team = teamsHook.getTeamById(assignment.teamId)
      if (team) {
        setActiveTeamWorkspace({ team, assignment })
        setCurrentView("team-workspace")
      } else {
        handleError(new Error(`Team with ID ${assignment.teamId} not found.`), "Opening Team Workspace")
      }
    }
  }

  const handleNavigateToTeamWorkspaceFromTeamsView = (teamId: string, assignmentId?: number) => {
    const team = teamsHook.getTeamById(teamId)
    if (team) {
      const assignment = assignmentId
        ? assignments.find((a) => a.id === assignmentId && a.teamId === teamId)
        : undefined
      setActiveTeamWorkspace({ team, assignment: assignment || null })
      setCurrentView("team-workspace")
    } else {
      handleError(new Error(`Team with ID ${teamId} not found.`), "Navigating to Team Workspace")
    }
  }

  const handleOpenInviteMembersModal = (team: Team) => {
    setTeamForInvitation(team)
    setShowInviteMembersModal(true)
  }

  const handleCloseInviteMembersModal = () => {
    setShowInviteMembersModal(false)
    setTeamForInvitation(null)
  }

  const handleInviteMembersSubmit = (teamId: string, selectedUserIds: string[]) => {
    try {
      teamsHook.inviteMembersToTeam(teamId, selectedUserIds) // Changed from addMembersToTeam
      handleCloseInviteMembersModal()
    } catch (error) {
      handleError(error, "Inviting members")
    }
  }

  const handleAcceptInvitation = (teamId: string, userId: string) => {
    teamsHook.acceptTeamInvitation(teamId, userId)
  }
  const handleRejectInvitation = (teamId: string, userId: string) => {
    teamsHook.rejectTeamInvitation(teamId, userId)
  }

  const ErrorAlert = useMemo(() => {
    if (!clientError) return null
    return (
      <div className="fixed top-4 right-4 z-[100] bg-red-500 text-white px-4 py-2 rounded-md shadow-lg max-w-md">
        <div className="flex items-start space-x-2">
          <span>⚠️</span>
          <div className="flex-1">
            <div className="text-sm font-medium">오류 발생</div>
            <div className="text-xs mt-1">{clientError}</div>
          </div>
          <button onClick={() => setClientError(null)} className="ml-2 text-white hover:text-gray-200">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }, [clientError])

  const navItems = [
    { id: "dashboard", label: "대시보드", icon: Home },
    { id: "assignments", label: "과제관리", icon: FileText },
    { id: "schedule", label: "시간표", icon: BookOpen },
    { id: "teams", label: "팀 관리", icon: UsersIcon },
    { id: "statistics", label: "통계", icon: TrendingUp },
    { id: "ai-assistant", label: "AI 도우미", icon: Sparkles },
    { id: "courses", label: "과목관리", icon: Settings },
  ]

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            assignments={filteredAssignments}
            statistics={
              assignmentStatistics || {
                totalAssignments: 0,
                completedAssignments: 0,
                pendingAssignments: 0,
                completionRate: 0,
              }
            }
            isMobile={isMobile}
            isDarkMode={isDarkMode}
            onViewAssignmentDetails={setSelectedAssignmentDetail}
            onNavigate={setCurrentView}
          />
        )
      case "assignments":
        return (
          <AssignmentsView
            assignments={filteredAssignments}
            onAdd={() => {
              setEditingAssignment(null)
              setShowAddAssignmentForm(true)
            }}
            onViewDetails={setSelectedAssignmentDetail}
            onEdit={handleEditAssignment}
            onDelete={deleteAssignment}
            onToggleStatus={toggleAssignmentStatus}
            filter={assignmentFilter}
            setFilter={setAssignmentFilter}
            searchTerm={assignmentSearchTerm}
            setSearchTerm={setAssignmentSearchTerm}
            isMobile={isMobile}
            isDarkMode={isDarkMode}
            onOpenTeamWorkspace={handleOpenTeamWorkspace}
          />
        )
      case "schedule":
        return (
          <ScheduleView
            schedule={schedule}
            onAdd={() => setShowAddScheduleForm(true)}
            onDelete={deleteScheduleItem}
            isMobile={isMobile}
            isDarkMode={isDarkMode}
          />
        )
      case "teams":
        return (
          <TeamsView
            teams={teamsHook.teams}
            assignments={assignments}
            currentUser={MOCK_CURRENT_USER}
            allUsers={teamsHook.mockUsers}
            onCreateTeam={() => setShowCreateTeamForm(true)}
            onNavigateToTeamWorkspace={handleNavigateToTeamWorkspaceFromTeamsView}
            onInviteMembers={handleOpenInviteMembersModal}
            onAcceptInvitation={handleAcceptInvitation}
            onRejectInvitation={handleRejectInvitation}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
          />
        )
      case "team-workspace":
        return activeTeamWorkspace && activeTeamWorkspace.team ? (
          <TeamWorkspaceView
            team={activeTeamWorkspace.team}
            assignment={activeTeamWorkspace.assignment || null}
            currentUser={MOCK_CURRENT_USER}
            allUsers={teamsHook.mockUsers}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onBack={() => {
              setActiveTeamWorkspace(null)
              setCurrentView("teams")
            }}
            onInviteMembers={handleOpenInviteMembersModal}
            onAcceptInvitation={handleAcceptInvitation}
            onRejectInvitation={handleRejectInvitation}
          />
        ) : (
          <div>팀 정보를 불러오는 중...</div>
        )
      case "statistics":
        return (
          <StatisticsView
            assignments={assignments}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            dateRange={statisticsDateRange}
            setDateRange={setStatisticsDateRange}
            view={statisticsViewType}
            setView={setStatisticsViewType}
          />
        )
      case "courses":
        return (
          <CoursesView
            courses={filteredCourses}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onAddCourse={() => {
              setEditingCourse(null)
              setShowAddCourseForm(true)
            }}
            onEditCourse={handleEditCourse}
            onDeleteCourse={deleteCourseHook}
            filter={courseFilter}
            setFilter={setCourseFilter}
            searchTerm={courseSearchTerm}
            setSearchTerm={setCourseSearchTerm}
          />
        )
      case "ai-assistant":
        return <AIAssistantView courses={courses} isDarkMode={isDarkMode} isMobile={isMobile} />
      default:
        return <div className="text-center p-8">잘못된 뷰입니다.</div>
    }
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${isDarkMode ? "dark" : ""}`}>
      <ErrorBoundary>
        {ErrorAlert}
        <nav className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">김조교 (StudyFlow)</span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setCurrentView(id)
                      setActiveTeamWorkspace(null)
                    }}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                  aria-label={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className="p-2 rounded-md hover:bg-muted transition-colors hidden md:block" aria-label="알림">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    aria-label="메뉴 열기/닫기"
                  >
                    {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {isMobileMenuOpen && isMobile && (
            <div className="md:hidden border-t">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setCurrentView(id)
                      setIsMobileMenuOpen(false)
                      setActiveTeamWorkspace(null)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${currentView === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {label}
                  </button>
                ))}
                <button
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="알림"
                >
                  <Bell className="w-5 h-5 mr-3" />
                  알림
                </button>
              </div>
            </div>
          )}
        </nav>

        {isMobile && !isMobileMenuOpen && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <div className="grid grid-cols-7 gap-px">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentView(id)
                    setActiveTeamWorkspace(null)
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${currentView === id ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"}`}
                >
                  <Icon className={`w-5 h-5 ${currentView === id ? "animate-pulse" : ""}`} />
                  <span className={`text-[10px] mt-1 font-medium ${currentView === id ? "font-bold" : ""}`}>
                    {label.includes("관리")
                      ? label.replace("관리", "")
                      : label.includes("도우미")
                        ? "AI"
                        : label.length > 3
                          ? label.substring(0, 2)
                          : label}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        )}

        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isMobile ? "pb-20" : "pb-6"}`}>
          {renderView()}
        </main>

        <AddAssignmentForm
          isOpen={showAddAssignmentForm}
          onClose={() => {
            setShowAddAssignmentForm(false)
            setEditingAssignment(null)
          }}
          onSubmit={handleAssignmentFormSubmit}
          courses={courses}
          teams={teamsHook.teams}
          onCreateNewTeam={() => setShowCreateTeamForm(true)}
          isDarkMode={isDarkMode}
          initialAssignment={editingAssignment}
        />
        <AddScheduleForm
          isOpen={showAddScheduleForm}
          onClose={() => setShowAddScheduleForm(false)}
          onSubmit={(data) => addScheduleItem(data)}
          courses={courses}
          isDarkMode={isDarkMode}
        />
        <AddCourseForm
          isOpen={showAddCourseForm}
          onClose={() => {
            setShowAddCourseForm(false)
            setEditingCourse(null)
          }}
          onSubmit={(data, id) => handleCourseFormSubmit(data, id)}
          isDarkMode={isDarkMode}
          initialData={editingCourse}
        />
        <CreateTeamForm
          isOpen={showCreateTeamForm}
          onClose={() => setShowCreateTeamForm(false)}
          onSubmit={handleCreateTeamSubmit}
          isDarkMode={isDarkMode}
          mockUsers={teamsHook.mockUsers}
        />
        <AssignmentDetailModal
          assignment={selectedAssignmentDetail}
          team={selectedAssignmentDetail?.teamId ? teamsHook.getTeamById(selectedAssignmentDetail.teamId) : undefined}
          isOpen={!!selectedAssignmentDetail}
          onClose={() => setSelectedAssignmentDetail(null)}
          onEdit={handleEditAssignment}
          onDelete={deleteAssignment}
          onToggleStatus={toggleAssignmentStatus}
          onOpenTeamWorkspace={handleOpenTeamWorkspace}
          isDarkMode={isDarkMode}
        />
        {teamForInvitation && ( // Ensure teamForInvitation is not null before rendering
          <InviteMembersModal
            isOpen={showInviteMembersModal}
            onClose={handleCloseInviteMembersModal}
            onSubmit={handleInviteMembersSubmit}
            team={teamForInvitation}
            allUsers={teamsHook.mockUsers}
            isDarkMode={isDarkMode}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
