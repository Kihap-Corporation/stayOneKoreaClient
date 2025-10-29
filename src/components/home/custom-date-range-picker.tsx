"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CustomDateRangePickerProps {
  checkIn: Date | null
  checkOut: Date | null
  onCheckInChange: (date: Date | null) => void
  onCheckOutChange: (date: Date | null) => void
  locale?: string
  monthsShown?: number
  showBorder?: boolean
}

// 날짜를 YYYY-MM-DD 형식으로 비교하기 위한 키 생성
const getDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

// 날짜가 같은지 비교 (년, 월, 일만)
const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false
  return getDateKey(date1) === getDateKey(date2)
}

// 날짜가 범위 안에 있는지 확인
const isInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) return false
  const dateTime = date.getTime()
  return dateTime > start.getTime() && dateTime < end.getTime()
}

// 월의 모든 날짜 가져오기
const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Date[] = []

  // 이전 달의 빈 칸 채우기
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }

  // 현재 달의 날짜
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // 다음 달의 빈 칸 채우기 (6주 = 42칸)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

// 로케일별 월 이름
const getMonthName = (year: number, month: number, locale: string): string => {
  const date = new Date(year, month, 1)
  const localeMap: Record<string, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    zh: 'zh-CN',
    fr: 'fr-FR'
  }
  return date.toLocaleDateString(localeMap[locale] || 'en-US', { month: 'long', year: 'numeric' })
}

// 요일 이름
const getDayNames = (locale: string): string[] => {
  const localeMap: Record<string, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    zh: 'zh-CN',
    fr: 'fr-FR'
  }
  const localeName = localeMap[locale] || 'en-US'
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(2000, 0, 2 + i) // 2000년 1월 2일은 일요일
    days.push(date.toLocaleDateString(localeName, { weekday: 'short' }))
  }
  return days
}

export function CustomDateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  locale = "en",
  monthsShown = 2,
  showBorder = true,
}: CustomDateRangePickerProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (date: Date) => {
    // 과거 날짜는 선택 불가
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (normalizedDate < normalizedToday) return

    // 체크인과 체크아웃이 모두 있을 때 -> 새로운 체크인 시작
    if (checkIn && checkOut) {
      onCheckInChange(normalizedDate)
      onCheckOutChange(null)
    }
    // 체크인만 있을 때
    else if (checkIn && !checkOut) {
      // 체크인보다 이전 날짜를 선택하면 체크인 변경
      if (normalizedDate < checkIn) {
        onCheckInChange(normalizedDate)
      } else {
        // 체크인 이후 날짜를 선택하면 체크아웃 설정
        onCheckOutChange(normalizedDate)
      }
    }
    // 아무것도 없을 때 -> 체크인 설정
    else {
      onCheckInChange(normalizedDate)
    }
  }

  const renderMonth = (monthOffset: number) => {
    const month = (currentMonth + monthOffset) % 12
    const year = currentYear + Math.floor((currentMonth + monthOffset) / 12)
    const days = getDaysInMonth(year, month)
    const dayNames = getDayNames(locale)

    return (
      <div key={monthOffset} className="flex flex-col px-4">
        {/* 월 헤더 */}
        <div className="text-center mb-4 h-6">
          <span className="text-base font-semibold text-[#14151a]">
            {getMonthName(year, month, locale).replace(' ', ' ')}
          </span>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500 w-9 h-8 flex items-center justify-center uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const isCurrentMonth = date.getMonth() === month
            const isToday = isSameDay(date, today)
            const isSelected = isSameDay(date, checkIn) || isSameDay(date, checkOut)
            const inRange = isInRange(date, checkIn, checkOut)
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const isDisabled = !isCurrentMonth || isPast

            // 호버 시 범위 미리보기
            const inHoverRange = checkIn && !checkOut && hoverDate && !isDisabled
              ? isInRange(date, checkIn, hoverDate) || isSameDay(date, hoverDate)
              : false

            let className = "w-9 h-9 flex items-center justify-center text-sm rounded cursor-pointer transition-colors relative"

            if (isDisabled) {
              className += " text-gray-300 cursor-not-allowed"
            } else if (isSelected) {
              className += " bg-[#e0004d] text-white font-medium z-10"
            } else if (inRange || inHoverRange) {
              className += " bg-[#ffebf3] text-[#14151a] z-0"
            } else if (isToday) {
              className += " text-[#14151a] font-bold"
            } else {
              className += " text-[#14151a] hover:bg-[#ffe5ef]"
            }

            return (
              <button
                key={i}
                onClick={() => !isDisabled && handleDateClick(date)}
                onMouseEnter={() => !isDisabled && setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                disabled={isDisabled}
                className={className}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={showBorder ? "bg-white rounded-2xl shadow-lg border border-[#dee0e3] w-fit p-6" : "bg-white w-fit p-6"}>
      <div className="flex items-start gap-4 relative">
        {/* 왼쪽 화살표 */}
        <button
          onClick={handlePrevMonth}
          className="absolute left-0 top-0 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 text-[#14151a]" />
        </button>

        {/* 달력들 */}
        <div className="flex gap-8 mx-12">
          {Array.from({ length: monthsShown }).map((_, i) => renderMonth(i))}
        </div>

        {/* 오른쪽 화살표 */}
        <button
          onClick={handleNextMonth}
          className="absolute right-0 top-0 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5 text-[#14151a]" />
        </button>
      </div>
    </div>
  )
}
