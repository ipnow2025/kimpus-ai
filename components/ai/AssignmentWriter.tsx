"use client"
import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea" // Assuming Textarea is needed for detailed requests
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, FileText } from "lucide-react"
import type { Course } from "@/lib/types"
import { ASSIGNMENT_FORMATS, WRITING_STYLES, TOC_OPTIONS_BY_FORMAT } from "@/lib/ai-constants"

interface AssignmentWriterProps {
  courses: Course[]
  isDarkMode: boolean
  isMobile: boolean
  onGenerate: (prompt: string) => void
  isLoading: boolean
}

export const AssignmentWriter: React.FC<AssignmentWriterProps> = ({
  courses,
  isDarkMode,
  isMobile,
  onGenerate,
  isLoading,
}) => {
  const [courseName, setCourseName] = useState("")
  const [assignmentTitle, setAssignmentTitle] = useState("")
  const [assignmentFormat, setAssignmentFormat] = useState<string>(ASSIGNMENT_FORMATS[0].value)
  const [assignmentLength, setAssignmentLength] = useState("")
  const [writingStyle, setWritingStyle] = useState<string>(WRITING_STYLES[0].value)
  const [includeToc, setIncludeToc] = useState<string>("include") // "include" or "exclude"
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [additionalRequests, setAdditionalRequests] = useState("")

  const currentTocOptions = useMemo(() => {
    const selectedFormat = ASSIGNMENT_FORMATS.find((f) => f.value === assignmentFormat)
    return selectedFormat ? TOC_OPTIONS_BY_FORMAT[selectedFormat.value] || [] : []
  }, [assignmentFormat])

  useEffect(() => {
    setSelectedChapters([]) // Reset selected chapters when format changes
  }, [assignmentFormat])

  const handleChapterChange = (chapter: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedChapters((prev) => [...prev, chapter])
    } else {
      setSelectedChapters((prev) => prev.filter((c) => c !== chapter))
    }
  }

  const handleSubmit = () => {
    let prompt = `과제 작성을 요청합니다.\n`
    prompt += `- 과목명: ${courses.find((c) => c.id.toString() === courseName)?.name || courseName || "미지정"}\n`
    prompt += `- 과제 제목: ${assignmentTitle || "미지정"}\n`
    prompt += `- 과제 형식: ${ASSIGNMENT_FORMATS.find((f) => f.value === assignmentFormat)?.label || "미지정"}\n`
    prompt += `- 분량: ${assignmentLength || "미지정"}\n`
    prompt += `- 문체: ${WRITING_STYLES.find((s) => s.value === writingStyle)?.label || "미지정"}\n`
    if (includeToc === "include" && currentTocOptions.length > 0) {
      prompt += `- 목차: ${selectedChapters.length > 0 ? selectedChapters.join(", ") : "기본 목차 사용"}\n`
    } else {
      prompt += `- 목차: 미포함\n`
    }
    if (additionalRequests.trim()) {
      prompt += `- 추가 요청사항: ${additionalRequests}\n`
    }
    onGenerate(prompt)
  }

  const inputClass = isDarkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
  const labelClass = isDarkMode ? "text-gray-300" : "text-gray-700"
  const selectTriggerClass = `${inputClass} text-left` // Ensure text alignment for SelectTrigger

  return (
    <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <CardHeader>
        <CardTitle className={`flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          <FileText className={`mr-2 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
          AI 과제 작성 도우미
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aiCourseName" className={labelClass}>
              과목명
            </Label>
            <Select value={courseName} onValueChange={setCourseName}>
              <SelectTrigger id="aiCourseName" className={selectTriggerClass}>
                <SelectValue placeholder="과목을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
                <SelectItem value="other">기타 (직접 입력)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="aiAssignmentTitle" className={labelClass}>
              과제 제목
            </Label>
            <Input
              id="aiAssignmentTitle"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="예: E-R 다이어그램 설계"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aiAssignmentFormat" className={labelClass}>
              과제 형식
            </Label>
            <Select value={assignmentFormat} onValueChange={setAssignmentFormat}>
              <SelectTrigger id="aiAssignmentFormat" className={selectTriggerClass}>
                <SelectValue placeholder="과제 형식을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNMENT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="aiAssignmentLength" className={labelClass}>
              분량
            </Label>
            <Input
              id="aiAssignmentLength"
              value={assignmentLength}
              onChange={(e) => setAssignmentLength(e.target.value)}
              placeholder="예: 2000자 또는 5 페이지"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aiWritingStyle" className={labelClass}>
              문체
            </Label>
            <Select value={writingStyle} onValueChange={setWritingStyle}>
              <SelectTrigger id="aiWritingStyle" className={selectTriggerClass}>
                <SelectValue placeholder="문체를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {WRITING_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="aiIncludeToc" className={labelClass}>
              목차 포함
            </Label>
            <Select value={includeToc} onValueChange={setIncludeToc}>
              <SelectTrigger id="aiIncludeToc" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="include">포함</SelectItem>
                <SelectItem value="exclude">미포함</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {includeToc === "include" && currentTocOptions.length > 0 && (
          <div>
            <Label className={`${labelClass} mb-2 block`}>포함할 목차 선택 (다중 선택 가능)</Label>
            <div
              className={`max-h-60 overflow-y-auto p-3 border rounded-md ${isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50/50"} grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2`}
            >
              {currentTocOptions.map((chapter) => (
                <div key={chapter} className="flex items-center space-x-2">
                  <Checkbox
                    id={`chapter-${chapter.replace(/\s+/g, "-")}`} // Ensure valid ID
                    checked={selectedChapters.includes(chapter)}
                    onCheckedChange={(checked) => handleChapterChange(chapter, checked)}
                    className={
                      isDarkMode
                        ? "border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        : ""
                    }
                  />
                  <Label
                    htmlFor={`chapter-${chapter.replace(/\s+/g, "-")}`}
                    className={`${labelClass} font-normal text-sm cursor-pointer`}
                  >
                    {chapter}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="aiAdditionalRequests" className={labelClass}>
            추가 요청사항 (선택)
          </Label>
          <Textarea
            id="aiAdditionalRequests"
            value={additionalRequests}
            onChange={(e) => setAdditionalRequests(e.target.value)}
            placeholder="특별히 강조하고 싶은 내용, 포함해야 할 키워드, 제외할 내용 등을 입력해주세요."
            rows={3}
            className={inputClass}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading || !assignmentTitle} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
          AI 과제 생성 요청
        </Button>
      </CardFooter>
    </Card>
  )
}
