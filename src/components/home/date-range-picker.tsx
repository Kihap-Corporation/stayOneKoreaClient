"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface DateRangePickerProps {
  checkIn: Date | null
  checkOut: Date | null
  onCheckInChange: (date: Date | null) => void
  onCheckOutChange: (date: Date | null) => void
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [nextMonth, setNextMonth] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date
  })

  // currentMonth가 변경되면 nextMonth도 자동으로 변경
  const handleCurrentMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth)
    const next = new Date(newMonth)
    next.setMonth(next.getMonth() + 1)
    setNextMonth(next)
  }

  const handleNextMonthChange = (newMonth: Date) => {
    setNextMonth(newMonth)
    const current = new Date(newMonth)
    current.setMonth(current.getMonth() - 1)
    setCurrentMonth(current)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // 이전 달의 날짜들
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      })
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      })
    }

    // 다음 달의 날짜들 (달력 완성)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      })
    }

    return days
  }

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return

    // 체크인과 체크아웃이 모두 없거나, 둘 다 있으면 새로 시작
    if (!checkIn || (checkIn && checkOut)) {
      onCheckInChange(date)
      onCheckOutChange(null)
    } 
    // 체크인만 있고 체크아웃이 없을 때
    else if (checkIn && !checkOut) {
      // 체크인 이전 날짜를 선택하면 체크인을 변경
      if (date < checkIn) {
        onCheckInChange(date)
        onCheckOutChange(null)
      } 
      // 체크인 이후 날짜를 선택하면 체크아웃으로 설정
      else {
        onCheckOutChange(date)
      }
    }
  }

  const isInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false
    const dateStr = date.toDateString()
    const checkInStr = checkIn.toDateString()
    const checkOutStr = checkOut.toDateString()
    return dateStr > checkInStr && dateStr < checkOutStr
  }

  const isInRangeInCurrentMonth = (date: Date) => {
    if (!checkIn || !checkOut) return false
    const dateStr = date.toDateString()
    const checkInStr = checkIn.toDateString()
    const checkOutStr = checkOut.toDateString()
    return dateStr >= checkInStr && dateStr <= checkOutStr
  }

  const isSelected = (date: Date) => {
    if (!checkIn && !checkOut) return false
    const dateStr = date.toDateString()
    return (
      dateStr === checkIn?.toDateString() ||
      dateStr === checkOut?.toDateString()
    )
  }

  const isStartDate = (date: Date) => {
    return date.toDateString() === checkIn?.toDateString()
  }

  const isEndDate = (date: Date) => {
    return date.toDateString() === checkOut?.toDateString()
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction: "prev" | "next", calendar: "current" | "next") => {
    if (calendar === "current") {
      handleCurrentMonthChange(
        direction === "prev" 
          ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
          : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      )
    } else {
      handleNextMonthChange(
        direction === "prev" 
          ? new Date(nextMonth.getFullYear(), nextMonth.getMonth() - 1, 1)
          : new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1)
      )
    }
  }

  const currentDays = getDaysInMonth(currentMonth)
  const nextDays = getDaysInMonth(nextMonth)

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const nights = checkIn && checkOut 
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-lg border border-[#dee0e3] w-fit">
      {/* Check-in Calendar */}
      <div className="w-[280px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth("prev", "current")}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-base font-semibold text-[#14151a]">
            {getMonthName(currentMonth)}
          </h3>
          <button
            onClick={() => navigateMonth("next", "current")}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {currentDays.map((day, index) => {
            const isRange = isInRange(day.date)
            const isSelectedDay = isSelected(day.date)
            const isStart = isStartDate(day.date)
            const isEnd = isEndDate(day.date)
            
            // 체크인 달력에서의 범위 표시 (체크인 날짜부터 해당 달의 마지막 날까지)
            const isInCheckInRange = checkIn && !checkOut && day.isCurrentMonth && day.date >= checkIn

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                disabled={!day.isCurrentMonth}
                className={`
                  h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${!day.isCurrentMonth ? "text-gray-300 cursor-not-allowed" : "text-[#14151a]"}
                  ${isRange || isInCheckInRange ? "bg-[#f3f4f6] text-[#14151a]" : ""}
                  ${isStart ? "bg-[#e0004d] text-white rounded-l-lg" : ""}
                  ${isEnd ? "bg-[#e0004d] text-white rounded-r-lg" : ""}
                  ${day.isCurrentMonth && !isRange && !isSelectedDay && !isInCheckInRange ? "hover:bg-gray-100" : ""}
                `}
              >
                {day.date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-[#14151a]">
            Check-in: {checkIn ? checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
          </p>
        </div>
      </div>

      {/* Nights Info */}
      {checkIn && checkOut && (
        <div className="flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#e0004d]">{nights}</p>
            <p className="text-sm text-gray-600">nights</p>
          </div>
        </div>
      )}

      {/* Check-out Calendar */}
      <div className="w-[280px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth("prev", "next")}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-base font-semibold text-[#14151a]">
            {getMonthName(nextMonth)}
          </h3>
          <button
            onClick={() => navigateMonth("next", "next")}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {nextDays.map((day, index) => {
            const isRange = isInRange(day.date)
            const isSelectedDay = isSelected(day.date)
            const isStart = isStartDate(day.date)
            const isEnd = isEndDate(day.date)
            
            // 체크아웃 달력에서의 범위 표시 (해당 달의 첫날부터 체크아웃 날짜까지)
            const isInCheckOutRange = checkIn && !checkOut && day.isCurrentMonth && day.date >= checkIn
            
            // 체크인 날짜가 이전 달에 있을 때도 범위 표시
            const isInRangeFromPreviousMonth = checkIn && !checkOut && day.isCurrentMonth && day.date < checkIn && day.date.getMonth() === checkIn.getMonth() + 1

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                disabled={!day.isCurrentMonth}
                className={`
                  h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${!day.isCurrentMonth ? "text-gray-300 cursor-not-allowed" : "text-[#14151a]"}
                  ${isRange || isInCheckOutRange || isInRangeFromPreviousMonth ? "bg-[#f3f4f6] text-[#14151a]" : ""}
                  ${isStart ? "bg-[#e0004d] text-white rounded-l-lg" : ""}
                  ${isEnd ? "bg-[#e0004d] text-white rounded-r-lg" : ""}
                  ${day.isCurrentMonth && !isRange && !isSelectedDay && !isInCheckOutRange && !isInRangeFromPreviousMonth ? "hover:bg-gray-100" : ""}
                `}
              >
                {day.date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-[#14151a]">
            Check-out: {checkOut ? checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
          </p>
        </div>
      </div>
    </div>
  )
}

