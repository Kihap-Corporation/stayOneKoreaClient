"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { ChevronRight, Clock, CheckCircle, XCircle, Calendar, AlertTriangle } from "lucide-react"

// Booking 타입 정의 (API 응답에 맞게 수정)
interface Booking {
  reservationIdentifier: string
  checkInDate: string
  checkOutDate: string
  totalNights: number
  reservationStatus: 'RESERVATION_UNDER_WAY' | 'RESERVATION_PENDING' | 'CANCELLED' | 'APPROVED' | 'REJECTED'
  roomName: string
  roomIdentifier: string
  residenceName: string
  roomImageUrl: string
  createdAt: string
}

function BookingsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { messages, currentLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])

  // URL 쿼리 파라미터에서 초기 페이지 번호 읽기 (0부터 시작)
  const initialPage = parseInt(searchParams.get('page') || '0')
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // 예약 상태에 따른 스타일과 아이콘
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'RESERVATION_UNDER_WAY':
        return {
          label: messages?.bookings?.underWay || 'Under Way',
          color: 'bg-[#2196f3]',
          textColor: 'text-white',
          icon: Clock
        }
      case 'RESERVATION_PENDING':
        return {
          label: messages?.bookings?.pending || 'Pending',
          color: 'bg-[#ffa726]',
          textColor: 'text-white',
          icon: Clock
        }
      case 'APPROVED':
        return {
          label: messages?.bookings?.approved || 'Approved',
          color: 'bg-[#26bd6c]',
          textColor: 'text-white',
          icon: CheckCircle
        }
      case 'CANCELLED':
        return {
          label: messages?.bookings?.cancelled || 'Cancelled',
          color: 'bg-[#e9eaec]',
          textColor: 'text-[#14151a]',
          icon: XCircle
        }
      case 'REJECTED':
        return {
          label: messages?.bookings?.rejected || 'Rejected',
          color: 'bg-[#f44336]',
          textColor: 'text-white',
          icon: AlertTriangle
        }
      default:
        return {
          label: status,
          color: 'bg-gray-100',
          textColor: 'text-gray-600',
          icon: Clock
        }
    }
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

  // 생성일 포맷팅 함수 (YYYY.MM.DD)
  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  // 예약 목록 조회
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const languageCode = currentLanguage.code

        // 쿼리 파라미터 구성
        const params = new URLSearchParams()
        params.append('page', currentPage.toString())
        params.append('size', '10')
        params.append('languageCode', languageCode)

        const response = await apiGet(
          `/api/user/reserve?${params.toString()}`
        )

        if (response.code === 200 && response.data) {
          setBookings(response.data.content || [])
          setTotalPages(response.data.totalPages || 1)
          setTotalElements(response.data.totalElements || 0)
        } else {
          setBookings([])
          setTotalPages(1)
          setTotalElements(0)
        }
      } catch (error) {
        setBookings([])
        setTotalPages(1)
        setTotalElements(0)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [currentPage, currentLanguage])

  const handleBookingClick = (reservationIdentifier: string, status: string) => {
    if (status === 'RESERVATION_UNDER_WAY') {
      // 예약 진행 중인 상태 - 예약 페이지로 이동
      router.push(`/reservation/${reservationIdentifier}`)
    } else {
      // 예약 완료된 상태 - 예약 상세 페이지로 이동
      router.push(`/bookings/${reservationIdentifier}`)
    }
  }

  // 페이지 변경 핸들러 - URL 쿼리 파라미터 업데이트
  const handlePageChange = (pageIndex: number) => {
    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageIndex.toString())
    router.push(`/bookings?${params.toString()}`, { scroll: false })

    // 상태 업데이트
    setCurrentPage(pageIndex)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
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

  // 예약 내역이 없을 때 전체 화면 중앙 배치
  if (bookings.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <Calendar className="h-16 w-16 text-[#e0004d] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#14151a] mb-2">
                {messages?.bookings?.noBookings || "No bookings found"}
              </h2>
              <p className="text-[#666] text-base">
                {messages?.bookings?.noBookingsDesc || "Start your first booking"}
              </p>
            </div>
            <Button
              onClick={() => router.push('/')}
              className="bg-[#e0004d] hover:bg-[#C2185B] text-white px-8 py-3 rounded-full text-base font-medium"
            >
              {messages?.bookings?.findBookings || "Find Bookings"}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <Header />

      <main className="flex-1 py-10 px-4">
        <div className="flex flex-col gap-6">
          <div className="mx-auto max-w-7xl xl:max-w-[1200px]">
            {/* Header */}
            <div className="flex gap-2 mb-6 items-center">
              <div className="p-1">
                <Calendar className="h-7 w-7 text-[#14151a]" />
              </div>
              <h1 className="text-[30px] font-bold tracking-[-0.5px] leading-[36px]">
                {messages?.bookings?.title || "Bookings"}
              </h1>
            </div>

            {/* Bookings List */}
            <div className="flex flex-col gap-6">
              {bookings.map((booking) => {
                const statusInfo = getStatusInfo(booking.reservationStatus)
                const StatusIcon = statusInfo.icon
                const checkInFormatted = formatDate(booking.checkInDate)
                const checkOutFormatted = formatDate(booking.checkOutDate)

                return (
                  <div
                    key={booking.reservationIdentifier}
                    className="bg-white rounded-[16px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleBookingClick(booking.reservationIdentifier, booking.reservationStatus)}
                  >
                    {/* Status Header */}
                    <div className={`${statusInfo.color} border ${statusInfo.color.includes('border') ? '' : 'border-transparent'} px-4 py-2 flex items-center justify-between`}>
                      <p className={`text-sm font-semibold tracking-[-0.1px] ${statusInfo.textColor}`}>
                        {statusInfo.label}
                      </p>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                        <span className={`text-sm font-medium tracking-[-0.1px] ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Content - 데스크톱 버전 */}
                    <div className="hidden lg:flex">
                      {/* Image */}
                      <div className="w-[205px] h-[205px] relative flex-shrink-0">
                        <img
                          src={booking.roomImageUrl}
                          alt={booking.roomName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 이미지 로드 실패 시 fallback
                            const target = e.target as HTMLImageElement
                            target.src = '/logo/desktop_logo.png' // 기본 로고로 대체
                          }}
                        />
                        {/* 생성일 표시 - 좌측 상단 */}
                        <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                          {formatCreatedAt(booking.createdAt)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col">
                        {/* Title Section */}
                        <div className="px-5 py-4">
                          <h3 className="text-lg font-bold tracking-[-0.2px] leading-[26px] max-h-[52px] overflow-hidden">
                            {booking.roomName}
                          </h3>
                          <p className="text-lg text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.2px] leading-[26px]">
                            {booking.residenceName}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                              ID: {booking.roomIdentifier}
                            </span>
                          </div>
                        </div>

                        {/* Dates and Nights */}
                        <div className="border-t border-[#dee0e3] px-5 py-4 flex items-center justify-between rounded-bl-[16px] rounded-br-[16px]">
                          <div className="flex gap-6 items-center flex-1">
                            {/* Check-in */}
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-[#14151a] font-medium tracking-[-0.1px]">
                                {messages?.bookings?.checkIn || "Check-in"}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-base font-bold tracking-[-0.2px]">
                                  {checkInFormatted.weekday}, {checkInFormatted.month} {checkInFormatted.day}
                                </span>
                                <span className="text-xs text-[rgba(13,17,38,0.4)] font-medium">
                                  {checkInFormatted.year}
                                </span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

                            {/* Check-out */}
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-[#14151a] font-medium tracking-[-0.1px]">
                                {messages?.bookings?.checkOut || "Check-out"}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-base font-bold tracking-[-0.2px]">
                                  {checkOutFormatted.weekday}, {checkOutFormatted.month} {checkOutFormatted.day}
                                </span>
                                <span className="text-xs text-[rgba(13,17,38,0.4)] font-medium">
                                  {checkOutFormatted.year}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Nights Badge */}
                          <div className="bg-[#f7f7f8] rounded-xl w-16 h-16 flex flex-col items-center justify-center text-center ml-4">
                            <span className="text-xl font-extrabold tracking-[-0.2px]">{booking.totalNights}</span>
                            <span className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                              {messages?.bookings?.nights || "nights"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content - 모바일 버전 */}
                    <div className="lg:hidden">
                      {/* Image */}
                      <div className="w-full h-[180px] relative">
                        <img
                          src={booking.roomImageUrl}
                          alt={booking.roomName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 이미지 로드 실패 시 fallback
                            const target = e.target as HTMLImageElement
                            target.src = '/logo/desktop_logo.png' // 기본 로고로 대체
                          }}
                        />
                        {/* 생성일 표시 - 좌측 상단 */}
                        <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                          {formatCreatedAt(booking.createdAt)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        {/* Title Section */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold tracking-[-0.2px] leading-[28px] mb-2">
                            {booking.roomName}
                          </h3>
                          <p className="text-base text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.2px] leading-[24px] mb-2">
                            {booking.residenceName}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                              ID: {booking.roomIdentifier}
                            </span>
                          </div>
                        </div>

                        {/* Dates - 모바일에서는 세로 배치 */}
                        <div className="flex gap-4 items-center mb-4">
                          {/* Check-in */}
                          <div className="flex-1">
                            <span className="text-sm text-[#14151a] font-medium tracking-[-0.1px] block mb-1">
                              {messages?.bookings?.checkIn || "Check-in"}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-base font-bold tracking-[-0.2px]">
                                {checkInFormatted.weekday}, {checkInFormatted.month} {checkInFormatted.day}
                              </span>
                              <span className="text-xs text-[rgba(13,17,38,0.4)] font-medium">
                                {checkInFormatted.year}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-4" />

                          {/* Check-out */}
                          <div className="flex-1">
                            <span className="text-sm text-[#14151a] font-medium tracking-[-0.1px] block mb-1">
                              {messages?.bookings?.checkOut || "Check-out"}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-base font-bold tracking-[-0.2px]">
                                {checkOutFormatted.weekday}, {checkOutFormatted.month} {checkOutFormatted.day}
                              </span>
                              <span className="text-xs text-[rgba(13,17,38,0.4)] font-medium">
                                {checkOutFormatted.year}
                              </span>
                            </div>
                          </div>

                          {/* Nights Badge */}
                          <div className="bg-[#f7f7f8] rounded-xl w-14 h-14 flex flex-col items-center justify-center text-center">
                            <span className="text-lg font-extrabold tracking-[-0.2px]">{booking.totalNights}</span>
                            <span className="text-xs text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                              {messages?.bookings?.nights || "nights"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-8">
                <div className="flex gap-2 items-center flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i).map((pageIndex) => {
                    const pageNumber = pageIndex + 1 // UI에서는 1부터 표시
                    return (
                      <Button
                        key={pageIndex}
                        variant={pageIndex === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageIndex)} // API에서는 0부터 시작
                        className={`w-10 h-10 lg:w-10 lg:h-10 rounded-xl text-sm lg:text-base ${
                          pageIndex === currentPage
                            ? 'bg-[rgba(10,15,41,0.04)] text-[#14151a] border-[#dee0e3]'
                            : 'bg-white hover:bg-[rgba(10,15,41,0.04)] border-[#dee0e3]'
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <BookingsPageContent />
    </Suspense>
  )
}
