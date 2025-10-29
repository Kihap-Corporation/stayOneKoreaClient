"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ReservationHeader } from "@/components/reservation-header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Wifi, Waves, ParkingCircle, Wind, Flame, Radio, ChevronRight, Info, Clock } from "lucide-react"
import { apiGet, apiDelete, apiPost } from "@/lib/api"
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

// Facility icon mapping
const facilityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  washingMachine: <Waves className="h-5 w-5" />,
  parking: <ParkingCircle className="h-5 w-5" />,
  airConditioning: <Wind className="h-5 w-5" />,
  smokeAlarm: <Flame className="h-5 w-5" />,
  carbonMonoxideAlarm: <Radio className="h-5 w-5" />
}

interface RoomFacility {
  facilityType: string
  nameI18n?: {
    [key: string]: string
  }
  customNameI18n?: {
    [key: string]: string
  }
  iconUrl?: string
}

interface ReservationAPIResponse {
  reservationIdentifier: string
  checkInDate: string
  checkOutDate: string
  totalNights: number
  roomDailyPrice: number
  totalPrice: number
  startToReserve: string
  endToReserve: string
  reservationStatus: string
  curUnit: string
  roomName: string
  roomIdentifier: string
  residenceName: string
  residenceAddress: string
  residenceLatitude: number
  residenceLongitude: number
  roomImageUrl: string
  roomFacilities: RoomFacility[]
  roomRules: string
  userFirstName: string
  userLastName: string
  userEmail: string
  userPhoneNumber: string
  userCountryCode: string
}

