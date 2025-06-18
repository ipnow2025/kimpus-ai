"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Wand2, Edit3, BotMessageSquare } from "lucide-react" // Updated icons
import { AssignmentWriter } from "@/components/ai/AssignmentWriter"
import { QuestionAnswering } from "@/components/ai/QuestionAnswering"
import type { Course } from "@/lib/types"

interface AIAssistantViewProps {
  courses: Course[]
  isDarkMode: boolean
  isMobile: boolean
}

const AIAssistantView: React.FC<AIAssistantViewProps> = ({ courses, isDarkMode, isMobile }) => {
  const [aiResponse, setAiResponse] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("assignment")

  // 🚨 TODO: ChatGPT API 연결 - 이 함수가 핵심 연결 부분입니다
  const handleGenerate = async (prompt: string, type?: "assignment" | "question" | "chat") => {
    setIsAiLoading(true)
    setAiResponse("")

    try {
      // 🔧 실제 ChatGPT API 호출
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type: type || activeTab,
          context: {
            // 추가 컨텍스트 정보
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAiResponse(data.data.content)
      } else {
        setAiResponse(`오류가 발생했습니다: ${data.error}`)
      }
    } catch (error) {
      console.error("AI 생성 오류:", error)
      setAiResponse("AI 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsAiLoading(false)
    }
  }

  const cardClass = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
  const textClass = isDarkMode ? "text-white" : "text-gray-900"
  const mutedTextClass = isDarkMode ? "text-gray-400" : "text-gray-500"

  // Define base and active classes for tabs
  const tabBaseClass = "flex-1 data-[state=active]:shadow-md transition-colors duration-150 ease-in-out"
  const assignmentActiveClass = isDarkMode ? "data-[state=active]:text-green-400" : "data-[state=active]:text-green-600"
  const chatGptActiveClass = isDarkMode ? "data-[state=active]:text-sky-400" : "data-[state=active]:text-sky-500"

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1
          className={`${isMobile ? "text-xl" : "text-2xl"} font-bold ${textClass} mb-1 flex items-center justify-center`}
        >
          <Wand2 className={`mr-2 h-6 w-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
          AI 학습 도우미
        </h1>
        <p className={`text-sm ${mutedTextClass}`}>AI의 마법으로 과제 작성, 궁금증 해결까지 한 번에!</p>
      </div>

      <Tabs defaultValue="assignment" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={`grid w-full ${isMobile ? "grid-cols-2 h-auto p-1 text-xs" : "grid-cols-2"} ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}
        >
          <TabsTrigger
            value="assignment"
            className={`${tabBaseClass} ${assignmentActiveClass} data-[state=active]:bg-green-500/10 dark:data-[state=active]:bg-green-500/20`}
          >
            <Edit3 className={`mr-1 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} /> 과제 작성
          </TabsTrigger>
          <TabsTrigger
            value="question"
            className={`${tabBaseClass} ${chatGptActiveClass} data-[state=active]:bg-sky-500/10 dark:data-[state=active]:bg-sky-500/20`}
          >
            <BotMessageSquare className={`mr-1 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} /> ChatGPT (유료버전을 무료로 이용)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignment">
          <AssignmentWriter
            courses={courses}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onGenerate={(prompt) => handleGenerate(prompt, "assignment")}
            isLoading={isAiLoading && activeTab === "assignment"}
          />
        </TabsContent>
        <TabsContent value="question">
          <QuestionAnswering
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onGenerate={(prompt) => handleGenerate(prompt, "question")}
            isLoading={isAiLoading && activeTab === "question"}
          />
        </TabsContent>
      </Tabs>

      {(isAiLoading || aiResponse) && (
        <Card className={`${cardClass} mt-6`}>
          <CardHeader>
            <CardTitle className={`${textClass} flex items-center`}>
              {isAiLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "🤖"}
              AI 응답 {isAiLoading ? "생성 중..." : "(시뮬레이션)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAiLoading && !aiResponse && (
              <div className="flex flex-col items-center justify-center h-24">
                <p className={`${mutedTextClass} text-sm`}>AI가 열심히 생각하고 있어요...</p>
              </div>
            )}
            {aiResponse && (
              <pre
                className={`whitespace-pre-wrap text-sm p-4 rounded-md ${isDarkMode ? "bg-gray-700/50 text-gray-200" : "bg-gray-50 text-gray-700"} max-h-96 overflow-y-auto`}
              >
                {aiResponse}
              </pre>
            )}
          </CardContent>
          {!isAiLoading && aiResponse && (
            <CardFooter>
              <Button variant="outline" onClick={() => setAiResponse("")} className="w-full">
                응답 지우기
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  )
}

export default AIAssistantView
