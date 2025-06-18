// PRD 요구사항에 따른 커스텀 유틸 함수 (lib/utils.ts 수정 금지)

/**
 * UNIX 타임스탬프를 Date 객체로 변환
 */
export function unixToDate(unixTimestamp: number): Date {
  return new Date(unixTimestamp * 1000)
}

/**
 * Date 객체를 UNIX 타임스탬프로 변환
 */
export function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

/**
 * 현재 시간을 UNIX 타임스탬프로 반환
 */
export function getCurrentUnixTime(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Soft Delete 처리를 위한 유틸 함수
 */
export function markAsDeleted() {
  return {
    delDate: getCurrentUnixTime(),
    isFlag: 1,
  }
}

/**
 * 활성 상태 필터 (Soft Delete 제외)
 */
export function getActiveFilter() {
  return {
    isFlag: 0,
    delDate: null,
  }
}

/**
 * 고유 ID 생성 함수
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 날짜 포맷팅 함수
 */
export function formatDate(
  date: Date | string | number,
  format: "YYYY-MM-DD" | "YYYY-MM-DD HH:mm" = "YYYY-MM-DD",
): string {
  let dateObj: Date

  if (typeof date === "number") {
    dateObj = unixToDate(date)
  } else if (typeof date === "string") {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, "0")
  const day = String(dateObj.getDate()).padStart(2, "0")

  if (format === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`
  } else {
    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

/**
 * 에러 처리 유틸 함수
 */
export function handleError(error: unknown, context = "Unknown"): string {
  console.error(`[${context}] Error:`, error)

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "알 수 없는 오류가 발생했습니다."
}

/**
 * API 응답 표준화 함수
 */
export function createApiResponse<T>(success: boolean, data?: T, message?: string, error?: string) {
  return {
    success,
    data: data || null,
    message: message || "",
    error: error || null,
    timestamp: getCurrentUnixTime(),
  }
}

/**
 * 페이지네이션 유틸 함수
 */
export function calculatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  return {
    page,
    limit,
    total,
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * 검색 쿼리 정규화 함수
 */
export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * 우선순위 정렬 함수
 */
export function sortByPriority<T extends { priority: "low" | "medium" | "high" }>(items: T[]): T[] {
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  return items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
}

/**
 * 마감일까지 남은 일수 계산
 */
export function getDaysUntilDue(dueDate: Date | string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24))
}

/**
 * 상태별 색상 클래스 반환
 */
export function getStatusColor(status: "pending" | "completed", isDark = false): string {
  const colors = {
    pending: isDark ? "text-yellow-400" : "text-yellow-600",
    completed: isDark ? "text-green-400" : "text-green-600",
  }
  return colors[status]
}

/**
 * 우선순위별 색상 클래스 반환
 */
export function getPriorityColor(priority: "low" | "medium" | "high", isDark = false): string {
  const colors = {
    low: isDark ? "text-green-400" : "text-green-600",
    medium: isDark ? "text-yellow-400" : "text-yellow-600",
    high: isDark ? "text-red-400" : "text-red-600",
  }
  return colors[priority]
}
