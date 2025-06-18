"use client"
// This is the ScheduleView.tsx from v13, preserved as requested.
// It contains the detailed, animated, and "edgy" mobile-responsive timetable.
import React, { useState, memo } from "react"
import type { ScheduleItem } from "@/lib/types" // Assuming types are in lib/types.ts

interface ScheduleViewProps {
  schedule: ScheduleItem[]
  onAdd: () => void
  onDelete: (id: number) => void
  isMobile: boolean
  isDarkMode: boolean // Added isDarkMode prop
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, onAdd, onDelete, isMobile, isDarkMode }) => {
  const [showEarlyHours, setShowEarlyHours] = useState(false)
  const [showLateHours, setShowLateHours] = useState(false)

  const getTimeSlots = () => {
    const base = [
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-13:00",
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
      "16:00-17:00",
      "17:00-18:00",
    ]
    const early = ["06:00-07:00", "07:00-08:00", "08:00-09:00"]
    const late = ["18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00", "23:00-24:00"]
    let slots = [...base]
    if (showEarlyHours) slots = [...early, ...slots]
    if (showLateHours) slots = [...slots, ...late]
    return slots
  }

  const timeSlots = getTimeSlots()
  const days = ["월", "화", "수", "목", "금"]

  // Enhanced color palette for subjects, considering dark mode
  const subjectColors = [
    {
      light: "from-blue-400 via-blue-500 to-blue-600",
      dark: "from-blue-500 via-blue-600 to-blue-700",
      shadow: "shadow-blue-300/50 dark:shadow-blue-800/50",
    },
    {
      light: "from-green-400 via-green-500 to-green-600",
      dark: "from-green-500 via-green-600 to-green-700",
      shadow: "shadow-green-300/50 dark:shadow-green-800/50",
    },
    {
      light: "from-yellow-400 via-orange-500 to-red-500",
      dark: "from-yellow-500 via-orange-600 to-red-600",
      shadow: "shadow-yellow-300/50 dark:shadow-yellow-800/50",
    },
    {
      light: "from-red-400 via-pink-500 to-purple-500",
      dark: "from-red-500 via-pink-600 to-purple-600",
      shadow: "shadow-red-300/50 dark:shadow-red-800/50",
    },
    {
      light: "from-purple-400 via-indigo-500 to-blue-600",
      dark: "from-purple-500 via-indigo-600 to-blue-700",
      shadow: "shadow-purple-300/50 dark:shadow-purple-800/50",
    },
    {
      light: "from-teal-400 via-cyan-500 to-sky-600",
      dark: "from-teal-500 via-cyan-600 to-sky-700",
      shadow: "shadow-teal-300/50 dark:shadow-teal-800/50",
    },
    {
      light: "from-rose-400 via-fuchsia-500 to-pink-600",
      dark: "from-rose-500 via-fuchsia-600 to-pink-700",
      shadow: "shadow-rose-300/50 dark:shadow-rose-800/50",
    },
  ]

  const getSubjectColor = (subjectName: string, dayIndex: number) => {
    let hash = 0
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = (Math.abs(hash) + dayIndex) % subjectColors.length // Add dayIndex for more variation
    return subjectColors[index]
  }

  return (
    <div className="space-y-4">
      {isMobile ? (
        // Mobile specific header
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <h1 className={`text-lg font-bold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              ✨ 스마트시간표
            </h1>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowEarlyHours(!showEarlyHours)}
              className={`flex items-center px-1.5 py-1 rounded-full text-xs font-medium ${showEarlyHours ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white" : isDarkMode ? "bg-gray-700 text-gray-300 border border-gray-600" : "bg-white text-gray-600 border border-gray-300"}`}
            >
              <span>아침</span>
            </button>
            <button
              onClick={() => {
                setShowEarlyHours(true)
                setShowLateHours(true)
              }}
              className="px-1.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full"
            >
              전체
            </button>
            <button
              onClick={() => {
                setShowEarlyHours(false)
                setShowLateHours(false)
              }}
              className="px-1.5 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs rounded-full"
            >
              기본
            </button>
            <button
              onClick={() => setShowLateHours(!showLateHours)}
              className={`flex items-center px-1.5 py-1 rounded-full text-xs font-medium ${showLateHours ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white" : isDarkMode ? "bg-gray-700 text-gray-300 border border-gray-600" : "bg-white text-gray-600 border border-gray-300"}`}
            >
              <span>야간</span>
            </button>
            <button
              onClick={onAdd}
              className="px-1.5 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-lg"
            >
              ✚
            </button>
          </div>
        </div>
      ) : (
        // Desktop specific header
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>✨ 스마트 시간표</h1>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                가변형 시간대로 완벽한 스케줄 관리
              </p>
            </div>
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ✚ 수업 추가
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowEarlyHours(!showEarlyHours)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 transform hover:scale-105 ${showEarlyHours ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg" : isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 shadow-sm"}`}
            >
              <span className={`transform transition-transform duration-300 ${showEarlyHours ? "rotate-180" : ""}`}>
                ⬆️
              </span>
              <span>{showEarlyHours ? "🌅 아침 시간 숨기기" : "🌅 아침 시간 보기 (6-9시)"}</span>
            </button>
            <button
              onClick={() => setShowLateHours(!showLateHours)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 transform hover:scale-105 ${showLateHours ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg" : isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 shadow-sm"}`}
            >
              <span>{showLateHours ? "🌙 야간 시간 숨기기" : "🌙 야간 시간 보기 (18-24시)"}</span>
              <span className={`transform transition-transform duration-300 ${showLateHours ? "rotate-180" : ""}`}>
                ⬇️
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="overflow-x-auto -mx-1 sm:-mx-3 px-1 sm:px-3 pb-4">
        <div className={`${isMobile ? "min-w-[380px]" : "min-w-full"} transition-all duration-700 ease-in-out`}>
          <div className={`grid grid-cols-6 ${isMobile ? "gap-0.5" : "gap-2 md:gap-3"}`}>
            {/* Header Row */}
            <div
              className={`${isMobile ? "p-1 text-[9px]" : "p-2 sm:p-3"} text-center font-bold bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-t-lg shadow-lg sticky left-0 z-10 ${isDarkMode ? "dark:from-purple-700 dark:to-pink-700" : ""}`}
            >
              ⏰ 시간
            </div>
            {days.map((day, index) => (
              <div
                key={day}
                className={`${isMobile ? "p-1 text-[9px]" : "p-2 sm:p-3"} text-center font-bold text-white rounded-t-lg shadow-lg bg-gradient-to-br ${index === 0 ? "from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600" : index === 1 ? "from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600" : index === 2 ? "from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600" : index === 3 ? "from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600" : "from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600"} hover:shadow-xl transition-all duration-300`}
              >
                {day}요일
              </div>
            ))}

            {/* Time Slots and Classes */}
            {timeSlots.map((timeSlot) => {
              const hour = Number.parseInt(timeSlot.split(":")[0], 10)
              const isEarly = hour < 9
              const isLate = hour >= 18
              const isBase = hour >= 9 && hour < 18

              let timeCellBg = isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
              if (isEarly)
                timeCellBg = `bg-gradient-to-r from-orange-300 to-yellow-300 text-orange-900 dark:from-orange-400 dark:to-yellow-400 dark:text-orange-950 shadow-md animate-fade-in`
              else if (isLate)
                timeCellBg = `bg-gradient-to-r from-indigo-300 to-purple-300 text-indigo-900 dark:from-indigo-400 dark:to-purple-400 dark:text-indigo-950 shadow-md animate-fade-in`
              else if (isBase) {
                if (hour < 12)
                  timeCellBg = `bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-900 dark:from-blue-300 dark:to-cyan-300 dark:text-blue-950 shadow-md`
                else if (hour < 15)
                  timeCellBg = `bg-gradient-to-r from-green-200 to-emerald-200 text-green-900 dark:from-green-300 dark:to-emerald-300 dark:text-green-950 shadow-md`
                else
                  timeCellBg = `bg-gradient-to-r from-purple-200 to-pink-200 text-purple-900 dark:from-purple-300 dark:to-pink-300 dark:text-purple-950 shadow-md`
              }

              return (
                <React.Fragment key={timeSlot}>
                  <div
                    className={`${isMobile ? "p-0.5 text-[8px]" : "p-2 sm:p-3 text-sm"} text-center font-bold rounded-lg border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-500 transform hover:scale-105 sticky left-0 z-10 ${timeCellBg}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{isMobile ? timeSlot.split("-")[0] : timeSlot}</span>
                      {!isMobile && (
                        <span className="text-[10px] opacity-75">
                          {isEarly ? "🌅" : isLate ? "🌙" : hour < 12 ? "☀️" : hour < 15 ? "🌞" : "🌆"}
                        </span>
                      )}
                    </div>
                  </div>
                  {days.map((day, dayIndex) => {
                    const classItem = schedule.find((item) => item.day === day && item.time === timeSlot)
                    const colorScheme = classItem ? getSubjectColor(classItem.subject, dayIndex) : null
                    const cellBg = classItem
                      ? `bg-gradient-to-br ${isDarkMode ? colorScheme?.dark : colorScheme?.light} ${colorScheme?.shadow}`
                      : isDarkMode
                        ? "bg-gray-800 border border-gray-700 hover:bg-gray-700/70"
                        : "bg-white border border-gray-200 hover:bg-gray-50"

                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        className={`${isMobile ? "p-0.5" : "p-1.5 sm:p-2"} rounded-xl ${isMobile ? "min-h-[40px]" : "min-h-[70px] sm:min-h-[80px]"} transition-all duration-300 hover:scale-105 hover:shadow-2xl transform ${classItem ? `animate-fade-in-slow border-2 border-white/50 dark:border-black/30 hover:border-yellow-300 dark:hover:border-yellow-400 ${cellBg}` : `${cellBg} hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-lg`}`}
                        onClick={!classItem ? onAdd : undefined} // Allow adding if cell is empty
                        role={!classItem ? "button" : undefined}
                        tabIndex={!classItem ? 0 : undefined}
                      >
                        {classItem && (
                          <>
                            <div
                              className={`absolute inset-0 bg-gradient-to-r from-transparent ${isDarkMode ? "via-white/10" : "via-white/30"} to-transparent opacity-20 animate-pulse-slow`}
                            ></div>
                            <div className="text-white animate-fade-in relative z-10 flex flex-col justify-between h-full">
                              <div>
                                <h4
                                  className={`${isMobile ? "text-[8px]" : "text-xs sm:text-sm"} font-bold ${isMobile ? "leading-tight" : "mb-0.5"} drop-shadow-lg`}
                                >
                                  {isMobile
                                    ? classItem.subject.length > 6
                                      ? classItem.subject.slice(0, 5) + "…"
                                      : classItem.subject
                                    : classItem.subject}
                                </h4>
                                <p
                                  className={`${isMobile ? "text-[7px]" : "text-[10px] sm:text-xs"} opacity-90 font-semibold drop-shadow-md`}
                                >
                                  📍{" "}
                                  {isMobile
                                    ? classItem.room.length > 4
                                      ? classItem.room.slice(0, 3) + "…"
                                      : classItem.room
                                    : classItem.room}
                                </p>
                              </div>
                              {!isMobile && classItem.instructor && (
                                <p className="text-[10px] sm:text-xs opacity-80 mt-0.5 font-medium drop-shadow-md self-start">
                                  👨‍🏫 {classItem.instructor}
                                </p>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(classItem.id)
                                }}
                                className={`absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] sm:text-xs opacity-50 hover:opacity-100 transition-opacity z-20 ${isDarkMode ? "bg-red-600/70 hover:bg-red-700" : ""}`}
                                aria-label="수업 삭제"
                              >
                                ×
                              </button>
                            </div>
                          </>
                        )}
                        {!classItem && (
                          <div className="flex items-center justify-center h-full opacity-0 hover:opacity-50 transition-opacity duration-300">
                            <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>➕</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ScheduleView)
