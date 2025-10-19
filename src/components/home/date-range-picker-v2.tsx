"use client"

import { useState } from "react"
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker"
import { ko, enUS, zhCN, fr } from "date-fns/locale"
import "react-datepicker/dist/react-datepicker.css"

registerLocale("ko", ko)
registerLocale("en", enUS)
registerLocale("zh", zhCN)
registerLocale("fr", fr)

interface DateRangePickerProps {
  checkIn: Date | null
  checkOut: Date | null
  onCheckInChange: (date: Date | null) => void
  onCheckOutChange: (date: Date | null) => void
  locale?: string
}

export function DateRangePickerV2({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  locale = "en",
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(checkIn)
  const [endDate, setEndDate] = useState(checkOut)

  const handleDateChange = (dates: [Date | null, Date | null] | Date | null) => {
    if (Array.isArray(dates)) {
      const [start, end] = dates
      
      // 체크인과 체크아웃이 모두 있을 때
      if (startDate && endDate) {
        // 새로운 날짜가 체크인 이전이면 체크인 변경
        if (start && start < startDate) {
          setStartDate(start)
          setEndDate(null)
          onCheckInChange(start)
          onCheckOutChange(null)
        }
        // 새로운 날짜가 체크아웃 이후면 체크아웃 변경
        else if (end && end > endDate) {
          setEndDate(end)
          onCheckOutChange(end)
        }
        // 그 외의 경우는 새로운 범위 시작
        else if (start) {
          setStartDate(start)
          setEndDate(end)
          onCheckInChange(start)
          onCheckOutChange(end)
        }
      }
      // 체크인만 있을 때
      else if (startDate && !endDate) {
        if (end) {
          setEndDate(end)
          onCheckOutChange(end)
        } else if (start && start < startDate) {
          // 체크인 이전 날짜를 선택하면 체크인 변경
          setStartDate(start)
          onCheckInChange(start)
        }
      }
      // 체크인과 체크아웃이 모두 없을 때
      else {
        if (start) {
          setStartDate(start)
          onCheckInChange(start)
        }
      }
    }
  }

  const nights = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-lg border border-[#dee0e3] w-fit">
      {/* Calendar */}
      <div>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          monthsShown={2}
          inline
          locale={locale}
          minDate={new Date()}
          dateFormat="yyyy/MM/dd"
          calendarClassName="custom-calendar"
        />
      </div>

      {/* Info Panel */}
      <div className="flex flex-col justify-center gap-4 px-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Check-in</p>
          <p className="text-base font-semibold text-[#14151a]">
            {startDate ? startDate.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" }) : "Select date"}
          </p>
        </div>

        {startDate && endDate && (
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-[#e0004d]">{nights}</p>
            <p className="text-sm text-gray-600">nights</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Check-out</p>
          <p className="text-base font-semibold text-[#14151a]">
            {endDate ? endDate.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" }) : "Select date"}
          </p>
        </div>
      </div>
    </div>
  )
}

