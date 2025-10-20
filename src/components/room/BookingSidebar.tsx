"use client"

import { Button } from "@/components/ui/button"
import { Calendar, X } from "lucide-react"
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
  avatar?: string
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
  filterDate?: (date: Date) => boolean
}

/**
 * 체크인/체크아웃 선택 규칙 (사용자 제공 가이드라인):
 *
 * 1. 예약된 기간(reservedDates)은 [checkIn, checkOut) 구간으로 간주하고, 해당 구간은 선택할 수 없음
 *
 * 2. 체크인 선택 규칙:
 *    - 예약된 기간 [checkIn, checkOut) 구간은 선택 불가
 *    - 체크인은 예약이 끝나는 날(checkOut 날짜)이나 예약이 시작하기 전날 이후 날짜만 가능
 *    - 외부 filterDate 함수에서: 선택된 날짜가 다른 예약의 체크아웃 날짜와 같거나 크면 안 됨 (checkIn >= other.checkOut)
 *
 * 3. 체크아웃 선택 규칙:
 *    - 체크인을 선택하기 전에는 체크아웃을 선택할 수 없음
 *    - 체크아웃은 선택된 체크인보다 이후 날짜 중, 다음 예약이 시작하기 전날까지만 선택할 수 있음
 *    - 최소 1박 필수 (체크인 다음날부터 선택 가능)
 *    - 외부 filterDate 함수에서: 해당 날짜가 다른 예약의 체크인 날짜와 같거나 작으면 안 됨 (checkOut <= other.checkIn)
 *    - 체크아웃 날짜와 다른 사용자의 체크인 날짜가 겹치는 것은 허용하지만, 예약 기간이 겹치는 것은 허용하지 않음
 *
 * 4. UI 동작:
 *    - 예약된 날짜를 비활성화 표시
 *    - 체크인 선택 후 가능한 체크아웃 날짜만 활성화
 *    - 체크인 미선택 시 체크아웃 섹션 전체 비활성화
 *
 * 5. 모든 비교는 LocalDate 단위로 처리하고, [checkIn, checkOut) 규칙을 준수
 */

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
  roomId,
  filterDate
}: BookingSidebarProps) {
  const { currentLanguage, messages } = useLanguage()
  const language = currentLanguage.code
  const currency = 'USD' // 항상 USD로 고정
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

  // 체크인 날짜 변경 핸들러
  const handleCheckInChange = (date: Date | null) => {
    onCheckInDateChange && onCheckInDateChange(date)

    // 체크인을 선택하지 않으면 체크아웃 초기화
    if (!date) {
      onCheckOutDateChange && onCheckOutDateChange(null)
      return
    }

    // 체크인 날짜가 체크아웃 날짜보다 늦으면 체크아웃 초기화
    if (checkOutDate && date >= checkOutDate) {
      onCheckOutDateChange && onCheckOutDateChange(null)
    }
  }

  // 체크아웃 날짜 변경 핸들러
  const handleCheckOutChange = (date: Date | null) => {
    // 체크인이 선택되지 않으면 체크아웃 선택 불가
    if (!checkInDate) {
      return
    }

    onCheckOutDateChange && onCheckOutDateChange(date)
  }

  // 날짜 포맷 함수 (디스플레이용)
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    if (language === 'ko') return `${year}년 ${month}월 ${day}일`
    if (language === 'zh') return `${year}年${month}月${day}日`
    if (language === 'fr') return `${day}/${month}/${year}`
    return `${month}/${day}/${year}`
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
        <div className="flex flex-col gap-4">
          {/* Schedule Label */}
          <label className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
            {messages?.roomDetail?.schedule || 'Schedule'}
          </label>

          {/* 체크인/체크아웃 한 줄 배치 */}
          <div className="flex gap-3 items-end">
            {/* Check-in (체크인 날짜 선택) */}
            <div className="flex-1 flex flex-col gap-2" ref={calendarRef}>
              <label className="text-[12px] font-normal leading-[16px] tracking-[-0.1px] text-[rgba(13,17,38,0.6)]">
                {messages?.roomDetail?.checkIn || 'Check-in'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={checkInDate ? formatDate(checkInDate) : ''}
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  readOnly
                  className="w-full rounded-xl border border-[#dee0e3] bg-white pl-10 pr-10 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[#14151a] focus:border-[#E91E63] focus:outline-none hover:border-gray-300 cursor-pointer"
                  placeholder="Select..."
                />
                {checkInDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCheckInDateChange && onCheckInDateChange(null)
                      onCheckOutDateChange && onCheckOutDateChange(null)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {isCalendarOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#dee0e3] p-4">
                    <div className="mb-3 text-sm font-semibold text-[#14151a]">
                      {messages?.roomDetail?.checkIn || 'Check-in'}
                    </div>
                    <DatePicker
                      selected={checkInDate}
                      onChange={handleCheckInChange}
                      inline
                      locale={datePickerLocale}
                      minDate={new Date()}
                      monthsShown={1}
                      calendarClassName="!border-none"
                      filterDate={(date) => {
                        // 체크인 선택 시 필터링 로직:
                        // - 예약된 기간 [checkIn, checkOut) 구간은 선택 불가
                        // - 체크인은 예약이 끝나는 날(checkOut 날짜)이나 예약이 시작하기 전날 이후 날짜만 가능
                        // - 외부 filterDate 함수에서 다음 로직 구현 필요:
                        //   * 선택된 날짜가 다른 예약의 체크아웃 날짜와 같거나 크면 안 됨 (checkIn >= other.checkOut)
                        //
                        // 예시: 기존 예약 [2025-12-26, 2025-12-27)
                        // - 2025-12-26: 선택 불가 (예약된 기간)
                        // - 2025-12-27: 선택 불가 (예약된 기간)
                        // - 2025-12-28: 선택 가능 (예약 종료 다음날)
                        if (filterDate) {
                          return filterDate(date)
                        }
                        return true
                      }}
                    />

                    <div className={`mt-4 mb-3 text-sm font-semibold ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-[#14151a]'}`}>
                      {messages?.roomDetail?.checkOut || 'Check-out'}
                    </div>
                    <div className={!checkInDate ? 'opacity-50 pointer-events-none' : ''}>
                      <DatePicker
                        selected={checkOutDate}
                        onChange={handleCheckOutChange}
                        inline
                        locale={datePickerLocale}
                        minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date()}
                        monthsShown={1}
                        calendarClassName="!border-none"
                        filterDate={(date) => {
                          // 체크인이 선택되지 않으면 모든 날짜 비활성화
                          if (!checkInDate) {
                            return false
                          }

                          // 체크인 날짜와 같은 날은 선택 불가 (당일 체크아웃 불가)
                          if (date.getTime() === checkInDate.getTime()) {
                            return false
                          }

                          // 체크인 다음날부터 선택 가능 (최소 1박 필수)
                          const nextDay = new Date(checkInDate.getTime() + 86400000)
                          if (date < nextDay) {
                            return false
                          }

                          // 외부에서 제공된 filterDate 함수 적용 (예약된 날짜 필터링)
                          // 체크아웃 선택 시 다음 로직 구현 필요:
                          // - 해당 날짜가 다른 예약의 체크인 날짜와 같거나 작으면 안 됨 (checkOut <= other.checkIn)
                          // - 이는 예약 기간 [checkIn, checkOut)이 겹치지 않도록 하기 위함
                          // - 체크아웃 날짜와 다른 사용자의 체크인 날짜가 겹치는 것은 허용됨
                          //
                          // 예시: 기존 예약 [2025-12-26, 2025-12-27)
                          // - 체크인 2025-12-26 선택 시:
                          //   * 체크아웃 2025-12-27: 선택 불가 (기존 예약 체크인과 같음)
                          //   * 체크아웃 2025-12-28: 선택 가능 (기존 예약 체크인보다 큼)
                          if (filterDate) {
                            return filterDate(date)
                          }

                          return true
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Check-out (체크아웃 날짜 표시) */}
            <div className="flex-1 flex flex-col gap-2">
              <label className={`text-[12px] font-normal leading-[16px] tracking-[-0.1px] ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-[rgba(13,17,38,0.6)]'}`}>
                {messages?.roomDetail?.checkOut || 'Check-out'}
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10 ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={checkOutDate ? formatDate(checkOutDate) : ''}
                  onClick={() => checkInDate && setIsCalendarOpen(!isCalendarOpen)}
                  readOnly
                  disabled={!checkInDate}
                  className={`w-full rounded-xl border pl-10 pr-10 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] ${!checkInDate
                    ? 'bg-gray-50 text-[rgba(13,17,38,0.3)] border-gray-200 cursor-not-allowed'
                    : 'bg-white text-[#14151a] border-[#dee0e3] focus:border-[#E91E63] focus:outline-none hover:border-gray-300 cursor-pointer'
                  }`}
                  placeholder="Select..."
                />
                {checkOutDate && checkInDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCheckOutDateChange && onCheckOutDateChange(null)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
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
              <p className="text-[24px] font-bold leading-[32px] tracking-[-0.3px] text-[#14151a]">
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
              src={host.avatar || "/api/placeholder/80/80"}
              alt={host.name}
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/api/placeholder/80/80'
              }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
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
