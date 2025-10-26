"use client"

import { useRef, useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import { X } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"

interface MobileDatePickerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  selectedDate: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  locale?: any
}

export function MobileDatePicker({
  isOpen,
  onClose,
  title,
  selectedDate,
  onChange,
  minDate,
  locale
}: MobileDatePickerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [calendarMonths, setCalendarMonths] = useState(36)

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

      if (scrollPercentage > 0.3 && calendarMonths < 120) {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          setCalendarMonths(prev => Math.min(prev + 30, 120))
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
      setCalendarMonths(36)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-[#FFF] lg:hidden flex flex-col">
      {/* 헤더 - 고정 */}
      <div className="flex items-center justify-between p-4 border-b border-[#e9eaec] bg-white flex-shrink-0">
        <h3 className="text-[18px] font-bold text-[#14151a]">
          {title}
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
        style={{ scrollBehavior: 'smooth' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          /* 무한스크롤 최적화 */
          .react-datepicker__month-container {
            will-change: transform !important;
            transform: translateZ(0) !important;
          }

          /* 부드러운 스크롤 */
          .react-datepicker {
            scroll-behavior: smooth !important;
            -webkit-overflow-scrolling: touch !important;
          }

          /* 스크롤바 스타일 */
          div[style*="scrollBehavior"] {
            scrollbar-width: thin !important;
            scrollbar-color: #e9eaec transparent !important;
          }

          div[style*="scrollBehavior"]::-webkit-scrollbar {
            width: 3px !important;
          }

          div[style*="scrollBehavior"]::-webkit-scrollbar-track {
            background: transparent !important;
          }

          div[style*="scrollBehavior"]::-webkit-scrollbar-thumb {
            background-color: #e9eaec !important;
            border-radius: 2px !important;
          }

          div[style*="scrollBehavior"]::-webkit-scrollbar-thumb:hover {
            background-color: #dee0e3 !important;
          }
        `}} />
        <style dangerouslySetInnerHTML={{__html: `
          /* 모바일용 무한스크롤 달력 */
          .react-datepicker {
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
            border: none !important;
            box-shadow: none !important;
            background-color: transparent !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .react-datepicker__month-container {
            background-color: white !important;
            border-radius: 16px !important;
            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06) !important;
            overflow: hidden !important;
            margin: 0 !important;
            flex-shrink: 0 !important;
            min-height: clamp(320px, 50vw, 500px) !important;
          }

          .react-datepicker__header {
            background-color: white !important;
            border-bottom: 1px solid #e9eaec !important;
            padding: 12px !important;
            border-radius: 16px 16px 0 0 !important;
          }

          .react-datepicker__current-month {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #14151a !important;
            text-align: center !important;
          }

          .react-datepicker__navigation {
            display: none !important;
          }

          .react-datepicker__day-names {
            background-color: #f7f7f8 !important;
            border-radius: 6px !important;
            margin: 0 8px !important;
            padding: 6px 0 !important;
          }

          .react-datepicker__day-name {
            color: #666 !important;
            font-weight: 500 !important;
            width: calc((100vw - 64px) / 7) !important;
            height: calc((100vw - 64px) / 7) !important;
            max-width: 60px !important;
            max-height: 60px !important;
            line-height: calc((100vw - 64px) / 7) !important;
            font-size: clamp(13px, 3vw, 16px) !important;
          }

          .react-datepicker__day {
            width: calc((100vw - 64px) / 7) !important;
            height: calc((100vw - 64px) / 7) !important;
            max-width: 60px !important;
            max-height: 60px !important;
            line-height: calc((100vw - 64px) / 7) !important;
            margin: 2px !important;
            border-radius: 6px !important;
            font-size: clamp(15px, 3.5vw, 18px) !important;
            font-weight: 500 !important;
            color: #14151a !important;
            transition: all 0.1s ease !important;
          }

          .react-datepicker__day:hover {
            background-color: #f7f7f8 !important;
          }

          .react-datepicker__day--selected {
            background-color: #e0004d !important;
            color: white !important;
          }

          .react-datepicker__day--selected:hover {
            background-color: #c2003f !important;
          }

          .react-datepicker__day--today {
            background-color: #fff3cd !important;
            color: #14151a !important;
            font-weight: 600 !important;
          }

          .react-datepicker__day--disabled {
            color: #ccc !important;
            cursor: not-allowed !important;
            background-color: transparent !important;
          }

          .react-datepicker__week {
            display: flex !important;
            justify-content: center !important;
            margin-bottom: 2px !important;
          }
        `}} />
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            onChange(date)
            if (date) {
              onClose()
            }
          }}
          inline
          locale={locale}
          minDate={minDate}
          monthsShown={calendarMonths}
          calendarClassName="!border-none !w-full"
        />
      </div>
    </div>
  )
}

