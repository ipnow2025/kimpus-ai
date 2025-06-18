"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { debounce } from "lodash"

interface CollaborativeTextareaProps {
  value: string
  onChange: (value: string) => void
  onCursorMove?: (position: number) => void
  onContentChange?: (content: string, cursorPosition: number) => void
  placeholder?: string
  className?: string
  rows?: number
  collaborators?: Array<{
    userId: string
    userName: string
    cursorPosition: number
    color: string
  }>
}

export function CollaborativeTextarea({
  value,
  onChange,
  onCursorMove,
  onContentChange,
  placeholder,
  className,
  rows = 10,
  collaborators = [],
}: CollaborativeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)

  // 디바운스된 콘텐츠 변경 알림
  const debouncedContentChange = useCallback(
    debounce((content: string, position: number) => {
      onContentChange?.(content, position)
    }, 300),
    [onContentChange],
  )

  // 커서 위치 변경 처리
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart
      setCursorPosition(position)
      onCursorMove?.(position)
    }
  }, [onCursorMove])

  // 텍스트 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const newPosition = e.target.selectionStart

    onChange(newValue)
    setCursorPosition(newPosition)
    debouncedContentChange(newValue, newPosition)
  }

  // 키보드 이벤트 처리 (커서 이동 감지)
  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 화살표 키, Home, End 등 커서 이동 키들
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(e.key)) {
      handleSelectionChange()
    }
  }

  // 마우스 클릭으로 커서 이동
  const handleClick = () => {
    setTimeout(handleSelectionChange, 0) // 클릭 후 커서 위치가 업데이트되길 기다림
  }

  // 협업자 커서 표시를 위한 스타일 계산
  const getCollaboratorCursors = () => {
    if (!textareaRef.current || collaborators.length === 0) return null

    return collaborators.map((collaborator) => {
      // 실제 구현에서는 더 정교한 커서 위치 계산이 필요
      // 여기서는 간단한 예시만 제공
      return (
        <div
          key={collaborator.userId}
          className="absolute pointer-events-none"
          style={{
            // 실제 커서 위치 계산 로직 필요
            top: "10px",
            left: "10px",
            borderLeft: `2px solid ${collaborator.color}`,
            height: "20px",
          }}
        >
          <div
            className="absolute -top-6 -left-1 px-1 py-0.5 text-xs text-white rounded"
            style={{ backgroundColor: collaborator.color }}
          >
            {collaborator.userName}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      {getCollaboratorCursors()}
    </div>
  )
}
