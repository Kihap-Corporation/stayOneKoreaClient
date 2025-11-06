"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { apiGet, apiPost } from "@/lib/api"
import { Search, ChevronLeft, ChevronRight, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { toast } from "sonner"
import { CustomDateRangePicker } from "@/components/home/custom-date-range-picker"
import { MobileCustomDateRangePicker } from "@/components/home/mobile-custom-date-range-picker"
import { getBookingDates, saveBookingDates } from "@/lib/session-storage"

interface ResidencePageProps {
  params: {
    residenceId: string
  }
}

interface Room {
  roomIdentifier: string
  roomName: string
  pricePerNight: number
  roomMainImageUrl: string
  roomLikeCheck: boolean
}

interface ResidenceDetail {
  residenceIdentifier: string
  residenceName: string
  hostingStartDate: string
  residenceDescription: string
  residenceFullAddress: string
  residenceSiDo: string
  residenceSiGunGu: string
  residenceDongMyeon: string
  residenceDetail: string
  residenceLatitude: number
  residenceLongitude: number
  residenceLogoImageUrl: string
  residenceGalleryImageUrls: string[]
  rooms: {
    rooms: Room[]
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    empty: boolean
  }
}


export default function ResidencePage({ params }: ResidencePageProps) {
  const router = useRouter()
  const { messages, currentLanguage } = useLanguage()
  const [currentPage, setCurrentPage] = useState(0)
  const [residenceData, setResidenceData] = useState<ResidenceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // 세션 스토리지에서 날짜 가져오기
  const [checkInDate, setCheckInDate] = useState<Date | null>(() => {
    const { checkIn } = getBookingDates()
    return checkIn
  })
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(() => {
    const { checkOut } = getBookingDates()
    return checkOut
  })

  // YYYY-MM-DD 형식 문자열 state
  const [checkIn, setCheckIn] = useState<string>(() => {
    const { checkIn } = getBookingDates()
    if (!checkIn) return ""
    const year = checkIn.getFullYear()
    const month = String(checkIn.getMonth() + 1).padStart(2, '0')
    const day = String(checkIn.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [checkOut, setCheckOut] = useState<string>(() => {
    const { checkOut } = getBookingDates()
    if (!checkOut) return ""
    const year = checkOut.getFullYear()
    const month = String(checkOut.getMonth() + 1).padStart(2, '0')
    const day = String(checkOut.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerLocale, setDatePickerLocale] = useState<any>(undefined)

  const pageSize = 12

  // 날짜 포맷 함수
  const formatDate = (date: Date | null) => {
    if (!date) return ''

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    if (currentLanguage.code === 'ko') return `${year}년 ${month}월 ${day}일`
    if (currentLanguage.code === 'zh') return `${year}年${month}月${day}日`
    if (currentLanguage.code === 'fr') return `${day}/${month}/${year}`
    return `${month}/${day}/${year}`
  }

  // 체크인 날짜 변경 핸들러
  const handleCheckInChange = (date: Date | null) => {
    setCheckInDate(date)

    // 체크인을 선택하지 않으면 체크아웃 초기화
    if (!date) {
      setCheckOutDate(null)
      setCheckOut("")
      return
    }

    // 체크인 날짜가 체크아웃 날짜보다 늦으면 체크아웃 초기화
    if (checkOutDate && date >= checkOutDate) {
      setCheckOutDate(null)
      setCheckOut("")
    }

    // API용 날짜 형식으로 변환
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    setCheckIn(`${year}-${month}-${day}`)
  }

  // 체크아웃 날짜 변경 핸들러
  const handleCheckOutChange = (date: Date | null) => {
    setCheckOutDate(date)

    if (date) {
      // API용 날짜 형식으로 변환
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      setCheckOut(`${year}-${month}-${day}`)
    } else {
      setCheckOut("")
    }
  }

  // 호스팅 시작 연도 계산
  const getHostingYears = (startDate: string) => {
    if (!startDate) return 0
    const start = new Date(startDate)
    const now = new Date()
    const years = now.getFullYear() - start.getFullYear()
    return years > 0 ? years : 1
  }

  // 로케일 로드
  useEffect(() => {
    const loadLocale = async () => {
      try {
        switch (currentLanguage.code) {
          case 'ko':
            const { ko } = await import('date-fns/locale/ko')
            setDatePickerLocale(ko)
            break
          case 'en':
            const { enUS } = await import('date-fns/locale/en-US')
            setDatePickerLocale(enUS)
            break
          case 'zh':
            const { zhCN } = await import('date-fns/locale/zh-CN')
            setDatePickerLocale(zhCN)
            break
          case 'fr':
            const { fr } = await import('date-fns/locale/fr')
            setDatePickerLocale(fr)
            break
          default:
            const { ko: defaultKo } = await import('date-fns/locale/ko')
            setDatePickerLocale(defaultKo)
        }
      } catch (error) {
        setDatePickerLocale(undefined)
      }
    }
    loadLocale()
  }, [currentLanguage])

  // 달력 외부 클릭 감지 (데스크톱 전용)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 모바일에서는 모달이므로 외부 클릭 감지 불필요
      if (window.innerWidth < 1024) return
      
      const target = event.target as HTMLElement
      
      // DatePicker 내부 클릭인지 확인
      if (!target.closest('.react-datepicker') && !target.closest('.react-datepicker-popper')) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  // 페이지가 변경될 때마다 체크인/체크아웃 초기화
  useEffect(() => {
    setCheckInDate(null)
    setCheckOutDate(null)
    setCheckIn("")
    setCheckOut("")
    setCurrentPage(0)
  }, [params.residenceId])

  // 검색 실행 함수
  const executeSearch = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        residenceIdentifier: params.residenceId,
        page: currentPage.toString(),
        size: pageSize.toString(),
        languageCode: currentLanguage.code
      })

      if (checkIn) queryParams.append('checkIn', checkIn)
      if (checkOut) queryParams.append('checkOut', checkOut)

      const response = await apiGet(`/api/residence/detail?${queryParams.toString()}`)

      if (response.code === 200 && response.data) {
        setResidenceData(response.data)
      } else {
        setError("Failed to load residence data")
        toast.error(messages?.searchResult?.searchError || '검색 중 오류가 발생했습니다')
      }
    } catch (error) {
      setError("Failed to load residence data")
      toast.error(messages?.searchResult?.searchError || '검색 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 레지던스 상세 정보 조회 (초기 로딩 시에만 실행)
  useEffect(() => {
    executeSearch()
  }, [params.residenceId, currentPage, currentLanguage])

  const handleRoomClick = (roomId: string) => {
    // 체크인/체크아웃 날짜를 쿼리 파라미터로 전달
    const queryParams = new URLSearchParams()
    if (checkIn) queryParams.append('checkIn', checkIn)
    if (checkOut) queryParams.append('checkOut', checkOut)

    const url = `/residence/${params.residenceId}/room/${roomId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    router.push(url)
  }

  const toggleRoomLike = async (roomIdentifier: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!residenceData) return

    // 낙관적 업데이트
    setResidenceData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          rooms: prev.rooms.rooms.map(room =>
            room.roomIdentifier === roomIdentifier
              ? { ...room, roomLikeCheck: !room.roomLikeCheck }
              : room
          )
        }
      }
    })

    try {
      const response = await apiPost(`/api/like?roomIdentifier=${roomIdentifier}`)
      
      // 응답 코드가 200이 아닌 경우 롤백
      if (response.code !== 200) {
        setResidenceData(prev => {
          if (!prev) return prev
          return {
            ...prev,
            rooms: {
              ...prev.rooms,
              rooms: prev.rooms.rooms.map(room =>
                room.roomIdentifier === roomIdentifier
                  ? { ...room, roomLikeCheck: !room.roomLikeCheck }
                  : room
              )
            }
          }
        })
      }
    } catch (error) {
      // 에러 발생 시 롤백
      setResidenceData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            rooms: prev.rooms.rooms.map(room =>
              room.roomIdentifier === roomIdentifier
                ? { ...room, roomLikeCheck: !room.roomLikeCheck }
                : room
            )
          }
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFF] lg:bg-[#f7f7f8]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg">{messages?.common?.loading || "Loading..."}</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !residenceData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFF] lg:bg-[#f7f7f8]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-[#14151a]">
            {messages?.error?.loadFailed || "Failed to load data"}
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  const rooms = residenceData.rooms.rooms
  const totalPages = residenceData.rooms.totalPages

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF] lg:bg-[#f7f7f8]">
      <Header />

      {/* 배경 이미지 섹션 */}
      <div className="relative w-full h-[270px] bg-gray-200">
        {residenceData.residenceGalleryImageUrls.length > 0 ? (
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation
            className="h-full w-full"
          >
            {residenceData.residenceGalleryImageUrls.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image}
                  alt={`${residenceData.residenceName} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Image
            src="http://localhost:3845/assets/242e01dbfe5fc9e8d9a2d40b0a357702ff4046f8.png"
            alt="Background"
            fill
            className="object-cover"
          />
        )}
      </div>

      <main className="flex-1 -mt-16 pb-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 좌측 호스트 정보 */}
            <div className="w-full lg:w-[368px] flex-shrink-0">
              <div className="flex flex-col gap-2">
                {/* 호스트 로고 - 원형 */}
                <div className="w-[124px] h-[124px] rounded-full border border-[#dee0e3] bg-white overflow-hidden flex-shrink-0 z-1">
                  <img
                    src={residenceData.residenceLogoImageUrl}
                    alt={residenceData.residenceName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 호스트 정보 섹션 */}
                <div className="flex flex-col gap-2">
                  {/* Host Name + Years */}
                  <div className="flex flex-col gap-1">
                    <h1 className="text-[24px] font-extrabold leading-[32px] tracking-[-0.3px] text-[#14151a] line-clamp-2">
                      {residenceData.residenceName}
                    </h1>
                    <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
                      {getHostingYears(residenceData.hostingStartDate)} years hosting
                    </p>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] ${!showFullDescription ? 'line-clamp-4' : ''}`}>
                      {residenceData.residenceDescription}
                    </p>
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="bg-[rgba(10,15,41,0.04)] rounded-full px-2 py-1 flex items-center justify-center gap-1 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] self-start"
                    >
                      <span className="text-[12px] font-medium leading-[16px] tracking-[0px] text-[#14151a] px-1">
                        {showFullDescription ? "Show less" : "Read more"}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform ${showFullDescription ? 'rotate-90' : ''}`}>
                        <path d="M5 3L9 7L5 11" stroke="#14151a" strokeWidth="2" fill="none" />
                      </svg>
                    </button>
                  </div>

                  {/* Share Button */}
                  <Button
                    className="w-full h-12 rounded-full bg-[#e0004d] hover:bg-[#c2003f] shadow-sm"
                    onClick={async () => {
                      try {
                        const currentUrl = window.location.href
                        await navigator.clipboard.writeText(currentUrl)
                        toast.success(messages?.roomDetail?.shareSuccess ||
                          (currentLanguage.code === 'ko' ? '링크가 클립보드에 복사되었습니다!' :
                           currentLanguage.code === 'en' ? 'Link copied to clipboard!' :
                           currentLanguage.code === 'zh' ? '链接已复制到剪贴板!' :
                           'Lien copié dans le presse-papiers!'))
                      } catch (error) {
                        toast.error(messages?.roomDetail?.shareError ||
                          (currentLanguage.code === 'ko' ? '링크 복사에 실패했습니다' :
                           currentLanguage.code === 'en' ? 'Failed to copy link' :
                           currentLanguage.code === 'zh' ? '复制链接失败' :
                           'Échec de la copie du lien'))
                      }
                    }}
                  >
                    <span className="text-[16px] font-medium leading-[24px] tracking-[-0.2px] text-white">
                      Share with friends
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 구분선 - 데스크톱과 모바일에서 다르게 표시 */}
            <div className="hidden lg:block">
              {/* 데스크톱: 얇은 구분선 */}
              <div className="bg-[#e9eaec] h-px w-full my-8" />
            </div>
            <div className="lg:hidden">
              {/* 모바일: 더 두꺼운 구분선 */}
              <div className="bg-[#e9eaec] h-px w-full my-4" />
            </div>

            {/* 우측 룸 리스트 */}
            <div className="flex-1 flex flex-col gap-4">
              {/* 검색 필드 */}
              <div className="relative bg-white border border-[#dee0e3] rounded-[16px] px-3 lg:px-4 py-3 lg:py-4 flex flex-col gap-2 lg:gap-3 items-stretch z-10 lg:mt-32 mt-2">
              {/* 데스크톱: 가로로 한 줄 배치, 모바일: 세로로 배치 */}
              <div className="flex flex-col lg:flex-row lg:items-end gap-2 lg:gap-3">
                {/* Schedule 라벨 - 데스크톱에서는 숨김 */}
                <div className="flex flex-col gap-1 lg:gap-2 lg:hidden">
                  <label className="text-[14px] lg:text-[16px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                    Schedule
                  </label>
                </div>

                {/* 체크인/체크아웃 입력 필드 wrapper */}
                <div className="relative flex flex-col lg:flex-row gap-3 lg:gap-4 lg:flex-[2]">
                  {/* Check-in */}
                  <div className="relative flex-1 cursor-pointer" onClick={() => setShowDatePicker(true)}>
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400 pointer-events-none z-10" />
                    <div className="w-full rounded-xl border border-[#dee0e3] bg-white pl-8 lg:pl-12 pr-8 lg:pr-12 h-12 lg:h-12 text-[14px] lg:text-[16px] leading-[20px] tracking-[-0.1px] text-[#14151a] flex items-center">
                      {checkInDate ? formatDate(checkInDate) : <span className="text-gray-400">Check-in</span>}
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="relative flex-1 cursor-pointer" onClick={() => setShowDatePicker(true)}>
                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 pointer-events-none z-10 ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-gray-400'}`} />
                    <div className={`w-full rounded-xl border pl-8 lg:pl-12 pr-8 lg:pr-12 h-12 lg:h-12 text-[14px] lg:text-[16px] leading-[20px] tracking-[-0.1px] flex items-center ${!checkInDate
                        ? 'bg-gray-50 text-[rgba(13,17,38,0.3)] border-gray-200'
                        : 'bg-white text-[#14151a] border-[#dee0e3]'
                      }`}>
                      {checkOutDate ? formatDate(checkOutDate) : <span className="text-gray-400">Check-out</span>}
                    </div>
                  </div>

                  {/* 전체 날짜 초기화 버튼 */}
                  {(checkInDate || checkOutDate) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCheckInDate(null)
                          setCheckOutDate(null)
                          setCheckIn("")
                          setCheckOut("")
                        setShowDatePicker(false)
                        }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer"
                        type="button"
                      >
                      <X className="h-4 w-4" />
                      </button>
                    )}

                   {/* 데스크톱용 달력 - 하나의 범위 선택 달력 (1개월 표시) */}
                   {showDatePicker && (
                     <div className="hidden lg:block absolute top-full left-0 z-50 mt-2">
                       <CustomDateRangePicker
                         checkIn={checkInDate}
                         checkOut={checkOutDate}
                         onCheckInChange={(date: Date | null) => {
                           setCheckInDate(date)
                           saveBookingDates(date, checkOutDate)
                              if (date) {
                             const year = date.getFullYear()
                             const month = String(date.getMonth() + 1).padStart(2, '0')
                             const day = String(date.getDate()).padStart(2, '0')
                             setCheckIn(`${year}-${month}-${day}`)
                           } else {
                             setCheckIn("")
                           }
                         }}
                         onCheckOutChange={(date: Date | null) => {
                           setCheckOutDate(date)
                           saveBookingDates(checkInDate, date)
                           if (date) {
                             const year = date.getFullYear()
                             const month = String(date.getMonth() + 1).padStart(2, '0')
                             const day = String(date.getDate()).padStart(2, '0')
                             setCheckOut(`${year}-${month}-${day}`)
                             // 체크아웃이 선택되면 달력 닫기
                             setShowDatePicker(false)
                           } else {
                          setCheckOut("")
                           }
                         }}
                         locale={currentLanguage.code}
                            monthsShown={1}
                         showBorder={true}
                          />
                      </div>
                    )}
                  </div>

                {/* 검색 및 모든 방 보기 버튼들 - 더 큰 크기 */}
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:flex-1 lg:justify-end">
                  {/* 검색 버튼 */}
                  <Button
                    onClick={() => {
                      if (!checkInDate || !checkOutDate) {
                        toast.error(messages?.common?.error || '체크인과 체크아웃 날짜를 모두 선택해주세요')
                        return
                      }
                      executeSearch()
                    }}
                    disabled={!checkInDate || !checkOutDate}
                    className="flex-1 lg:flex-none lg:w-auto h-12 lg:h-12 px-4 lg:px-6 rounded-xl bg-[#e0004d] hover:bg-[#c2003f] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Search className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    <span className="text-[15px] lg:text-[16px] font-medium leading-[24px] tracking-[-0.1px] text-white">
                      {messages?.searchResult?.searchButton || '검색'}
                    </span>
                  </Button>

                  {/* 모든 방 보기 버튼 */}
                  <Button
                    onClick={() => {
                      // 체크인/체크아웃 데이터 초기화
                      setCheckInDate(null)
                      setCheckOutDate(null)
                      setCheckIn("")
                      setCheckOut("")
                      setCurrentPage(0)
                      // 모든 방을 보기 위해 검색 실행 (체크인/체크아웃 없이)
                      executeSearch()
                    }}
                    className="flex-1 lg:flex-none lg:w-auto h-12 lg:h-12 px-4 lg:px-6 rounded-xl bg-white border border-[#dee0e3] hover:bg-gray-50"
                  >
                    <span className="text-[15px] lg:text-[16px] font-medium leading-[24px] tracking-[-0.1px] text-[#14151a]">
                      {messages?.searchResult?.showAllRooms || '모든 방 보기'}
                    </span>
                  </Button>
                </div>
              </div>
              </div>

              {/* 방 목록 헤더 */}
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-extrabold leading-[28px] tracking-[-0.2px] text-[#14151a]">
                  Available rooms ({residenceData.rooms.totalElements})
                </h2>
              </div>

              {/* 방 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                  <div
                    key={room.roomIdentifier}
                    className="flex flex-col gap-2 cursor-pointer"
                    onClick={() => handleRoomClick(room.roomIdentifier)}
                  >
                    {/* 이미지 */}
                    <div className="relative aspect-square rounded-[16px] overflow-hidden bg-gray-200">
                      <img
                        src={room.roomMainImageUrl}
                        alt={room.roomName}
                        className="w-full h-full object-cover"
                      />

                      {/* Like Button */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          className="bg-[rgba(10,15,41,0.04)] p-1 rounded-md hover:bg-[rgba(10,15,41,0.1)] transition-colors"
                          onClick={(e) => toggleRoomLike(room.roomIdentifier, e)}
                        >
                          {room.roomLikeCheck ? (
                            <svg width="24" height="22" viewBox="0 0 18 16" fill="none">
                              <path
                                d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z"
                                fill="#e0004d"
                              />
                            </svg>
                          ) : (
                            <svg width="24" height="22" viewBox="0 0 18 16" fill="none">
                              <path
                                d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415ZM3.31033 3.14332C2.06866 4.38498 2.00616 6.37248 3.15033 7.68582L9.00033 13.545L14.8503 7.68665C15.9953 6.37248 15.9328 4.38748 14.6895 3.14165C13.4503 1.89998 11.4553 1.83998 10.1453 2.98665L6.64366 6.48915L5.4645 5.31082L7.81866 2.95498L7.75033 2.89748C6.43783 1.84332 4.5195 1.93332 3.31033 3.14332V3.14332Z"
                                fill="#FFF"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 방 정보 */}
                    <div className="flex flex-col gap-2">
                      {/* Title */}
                      <div className="flex flex-col">
                        <h3 className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a] line-clamp-2 max-h-[52px] overflow-hidden">
                          {room.roomName}
                        </h3>
                        <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
                          {residenceData.residenceFullAddress}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col">
                        <span className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a] underline">
                          ${room.pricePerNight.toFixed(2)} per night
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, residenceData.rooms.currentPage - 1))}
                    disabled={residenceData.rooms.first}
                    className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 text-[#14151a]" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-medium transition-colors ${
                        residenceData.rooms.currentPage === i
                          ? 'bg-[#e0004d] text-white'
                          : 'bg-[rgba(10,15,41,0.04)] text-[#14151a] hover:bg-[rgba(10,15,41,0.08)]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, residenceData.rooms.currentPage + 1))}
                    disabled={residenceData.rooms.last}
                    className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4 text-[#14151a]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* 날짜 범위 선택 달력 모달 - 모바일만 */}
      <MobileCustomDateRangePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        checkIn={checkInDate}
        checkOut={checkOutDate}
        onCheckInChange={(date: Date | null) => {
          setCheckInDate(date)
          saveBookingDates(date, checkOutDate)
          if (date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            setCheckIn(`${year}-${month}-${day}`)
          } else {
            setCheckIn("")
          }
        }}
        onCheckOutChange={(date: Date | null) => {
          setCheckOutDate(date)
          saveBookingDates(checkInDate, date)
          if (date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            setCheckOut(`${year}-${month}-${day}`)
          } else {
            setCheckOut("")
          }
        }}
        locale={currentLanguage.code}
      />
    </div>
  )
}