interface ReservationData {
  room: {
    id: string
    title: string
    propertyName: string
    location: string
    image: string
    pricePerNight: number
  }
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  facilities: RoomFacility[]
  rules: string
  totalPrice: number
}

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const { messages, currentLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)
  
  // Timer state - 서버에서 받은 endToReserve 시간 기준으로 계산
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [endToReserveTime, setEndToReserveTime] = useState<Date | null>(null)
  
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+82")
  
  // Consent checkboxes (사용자 상호작용 가능)
  const [consentAll, setConsentAll] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentThirdParty, setConsentThirdParty] = useState(false)

  // Expanded sections
  const [showAllFacilities, setShowAllFacilities] = useState(false)
  const [showMoreRules, setShowMoreRules] = useState(false)

  // 예약 정보 조회 및 타이머 설정
  useEffect(() => {
    const initializeReservation = async () => {
      
      // API에서 예약 정보 가져오기
      try {
        const languageCode = currentLanguage.code
        
        
        const response = await apiGet(
          `/api/user/reserve/page/${params.reservationId}?languageCode=${languageCode}`
        ) 
        
        if (response.code === 200 && response.data) {
          const apiData: ReservationAPIResponse = response.data
          
          // ============================================
          // 1단계: reservationStatus 검증
          // ============================================
          // RESERVATION_UNDER_WAY 상태만 허용
          if (apiData.reservationStatus !== 'RESERVATION_UNDER_WAY') {
            const errorMessage = currentLanguage.code === 'ko'
              ? '예약 가능한 상태가 아닙니다'
              : currentLanguage.code === 'en'
              ? 'Reservation is not available'
              : currentLanguage.code === 'zh'
              ? '预订不可用'
              : 'Réservation non disponible'
            
            alert(messages?.reservation?.reservationNotAvailable || errorMessage)
            router.push('/')
            return
          }
          
          // ============================================
          // 2단계: endToReserve 시간 검증 (한국 시간 기준)
          // ============================================
          // 서버에서 받은 시간 (KST 기준)
          const serverEndTime = new Date(apiData.endToReserve)

          // 현재 시간을 한국 시간(KST)으로 변환
          // Intl API를 사용하면 시간대 변환 시 더 정확한 결과를 얻을 수 있습니다
          const now = new Date()
          const kstTime = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).format(now)

          // 스웨덴 형식(ISO-like)을 표준 ISO 형식으로 변환
          const isoKST = kstTime.replace(' ', 'T')


          // 현재 한국 시간이 예약 종료 시간을 넘어간 경우 차단
          if (new Date(isoKST) > serverEndTime) {
            alert(messages?.reservation?.timeExpired || "예약 가능 시간이 만료되었습니다.")
            router.push('/')
            return
          }

          // 남은 시간 계산 (초 단위)
          const remainingSeconds = Math.floor((serverEndTime.getTime() - new Date(isoKST).getTime()) / 1000)

          setEndToReserveTime(serverEndTime)
          setTimeRemaining(remainingSeconds)
          
          // API 응답을 화면 데이터 형식으로 변환
          const transformedData: ReservationData = {
            room: {
              id: apiData.roomIdentifier,
              title: apiData.roomName,
              propertyName: apiData.residenceName,
              location: apiData.residenceAddress,
              image: apiData.roomImageUrl,
              pricePerNight: apiData.roomDailyPrice
            },
            checkIn: apiData.checkInDate,
            checkOut: apiData.checkOutDate,
            nights: apiData.totalNights,
            guests: 1, // 기본값
            facilities: apiData.roomFacilities,
            rules: apiData.roomRules,
            totalPrice: apiData.totalPrice
          }
          
          // 폼 필드에 사용자 정보 자동 입력
          setFirstName(apiData.userFirstName || "")
          setLastName(apiData.userLastName || "")
          setEmail(apiData.userEmail || "")
          setPhoneNumber(apiData.userPhoneNumber || "")
          setCountryCode(apiData.userCountryCode || "+82")
          
          setReservationData(transformedData)
        } else if (response.code === 40500) {
          // 존재하지 않는 방
          const errorMessage = currentLanguage.code === 'ko' 
            ? '존재하지 않는 방입니다'
            : currentLanguage.code === 'en'
            ? 'Room not found'
            : currentLanguage.code === 'zh'
            ? '房间不存在'
            : 'Chambre introuvable'
          
          alert(messages?.reservation?.roomNotFound || errorMessage)
          router.push('/')
          return
        } else {
          // 그 외 에러
          const errorMessage = currentLanguage.code === 'ko'
            ? '잘못된 입력을 했습니다'
            : currentLanguage.code === 'en'
            ? 'Invalid input provided'
            : currentLanguage.code === 'zh'
            ? '输入的值无效'
            : 'Valeur saisie invalide'
          
          alert(messages?.reservation?.invalidInput || errorMessage)
          router.push('/')
          return
        }
      } catch (error) {
        const errorMessage = currentLanguage.code === 'ko'
          ? '예약 정보를 불러오는 중 오류가 발생했습니다'
          : currentLanguage.code === 'en'
          ? 'Failed to load reservation information'
          : currentLanguage.code === 'zh'
          ? '加载预订信息失败'
          : 'Échec du chargement des informations de réservation'
        
        alert(messages?.reservation?.loadError || errorMessage)
        router.push('/')
        return
      } finally {
        setLoading(false)
      }
    }
    
    initializeReservation()
  }, [params, router, messages, currentLanguage])

  // 타이머 카운트다운 - 서버 종료 시간 기준으로 실시간 계산
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || !endToReserveTime) return

    const timer = setInterval(() => {
      // 현재 시간을 한국 시간(KST)으로 변환
      const now = new Date()
      const kstTime = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now)

      const isoKST = kstTime.replace(' ', 'T')

      // 남은 시간 계산 (초 단위)
      const remaining = Math.floor((endToReserveTime.getTime() - new Date(isoKST).getTime()) / 1000)
      const newTimeRemaining = Math.max(0, remaining)


      if (newTimeRemaining <= 0) {
        clearInterval(timer)
        // 시간 만료 시 홈으로 리다이렉트
        alert(messages?.reservation?.timeExpired || "예약 가능 시간이 만료되었습니다.")
        router.push('/')
        return
      }

      setTimeRemaining(newTimeRemaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, endToReserveTime, params.reservationId, router, messages])

  // 타이머 포맷 함수 (HH:MM:SS)
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 체크박스 핸들러 함수들
  const handleConsentAllChange = (checked: boolean) => {
    setConsentAll(checked)
    setConsentTerms(checked)
    setConsentPrivacy(checked)
    setConsentThirdParty(checked)
  }

  const handleConsentTermsChange = (checked: boolean) => {
    setConsentTerms(checked)
    updateConsentAllState()
  }

  const handleConsentPrivacyChange = (checked: boolean) => {
    setConsentPrivacy(checked)
    updateConsentAllState()
  }

  const handleConsentThirdPartyChange = (checked: boolean) => {
    setConsentThirdParty(checked)
    updateConsentAllState()
  }

  const updateConsentAllState = () => {
    const allChecked = consentTerms && consentPrivacy && consentThirdParty
    setConsentAll(allChecked)
  }


  const handleSubmit = () => {
    // 동의 체크박스 검증
    if (!consentAll || !consentTerms || !consentPrivacy || !consentThirdParty) {
      alert(messages?.reservation?.consentRequired || "모든 동의사항에 체크해주세요.")
      return
    }

    // 검증 통과 시 결제 페이지로 이동 (DY 분기)
    router.push(`/payment-dy/${params.reservationId}`)
  }

  const handleCancel = async () => {
    // 취소 확인 모달
    const confirmed = window.confirm(
      messages?.reservation?.cancelConfirmModal ||
      "예약을 취소하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다."
    )

    if (!confirmed) return

    try {
      const response = await apiDelete(`/api/user/reserve/${params.reservationId}`)

      if (response.code === 200) {
        // 취소 성공
        alert(messages?.reservation?.cancelSuccess || "예약이 취소되었습니다.")
        router.push('/')
      } else if (response.code === 40500) {
        // 방 존재하지 않음
        alert(messages?.reservation?.roomNotFound || "존재하지 않는 방입니다.")
      } else if (response.code === 40502) {
        // 삭제 불가능
        alert(messages?.reservation?.cancelNotAllowed || "해당 예약은 취소가 불가능합니다.")
      } else if (response.code === 40103) {
        // 유저 존재하지 않음
        alert(messages?.reservation?.userNotFound || "존재하지 않는 사용자입니다.")
        // 강제 로그아웃 및 리다이렉트
        try {
          await apiPost('/api/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        }
        router.push('/account_check')
      } else {
        // 그 외 에러
        alert(messages?.reservation?.invalidInput || "잘못된 입력을 했습니다.")
      }
    } catch (error) {
      console.error('Cancel reservation error:', error)
      alert(messages?.reservation?.cancelError || "예약 취소 중 오류가 발생했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <ReservationHeader currentStep={1} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!reservationData || timeRemaining === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <ReservationHeader currentStep={1} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.error || "Error loading reservation"}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }


  const displayFacilities = showAllFacilities ? reservationData.facilities : reservationData.facilities.slice(0, 6)
  
  // Rules를 줄 단위로 자르기 (약 4줄 기준: 한 줄당 약 50자 가정 = 200자)
  const getRulesPreview = (text: string, maxLines: number = 4) => {
    const lines = text.split('\n')
    if (lines.length <= maxLines) {
      return text
    }
    return lines.slice(0, maxLines).join('\n')
  }
  
  const displayRules = showMoreRules ? reservationData.rules : getRulesPreview(reservationData.rules, 4)
  const shouldShowMoreButton = reservationData.rules.split('\n').length > 4
  
  // Facility 이름 가져오기 (다국어 지원)
  const getFacilityName = (facility: RoomFacility) => {
    const languageCode = currentLanguage.code === 'ko' ? 'ko' : currentLanguage.code
    return facility.nameI18n?.[languageCode] || facility.customNameI18n?.[languageCode] || facility.facilityType
  }
  
  // Facility 아이콘 가져오기 (iconUrl 우선, 없으면 로컬 아이콘 사용)
  const getFacilityIcon = (facility: RoomFacility) => {
    const typeMap: Record<string, string> = {
      'WIFI': 'wifi',
      'WASHING_MACHINE': 'washingMachine',
      'PARKING': 'parking',
      'AIR_CONDITIONING': 'airConditioning',
      'SMOKE_ALARM': 'smokeAlarm',
      'CARBON_MONOXIDE_ALARM': 'carbonMonoxideAlarm'
    }
    return facilityIcons[typeMap[facility.facilityType]] || facilityIcons['wifi']
  }
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return {
      weekday: weekdays[date.getDay()],
      month: months[date.getMonth()],
      day: date.getDate().toString().padStart(2, '0'),
      year: date.getFullYear().toString()
    }
  }
  
  const checkInFormatted = formatDate(reservationData.checkIn)
  const checkOutFormatted = formatDate(reservationData.checkOut)

  return (
    <div className="flex min-h-screen flex-col">
      <ReservationHeader currentStep={1} />
      
      {/* Timer Banner - 가격 보장 타이머 */}
      <div className="bg-[#fce5e4] py-1">
        <div className="mx-auto max-w-7xl xl:max-w-[1200px] px-4 flex items-center justify-center gap-2">
          <p className="text-base font-medium text-[#9a1c13] tracking-[-0.2px]">
            {messages?.reservation?.priceGuaranteed || "This price is guaranteed for"}
          </p>
          <div className="flex items-center gap-0.5">
            <Clock className="h-[18px] w-[18px] text-[#e6483d]" />
            <p className="text-base font-extrabold text-[#e6483d] tracking-[-0.2px]">
              {formatTimer(timeRemaining)}
            </p>
          </div>
        </div>
      </div>
      
      <main className="flex-1 bg-[#f7f7f8] py-4 lg:py-10 px-4">
        <div className="mx-auto max-w-7xl xl:max-w-[1200px]">
          {/* Booking Summary - 모바일 (상단에 표시) */}
          <div className="lg:hidden mb-4">
            {/* Room Card */}
            <div className="bg-white border border-[#dee0e3] rounded-[16px] overflow-hidden mb-4">
              <div className="h-[200px] relative">
                <img
                  src={reservationData.room.image}
                  alt={reservationData.room.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-0 tracking-[-0.2px]">{reservationData.room.title}</h3>
                <p className="text-lg text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.2px]">{reservationData.room.propertyName}</p>
                <p className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">{reservationData.room.location}</p>
              </div>
            </div>

            {/* Dates Card */}
            <div className="bg-white border border-[#dee0e3] rounded-[16px] p-5 flex items-center justify-between mb-4">
              <div className="flex gap-2 items-center">
                <div className="w-[116px]">
                  <p className="text-sm text-[#14151a] font-medium mb-1 tracking-[-0.1px]">
                    {messages?.reservation?.checkIn || "Check-in"}
                  </p>
                  <p className="text-base font-bold tracking-[-0.2px]">
                    {checkInFormatted.weekday}, {checkInFormatted.month} {checkInFormatted.day}
                  </p>
                  <p className="text-xs text-[rgba(13,17,38,0.4)] font-medium">{checkInFormatted.year}</p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-400" />
                
                <div className="w-[116px]">
                  <p className="text-sm text-[#14151a] font-medium mb-1 tracking-[-0.1px]">
                    {messages?.reservation?.checkOut || "Check-out"}
                  </p>
                  <p className="text-base font-bold tracking-[-0.2px]">
                    {checkOutFormatted.weekday}, {checkOutFormatted.month} {checkOutFormatted.day}
                  </p>
                  <p className="text-xs text-[rgba(13,17,38,0.4)] font-medium">{checkOutFormatted.year}</p>
                </div>
              </div>
              
              <div className="bg-[#f7f7f8] rounded-xl w-16 h-16 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-extrabold tracking-[-0.2px]">{reservationData.nights}</p>
                <p className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                  {messages?.reservation?.nights || "nights"}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="bg-white rounded-[16px] p-5">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.roomPricePerNight || "Room price per night"}
                  </span>
                  <span className="font-medium tracking-[-0.1px]">
                    ${reservationData.room.pricePerNight.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.nightsCount?.replace("{count}", String(reservationData.nights)) || `× ${reservationData.nights} nights`}
                  </span>
                  <span className="font-medium tracking-[-0.1px]">
                    {messages?.reservation?.nightsCount?.replace("{count}", String(reservationData.nights)) || `× ${reservationData.nights} nights`}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.roomCount?.replace("{count}", "1") || "× 1 room"}
                  </span>
                  <span className="font-medium tracking-[-0.1px]">
                    {messages?.reservation?.roomCount?.replace("{count}", "1") || "× 1 room"}
                  </span>
                </div>
                
                <div className="flex justify-between mb-4 text-sm text-[#26bd6c]">
                  <span className="font-medium tracking-[-0.1px]">
                    {messages?.reservation?.bookingFees || "Booking fees"}
                  </span>
                  <span className="font-medium tracking-[-0.1px]">
                    {messages?.reservation?.free || "FREE"}
                  </span>
                </div>
                
                <div className="border-t border-[#e9eaec] pt-2 mb-2" />
                
                <div className="flex justify-between text-base">
                  <span className="font-extrabold tracking-[-0.2px]">
                    {messages?.reservation?.price || "Price"}
                  </span>
                  <span className="font-extrabold tracking-[-0.2px] underline">
                    ${reservationData.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-[rgba(10,15,41,0.25)] font-medium">
                <p className="mb-1">{messages?.reservation?.includedInPrice || "Included in price: Tax 10%"}</p>
                <p>
                  {messages?.reservation?.currencyNote || "Your currency selections affect the prices"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Left Column - Form Sections */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Facilities Section - 모바일 */}
              <div className="lg:hidden bg-white rounded-[24px] p-5">
                <h2 className="text-base font-bold mb-4 tracking-[-0.2px]">
                  {messages?.reservation?.facilities || "Facilities"}
                </h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {displayFacilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-1 text-sm">
                      {facility.iconUrl ? (
                        <img
                          src={facility.iconUrl}
                          alt={getFacilityName(facility)}
                          className="h-5 w-5 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        getFacilityIcon(facility)
                      )}
                      <span className="font-medium tracking-[-0.2px]">{getFacilityName(facility)}</span>
                    </div>
                  ))}
                </div>
                {reservationData.facilities.length > 6 && (
                  <Button
                    variant="ghost"
                    className="w-full bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] rounded-[10px] text-sm font-medium px-[10px] py-[6px]"
                    onClick={() => setShowAllFacilities(!showAllFacilities)}
                  >
                    {showAllFacilities 
                      ? messages?.common?.close || "Close"
                      : messages?.reservation?.showAllFacilities?.replace("{count}", String(reservationData.facilities.length)) || `Show all ${reservationData.facilities.length} facilities`
                    }
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Facilities Section - 데스크톱 */}
              <div className="hidden lg:block bg-white rounded-[24px] p-5">
                <h2 className="text-base font-bold mb-4 tracking-[-0.2px]">
                  {messages?.reservation?.facilities || "Facilities"}
                </h2>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {displayFacilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-1 text-sm">
                      {facility.iconUrl ? (
                        <img
                          src={facility.iconUrl}
                          alt={getFacilityName(facility)}
                          className="h-5 w-5 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        getFacilityIcon(facility)
                      )}
                      <span className="font-medium tracking-[-0.2px]">{getFacilityName(facility)}</span>
                    </div>
                  ))}
                </div>
                {reservationData.facilities.length > 6 && (
                  <Button
                    variant="ghost"
                    className="w-full bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] rounded-[10px] text-sm font-medium px-[10px] py-[6px]"
                    onClick={() => setShowAllFacilities(!showAllFacilities)}
                  >
                    {showAllFacilities 
                      ? messages?.common?.close || "Close"
                      : messages?.reservation?.showAllFacilities?.replace("{count}", String(reservationData.facilities.length)) || `Show all ${reservationData.facilities.length} facilities`
                    }
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Rules Section */}
              <div className="bg-white rounded-[24px] p-5">
                <h2 className="text-base font-bold mb-2 tracking-[-0.2px]">
                  {messages?.reservation?.rules || "Rules"}
                </h2>
                <p className="text-base text-[#14151a] mb-4 whitespace-pre-wrap tracking-[-0.2px]">
                  {displayRules}
                </p>
                {shouldShowMoreButton && (
                  <Button
                    variant="ghost"
                    className="bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] rounded-full px-[10px] py-[6px] text-sm font-medium"
                    onClick={() => setShowMoreRules(!showMoreRules)}
                  >
                    {showMoreRules 
                      ? messages?.common?.close || "Close"
                      : messages?.reservation?.showMore || "Show more"
                    }
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Lead Guest Section */}
              <div className="bg-white rounded-[24px] p-5">
                <h2 className="text-base font-bold mb-4 tracking-[-0.2px]">
                  {messages?.reservation?.leadGuest || "Who's the lead guest?"}
                </h2>
                
                {/* Name Fields */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block tracking-[-0.1px]">
                      {messages?.reservation?.firstName || "First name"} <span className="text-[#e6483d]">*</span>
                    </label>
                    <Input
                      value={firstName}
                      disabled
                      placeholder={messages?.reservation?.firstNamePlaceholder || "First name"}
                      className="rounded-xl bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block tracking-[-0.1px]">
                      {messages?.reservation?.lastName || "Last name"} <span className="text-[#e6483d]">*</span>
                    </label>
                    <Input
                      value={lastName}
                      disabled
                      placeholder={messages?.reservation?.lastNamePlaceholder || "Last name"}
                      className="rounded-xl bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email and Country */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block tracking-[-0.1px]">
                      {messages?.reservation?.email || "Email"} <span className="text-[#e6483d]">*</span>
                    </label>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      placeholder={messages?.reservation?.emailPlaceholder || "email@email.com"}
                      className="rounded-xl bg-gray-50 cursor-not-allowed"
                    />
                    <div className="flex gap-1 mt-2 text-xs text-[rgba(10,15,41,0.25)]">
                      <Info className="h-4 w-4 shrink-0" />
                      <p className="tracking-[0px]">{messages?.reservation?.emailHelper || "Please make sure your email address is correct."}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block tracking-[-0.1px]">
                      {messages?.reservation?.countryRegion || "Country/region"} <span className="text-[#e6483d]">*</span>
                    </label>
                    <Input
                      value={countryCode}
                      disabled
                      placeholder={messages?.reservation?.selectPlaceholder || "Select..."}
                      className="rounded-xl bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    {messages?.reservation?.phoneNumber || "Phone number"} <span className="text-primary">*</span>
                  </Label>
                  <div className="w-full">
                    <PhoneInput
                      defaultCountry="kr"
                      value={phoneNumber}
                      disabled
                      inputClassName={`flex-1 rounded-lg ${'border-gray-300'}`}
                      inputProps={{
                        id: "phoneNumber",
                        required: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Consent Section */}
              <div className="bg-white rounded-[24px] px-5 py-4">
                <div className="flex flex-col gap-1">
                  {/* 전체 동의 체크박스 */}
                  <div className="flex gap-3 items-start">
                    <div className="pt-[2px]">
                      <Checkbox
                        checked={consentAll}
                        onCheckedChange={handleConsentAllChange}
                        className="cursor-pointer h-5 w-5"
                      />
                    </div>
                    <label 
                      onClick={() => handleConsentAllChange(!consentAll)}
                      className="text-base font-medium leading-6 tracking-[-0.2px] cursor-pointer flex-1"
                    >
                      {messages?.reservation?.consentAll || "I consent to all of the following:"}
                    </label>
                  </div>
                  
                  {/* 하위 동의 항목들 */}
                  <div className="flex gap-[14px] pl-[10px]">
                    <div className="w-[2px] bg-[#e9eaec] rounded-full self-stretch" />
                    <div className="flex-1 flex flex-col gap-[10px] pt-1">
                      {/* Terms of use */}
                      <div className="flex gap-3 items-start">
                        <div className="pt-[2px]">
                          <Checkbox
                            checked={consentTerms}
                            onCheckedChange={handleConsentTermsChange}
                            className="cursor-pointer h-5 w-5"
                          />
                        </div>
                        <label 
                          onClick={() => handleConsentTermsChange(!consentTerms)}
                          className="text-base font-medium leading-6 tracking-[-0.2px] cursor-pointer flex-1"
                        >
                          {messages?.reservation?.consentTerms || "I consent to the Terms of use."}
                        </label>
                      </div>
                      
                      {/* Privacy Policy */}
                      <div className="flex gap-3 items-start">
                        <div className="pt-[2px]">
                          <Checkbox
                            checked={consentPrivacy}
                            onCheckedChange={handleConsentPrivacyChange}
                            className="cursor-pointer h-5 w-5"
                          />
                        </div>
                        <label 
                          onClick={() => handleConsentPrivacyChange(!consentPrivacy)}
                          className="text-base font-medium leading-6 tracking-[-0.2px] cursor-pointer flex-1"
                        >
                          {messages?.reservation?.consentPrivacy || "I consent to the Privacy Policy."}
                        </label>
                      </div>
                      
                      {/* Third Party Sharing */}
                      <div className="flex gap-3 items-start">
                        <div className="pt-[2px]">
                          <Checkbox
                            checked={consentThirdParty}
                            onCheckedChange={handleConsentThirdPartyChange}
                            className="cursor-pointer h-5 w-5"
                          />
                        </div>
                        <label 
                          onClick={() => handleConsentThirdPartyChange(!consentThirdParty)}
                          className="text-base font-medium leading-6 tracking-[-0.2px] cursor-pointer flex-1"
                        >
                          {messages?.reservation?.consentThirdParty || "I consent to sharing information."}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-[16px] p-5">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-full py-3"
                  >
                    {messages?.reservation?.nextPayment || "Next: Payment information"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 border-2 border-[#dee0e3] text-[#14151a] rounded-full py-3"
                  >
                    {messages?.reservation?.cancelReservation || "Cancel Reservation"}
                  </Button>
                </div>
                <p className="text-base text-center text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.2px] mt-3">
                  {messages?.reservation?.notChargedYet || "You won't be charged yet"}
                </p>
              </div>
            </div>

            {/* Right Column - Booking Summary - 데스크톱만 표시 */}
            <div className="hidden lg:flex lg:w-[368px] flex-col gap-4">
              {/* Room Card */}
              <div className="bg-white border border-[#dee0e3] rounded-[16px] overflow-hidden">
                <div className="h-[200px] relative">
                  <img
                    src={reservationData.room.image}
                    alt={reservationData.room.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-0 tracking-[-0.2px]">{reservationData.room.title}</h3>
                  <p className="text-lg text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.2px]">{reservationData.room.propertyName}</p>
                  <p className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">{reservationData.room.location}</p>
                </div>
              </div>

              {/* Dates Card */}
              <div className="bg-white border border-[#dee0e3] rounded-[16px] p-5 flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <div className="w-[116px]">
                    <p className="text-sm text-[#14151a] font-medium mb-1 tracking-[-0.1px]">
                      {messages?.reservation?.checkIn || "Check-in"}
                    </p>
                    <p className="text-base font-bold tracking-[-0.2px]">
                      {checkInFormatted.weekday}, {checkInFormatted.month} {checkInFormatted.day}
                    </p>
                    <p className="text-xs text-[rgba(13,17,38,0.4)] font-medium">{checkInFormatted.year}</p>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  
                  <div className="w-[116px]">
                    <p className="text-sm text-[#14151a] font-medium mb-1 tracking-[-0.1px]">
                      {messages?.reservation?.checkOut || "Check-out"}
                    </p>
                    <p className="text-base font-bold tracking-[-0.2px]">
                      {checkOutFormatted.weekday}, {checkOutFormatted.month} {checkOutFormatted.day}
                    </p>
                    <p className="text-xs text-[rgba(13,17,38,0.4)] font-medium">{checkOutFormatted.year}</p>
                  </div>
                </div>
                
                <div className="bg-[#f7f7f8] rounded-xl w-16 h-16 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-extrabold tracking-[-0.2px]">{reservationData.nights}</p>
                  <p className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.nights || "nights"}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-2">
                <div className="bg-white rounded-[16px] p-5">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                      {messages?.reservation?.roomPricePerNight || "Room price per night"}
                    </span>
                    <span className="font-medium tracking-[-0.1px]">
                      ${reservationData.room.pricePerNight.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                      {messages?.reservation?.nightsCount?.replace("{count}", String(reservationData.nights)) || `× ${reservationData.nights} nights`}
                    </span>
                    <span className="font-medium tracking-[-0.1px]">
                      {messages?.reservation?.nightsCount?.replace("{count}", String(reservationData.nights)) || `× ${reservationData.nights} nights`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                      {messages?.reservation?.roomCount?.replace("{count}", "1") || "× 1 room"}
                    </span>
                    <span className="font-medium tracking-[-0.1px]">
                      {messages?.reservation?.roomCount?.replace("{count}", "1") || "× 1 room"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-4 text-sm text-[#26bd6c]">
                    <span className="font-medium tracking-[-0.1px]">
                      {messages?.reservation?.bookingFees || "Booking fees"}
                    </span>
                    <span className="font-medium tracking-[-0.1px]">
                      {messages?.reservation?.free || "FREE"}
                    </span>
                  </div>
                  
                  <div className="border-t border-[#e9eaec] pt-2 mb-2" />
                  
                  <div className="flex justify-between text-base">
                    <span className="font-extrabold tracking-[-0.2px]">
                      {messages?.reservation?.price || "Price"}
                    </span>
                    <span className="font-extrabold tracking-[-0.2px] underline">
                      ${reservationData.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-[rgba(10,15,41,0.25)] font-medium">
                  <p className="mb-1">{messages?.reservation?.includedInPrice || "Included in price: Tax 10%"}</p>
                  <p>
                    {messages?.reservation?.currencyNote || "Your currency selections affect the prices"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

