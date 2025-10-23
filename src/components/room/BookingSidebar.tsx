"use client"

import { Button } from "@/components/ui/button"
import { Calendar, X } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/language-provider"
import { apiPostWithResponse, apiPost } from "@/lib/api"
import { toast } from "sonner"
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
  filterCheckInDate?: (date: Date) => boolean
  filterCheckOutDate?: (date: Date) => boolean
  roomLikeCheck?: boolean
}

/**
 * 체크인/체크아웃 선택 규칙:
 *
 * 1. 예약된 기간(reservedDates)은 [checkIn, checkOut) 구간으로 간주
 *
 * 2. 체크인 선택 규칙:
 *    - 예약된 기간 [checkIn, checkOut) 구간은 선택 불가
 *    - 다른 예약의 체크아웃 날짜는 체크인 선택 가능 (예: 다른 예약이 10-20 ~ 10-25라면, 10-25에 체크인 가능)
 *    - 다른 예약의 체크인 날짜는 체크인 선택 불가 (예: 10-20에는 체크인 불가)
 *
 * 3. 체크아웃 선택 규칙:
 *    - 체크인을 선택하기 전에는 체크아웃을 선택할 수 없음
 *    - 다음 예약의 체크인 날짜까지 체크아웃 선택 가능 (예: 다른 예약이 10-20 ~ 10-25라면, 내가 10-18에 체크인했을 때 10-20까지 체크아웃 가능)
 *    - 최소 1박 필수 (체크인 다음날부터 선택 가능)
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
  filterCheckInDate,
  filterCheckOutDate,
  roomLikeCheck = false
}: BookingSidebarProps) {
  const { currentLanguage, messages } = useLanguage()
  const language = currentLanguage.code
  const currency = 'USD' // 항상 USD로 고정
  const [isCheckInCalendarOpen, setIsCheckInCalendarOpen] = useState(false)
  const [isCheckOutCalendarOpen, setIsCheckOutCalendarOpen] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [datePickerLocale, setDatePickerLocale] = useState<any>(undefined)
  const [isLiked, setIsLiked] = useState(roomLikeCheck)
  const calendarRef = useRef<HTMLDivElement>(null)

  // 숙박일수 계산
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // 총 금액 계산
  const calculateTotalPrice = () => {
    const nightsCount = calculateNights()
    return nightsCount * price
  }

  const calculatedNights = calculateNights()
  const calculatedTotalPrice = calculateTotalPrice()

  // roomLikeCheck prop이 변경되면 isLiked 상태 업데이트
  useEffect(() => {
    setIsLiked(roomLikeCheck)
  }, [roomLikeCheck])

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
          setIsCheckInCalendarOpen(false)
          setIsCheckOutCalendarOpen(false)
        }
      }
    }

    if (isCheckInCalendarOpen || isCheckOutCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCheckInCalendarOpen, isCheckOutCalendarOpen])

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

  // 좋아요 토글 함수 (낙관적 업데이트)
  const handleToggleLike = async () => {
    // 낙관적 업데이트: 먼저 UI 업데이트
    setIsLiked(prev => !prev)

    try {
      const response = await apiPost(`/api/user/like?roomIdentifier=${roomId}`)
      
      // 응답 코드가 200이 아닌 경우 롤백
      if (response.code !== 200) {
        setIsLiked(prev => !prev)
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
      // 에러 발생 시 롤백
      setIsLiked(prev => !prev)
    }
  }

  // 링크 공유 함수
  const handleShareLink = async () => {
    try {
      const currentUrl = window.location.href
      await navigator.clipboard.writeText(currentUrl)

      // 성공 메시지 alert로 표시
      alert(messages?.roomDetail?.shareSuccess || 
        (language === 'ko' ? '링크가 클립보드에 복사되었습니다!' :
         language === 'en' ? 'Link copied to clipboard!' :
         language === 'zh' ? '链接已复制到剪贴板!' :
         'Lien copié dans le presse-papiers!'))
    } catch (error) {
      console.error('링크 복사 실패:', error)
      alert(messages?.roomDetail?.shareError || 
        (language === 'ko' ? '링크 복사에 실패했습니다' :
         language === 'en' ? 'Failed to copy link' :
         language === 'zh' ? '复制链接失败' :
         'Échec de la copie du lien'))
    }
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

          {/* 체크인/체크아웃 가로 배치 */}
          <div className="grid grid-cols-2 gap-3">
            {/* Check-in (체크인 날짜 선택) */}
            <div className="flex flex-col gap-2" ref={calendarRef}>
              <label className="text-[12px] font-normal leading-[16px] tracking-[-0.1px] text-[rgba(13,17,38,0.6)]">
                {messages?.roomDetail?.checkIn || 'Check-in'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={checkInDate ? formatDate(checkInDate) : ''}
                  onClick={() => {
                    setIsCheckInCalendarOpen(!isCheckInCalendarOpen)
                    setIsCheckOutCalendarOpen(false) // 체크인 달력을 열 때 체크아웃 달력 닫기
                  }}
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

                {isCheckInCalendarOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#dee0e3] p-4 w-[280px]">
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
                        // 체크인 전용 필터링 로직
                        if (filterCheckInDate) {
                          return filterCheckInDate(date)
                        }
                        return true
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Check-out (체크아웃 날짜 선택) */}
            <div className="flex flex-col gap-2">
              <label className={`text-[12px] font-normal leading-[16px] tracking-[-0.1px] ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-[rgba(13,17,38,0.6)]'}`}>
                {messages?.roomDetail?.checkOut || 'Check-out'}
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10 ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={checkOutDate ? formatDate(checkOutDate) : ''}
                  onClick={() => checkInDate && (setIsCheckOutCalendarOpen(!isCheckOutCalendarOpen), setIsCheckInCalendarOpen(false))}
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

                {isCheckOutCalendarOpen && checkInDate && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#dee0e3] p-4 w-[280px]">
                    <div className="mb-3 text-sm font-semibold text-[#14151a]">
                      {messages?.roomDetail?.checkOut || 'Check-out'}
                    </div>
                    <DatePicker
                      selected={checkOutDate}
                      onChange={handleCheckOutChange}
                      inline
                      locale={datePickerLocale}
                      minDate={new Date(checkInDate.getTime() + 86400000)}
                      monthsShown={1}
                      calendarClassName="!border-none"
                      filterDate={(date) => {
                        // 체크아웃 전용 필터링 로직
                        if (filterCheckOutDate) {
                          return filterCheckOutDate(date)
                        }
                        return false
                      }}
                    />
                  </div>
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
                ${price.toLocaleString()} {messages?.roomDetail?.perNight || 'per night'}
              </p>
            </div>
            
            {/* 총 금액 정보 - 동적 계산 */}
            {calculatedNights > 0 && (
              <p className="text-[18px] font-medium leading-[26px] tracking-[-0.2px] text-[rgba(13,17,38,0.4)]">
                ${calculatedTotalPrice.toLocaleString()} {messages?.roomDetail?.forNights?.replace('{nights}', calculatedNights.toString()) || `for ${calculatedNights} nights`}
              </p>
            )}
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
            <Button 
              className="w-full h-10 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none"
              onClick={handleToggleLike}
            >
              {isLiked ? (
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z" 
                    fill="#e0004d"
                  />
                </svg>
              ) : (
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415ZM3.31033 3.14332C2.06866 4.38498 2.00616 6.37248 3.15033 7.68582L9.00033 13.545L14.8503 7.68665C15.9953 6.37248 15.9328 4.38748 14.6895 3.14165C13.4503 1.89998 11.4553 1.83998 10.1453 2.98665L6.64366 6.48915L5.4645 5.31082L7.81866 2.95498L7.75033 2.89748C6.43783 1.84332 4.5195 1.93332 3.31033 3.14332V3.14332Z" 
                    fill="#0F1324" 
                    fillOpacity="0.6"
                  />
                </svg>
              )}
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
        <Button
          className="w-full h-10 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none"
          onClick={handleShareLink}
        >
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
        <p className="text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a]">
          {host.description}
        </p>
      </div>
    </div>
  )
}
