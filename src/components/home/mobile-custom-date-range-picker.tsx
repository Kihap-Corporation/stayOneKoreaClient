"use client"

import { useRef, useEffect, useState } from "react"
import { X } from "lucide-react"

interface MobileCustomDateRangePickerProps {
  isOpen: boolean
  onClose: () => void
  checkIn: Date | null
  checkOut: Date | null
  onCheckInChange: (date: Date | null) => void
  onCheckOutChange: (date: Date | null) => void
  locale?: string
  filterCheckInDate?: (date: Date) => boolean
  filterCheckOutDate?: (date: Date) => boolean
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

export function MobileCustomDateRangePicker({
  isOpen,
  onClose,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  locale = "en",
  filterCheckInDate,
  filterCheckOutDate
}: MobileCustomDateRangePickerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [calendarMonths, setCalendarMonths] = useState(12)
  const today = new Date()

  // 무한스크롤
  useEffect(() => {
    if (typeof window === 'undefined' || !scrollContainerRef.current || !isOpen) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const container = scrollContainerRef.current
      if (!container) return

      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage > 0.7 && calendarMonths < 24) {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          setCalendarMonths(prev => Math.min(prev + 6, 24))
        }, 100)
      }
    }

    const container = scrollContainerRef.current
    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [calendarMonths, isOpen])

  // 모달이 열릴 때 calendarMonths 초기화
  useEffect(() => {
    if (isOpen) {
      setCalendarMonths(12)
    }
  }, [isOpen])

  const handleDateClick = (date: Date) => {
    // 과거 날짜는 선택 불가
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (normalizedDate < normalizedToday) return

    const isSelectingCheckOut = !!checkIn && !checkOut

    if (isSelectingCheckOut) {
      if (filterCheckOutDate && !filterCheckOutDate(normalizedDate)) return
    } else {
      if (filterCheckInDate && !filterCheckInDate(normalizedDate)) return
    }

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
        // 체크인 이후 날짜를 선택하면 체크아웃 설정하고 모달 닫기
        onCheckOutChange(normalizedDate)
        setTimeout(() => onClose(), 300) // 약간의 딜레이 후 닫기
      }
    }
    // 아무것도 없을 때 -> 체크인 설정
    else {
      onCheckInChange(normalizedDate)
    }
  }

  const renderMonth = (monthOffset: number) => {
    const month = (today.getMonth() + monthOffset) % 12
    const year = today.getFullYear() + Math.floor((today.getMonth() + monthOffset) / 12)
    const days = getDaysInMonth(year, month)
    const dayNames = getDayNames(locale)

    return (
      <div key={monthOffset} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        {/* 월 헤더 */}
        <div className="text-center mb-4">
          <span className="text-lg font-bold text-[#14151a]">
            {getMonthName(year, month, locale)}
          </span>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500 h-10 flex items-center justify-center uppercase">
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
            const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const isPast = normalizedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())

            const isSelectingCheckOut = !!checkIn && !checkOut
            let isAvailable = true

            if (isSelectingCheckOut) {
              if (filterCheckOutDate) {
                isAvailable = filterCheckOutDate(normalizedDate)
              }
            } else {
              if (filterCheckInDate) {
                isAvailable = filterCheckInDate(normalizedDate)
              }
            }

            const isDisabled = !isCurrentMonth || isPast || !isAvailable

            let className = "h-12 flex items-center justify-center text-base rounded-lg cursor-pointer transition-colors relative"

            if (isDisabled) {
              className += " text-gray-300 cursor-not-allowed"
            } else if (isSelected) {
              className += " bg-[#e0004d] text-white font-semibold z-10"
            } else if (inRange) {
              className += " bg-[#ffebf3] text-[#14151a] z-0"
            } else if (isToday) {
              className += " text-[#14151a] font-bold"
            } else {
              className += " text-[#14151a] active:bg-[#ffe5ef]"
            }

            return (
              <button
                key={i}
                onClick={() => !isDisabled && handleDateClick(date)}
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] lg:hidden flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div
        className="relative bg-white rounded-[24px] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between p-4 border-b border-[#e9eaec] bg-white rounded-t-[24px] flex-shrink-0">
          <h3 className="text-[18px] font-bold text-[#14151a]">
            Select dates
          </h3>
          <button
            onClick={onClose}
            className="bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5 text-[#14151a]" />
          </button>
        </div>

        {/* 달력 영역 - 무한스크롤 가능 */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 pb-8"
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {Array.from({ length: calendarMonths }).map((_, i) => renderMonth(i))}
        </div>
      </div>
    </div>
  )
}
