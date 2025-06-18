"use client"

import { useState, useCallback } from "react"
import type { ScheduleItem } from "@/lib/types"

const initialScheduleData: ScheduleItem[] = [
  {
    id: 1,
    day: "월",
    time: "09:00-10:00",
    subject: "데이터베이스시스템 (샘플)",
    room: "공학관 301",
    instructor: "김교수",
  },
  { id: 2, day: "월", time: "13:00-14:00", subject: "알고리즘 (샘플)", room: "공학관 205", instructor: "이교수" },
  { id: 3, day: "화", time: "10:00-11:00", subject: "웹프로그래밍 (샘플)", room: "IT관 401", instructor: "박교수" },
]
const generateId = () => Date.now() + Math.random()

export function useSchedule(initialSchedule: ScheduleItem[] = initialScheduleData) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule)

  const addScheduleItem = useCallback((newScheduleData: Omit<ScheduleItem, "id">) => {
    const newSchedule: ScheduleItem = {
      ...newScheduleData,
      id: generateId(),
    }
    setSchedule((prev) =>
      [...prev, newSchedule].sort((a, b) => {
        const dayOrder = ["월", "화", "수", "목", "금", "토", "일"]
        if (dayOrder.indexOf(a.day) !== dayOrder.indexOf(b.day)) {
          return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
        }
        return a.time.localeCompare(b.time)
      }),
    )
  }, [])

  const deleteScheduleItem = useCallback((id: number) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Add updateScheduleItem if needed

  return {
    schedule,
    addScheduleItem,
    deleteScheduleItem,
  }
}
