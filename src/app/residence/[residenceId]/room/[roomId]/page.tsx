"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { BookingSidebar } from "@/components/room/BookingSidebar"
import { RelatedRoomCard } from "@/components/room/RelatedRoomCard"
import { apiGet, apiPost } from "@/lib/api"
import { Wifi, WashingMachine, Car, AirVent, Bell, Flame, ChevronRight, Camera, ChevronLeft, X, Heart, Share2, Calendar } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"
import DatePicker from "react-datepicker"
import Script from 'next/script'
import { MobileCustomDateRangePicker } from "@/components/home/mobile-custom-date-range-picker"
import { getBookingDates, saveBookingDates } from "@/lib/session-storage"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { toast } from "sonner"
import { apiPostWithResponse } from "@/lib/api"

interface RoomDetailPageProps {
  params: {
    residenceId: string
    roomId: string
  }
}

interface RoomImage {
  imageUrl: string
  imageType: string
  displayOrder: number
}

interface RoomFacility {
  facilityType: string
  customNameI18n: Record<string, string>
  iconUrl?: string
}

interface ReservedDate {
  checkIn: string
  checkOut: string
  reservationStatus: string
}

interface RoomDetail {
  roomIdentifier: string
  roomNameI18n: string
  roomDescriptionI18n: string
  roomRulesI18n: string
  pricePerNight: number
  curUnit: string
  residenceIdentifier: string
  residenceNameI18n: string
  residenceDescriptionI18n: string
  residenceLogoImageUrl: string
  hostingStartDate: string
  residenceFullAddress: string
  residenceSiDo: string
  residenceSiGunGu: string
  residenceDongMyeon: string
  residenceDetail: string
  residenceLatitude: number
  residenceLongitude: number
  roomImages: RoomImage[]
  roomFacilities: RoomFacility[]
  reservedDates: ReservedDate[]
  roomLikeCheck: boolean
}

interface RelatedRoom {
  roomIdentifier: string
  roomName: string
  residenceFullAddress: string
  pricePerNight: number
  mainImageUrl: string
  residenceIdentifier: string
  roomLikeCheck: boolean
}

