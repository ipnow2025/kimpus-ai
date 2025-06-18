// Zod 스키마 검증 (타입 안전성 강화)
import { z } from "zod"

// 공통 스키마
export const memberIdxSchema = z.number().int().positive()
export const unixTimestampSchema = z.number().int().positive()

// 과목 스키마
export const courseSchema = z.object({
  id: z.number().int().positive().optional(),
  memberIdx: memberIdxSchema,
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  instructor: z.string().max(100).optional(),
  credits: z.number().int().min(1).max(6).default(3),
  description: z.string().optional(),
})

export const createCourseSchema = courseSchema.omit({ id: true })
export const updateCourseSchema = courseSchema.partial().required({ id: true })

// 팀 스키마
export const teamSchema = z.object({
  id: z.string().min(1).max(50).optional(),
  creatorMemberIdx: memberIdxSchema,
  name: z.string().min(1).max(255),
  description: z.string().optional(),
})

export const createTeamSchema = teamSchema.omit({ id: true })
export const updateTeamSchema = teamSchema.partial().required({ id: true })

// 팀 멤버 스키마
export const teamMemberSchema = z.object({
  teamId: z.string().min(1).max(50),
  memberIdx: memberIdxSchema,
  memberName: z.string().min(1).max(100),
  memberAvatar: z.string().url().optional(),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  role: z.enum(["admin", "member"]).default("member"),
})

// 과제 스키마
export const assignmentSchema = z.object({
  id: z.number().int().positive().optional(),
  memberIdx: memberIdxSchema,
  title: z.string().min(1).max(255),
  courseId: z.number().int().positive().optional(),
  courseName: z.string().min(1).max(255),
  dueDate: z.date(),
  status: z.enum(["pending", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  description: z.string().optional(),
  submitLink: z.string().url().optional(),
  notes: z.string().optional(),
  isTeamAssignment: z.boolean().default(false),
  teamId: z.string().min(1).max(50).optional(),
})

export const createAssignmentSchema = assignmentSchema.omit({ id: true })
export const updateAssignmentSchema = assignmentSchema.partial().required({ id: true })

// 스케줄 스키마
export const scheduleSchema = z.object({
  id: z.number().int().positive().optional(),
  memberIdx: memberIdxSchema,
  courseId: z.number().int().positive().optional(),
  subject: z.string().min(1).max(255),
  dayOfWeek: z.enum(["월", "화", "수", "목", "금", "토", "일"]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  room: z.string().max(100).optional(),
  instructor: z.string().max(100).optional(),
})

export const createScheduleSchema = scheduleSchema.omit({ id: true })
export const updateScheduleSchema = scheduleSchema.partial().required({ id: true })

// 팀 태스크 스키마
export const teamTaskSchema = z.object({
  id: z.string().min(1).max(50).optional(),
  teamId: z.string().min(1).max(50),
  assignmentId: z.number().int().positive().optional(),
  text: z.string().min(1),
  completed: z.boolean().default(false),
  assignedTo: memberIdxSchema.optional(),
})

export const createTeamTaskSchema = teamTaskSchema.omit({ id: true })
export const updateTeamTaskSchema = teamTaskSchema.partial().required({ id: true })

// 팀 채팅 메시지 스키마
export const teamChatMessageSchema = z.object({
  id: z.string().min(1).max(50).optional(),
  teamId: z.string().min(1).max(50),
  memberIdx: memberIdxSchema,
  memberName: z.string().min(1).max(100),
  message: z.string().min(1),
})

export const createTeamChatMessageSchema = teamChatMessageSchema.omit({ id: true })

// API 요청 스키마
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const searchSchema = z.object({
  query: z.string().optional(),
  ...paginationSchema.shape,
})

// 타입 추출
export type Course = z.infer<typeof courseSchema>
export type CreateCourse = z.infer<typeof createCourseSchema>
export type UpdateCourse = z.infer<typeof updateCourseSchema>

export type Team = z.infer<typeof teamSchema>
export type CreateTeam = z.infer<typeof createTeamSchema>
export type UpdateTeam = z.infer<typeof updateTeamSchema>

export type TeamMember = z.infer<typeof teamMemberSchema>

export type Assignment = z.infer<typeof assignmentSchema>
export type CreateAssignment = z.infer<typeof createAssignmentSchema>
export type UpdateAssignment = z.infer<typeof updateAssignmentSchema>

export type Schedule = z.infer<typeof scheduleSchema>
export type CreateSchedule = z.infer<typeof createScheduleSchema>
export type UpdateSchedule = z.infer<typeof updateScheduleSchema>

export type TeamTask = z.infer<typeof teamTaskSchema>
export type CreateTeamTask = z.infer<typeof createTeamTaskSchema>
export type UpdateTeamTask = z.infer<typeof updateTeamTaskSchema>

export type TeamChatMessage = z.infer<typeof teamChatMessageSchema>
export type CreateTeamChatMessage = z.infer<typeof createTeamChatMessageSchema>

export type Pagination = z.infer<typeof paginationSchema>
export type SearchParams = z.infer<typeof searchSchema>
