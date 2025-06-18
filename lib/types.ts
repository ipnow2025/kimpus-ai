// User placeholder - in a real app, this would be more detailed
export interface User {
  id: string
  name: string
  avatar?: string // URL to avatar image
}

export interface Team {
  id: string
  name: string
  members: User[]
  pendingMemberIds: string[] // IDs of users invited but not yet accepted
  assignmentIds: number[] // IDs of assignments this team is working on
}

export interface Assignment {
  id: number
  title: string
  course: string
  dueDate: string
  status: "pending" | "completed"
  priority: "low" | "medium" | "high"
  description: string
  attachments: string[]
  submitLink: string
  notes?: string
  isTeamAssignment?: boolean
  teamId?: string // Link to the Team's ID
}

export interface ScheduleSlot {
  day: string
  startTime: string
  endTime: string
  room: string
  instructor?: string
}

export interface ScheduleItem {
  id: number
  day: string
  time: string
  subject: string
  room: string
  instructor?: string
  courseId?: number
}

export interface Course {
  id: number
  name: string
  code: string
  instructor: string
  credits: number
  defaultScheduleSlots?: ScheduleSlot[]
}

export interface AssignmentFormData {
  title: string
  course: string
  dueDate: string
  priority: "low" | "medium" | "high"
  description: string
  submitLink: string
  notes: string
  isTeamAssignment?: boolean
  teamId?: string // Selected team ID
  newTeamName?: string // For creating a new team during assignment creation
}

export interface TeamFormData {
  name: string
  memberNames: string[] // For simplicity, just names for now
}

export interface ScheduleFormData {
  day: string
  startTime: string
  endTime: string
  subject: string
  room: string
  instructor: string
  courseId?: number
}

export interface CourseFormData {
  name: string
  code: string
  instructor: string
  credits: number
  defaultScheduleSlots?: Array<Omit<ScheduleSlot, "instructor"> & { instructor?: string }>
}

export interface AssignmentStatistics {
  totalAssignments: number
  completedAssignments: number
  pendingAssignments: number
  completionRate: number
}

// For Team Workspace
export interface TeamTask {
  id: string
  text: string
  completed: boolean
  assignedTo?: string // User ID
}

export interface TeamChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
}