// 시설 아이콘 매핑
const getFacilityIcon = (facilityType: string) => {
  const lowerFacility = facilityType.toLowerCase()
  if (lowerFacility.includes('wifi') || lowerFacility.includes('wi-fi')) return Wifi
  if (lowerFacility.includes('washing') || lowerFacility.includes('machine')) return WashingMachine
  if (lowerFacility.includes('air') || lowerFacility.includes('conditioning')) return AirVent
  if (lowerFacility.includes('smoke') || lowerFacility.includes('alarm')) return Bell
  if (lowerFacility.includes('carbon') || lowerFacility.includes('monoxide')) return Flame
  if (lowerFacility.includes('parking')) return Car
  return Wifi // 기본 아이콘
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { messages, currentLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [roomData, setRoomData] = useState<RoomDetail | null>(null)
  const [relatedRooms, setRelatedRooms] = useState<RelatedRoom[]>([])

  // 세션 스토리지에서 날짜 가져오기 (하이드레이션 에러 방지를 위해 초기값은 null)
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)
  const [guests, setGuests] = useState(1)
  const [showAllFacilities, setShowAllFacilities] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showFullRules, setShowFullRules] = useState(false)
  const [currentRoomPage, setCurrentRoomPage] = useState(0)
  const [totalRoomPages, setTotalRoomPages] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false)
  const [datePickerLocale, setDatePickerLocale] = useState<any>(undefined)
  const [isReserving, setIsReserving] = useState(false)
  const [isNaverMapLoaded, setIsNaverMapLoaded] = useState(false)

  const handleGuestsChange = (newGuests: number) => {
    setGuests(Math.max(1, Math.min(1, newGuests)))
  }

  // 날짜 범위가 예약 가능한지 확인하는 함수
  const isDateRangeAvailable = (checkIn: Date | null, checkOut: Date | null, reservedDates: ReservedDate[]): boolean => {
    if (!checkIn || !checkOut) return true // 날짜가 없으면 체크하지 않음
    
    const normalizedCheckIn = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
    const normalizedCheckOut = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())
    normalizedCheckIn.setHours(0, 0, 0, 0)
    normalizedCheckOut.setHours(0, 0, 0, 0)
    
    for (const reserved of reservedDates) {
      const reservedCheckIn = new Date(reserved.checkIn)
      const reservedCheckOut = new Date(reserved.checkOut)
      reservedCheckIn.setHours(0, 0, 0, 0)
      reservedCheckOut.setHours(0, 0, 0, 0)
      
      // 예약 기간과 겹치는지 확인
      // 1. 선택한 체크인이 예약 기간 내에 있는 경우
      // 2. 선택한 체크아웃이 예약 기간 내에 있는 경우
      // 3. 선택한 기간이 예약 기간을 포함하는 경우
      if (
        (normalizedCheckIn.getTime() >= reservedCheckIn.getTime() && normalizedCheckIn.getTime() < reservedCheckOut.getTime()) ||
        (normalizedCheckOut.getTime() > reservedCheckIn.getTime() && normalizedCheckOut.getTime() <= reservedCheckOut.getTime()) ||
        (normalizedCheckIn.getTime() <= reservedCheckIn.getTime() && normalizedCheckOut.getTime() >= reservedCheckOut.getTime())
      ) {
        return false
      }
    }
    
    return true
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
      toast.error(messages?.roomDetail?.pleaseSelectDates || '날짜를 선택해주세요')
      return
    }

    setIsReserving(true)

    try {
      // 버튼 클릭 시점의 시간 기록 (한국 시간 기준)
      const clickTime = new Date()

      // 현재 시간을 한국 시간(KST)으로 변환
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

      // 예약 API 호출
      const { response, data } = await apiPostWithResponse('/api/user/reserve', {
        identifier: params.roomId,
        checkIn: formatDateForAPI(checkInDate),
        checkOut: formatDateForAPI(checkOutDate),
        curUnit: 'USD',
        requestTime,
        languageCode: currentLanguage.code
      })

      if (response.ok && data.code === 200) {
        const reservationId = data.data?.identifier
        if (reservationId) {
          window.location.href = `/reservation/${reservationId}`
        } else {
          // 예약 ID가 없으면 폴백으로 기존 방식 사용
          const fallbackId = params.roomId
          window.location.href = `/reservation/${fallbackId}`
        }
      } else {
        // 에러 처리
        switch (data.code) {
          case 40500:
            toast.error(messages?.roomDetail?.roomNotFound || (currentLanguage.code === 'ko' ? '존재하지 않는 방입니다' :
                                                       currentLanguage.code === 'en' ? 'Room not found' :
                                                       currentLanguage.code === 'zh' ? '房间不存在' :
                                                       'Chambre introuvable'))
            break
          case 40000:
            toast.error(messages?.roomDetail?.invalidInput || (currentLanguage.code === 'ko' ? '잘못된 값을 입력했습니다' :
                                                       currentLanguage.code === 'en' ? 'Invalid input provided' :
                                                       currentLanguage.code === 'zh' ? '输入的值无效' :
                                                       'Valeur saisie invalide'))
            break
          case 40501:
            toast.error(messages?.roomDetail?.alreadyReserved || (currentLanguage.code === 'ko' ? '해당 기간에 이미 예약이 존재합니다' :
                                                           currentLanguage.code === 'en' ? 'This period is already reserved' :
                                                           currentLanguage.code === 'zh' ? '该时间段已被预订' :
                                                           'Cette période est déjà réservée'))
            break
          case 40110:
            toast.error(messages?.roomDetail?.invalidCurrency || (currentLanguage.code === 'ko' ? '잘못된 화폐단위를 입력했습니다' :
                                                           currentLanguage.code === 'en' ? 'Invalid currency provided' :
                                                           currentLanguage.code === 'zh' ? '货币单位无效' :
                                                           'Devise invalide'))
            break
          case 40300:
            toast.error(messages?.roomDetail?.exchangeRateNotFound || (currentLanguage.code === 'ko' ? '환율정보를 찾을 수 없습니다' :
                                                                currentLanguage.code === 'en' ? 'Exchange rate information not found' :
                                                                currentLanguage.code === 'zh' ? '找不到汇率信息' :
                                                                'Informations de taux de change introuvables'))
            break
          default:
            toast.error(messages?.roomDetail?.invalidInput || (currentLanguage.code === 'ko' ? '잘못된 값을 입력했습니다' :
                                                       currentLanguage.code === 'en' ? 'Invalid input provided' :
                                                       currentLanguage.code === 'zh' ? '输入的值无效' :
                                                       'Valeur saisie invalide'))
        }
      }
    } catch (error: any) {
      toast.error(messages?.roomDetail?.reservationError || (currentLanguage.code === 'ko' ? '예약 처리 중 오류가 발생했습니다' :
                                                      currentLanguage.code === 'en' ? 'An error occurred while processing the reservation' :
                                                      currentLanguage.code === 'zh' ? '预订处理过程中发生错误' :
                                                      'Une erreur s\'est produite lors du traitement de la réservation'))
    } finally {
      setIsReserving(false)
    }
  }

  // 호스팅 시작 연도 계산
  const getHostingYears = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const years = now.getFullYear() - start.getFullYear()
    return years > 0 ? years : 1
  }

  // 클라이언트 사이드에서만 세션 스토리지 읽기 (하이드레이션 에러 방지)
  useEffect(() => {
    const { checkIn, checkOut } = getBookingDates()
    setCheckInDate(checkIn)
    setCheckOutDate(checkOut)
  }, [])

  // 모바일용 달력 로케일 로드
  useEffect(() => {
    const loadLocale = async () => {
      try {
        const { ko } = await import('date-fns/locale/ko')
        setDatePickerLocale(ko)
      } catch (error) {
        setDatePickerLocale(undefined)
      }
    }
    loadLocale()
  }, [])

  // 모바일용 날짜 포맷 함수
  const formatMobileDate = (date: Date | null) => {
    if (!date) return 'Select date'
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}/${year}`
  }

  // 모바일용 Range 달력 날짜 변경 핸들러
  const handleMobileDateRangeChange = (dates: [Date | null, Date | null] | Date | null) => {
    if (Array.isArray(dates)) {
      const [start, end] = dates

      // 시간 정보를 제거하고 날짜만 저장 (00:00:00.000으로 설정)
      const normalizedStart = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null
      const normalizedEnd = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null

      setCheckInDate(normalizedStart)
      setCheckOutDate(normalizedEnd)

      // 체크인과 체크아웃이 모두 선택되면 달력 닫기
      if (normalizedStart && normalizedEnd) {
        setIsMobileCalendarOpen(false)
      }
    }
  }

  // 방 상세 정보 조회
  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const languageCode = currentLanguage.code
        
        const response = await apiGet(
          `/api/room/detail?residenceIdentifier=${params.residenceId}&roomIdentifier=${params.roomId}&languageCode=${languageCode}`
        )

        if (response.code === 200 && response.data) {
          setRoomData(response.data)
        } else if (response.code === 40500) {
          alert(messages?.roomDetail?.roomNotFound || "방을 찾을 수 없습니다.")
          setError("ROOM_NOT_FOUND")
        } else {
          setError("LOAD_ERROR")
        }
      } catch (error) {
        setError("LOAD_ERROR")
      } finally {
        setLoading(false)
      }
    }

    fetchRoomDetail()
  }, [params.residenceId, params.roomId, currentLanguage])

  // 세션 스토리지의 날짜가 예약 가능한지 확인
  useEffect(() => {
    if (roomData && roomData.reservedDates) {
      // 세션 스토리지에서 가져온 날짜가 예약된 날짜와 겹치면 초기화
      if (!isDateRangeAvailable(checkInDate, checkOutDate, roomData.reservedDates)) {
        setCheckInDate(null)
        setCheckOutDate(null)
      }
    }
  }, [roomData])

  // 관련 방 목록 조회
  useEffect(() => {
    const fetchRelatedRooms = async () => {
      if (!roomData) return

      try {
        const languageCode = currentLanguage.code
        
        const response = await apiGet(
          `/api/room/list?residenceIdentifier=${params.residenceId}&excludeRoomIdentifier=${params.roomId}&languageCode=${languageCode}&page=${currentRoomPage}&size=5`
        )

        if (response.code === 200 && response.data) {
          setRelatedRooms(response.data.content || [])
          setTotalRoomPages(response.data.totalPages || 0)
        } else if (response.code === 40500) {
          alert(messages?.roomDetail?.roomNotFound || "방을 찾을 수 없습니다.")
          setRelatedRooms([])
        } else {
          // 다른 에러의 경우 조용히 처리
          setRelatedRooms([])
        }
      } catch (error) {
        setRelatedRooms([])
      }
    }

    fetchRelatedRooms()
  }, [roomData, params.residenceId, params.roomId, currentLanguage, currentRoomPage])

  // 네이버 SDK가 이미 로드되어 있는지 초기 체크
  useEffect(() => {
    if ((window as any).naver) {
      setIsNaverMapLoaded(true)
    }
  }, [])

  // 네이버 지도 초기화 - roomData 로드 후 SDK를 기다리며 초기화
  useEffect(() => {
    if (!roomData) return

    let retryCount = 0
    const maxRetries = 50 // 최대 5초 대기 (50 * 100ms)
    let timeoutId: NodeJS.Timeout

    const initializeMaps = () => {
      // 네이버 SDK가 로드될 때까지 대기
      if (!(window as any).naver || !(window as any).naver.maps) {
        retryCount++
        if (retryCount < maxRetries) {
          // 아직 로드되지 않았으면 100ms 후 재시도
          timeoutId = setTimeout(initializeMaps, 100)
        } else {
          console.error('Naver Maps SDK failed to load after 5 seconds')
        }
        return
      }

      const naver = (window as any).naver;

      // 모바일 지도
      const mobileMapElement = document.getElementById('map');
      if (mobileMapElement && !mobileMapElement.classList.contains('map-initialized')) {
        mobileMapElement.classList.add('map-initialized')
        try {
          const mobileMap = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(roomData.residenceLatitude, roomData.residenceLongitude),
            zoom: 15,
            mapTypeControl: false,
            zoomControl: false
          });

          new naver.maps.Marker({
            position: new naver.maps.LatLng(roomData.residenceLatitude, roomData.residenceLongitude),
            map: mobileMap
          });
        } catch (error) {
          console.error('Failed to initialize mobile map:', error)
          mobileMapElement.classList.remove('map-initialized')
        }
      }

      // 데스크톱 지도
      const desktopMapElement = document.getElementById('map-desktop');
      if (desktopMapElement && !desktopMapElement.classList.contains('map-initialized')) {
        desktopMapElement.classList.add('map-initialized')
        try {
          const desktopMap = new naver.maps.Map('map-desktop', {
            center: new naver.maps.LatLng(roomData.residenceLatitude, roomData.residenceLongitude),
            zoom: 15,
            mapTypeControl: false,
            zoomControl: false
          });

          new naver.maps.Marker({
            position: new naver.maps.LatLng(roomData.residenceLatitude, roomData.residenceLongitude),
            map: desktopMap
          });
        } catch (error) {
          console.error('Failed to initialize desktop map:', error)
          desktopMapElement.classList.remove('map-initialized')
        }
      }
    }

    // DOM 렌더링 대기 후 초기화 시작
    timeoutId = setTimeout(initializeMaps, 100)

    // Cleanup: 컴포넌트 언마운트 시 timeout 제거
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [roomData])

  // 체크인 날짜 필터링 함수 (체크인 전용)
  const filterCheckInDates = (date: Date) => {
    if (!roomData?.reservedDates) return true

    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    currentDate.setHours(0, 0, 0, 0)

    // 오늘 이전 날짜는 선택 불가
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (currentDate.getTime() < today.getTime()) {
      return false
    }

    for (const reserved of roomData.reservedDates) {
      const reservedCheckIn = new Date(reserved.checkIn)
      const reservedCheckOut = new Date(reserved.checkOut)
      reservedCheckIn.setHours(0, 0, 0, 0)
      reservedCheckOut.setHours(0, 0, 0, 0)

      // 예약 기간 [checkIn, checkOut) 동안은 체크인 불가
      // 예: 11월 7일 ~ 11월 12일 예약이면 11월 7일 ~ 11월 11일은 체크인 불가
      // 11월 6일 이전 또는 11월 12일 이후만 체크인 가능
      if (currentDate.getTime() >= reservedCheckIn.getTime() && currentDate.getTime() < reservedCheckOut.getTime()) {
        return false
      }
    }

    return true
  }

  // 체크아웃 날짜 필터링 함수 (체크아웃 전용)
  const filterCheckOutDates = (date: Date) => {
    if (!roomData?.reservedDates || !checkInDate) return false

    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    currentDate.setHours(0, 0, 0, 0)

    const selectedCheckIn = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate())
    selectedCheckIn.setHours(0, 0, 0, 0)

    // 체크아웃은 체크인 다음날부터 시작해야 함 (최소 1박)
    const nextDay = new Date(selectedCheckIn.getTime() + 24 * 60 * 60 * 1000)
    if (currentDate.getTime() < nextDay.getTime()) {
      return false
    }

    // 선택한 체크인 이후, 가장 가까운 예약의 체크인 날짜 찾기
    let nearestReservedCheckIn: Date | null = null

    for (const reserved of roomData.reservedDates) {
      const reservedCheckIn = new Date(reserved.checkIn)
      reservedCheckIn.setHours(0, 0, 0, 0)

      // 선택한 체크인보다 이후에 있는 예약 중에서
      if (reservedCheckIn.getTime() > selectedCheckIn.getTime()) {
        // 가장 가까운 예약 찾기
        if (!nearestReservedCheckIn || reservedCheckIn.getTime() < nearestReservedCheckIn.getTime()) {
          nearestReservedCheckIn = reservedCheckIn
        }
      }
    }

    // 가장 가까운 예약의 체크인 날짜까지만 선택 가능
    // 예: 체크인이 11월 1일이고, 가장 가까운 예약이 11월 7일 ~ 11월 12일이면
    // 체크아웃은 11월 2일 ~ 11월 7일까지 가능 (11월 7일 포함)
    // 다음 예약의 체크인 날짜(11월 7일)까지 체크아웃 가능
    if (nearestReservedCheckIn && currentDate.getTime() > nearestReservedCheckIn.getTime()) {
      return false
    }

    return true
  }

  const handlePreviousPage = () => {
    if (currentRoomPage > 0) {
      setCurrentRoomPage(currentRoomPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentRoomPage < totalRoomPages - 1) {
      setCurrentRoomPage(currentRoomPage + 1)
    }
  }

  const handleRoomClick = (residenceIdentifier: string, roomIdentifier: string) => {
    router.push(`/residence/${residenceIdentifier}/room/${roomIdentifier}`)
  }

  // 좋아요 토글 함수 (낙관적 업데이트)
  const toggleRelatedRoomLike = async (roomIdentifier: string, e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지

    // 낙관적 업데이트: 먼저 UI 업데이트
    setRelatedRooms(prevRooms =>
      prevRooms.map(room =>
        room.roomIdentifier === roomIdentifier
          ? { ...room, roomLikeCheck: !room.roomLikeCheck }
          : room
      )
    )

    try {
      const response = await apiPost(`/api/user/like?roomIdentifier=${roomIdentifier}`)
      
      // 응답 코드가 200이 아닌 경우 롤백
      if (response.code !== 200) {
        setRelatedRooms(prevRooms =>
          prevRooms.map(room =>
            room.roomIdentifier === roomIdentifier
              ? { ...room, roomLikeCheck: !room.roomLikeCheck }
              : room
          )
        )
      }
    } catch (error) {
      // 에러 발생 시 롤백
      setRelatedRooms(prevRooms =>
        prevRooms.map(room =>
          room.roomIdentifier === roomIdentifier
            ? { ...room, roomLikeCheck: !room.roomLikeCheck }
            : room
        )
      )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !roomData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-[#14151a]">
              {messages?.roomDetail?.cannotLoadRoom || "방 정보를 조회할 수 없습니다."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const sortedImages = [...roomData.roomImages].sort((a, b) => a.displayOrder - b.displayOrder)
  const displayedFacilities = showAllFacilities 
    ? roomData.roomFacilities 
    : roomData.roomFacilities.slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-[#FFF] lg:bg-[#f7f7f8]">
        {/* 타이틀 섹션 - 데스크톱만 표시 */}
        <div className="hidden lg:block bg-[#f7f7f8] pt-10 pb-0">
          <div className="mx-auto max-w-[1200px] px-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-extrabold leading-[32px] tracking-[-0.3px] text-[#14151a]">
                {roomData.roomNameI18n}
              </h1>
              <p className="text-[18px] font-medium leading-[26px] tracking-[-0.2px] text-[rgba(13,17,38,0.4)]">
                {roomData.residenceFullAddress}
              </p>
            </div>
          </div>
        </div>

        {/* 이미지 갤러리 섹션 - 데스크톱 */}
        <div className="hidden lg:block bg-[#f7f7f8] pt-[18px]">
          <div className="mx-auto max-w-[1200px] px-4">
            {/* 이미지 1개 */}
            {sortedImages.length === 1 && (
              <div className="bg-white rounded-[16px] overflow-hidden">
                <img
                  src={sortedImages[0].imageUrl}
                  alt={roomData.roomNameI18n}
                  className="w-full h-[404px] object-cover cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(0)
                    setShowImageModal(true)
                  }}
                />
              </div>
            )}

            {/* 이미지 2개 */}
            {sortedImages.length === 2 && (
              <div className="bg-white rounded-[16px] overflow-hidden flex gap-1">
                {sortedImages.map((image, index) => (
                  <div key={index} className="flex-1 relative">
                    <img
                      src={image.imageUrl}
                      alt={roomData.roomNameI18n}
                      className="w-full h-[404px] object-cover cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setShowImageModal(true)
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 3개 */}
            {sortedImages.length === 3 && (
              <div className="bg-white rounded-[16px] overflow-hidden flex gap-1">
                <div className="flex-1 relative">
                  <img
                    src={sortedImages[0].imageUrl}
                    alt={roomData.roomNameI18n}
                    className="w-full h-[404px] object-cover cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(0)
                      setShowImageModal(true)
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 w-[550px]">
                  {sortedImages.slice(1).map((image, index) => (
                    <div key={index + 1} className="flex-1 relative">
                      <img
                        src={image.imageUrl}
                        alt=""
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(index + 1)
                          setShowImageModal(true)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 이미지 4개 */}
            {sortedImages.length === 4 && (
              <div className="bg-white rounded-[16px] overflow-hidden flex gap-1">
                <div className="flex-1 relative">
                  <img
                    src={sortedImages[0].imageUrl}
                    alt={roomData.roomNameI18n}
                    className="w-full h-[404px] object-cover cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(0)
                      setShowImageModal(true)
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 w-[550px]">
                  <div className="flex gap-1">
                    {sortedImages.slice(1, 3).map((image, index) => (
                      <div key={index + 1} className="flex-1 h-[200px] relative">
                        <img
                          src={image.imageUrl}
                          alt=""
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => {
                            setCurrentImageIndex(index + 1)
                            setShowImageModal(true)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 h-[200px] relative">
                    <img
                      src={sortedImages[3].imageUrl}
                      alt=""
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(3)
                        setShowImageModal(true)
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 이미지 5개 이상 */}
            {sortedImages.length >= 5 && (
              <div className="rounded-[16px] overflow-hidden flex gap-1">
                <div className="flex-1 relative">
                  <img
                    src={sortedImages[0].imageUrl}
                    alt={roomData.roomNameI18n}
                    className="w-full h-[404px] object-cover cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(0)
                      setShowImageModal(true)
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 w-[550px]">
                  <div className="flex gap-1">
                    {sortedImages.slice(1, 3).map((image, index) => (
                      <div key={index + 1} className="flex-1 h-[200px] relative">
                        <img
                          src={image.imageUrl}
                          alt=""
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => {
                            setCurrentImageIndex(index + 1)
                            setShowImageModal(true)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-[200px] relative">
                      <img
                        src={sortedImages[3].imageUrl}
                        alt=""
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(3)
                          setShowImageModal(true)
                        }}
                      />
                    </div>
                    <div className="flex-1 h-[200px] relative">
                      <img
                        src={sortedImages[4].imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button 
                        className="absolute inset-0 bg-[rgba(224,0,77,0.7)] backdrop-blur-[6px] flex flex-col items-center justify-center gap-2 cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(0)
                          setShowImageModal(true)
                        }}
                      >
                        <Camera className="h-8 w-8 text-white" />
                        <span className="text-[24px] font-bold leading-[32px] tracking-[-0.3px] text-white">
                          Show all photos
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 이미지 갤러리 섹션 - 모바일 (Swiper) */}
        <div className="lg:hidden relative">
          <div className="relative h-[300px]">
            <Swiper
              modules={[Pagination, Navigation]}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet bg-white/50 !w-2 !h-2',
                bulletActiveClass: 'swiper-pagination-bullet-active !bg-[#e0004d]',
              }}
              navigation={{
                prevEl: '.swiper-button-prev-custom',
                nextEl: '.swiper-button-next-custom',
              }}
              className="h-full w-full"
            >
              {sortedImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image.imageUrl}
                    alt={`${roomData.roomNameI18n} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* 네비게이션 버튼 */}
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-[#e9eaec] rounded-full p-2 hover:bg-white transition-colors">
              <ChevronLeft className="h-4 w-4 text-[#14151a]" />
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-[#dee0e3] rounded-full p-2 hover:bg-white/90 transition-colors">
              <ChevronRight className="h-4 w-4 text-[#14151a]" />
            </button>
          </div>

        </div>

        {/* 모바일 타이틀 및 정보 섹션 */}
        <div className="lg:hidden bg-[#FFF] px-4 py-4 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-[18px] font-medium leading-[26px] tracking-[-0.2px] text-[rgba(13,17,38,0.4)]">
                {roomData.residenceFullAddress}
              </p>
            </div>
            <h1 className="text-[24px] font-extrabold leading-[32px] tracking-[-0.3px] text-[#14151a]">
              {roomData.roomNameI18n}
            </h1>
          </div>

          {/* Check-in and Check-out - 모바일용 */}
          <div className="flex gap-3 items-end mt-2">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                Check-in
              </label>
              <div
                className="relative h-[44px] bg-white border border-[#dee0e3] rounded-xl flex items-center px-3 cursor-pointer hover:border-gray-300"
                onClick={() => setIsMobileCalendarOpen(true)}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <p className="text-[14px] text-[rgba(13,17,38,0.4)] ml-7">
                  {formatMobileDate(checkInDate)}
                </p>
                {checkInDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCheckInDate(null)
                      setCheckOutDate(null)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className={`text-[14px] font-medium leading-[20px] tracking-[-0.1px] ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-[#14151a]'}`}>
                Check-out
              </label>
              <div
                className={`relative h-[44px] bg-white border rounded-xl flex items-center px-3 ${!checkInDate ? 'border-gray-200 cursor-not-allowed' : 'border-[#dee0e3] cursor-pointer hover:border-gray-300'}`}
                onClick={() => checkInDate && setIsMobileCalendarOpen(true)}
              >
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-gray-400'}`} />
                <p className={`text-[14px] ml-7 ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-[rgba(13,17,38,0.4)]'}`}>
                  {formatMobileDate(checkOutDate)}
                </p>
                {checkOutDate && checkInDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCheckOutDate(null)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Share and Save buttons - 모바일 전용 */}
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={async () => {
                try {
                  const currentUrl = window.location.href
                  await navigator.clipboard.writeText(currentUrl)
                  toast.success(messages?.roomDetail?.shareSuccess || 'Link copied to clipboard!')
                } catch (error) {
                  toast.error(messages?.roomDetail?.shareError || 'Failed to copy link')
                }
              }}
              className="w-full h-10 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none"
            >
              <Share2 className="h-5 w-5 text-[#14151a]" />
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                Share with friends
              </span>
            </Button>
            <Button
              onClick={async () => {
                // 낙관적 업데이트: 먼저 UI 업데이트
                setRoomData(prev => prev ? { ...prev, roomLikeCheck: !prev.roomLikeCheck } : prev)

                try {
                  const response = await apiPost(`/api/user/like?roomIdentifier=${params.roomId}`)

                  // 응답 코드가 200이 아닌 경우 롤백
                  if (response.code !== 200) {
                    setRoomData(prev => prev ? { ...prev, roomLikeCheck: !prev.roomLikeCheck } : prev)
                  }
                } catch (error) {
                  // 에러 발생 시 롤백
                  setRoomData(prev => prev ? { ...prev, roomLikeCheck: !prev.roomLikeCheck } : prev)
                }
              }}
              className="w-full h-10 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none"
            >
              {roomData.roomLikeCheck ? (
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z"
                    fill="#e0004d"
                  />
                </svg>
              ) : (
                <Heart className="h-5 w-5 text-[#14151a]" />
              )}
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                Save
              </span>
            </Button>
          </div>
        </div>

        {/* 하단에 고정된 가격 및 Reserve 버튼 - 모바일 전용 */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e9eaec] rounded-t-3xl px-4 py-3 shadow-[0px_-2px_8px_0px_rgba(20,21,26,0.1)]">
          <div className="flex gap-4 items-center pb-5">
            <div className="flex-1 flex flex-col gap-[2px]">
              <p className="text-[20px] font-bold leading-[28px] tracking-[-0.2px] text-[#14151a] underline">
                ${roomData.pricePerNight} per night
              </p>
            </div>
            <Button
              onClick={() => {
                if (!checkInDate || !checkOutDate) {
                  toast.error(messages?.roomDetail?.pleaseSelectDates || '날짜를 선택해주세요')
                  return
                }
                // 예약 처리 로직
                handleReservation()
              }}
              disabled={isReserving || !checkInDate || !checkOutDate}
              className="flex-shrink-0 w-[160px] h-10 rounded-full bg-[#e0004d] hover:bg-[#c2003f] px-4 py-3 shadow-[0px_1px_2px_0px_rgba(20,21,26,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[16px] font-medium leading-[24px] tracking-[-0.2px] text-white">
                {isReserving
                  ? (messages?.common?.loading || '예약 중...')
                  : (messages?.roomDetail?.reserve || 'Reserve')
                }
              </span>
            </Button>
          </div>
        </div>

        {/* 구분선 - 모바일 */}
        <div className="lg:hidden bg-[#FFF] px-0 py-4">
          <div className="px-4">
            <div className="h-px bg-[#e9eaec] w-full" />
          </div>
        </div>

        {/* 메인 컨텐츠 - 모바일 */}
        <div className="lg:hidden bg-[#FFF] pt-4 pb-4">
          <div className="mx-auto max-w-[1200px] px-4">
            <div className="flex flex-col gap-4">
              {/* Facilities - 모바일 */}
              {roomData.roomFacilities.length > 0 && (
                <div className="flex flex-col gap-[18px]">
                  <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                    Facilities
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {displayedFacilities.map((facility, index) => {
                      const Icon = getFacilityIcon(facility.facilityType)
                      const facilityName = facility.customNameI18n?.[currentLanguage.code] || facility.facilityType

                      return (
                        <div key={index} className="flex items-center gap-2">
                          {facility.iconUrl ? (
                            <img
                              src={facility.iconUrl}
                              alt={facilityName}
                              className="h-5 w-5 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <Icon className="h-5 w-5 text-[#14151a]" />
                          )}
                          <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                            {facilityName}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {roomData.roomFacilities.length > 6 && (
                    <button
                      onClick={() => setShowAllFacilities(!showAllFacilities)}
                      className="bg-[rgba(10,15,41,0.04)] rounded-[10px] px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                    >
                      <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                        {showAllFacilities ? "Show less" : `Show all ${roomData.roomFacilities.length} facilities`}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showAllFacilities ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="lg:hidden bg-[#FFF] px-0 py-4">
                <div className="px-4">
                  <div className="h-px bg-[#e9eaec] w-full" />
                </div>
              </div>

              {/* About this room - 모바일 */}
              {roomData.roomDescriptionI18n && (
                <div className="flex flex-col gap-2">
                  <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                    About this room
                  </p>
                  <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-4 max-h-[96px] overflow-hidden' : ''}`}>
                    {roomData.roomDescriptionI18n}
                  </p>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="bg-[rgba(10,15,41,0.04)] rounded-full px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                  >
                    <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                      {showFullDescription ? "Show less" : "Show more"}
                    </span>
                    <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="lg:hidden bg-[#FFF] px-0 py-4">
                <div className="px-4">
                  <div className="h-px bg-[#e9eaec] w-full" />
                </div>
              </div>

              {/* Rules - 모바일 */}
              {roomData.roomRulesI18n && (
                <div className="flex flex-col gap-2">
                  <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                    Rules
                  </p>
                  <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] whitespace-pre-wrap ${!showFullRules ? 'line-clamp-4 max-h-[96px] overflow-hidden' : ''}`}>
                    {roomData.roomRulesI18n}
                  </p>
                  <button
                    onClick={() => setShowFullRules(!showFullRules)}
                    className="bg-[rgba(10,15,41,0.04)] rounded-full px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                  >
                    <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                      {showFullRules ? "Show less" : "Show more"}
                    </span>
                    <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showFullRules ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="lg:hidden bg-[#FFF] px-0 py-4">
                <div className="px-4">
                  <div className="h-px bg-[#e9eaec] w-full" />
                </div>
              </div>

              {/* Room location - 모바일 */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-0">
                  <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                    Room location
                  </p>
                  <p className="text-[14px] font-semibold leading-[20px] tracking-[-0.1px] text-[rgba(15,19,36,0.6)]">
                    {roomData.residenceFullAddress}
                  </p>
                </div>
                <div id="map" className="h-[200px] rounded-[12px] bg-gray-200 overflow-hidden flex items-center justify-center naver-map-container" style={{ position: 'relative', zIndex: 1 }} />
              </div>  

              {/* Divider */}
              <div className="lg:hidden bg-[#FFF] px-0 py-4">
                <div className="px-4">
                  <div className="h-px bg-[#e9eaec] w-full" />
                </div>
              </div>

              {/* Host of this room - 모바일 */}
              <div className="rounded-3xl bg-white px-5 py-4 flex flex-col gap-2">
                <h3 className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                  {messages?.roomDetail?.hostTitle || 'Host of this room'}
                </h3>

                {/* 호스트 프로필 */}
                <div className="flex items-center gap-2 w-full">
                  <div className="relative h-20 w-20 rounded-full border border-[#dee0e3] flex-shrink-0">
                    <img
                      src={roomData.residenceLogoImageUrl || "/api/placeholder/80/80"}
                      alt={roomData.residenceNameI18n}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/api/placeholder/80/80'
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <p className="text-[18px] font-extrabold leading-[26px] tracking-[-0.2px] text-[#14151a] truncate">
                      {roomData.residenceNameI18n}
                    </p>
                    <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
                      {messages?.roomDetail?.yearsHosting?.replace('{years}', getHostingYears(roomData.hostingStartDate).toString()) || `${getHostingYears(roomData.hostingStartDate)} years hosting`}
                    </p>
                  </div>
                </div>

                {/* 다른 숙소 보기 버튼 */}
                <Button
                  className="w-full h-10 rounded-xl bg-white border border-[#dee0e3] hover:bg-gray-50 px-3 py-2.5 shadow-none"
                  onClick={() => {
                    // 현재 URL에서 residenceId를 추출하여 고시원 페이지로 이동
                    const currentPath = window.location.pathname
                    const pathParts = currentPath.split('/')
                    // /residence/[residenceId]/room/[roomId] 구조에서 residenceId 추출
                    if (pathParts.length >= 3 && pathParts[1] === 'residence') {
                      const residenceId = pathParts[2]
                      window.location.href = `/residence/${residenceId}`
                    }
                  }}
                >
                  <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                    {messages?.roomDetail?.showMoreRooms || 'Show more rooms'}
                  </span>
                </Button>

                {/* 호스트 설명 - Read more 기능 추가 */}
                <div className="flex flex-col gap-2">
                  <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-4 max-h-[96px] overflow-hidden' : ''}`}>
                    {roomData.residenceDescriptionI18n}
                  </p>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mx-auto rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
                  >
                    <span className="text-[16px] font-medium leading-[20px] tracking-[-0.1px] text-gray-600">
                      {showFullDescription ? "Show less" : "Read more"}
                    </span>
                    <ChevronRight className={`h-5 w-5 text-gray-600 transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 - 데스크톱 */}
        <div className="hidden lg:block bg-[#f7f7f8] pt-10 pb-20 overflow-visible">
          <div className="mx-auto max-w-[1200px] px-4 overflow-visible">
            <div className="flex flex-col lg:flex-row gap-6 overflow-visible">
              {/* 좌측 컨텐츠 */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Facilities - 데스크톱 */}
                {roomData.roomFacilities.length > 0 && (
                  <div className="bg-white rounded-[24px] px-5 py-4 flex-col gap-[18px] flex">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      Facilities
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {displayedFacilities.map((facility, index) => {
                        const Icon = getFacilityIcon(facility.facilityType)
                        const facilityName = facility.customNameI18n?.[currentLanguage.code] || facility.facilityType

                        return (
                          <div key={index} className="flex items-center gap-2">
                            {facility.iconUrl ? (
                              <img
                                src={facility.iconUrl}
                                alt={facilityName}
                                className="h-5 w-5 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Icon className="h-5 w-5 text-[#14151a]" />
                            )}
                            <span className="text-[16px] font-medium leading-[24px] tracking-[-0.2px] text-[#14151a]">
                              {facilityName}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {roomData.roomFacilities.length > 6 && (
                      <button
                        onClick={() => setShowAllFacilities(!showAllFacilities)}
                        className="bg-[rgba(10,15,41,0.04)] rounded-[10px] px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                      >
                        <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                          {showAllFacilities ? "Show less" : `Show all ${roomData.roomFacilities.length} facilities`}
                        </span>
                        <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showAllFacilities ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                )}

                {/* About this room - 데스크톱 */}
                {roomData.roomDescriptionI18n && (
                  <div className="bg-white rounded-[24px] px-5 py-4 flex-col gap-2 flex">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      About this room
                    </p>
                    <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-4 max-h-[96px] overflow-hidden' : ''}`}>
                      {roomData.roomDescriptionI18n}
                    </p>
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="bg-[rgba(10,15,41,0.04)] rounded-full px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                    >
                      <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                        {showFullDescription ? "Show less" : "Show more"}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Rules - 데스크톱 */}
                {roomData.roomRulesI18n && (
                  <div className="bg-white rounded-[24px] px-5 py-4 flex-col gap-2 flex">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      Rules
                    </p>
                    <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] whitespace-pre-wrap ${!showFullRules ? 'line-clamp-4 max-h-[96px] overflow-hidden' : ''}`}>
                      {roomData.roomRulesI18n}
                    </p>
                    <button
                      onClick={() => setShowFullRules(!showFullRules)}
                      className="bg-[rgba(10,15,41,0.04)] rounded-full px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                    >
                      <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                        {showFullRules ? "Show less" : "Show more"}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showFullRules ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Room location - 데스크톱 */}
                <div className="bg-white rounded-[24px] px-5 py-4 flex-col gap-2 flex">
                  <div className="flex flex-col gap-0">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      Room location
                    </p>
                    <p className="text-[14px] font-semibold leading-[20px] tracking-[-0.1px] text-[rgba(15,19,36,0.6)]">
                      {roomData.residenceFullAddress}
                    </p>
                  </div>
                  <div id="map-desktop" className="h-[200px] rounded-[12px] bg-gray-200 overflow-hidden flex items-center justify-center naver-map-container" style={{ position: 'relative', zIndex: 1 }} />
                </div>
              </div>

              {/* 우측 예약 사이드바 - 데스크톱만 표시 */}
              <div className="w-[368px] overflow-visible">
                <BookingSidebar
                  price={roomData.pricePerNight}
                  originalPrice={roomData.pricePerNight}
                  nights={1}
                  totalPrice={roomData.pricePerNight}
                  host={{
                    name: roomData.residenceNameI18n,
                    isVerified: true,
                    joinYear: getHostingYears(roomData.hostingStartDate),
                    description: roomData.residenceDescriptionI18n,
                    avatar: roomData.residenceLogoImageUrl
                  }}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  guests={guests}
                  onCheckInDateChange={setCheckInDate}
                  onCheckOutDateChange={setCheckOutDate}
                  onGuestsChange={handleGuestsChange}
                  roomId={params.roomId}
                  filterCheckInDate={filterCheckInDates}
                  filterCheckOutDate={filterCheckOutDates}
                  roomLikeCheck={roomData.roomLikeCheck}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 관련 숙소들 - content가 있을 때만 표시 */}
        {relatedRooms.length > 0 && (
          <>
            {/* Divider - 모바일 */}
            <div className="lg:hidden bg-[#FFF] py-12">
              <div className="mx-auto max-w-[1200px] px-4">
                <div className="h-px bg-[#e9eaec] w-full" />
              </div>
            </div>

            {/* Divider - 데스크톱 */}
            <div className="hidden lg:block bg-[#F7F7F8] py-12">
              <div className="mx-auto max-w-[1200px] px-4">
                <div className="h-px bg-[#e9eaec] w-full" />
              </div>
            </div>

            {/* Find more rooms - 모바일 */}
            <div className="lg:hidden bg-[#FFF] pb-28">
              <div className="mx-auto max-w-[1200px] px-4">
                <div className="flex items-center justify-between mb-[18px]">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-extrabold leading-[28px] tracking-[-0.2px] text-[#14151a]">
                      Find more rooms by this host
                    </h2>
                  </div>

                  {totalRoomPages > 1 && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentRoomPage === 0}
                        className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 text-[#14151a]" />
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentRoomPage >= totalRoomPages - 1}
                        className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4 text-[#14151a]" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 모바일용 스크롤 가능한 레이아웃 */}
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  {relatedRooms.map((room) => (
                    <RelatedRoomCard
                      key={room.roomIdentifier}
                      room={room}
                      variant="mobile"
                      onClick={handleRoomClick}
                      onLikeToggle={toggleRelatedRoomLike}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Find more rooms - 데스크톱 */}
            <div className="hidden lg:block bg-[#F7F7F8] pb-20">
              <div className="mx-auto max-w-[1200px] px-4">
                <div className="flex items-center justify-between mb-[18px]">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-extrabold leading-[28px] tracking-[-0.2px] text-[#14151a]">
                      Find more rooms by this host
                    </h2>
                  </div>

                  {totalRoomPages > 1 && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentRoomPage === 0}
                        className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 text-[#14151a]" />
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentRoomPage >= totalRoomPages - 1}
                        className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4 text-[#14151a]" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {relatedRooms.map((room) => (
                    <RelatedRoomCard
                      key={room.roomIdentifier}
                      room={room}
                      variant="desktop"
                      onClick={handleRoomClick}
                      onLikeToggle={toggleRelatedRoomLike}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* 모바일 달력 모달 */}
      <MobileCustomDateRangePicker
        isOpen={isMobileCalendarOpen}
        onClose={() => setIsMobileCalendarOpen(false)}
        checkIn={checkInDate}
        checkOut={checkOutDate}
        onCheckInChange={(date: Date | null) => {
          setCheckInDate(date)
          saveBookingDates(date, checkOutDate)
        }}
        onCheckOutChange={(date: Date | null) => {
          setCheckOutDate(date)
          saveBookingDates(checkInDate, date)
        }}
        locale={currentLanguage.code}
        filterCheckInDate={filterCheckInDates}
        filterCheckOutDate={filterCheckOutDates}
      />

      {/* 이미지 모달 */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-100 bg-black/7 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative bg-white rounded-[24px] w-[1200px] h-[800px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-[#e9eaec]">
              <div className="text-[20px] font-bold text-[#14151a]">
                {currentImageIndex + 1} / {sortedImages.length}
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5 text-[#14151a]" />
              </button>
            </div>

            {/* 이미지 영역 */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[#f7f7f8] relative overflow-hidden">
              <img
                src={sortedImages[currentImageIndex]?.imageUrl}
                alt={roomData.roomNameI18n}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* 네비게이션 버튼 */}
              {sortedImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-[#f7f7f8] rounded-full p-3 shadow-lg transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-[#14151a]" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-[#f7f7f8] rounded-full p-3 shadow-lg transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-[#14151a]" />
                  </button>
                </>
              )}
            </div>

            {/* 썸네일 그리드 */}
            <div className="p-4 bg-white border-t border-[#e9eaec]">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {sortedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index 
                        ? 'border-[#e0004d] scale-105' 
                        : 'border-[#e9eaec] opacity-60 hover:opacity-100 hover:border-[#14151a]'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLOUD_CLIENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => setIsNaverMapLoaded(true)}
      />
    </div>
  )
}
