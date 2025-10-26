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
  monthsShown?: number
  showBorder?: boolean
}

export function DateRangePickerV2({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  locale = "en",
  monthsShown = 2,
  showBorder = true,
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

  return (
    <div className={showBorder ? "bg-white rounded-2xl shadow-lg border border-[#dee0e3] w-fit" : "bg-white w-fit"}>
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        monthsShown={monthsShown}
        inline
        locale={locale}
        minDate={new Date()}
        dateFormat="yyyy/MM/dd"
        calendarClassName="custom-calendar"
      />
    </div>
  )
}

