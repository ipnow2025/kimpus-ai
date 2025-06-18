"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, HelpCircle } from "lucide-react"
import { QUESTION_TYPES } from "@/lib/ai-constants"

interface QuestionAnsweringProps {
  isDarkMode: boolean
  isMobile: boolean
  onGenerate: (prompt: string) => void
  isLoading: boolean
}

export const QuestionAnswering: React.FC<QuestionAnsweringProps> = ({
  isDarkMode,
  isMobile,
  onGenerate,
  isLoading,
}) => {
  const [questionType, setQuestionType] = useState("")
  const [questionText, setQuestionText] = useState("")

  const handleSubmit = () => {
    let prompt = `질의응답을 요청합니다.\n`
    prompt += `- 질문 유형: ${QUESTION_TYPES.find((qt) => qt.value === questionType)?.label || questionType || "미지정"}\n`
    prompt += `- 질문 내용: ${questionText}\n`
    onGenerate(prompt)
  }

  const inputClass = isDarkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
  const labelClass = isDarkMode ? "text-gray-300" : "text-gray-700"
  const selectTriggerClass = `${inputClass} text-left`

  return (
    <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <CardHeader>
        <CardTitle className={`flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          <HelpCircle className={`mr-2 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
          AI 질의응답
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="aiQuestionType" className={labelClass}>
            질문 유형
          </Label>
          <Select value={questionType} onValueChange={setQuestionType}>
            <SelectTrigger id="aiQuestionType" className={selectTriggerClass}>
              <SelectValue placeholder="질문 유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((qType) => (
                <SelectItem key={qType.value} value={qType.value}>
                  {qType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="aiQuestionText" className={labelClass}>
            질문 내용
          </Label>
          <Textarea
            id="aiQuestionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="궁금한 내용을 자세히 입력해주세요..."
            rows={isMobile ? 4 : 6}
            className={inputClass}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading || !questionText.trim()} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
          AI 답변 요청
        </Button>
      </CardFooter>
    </Card>
  )
}
