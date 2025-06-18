"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { teamChatApi } from "@/lib/api-client"

const TEAM_CHAT_QUERY_KEY = ["team-chat"]

export function useTeamChatQuery(teamId: string) {
  const queryClient = useQueryClient()

  // 채팅 메시지 조회
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...TEAM_CHAT_QUERY_KEY, teamId],
    queryFn: () => teamChatApi.getMessages(teamId),
    enabled: !!teamId,
    refetchInterval: 3000, // 3초마다 새 메시지 확인
  })

  // 메시지 전송
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => teamChatApi.sendMessage(teamId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TEAM_CHAT_QUERY_KEY, teamId] })
    },
  })

  return {
    // 데이터
    messages,

    // 로딩 상태
    isLoading,
    error,

    // 액션
    sendMessage: (message: string) => sendMessageMutation.mutateAsync(message),
    refetch,

    // 뮤테이션 상태
    isSending: sendMessageMutation.isPending,
  }
}
