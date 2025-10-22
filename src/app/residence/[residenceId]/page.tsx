"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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
  const [checkIn, setCheckIn] = useState<string>("")
  const [checkOut, setCheckOut] = useState<string>("")
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)
  const [isCheckInCalendarOpen, setIsCheckInCalendarOpen] = useState(false)
  const [isCheckOutCalendarOpen, setIsCheckOutCalendarOpen] = useState(false)
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
        console.error('Failed to load locale:', error)
        setDatePickerLocale(undefined)
      }
    }
    loadLocale()
  }, [currentLanguage])

  // 달력 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.calendar-container') && !target.closest('.react-datepicker') && !target.closest('.react-datepicker-popper')) {
        setIsCheckInCalendarOpen(false)
        setIsCheckOutCalendarOpen(false)
      }
    }

    if (isCheckInCalendarOpen || isCheckOutCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCheckInCalendarOpen, isCheckOutCalendarOpen])

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
        toast.success(messages?.common?.success || '검색이 완료되었습니다')
      } else {
        setError("Failed to load residence data")
        toast.error(messages?.searchResult?.searchError || '검색 중 오류가 발생했습니다')
      }
    } catch (error) {
      console.error('Error fetching residence detail:', error)
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
    router.push(`/residence/${params.residenceId}/room/${roomId}`)
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
      console.error('좋아요 토글 실패:', error)
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
      <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
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
      <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
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
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
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
                <img
                  src={image}
                  alt={`${residenceData.residenceName} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src="http://localhost:3845/assets/242e01dbfe5fc9e8d9a2d40b0a357702ff4046f8.png"
            alt="Background"
            className="w-full h-full object-cover"
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
                  {/* Verified Badge + Name + Years */}
                  <div className="flex flex-col gap-1">
                    <div className="inline-flex items-center justify-center bg-[#d1fae4] border border-[rgba(10,15,41,0.08)] rounded-full px-2 py-1 self-start">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mr-1">
                        <path d="M7 0L9 5L14 5L10 8L12 14L7 10L2 14L4 8L0 5L5 5L7 0Z" fill="#166e3f" />
                      </svg>
                      <span className="text-[12px] font-medium leading-[16px] text-[#166e3f]">
                        Verified Host
                      </span>
                    </div>
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
                        console.error('링크 복사 실패:', error)
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

            {/* 우측 룸 리스트 */}
            <div className="flex-1 flex flex-col gap-4">
              {/* 검색 필드 */}
              <div className="bg-white border border-[#dee0e3] rounded-[16px] px-4 py-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-end z-100 mt-32">
              {/* 체크인/체크아웃 날짜 선택 및 검색 */}
              <div className="flex gap-3 items-end">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                    Schedule
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Check-in */}
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                      <input
                        type="text"
                        value={checkInDate ? formatDate(checkInDate) : ''}
                        onClick={() => {
                          setIsCheckInCalendarOpen(!isCheckInCalendarOpen)
                          setIsCheckOutCalendarOpen(false) // 체크인 달력을 열 때 체크아웃 달력 닫기
                        }}
                        readOnly
                        className="w-full rounded-xl border border-[#dee0e3] bg-white pl-10 pr-10 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[#14151a] focus:border-[#E91E63] focus:outline-none hover:border-gray-300 cursor-pointer"
                        placeholder="Check-in"
                      />
                      {checkInDate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCheckInDate(null)
                            setCheckOutDate(null)
                            setCheckIn("")
                            setCheckOut("")
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}

                      {isCheckInCalendarOpen && (
                        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#dee0e3] p-4 w-[280px] calendar-container">
                          <div className="mb-3 text-sm font-semibold text-[#14151a]">
                            Check-in
                          </div>
                          <DatePicker
                            selected={checkInDate}
                            onChange={(date) => {
                              handleCheckInChange(date)
                              if (date) {
                                // 체크인을 선택하면 체크인 달력을 닫고 체크아웃 입력 필드를 활성화
                                setIsCheckInCalendarOpen(false)
                              }
                            }}
                            inline
                            locale={datePickerLocale}
                            minDate={new Date()}
                            monthsShown={1}
                            calendarClassName="!border-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Check-out */}
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10 ${!checkInDate ? 'text-[rgba(13,17,38,0.3)]' : 'text-gray-400'}`} />
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
                        placeholder="Check-out"
                      />
                      {checkOutDate && checkInDate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCheckOutDate(null)
                            setCheckOut("")
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}

                      {isCheckOutCalendarOpen && (
                        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#dee0e3] p-4 w-[280px] calendar-container">
                          <div className="mb-3 text-sm font-semibold text-[#14151a]">
                            Check-out
                          </div>
                          <DatePicker
                            selected={checkOutDate}
                            onChange={(date) => {
                              handleCheckOutChange(date)
                              if (date) {
                                // 체크아웃을 선택하면 체크아웃 달력을 닫음
                                setIsCheckOutCalendarOpen(false)
                              }
                            }}
                            inline
                            locale={datePickerLocale}
                            minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date()}
                            monthsShown={1}
                            calendarClassName="!border-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 검색 및 모든 방 보기 버튼들 */}
                <div className="flex gap-2">
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
                    className="flex-1 h-10 px-4 rounded-xl bg-[#e0004d] hover:bg-[#c2003f] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-white">
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
                    className="flex-1 h-10 px-4 rounded-xl bg-white border border-[#dee0e3] hover:bg-gray-50"
                  >
                    <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
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
    </div>
  )
}

