"use client"

import { Button } from "@/components/ui/button"
import { ShieldCheck, Calendar, Plus, Minus } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/language-provider"
import { apiPostWithResponse } from "@/lib/api"
import Image from "next/image"

// 로케일 맵핑 - 동적 import 사용
const getLocale = async (lang: string) => {
  try {
    switch (lang) {
      case 'ko':
        const { ko } = await import('date-fns/locale/ko')
        return ko
      case 'en':
        const { enUS } = await import('date-fns/locale/en-US')
        return enUS
      case 'zh':
        const { zhCN } = await import('date-fns/locale/zh-CN')
        return zhCN
      case 'fr':
        const { fr } = await import('date-fns/locale/fr')
        return fr
      default:
        const { ko: defaultKo } = await import('date-fns/locale/ko')
        return defaultKo
    }
  } catch (error) {
    console.error('Failed to load locale:', error)
    // 폴백으로 undefined 반환 (DatePicker가 기본 로케일 사용)
    return undefined
  }
}

interface Host {
  name: string
  isVerified: boolean
  joinYear: number
  description: string
}

interface BookingSidebarProps {
  price: number
  originalPrice: number
  nights: number
  totalPrice: number
  host: Host
  checkInDate?: Date | null
  checkOutDate?: Date | null
  guests?: number
  onCheckInDateChange?: (date: Date | null) => void
  onCheckOutDateChange?: (date: Date | null) => void
  onGuestsChange?: (guests: number) => void
  roomId?: string
}

