// API 클라이언트 함수들
const API_BASE = "/api"

// 현재 사용자 ID (실제로는 인증에서 가져와야 함)
const CURRENT_USER_ID = "user_current_123"

// 공통 fetch 함수
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Course API
export const courseApi = {
  getAll: () => apiRequest<any[]>(`/courses?memberIdx=${CURRENT_USER_ID}`),

  create: (data: any) =>
    apiRequest<any>("/courses", {
      method: "POST",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  update: (id: number, data: any) =>
    apiRequest<any>(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/courses/${id}?memberIdx=${CURRENT_USER_ID}`, {
      method: "DELETE",
    }),
}

// Assignment API
export const assignmentApi = {
  getAll: (filter?: string) => {
    const params = new URLSearchParams({ memberIdx: CURRENT_USER_ID })
    if (filter && filter !== "all") params.append("filter", filter)
    return apiRequest<any[]>(`/assignments?${params}`)
  },

  create: (data: any) =>
    apiRequest<any>("/assignments", {
      method: "POST",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  update: (id: number, data: any) =>
    apiRequest<any>(`/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/assignments/${id}?memberIdx=${CURRENT_USER_ID}`, {
      method: "DELETE",
    }),

  toggleStatus: (id: number) =>
    apiRequest<any>(`/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        memberIdx: CURRENT_USER_ID,
        toggleStatus: true,
      }),
    }),
}

// Team API
export const teamApi = {
  getAll: () => apiRequest<any[]>(`/teams?memberIdx=${CURRENT_USER_ID}`),

  getById: (id: string) => apiRequest<any>(`/teams/${id}?memberIdx=${CURRENT_USER_ID}`),

  create: (data: any) =>
    apiRequest<any>("/teams", {
      method: "POST",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/teams/${id}?memberIdx=${CURRENT_USER_ID}`, {
      method: "DELETE",
    }),

  inviteMembers: (teamId: string, memberIds: string[]) =>
    apiRequest<any>(`/teams/${teamId}`, {
      method: "PUT",
      body: JSON.stringify({
        memberIdx: CURRENT_USER_ID,
        action: "invite",
        memberIds,
      }),
    }),

  acceptInvitation: (teamId: string) =>
    apiRequest<any>(`/teams/${teamId}`, {
      method: "PUT",
      body: JSON.stringify({
        memberIdx: CURRENT_USER_ID,
        action: "accept",
      }),
    }),

  rejectInvitation: (teamId: string) =>
    apiRequest<any>(`/teams/${teamId}`, {
      method: "PUT",
      body: JSON.stringify({
        memberIdx: CURRENT_USER_ID,
        action: "reject",
      }),
    }),
}

// Team Tasks API
export const teamTaskApi = {
  getAll: (teamId: string) => apiRequest<any[]>(`/teams/${teamId}/tasks?memberIdx=${CURRENT_USER_ID}`),

  create: (teamId: string, data: any) =>
    apiRequest<any>(`/teams/${teamId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  update: (teamId: string, taskId: string, data: any) =>
    apiRequest<any>(`/teams/${teamId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, memberIdx: CURRENT_USER_ID }),
    }),

  delete: (teamId: string, taskId: string) =>
    apiRequest<void>(`/teams/${teamId}/tasks/${taskId}?memberIdx=${CURRENT_USER_ID}`, {
      method: "DELETE",
    }),
}

// Team Chat API
export const teamChatApi = {
  getMessages: (teamId: string) => apiRequest<any[]>(`/teams/${teamId}/chat?memberIdx=${CURRENT_USER_ID}`),

  sendMessage: (teamId: string, message: string) =>
    apiRequest<any>(`/teams/${teamId}/chat`, {
      method: "POST",
      body: JSON.stringify({
        memberIdx: CURRENT_USER_ID,
        message,
      }),
    }),
}
