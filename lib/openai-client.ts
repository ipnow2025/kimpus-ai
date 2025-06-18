// 🚨 TODO: ChatGPT API 연결 필수 구현 부분
// 개발자는 이 파일을 실제 OpenAI API와 연결해야 합니다.

import OpenAI from "openai"

// 환경변수 설정 필요: OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 🔑 API 키 설정 필요
})

export interface ChatGPTRequest {
  prompt: string
  type: "assignment" | "question" | "chat"
  context?: {
    courseName?: string
    assignmentTitle?: string
    teamName?: string
  }
}

export interface ChatGPTResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 🚨 핵심 구현 부분: 실제 ChatGPT API 호출
export async function callChatGPT(request: ChatGPTRequest): Promise<ChatGPTResponse> {
  try {
    // 🔧 TODO: 실제 OpenAI API 호출로 교체 필요
    // 현재는 시뮬레이션 응답
    console.log("🤖 ChatGPT API 호출 시뮬레이션:", request)

    // 실제 구현 예시:
    /*
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // 또는 "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content: getSystemPrompt(request.type)
        },
        {
          role: "user", 
          content: request.prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage
    }
    */

    // 🚨 임시 시뮬레이션 응답 (실제 구현 시 제거)
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    return {
      content: `🤖 ChatGPT 시뮬레이션 응답\n\n요청 내용: ${request.prompt}\n\n실제 구현 시 이 부분이 ChatGPT의 실제 응답으로 교체됩니다.`,
    }
  } catch (error) {
    console.error("ChatGPT API 호출 오류:", error)
    throw new Error("AI 응답 생성 중 오류가 발생했습니다.")
  }
}

// 🔧 TODO: 각 타입별 시스템 프롬프트 최적화 필요
function getSystemPrompt(type: ChatGPTRequest["type"]): string {
  switch (type) {
    case "assignment":
      return `당신은 대학생들의 과제 작성을 도와주는 전문 AI 어시스턴트입니다. 
              학술적이고 체계적인 과제를 작성해주세요. 
              표절 없이 창의적이고 논리적인 내용을 제공해주세요.`

    case "question":
      return `당신은 학습을 도와주는 친근한 AI 튜터입니다. 
              학생의 질문에 대해 이해하기 쉽고 자세한 설명을 제공해주세요.
              예시와 함께 단계별로 설명해주세요.`

    case "chat":
      return `당신은 팀 프로젝트를 도와주는 AI 어시스턴트입니다.
              팀원들의 협업과 학습을 지원해주세요.`

    default:
      return `당신은 도움이 되는 AI 어시스턴트입니다.`
  }
}