export function BookingSidebar({
  price,
  originalPrice,
  nights,
  totalPrice,
  host,
  checkInDate,
  checkOutDate,
  guests = 1,
  onCheckInDateChange,
  onCheckOutDateChange,
  onGuestsChange,
  roomId
}: BookingSidebarProps) {
  const { currentLanguage, currentCurrency, messages } = useLanguage()
  const language = currentLanguage.code
  const currency = currentCurrency.code
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [datePickerLocale, setDatePickerLocale] = useState<any>(undefined)
  const calendarRef = useRef<HTMLDivElement>(null)

  // 로케일 로드
  useEffect(() => {
    const loadLocale = async () => {
      const locale = await getLocale(language)
      setDatePickerLocale(locale)
    }
    loadLocale()
  }, [language])

  // 달력 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        // DatePicker의 내부 요소 클릭인지 확인
        const target = event.target as HTMLElement
        if (!target.closest('.react-datepicker') && !target.closest('.react-datepicker-popper')) {
          setIsCalendarOpen(false)
        }
      }
    }

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCalendarOpen])

  // 날짜 범위 변경 핸들러
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    onCheckInDateChange && onCheckInDateChange(start)
    onCheckOutDateChange && onCheckOutDateChange(end)
    
    // 체크아웃 날짜가 선택되면 달력 닫기
    if (start && end) {
      setIsCalendarOpen(false)
    }
  }

  // 날짜 포맷 함수 (디스플레이용)
  const formatDateRange = () => {
    if (!checkInDate && !checkOutDate) {
      return messages?.roomDetail?.selectDates || 'Select dates...'
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()

      if (language === 'ko') return `${year}년 ${month}월 ${day}일`
      if (language === 'zh') return `${year}年${month}月${day}日`
      if (language === 'fr') return `${day}/${month}/${year}`
      return `${month}/${day}/${year}`
    }

    if (checkInDate && !checkOutDate) {
      return formatDate(checkInDate)
    }

    if (checkInDate && checkOutDate) {
      return `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`
    }

    return ''
  }

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateForAPI = (date: Date | null) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 예약 처리 함수
  const handleReservation = async () => {
    if (!checkInDate || !checkOutDate) {
      alert(messages?.roomDetail?.pleaseSelectDates || '날짜를 선택해주세요')
      return
    }

    setIsReserving(true)

    try {
      // ============================================
      // 1단계: 예약 버튼 클릭 시점의 시간 기록 (한국 시간 기준)
      // ============================================
      const clickTime = new Date() // 버튼 클릭 시점 (로컬 시간)

      // 현재 시간을 한국 시간(KST)으로 정확하게 변환
      // Intl API를 사용하면 시간대 변환 시 더 정확한 결과를 얻을 수 있습니다
      const kstTime = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(clickTime)

      // 스웨덴 형식(ISO-like)을 표준 ISO 형식으로 변환
      const isoKST = kstTime.replace(' ', 'T')
      const requestTime = isoKST


      
      
    

      // apiPostWithResponse를 사용해서 응답 코드 확인 가능
      const { response, data } = await apiPostWithResponse('/api/user/reserve', {
        identifier: roomId || 'unknown-room',
        checkIn: formatDateForAPI(checkInDate),
        checkOut: formatDateForAPI(checkOutDate),
        curUnit: currency,
        requestTime,
        languageCode: language
      })

      if (response.ok && data.code === 200) {
        const reservationId = data.data?.id
        if (reservationId) {
          window.location.href = `/reservation/${reservationId}`
        } else {
          // 예약 ID가 없으면 폴백으로 기존 방식 사용
          const fallbackId = roomId || 'unknown'
          window.location.href = `/reservation/${fallbackId}`
        }
      } else {
        // 에러 처리
        switch (data.code) {
          case 40500:
            alert(messages?.roomDetail?.roomNotFound || (language === 'ko' ? '존재하지 않는 방입니다' :
                                                       language === 'en' ? 'Room not found' :
                                                       language === 'zh' ? '房间不存在' :
                                                       'Chambre introuvable'))
            break
          case 40000:
            alert(messages?.roomDetail?.invalidInput || (language === 'ko' ? '잘못된 값을 입력했습니다' :
                                                       language === 'en' ? 'Invalid input provided' :
                                                       language === 'zh' ? '输入的值无效' :
                                                       'Valeur saisie invalide'))
            break
          case 40501:
            alert(messages?.roomDetail?.alreadyReserved || (language === 'ko' ? '해당 기간에 이미 예약이 존재합니다' :
                                                           language === 'en' ? 'This period is already reserved' :
                                                           language === 'zh' ? '该时间段已被预订' :
                                                           'Cette période est déjà réservée'))
            break
          case 40110:
            alert(messages?.roomDetail?.invalidCurrency || (language === 'ko' ? '잘못된 화폐단위를 입력했습니다' :
                                                           language === 'en' ? 'Invalid currency provided' :
                                                           language === 'zh' ? '货币单位无效' :
                                                           'Devise invalide'))
            break
          case 40300:
            alert(messages?.roomDetail?.exchangeRateNotFound || (language === 'ko' ? '환율정보를 찾을 수 없습니다' :
                                                                language === 'en' ? 'Exchange rate information not found' :
                                                                language === 'zh' ? '找不到汇率信息' :
                                                                'Informations de taux de change introuvables'))
            break
          default:
            alert(messages?.roomDetail?.invalidInput || (language === 'ko' ? '잘못된 값을 입력했습니다' :
                                                       language === 'en' ? 'Invalid input provided' :
                                                       language === 'zh' ? '输入的值无效' :
                                                       'Valeur saisie invalide'))
        }
      }
    } catch (error: any) {
      alert(messages?.roomDetail?.reservationError || (language === 'ko' ? '예약 처리 중 오류가 발생했습니다' :
                                                      language === 'en' ? 'An error occurred while processing the reservation' :
                                                      language === 'zh' ? '预订处理过程中发生错误' :
                                                      'Une erreur s\'est produite lors du traitement de la réservation'))
    } finally {
      setIsReserving(false)
    }
  }

  return (
    <div className="sticky top-24 space-y-6">
      {/* 날짜 및 인원 선택 필드 - Figma 디자인 기반 */}
      <div className="rounded-2xl bg-white border border-[#dee0e3] p-4 shadow-[0px_18px_24px_-5px_rgba(20,21,26,0.1),0px_8px_8px_-5px_rgba(20,21,26,0.05)]">
        <div className="flex gap-4 items-center">
          {/* Schedule (날짜 선택) */}
          <div className="flex-1 flex flex-col gap-2" ref={calendarRef}>
            <label className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
              {messages?.roomDetail?.schedule || 'Schedule'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={formatDateRange()}
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                readOnly
                className="w-full rounded-xl border border-[#dee0e3] bg-white pl-10 pr-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[#14151a] focus:border-[#E91E63] focus:outline-none hover:border-gray-300 cursor-pointer"
                placeholder={messages?.roomDetail?.selectDates || 'Select dates...'}
              />
              
              {isCalendarOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#dee0e3] p-2">
                  <DatePicker
                    selected={checkInDate}
                    onChange={handleDateChange}
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    selectsRange
                    inline
                    locale={datePickerLocale}
                    minDate={new Date()}
                    monthsShown={1}
                    calendarClassName="!border-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* People (인원 선택) */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
              {messages?.roomDetail?.people || 'People'}
            </label>
            <div className="flex items-center gap-0 bg-white border border-[#dee0e3] rounded-full px-0 w-[108px]">
              <button
                onClick={() => onGuestsChange && onGuestsChange(Math.max(1, guests - 1))}
                className="flex items-center justify-center p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={guests <= 1}
              >
                <Minus className="h-5 w-5 text-[#14151a]" />
              </button>
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] text-center w-[28px]">
                {guests}
              </span>
              <button
                onClick={() => onGuestsChange && onGuestsChange(Math.min(1, guests + 1))}
                className="flex items-center justify-center p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={guests >= 1}
              >
                <Plus className="h-5 w-5 text-[#14151a]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 통합 예약 필드 - Figma 디자인 기반 */}
      <div className="rounded-2xl bg-white px-5 py-4 shadow-[0px_18px_24px_-5px_rgba(20,21,26,0.1),0px_8px_8px_-5px_rgba(20,21,26,0.05)]">
        <div className="flex flex-col gap-4">
          {/* 가격 정보 섹션 */}
          <div className="flex flex-col gap-2">
            {/* 가격 라인 */}
            <div className="flex gap-1 items-start">
              <p className="text-[24px] font-bold leading-[32px] tracking-[-0.3px] text-[rgba(13,17,38,0.4)] line-through">
                ₩{originalPrice.toLocaleString()}
              </p>
              <p className="text-[24px] font-bold leading-[32px] tracking-[-0.3px] text-[#14151a] underline">
                ₩{price.toLocaleString()} {messages?.roomDetail?.perNight || 'per night'}
              </p>
            </div>
            
            {/* 총 금액 정보 */}
            <p className="text-[18px] font-medium leading-[26px] tracking-[-0.2px] text-[rgba(13,17,38,0.4)]">
              ₩{totalPrice.toLocaleString()} {messages?.roomDetail?.forNights?.replace('{nights}', nights.toString()) || `for ${nights} nights`}
            </p>
          </div>

          {/* 무료 취소 배지 */}
          <div className="inline-flex items-center justify-center bg-[#fdead8] rounded-lg px-2 py-1 self-start">
            <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#ae590a] px-1">
              {messages?.roomDetail?.freeCancellation || 'Free cancellation'}
            </p>
          </div>

          {/* 버튼 섹션 */}
          <div className="flex flex-col gap-1.5 items-center">
            {/* 저장 버튼 */}
            <Button className="w-full h-10 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none">
              <Image 
                src="/icons/like.png" 
                alt="Like" 
                width={20} 
                height={20}
                className="h-5 w-5"
              />
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                {messages?.roomDetail?.save || 'Save'}
              </span>
            </Button>

            {/* 예약 버튼 */}
            <Button
              className="w-full h-12 rounded-full bg-[#e0004d] hover:bg-[#c2003f] px-4 py-3 shadow-[0px_1px_2px_0px_rgba(20,21,26,0.05)]"
              onClick={handleReservation}
              disabled={isReserving || !checkInDate || !checkOutDate}
            >
              <span className="text-[16px] font-medium leading-[24px] tracking-[-0.2px] text-white">
                {isReserving
                  ? (messages?.common?.loading || '예약 중...')
                  : (messages?.roomDetail?.reserve || 'Reserve')
                }
              </span>
            </Button>

            {/* 안내 텍스트 */}
            <p className="text-[16px] font-medium leading-[24px] tracking-[-0.2px] text-[rgba(13,17,38,0.4)] text-center">
              {messages?.roomDetail?.notChargedYet || 'You won\'t be charged yet'}
            </p>
          </div>
        </div>
      </div>

      {/* 호스트 공유 버튼 - Figma 디자인 기반 */}
      <div className="rounded-3xl bg-white px-5 py-4 flex flex-col gap-2">
        <h3 className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
          {messages?.roomDetail?.shareTitle || 'Share this room with friends'}
        </h3>
        <Button className="w-full h-10 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none">
          <Image 
            src="/icons/share.png" 
            alt="Share" 
            width={20} 
            height={20}
            className="h-5 w-5"
          />
          <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
            {messages?.roomDetail?.shareButton || 'Share this room'}
          </span>
        </Button>
      </div>

      {/* 호스트 정보 - Figma 디자인 기반 */}
      <div className="rounded-3xl bg-white px-5 py-4 flex flex-col gap-2">
        <h3 className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
          {messages?.roomDetail?.hostTitle || 'Host of this room'}
        </h3>
        
        {/* 호스트 프로필 */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative h-20 w-20 rounded-full border border-[#dee0e3] flex-shrink-0">
            <img
              src="/api/placeholder/80/80"
              alt={host.name}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            {host.isVerified && (
              <div className="inline-flex items-center gap-1 bg-[#d1fae4] border border-[rgba(10,15,41,0.08)] rounded-full px-1.5 py-0.5 self-start">
                <ShieldCheck className="h-3.5 w-3.5 text-[#166e3f]" />
                <span className="text-[12px] font-medium leading-[16px] text-[#166e3f]">
                  {messages?.roomDetail?.verifiedHost || 'Verified Host'}
                </span>
              </div>
            )}
            <p className="text-[18px] font-extrabold leading-[26px] tracking-[-0.2px] text-[#14151a] truncate">
              {host.name}
            </p>
            <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
              {messages?.roomDetail?.yearsHosting?.replace('{years}', host.joinYear.toString()) || `${host.joinYear} years hosting`}
            </p>
          </div>
        </div>

        {/* 다른 숙소 보기 버튼 */}
        <Button className="w-full h-10 rounded-xl bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none">
          <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
            {messages?.roomDetail?.showMoreRooms || 'Show more rooms'}
          </span>
        </Button>

        {/* 호스트 설명 */}
        <p className="text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] line-clamp-4 max-h-[96px] overflow-hidden">
          {host.description}
        </p>

        {/* 더 읽어보기 버튼 */}
        <button className="w-full flex items-center justify-center gap-0.5 px-2.5 py-1.5 rounded-full hover:bg-gray-50">
          <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(15,19,36,0.6)]">
            {messages?.roomDetail?.readMore || 'Read more'}
          </span>
          <svg className="h-4 w-4 text-[rgba(15,19,36,0.6)]" fill="none" viewBox="0 0 16 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4l4 4-4 4"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
