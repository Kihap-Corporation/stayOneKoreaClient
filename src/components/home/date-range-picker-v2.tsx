"use client"

import DatePicker, { registerLocale } from "react-datepicker"
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
  const handleDateChange = (dates: [Date | null, Date | null] | Date | null) => {
    if (Array.isArray(dates)) {
      const [start, end] = dates

      // 시간 정보를 제거하고 날짜만 사용 (00:00:00.000으로 설정)
      const normalizedStart = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null
      const normalizedEnd = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null

      // 체크인과 체크아웃이 모두 있을 때
      if (checkIn && checkOut) {
        // 새로운 날짜가 체크인 이전이면 체크인 변경
        if (normalizedStart && normalizedStart < checkIn) {
          onCheckInChange(normalizedStart)
          onCheckOutChange(null)
        }
        // 새로운 날짜가 체크아웃 이후면 체크아웃 변경
        else if (normalizedEnd && normalizedEnd > checkOut) {
          onCheckOutChange(normalizedEnd)
        }
        // 그 외의 경우는 새로운 범위 시작
        else if (normalizedStart) {
          onCheckInChange(normalizedStart)
          onCheckOutChange(normalizedEnd)
        }
      }
      // 체크인만 있을 때
      else if (checkIn && !checkOut) {
        if (normalizedEnd) {
          onCheckOutChange(normalizedEnd)
        } else if (normalizedStart && normalizedStart < checkIn) {
          // 체크인 이전 날짜를 선택하면 체크인 변경
          onCheckInChange(normalizedStart)
        }
      }
      // 체크인과 체크아웃이 모두 없을 때
      else {
        if (normalizedStart) {
          onCheckInChange(normalizedStart)
        }
      }
    }
  }

  return (
    <div className={showBorder ? "bg-white rounded-2xl shadow-lg border border-[#dee0e3] w-fit" : "bg-white w-fit"}>
      <DatePicker
        selected={null}
        onChange={handleDateChange}
        startDate={checkIn}
        endDate={checkOut}
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

