"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { ChevronLeft, ChevronRight, Wifi, WashingMachine, AirVent, Bell, Flame, Globe, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

// Room Facility 타입 정의 (새로운 응답 구조)
interface RoomFacility {
  facilityType: string
  customNameI18n: Record<string, string>
}

// Booking Detail 타입 정의 (새로운 API 응답 구조에 맞게 수정)
interface BookingDetail {
  reservationIdentifier: string
  reservationStatus: string
  roomName: string
  residenceName: string
  roomIdentifier: string
  roomImageUrl: string
  checkInDate: string
  checkOutDate: string
  totalNights: number
  roomDailyPrice: number
  totalPrice: number
  curUnit: string
  residenceFullAddress: string
  residenceSiDo: string
  residenceSiGunGu: string
  residenceDongMyeon: string
  residenceDetail: string
  roomFacilities: RoomFacility[]
  userFirstName: string
  userLastName: string
  userEmail: string
  userPhoneNumber: string
  userCountryCode: string
}

// 시설 아이콘 매핑
const getFacilityIcon = (facilityType: string) => {
  const lowerFacility = facilityType.toLowerCase()
  if (lowerFacility.includes('wifi') || lowerFacility.includes('wi-fi')) return Wifi
  if (lowerFacility.includes('washing') || lowerFacility.includes('machine')) return WashingMachine
  if (lowerFacility.includes('air') || lowerFacility.includes('conditioning')) return AirVent
  if (lowerFacility.includes('smoke') || lowerFacility.includes('alarm')) return Bell
  if (lowerFacility.includes('carbon') || lowerFacility.includes('monoxide')) return Flame
  if (lowerFacility.includes('parking')) return Globe
  return Globe // 기본 아이콘
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

// Facility Item 컴포넌트
const FacilityItem = ({ facility }: { facility: { iconComponent: any; name: string; type: string } }) => {
  const IconComponent = facility.iconComponent

  return (
    <div className="flex items-center gap-2 px-0 py-0">
      <IconComponent className="h-5 w-5 text-[#14151a]" />
      <span className="text-sm font-medium tracking-[-0.1px] text-[#14151a]">
        {facility.name}
      </span>
    </div>
  )
}

// 상태에 따른 스타일
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'RESERVATION_UNDER_WAY':
      return {
        label: 'Under Way',
        color: 'bg-[#f48e2f] border-[#fad0a9]',
        textColor: 'text-white',
        icon: Clock
      }
    case 'RESERVATION_PENDING':
      return {
        label: 'Pending',
        color: 'bg-[#ffa726] border-[#ffcc02]',
        textColor: 'text-white',
        icon: Clock
      }
    case 'APPROVED':
      return {
        label: 'Approved',
        color: 'bg-[#26bd6c] border-[#9af4c3]',
        textColor: 'text-white',
        icon: CheckCircle
      }
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: 'bg-[#e9eaec]',
        textColor: 'text-[#14151a]',
        icon: XCircle
      }
    case 'REJECTED':
      return {
        label: 'Rejected',
        color: 'bg-[#f44336] border-[#ffcdd2]',
        textColor: 'text-white',
        icon: AlertTriangle
      }
    default:
      return {
        label: status,
        color: 'bg-[#f48e2f]',
        textColor: 'text-white',
        icon: Clock
      }
  }
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { messages, currentLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [showAllFacilities, setShowAllFacilities] = useState(false)

  const reservationId = params.reservationId as string

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const languageCode = currentLanguage.code

        const response = await apiGet(
          `/api/user/reserve/${reservationId}?languageCode=${languageCode}`
        )

        if (response.code === 200 && response.data) {
          setBooking(response.data)
        } else if (response.code === 40103) {
          alert(messages?.auth?.tokenExpired || "유효한 계정이 아닙니다. 다시 로그인해주세요.")
          localStorage.removeItem('isLoggedIn')
          router.push('/account_check')
        } else if (response.code === 40500) {
          alert(messages?.roomDetail?.roomNotFound || "존재하지 않는 방입니다.")
        } else {
          console.error('Failed to fetch booking detail:', response)
        }
      } catch (error) {
        console.error('Error fetching booking detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetail()
  }, [reservationId, currentLanguage, messages, router])

  // 예약 취소 기능은 다른 페이지에서 처리됨
  const handleCancelBooking = () => {
    // 예약 취소 버튼 클릭 시 처리할 로직
    // 현재는 API 연결 없이 UI만 표시
    console.log('Cancel booking clicked for reservation:', reservationId)
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

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.bookings?.noBookings || "No booking found"}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusInfo = getStatusInfo(booking.reservationStatus)
  const StatusIcon = statusInfo.icon
  const checkInFormatted = formatDate(booking.checkInDate)
  const checkOutFormatted = formatDate(booking.checkOutDate)

  // 시설 정보를 처리 (customNameI18n 또는 facilityType을 기반으로 아이콘과 이름 매핑)
  const processedFacilities = (booking.roomFacilities || []).map(facility => {
    // customNameI18n에서 현재 언어에 맞는 이름 찾기, 없으면 facilityType 사용
    const facilityName = facility.customNameI18n?.[currentLanguage.code] || facility.facilityType
    return {
      iconComponent: getFacilityIcon(facility.facilityType),
      name: facilityName,
      type: facility.facilityType
    }
  })

  const displayedFacilities = showAllFacilities
    ? processedFacilities
    : processedFacilities.slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <Header />

      <main className="flex-1 py-10 px-4">
        <div className="mx-auto w-full max-w-[640px] flex flex-col gap-6">
          {/* Back to bookings button */}
          <button
            onClick={() => router.push('/bookings')}
            className="bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] flex items-center gap-2 px-[10px] py-[6px] rounded-[10px] transition-colors self-start cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-[#14151a]" />
            <span className="text-sm font-medium text-[#14151a] tracking-[-0.1px]">
              Back to bookings
            </span>
          </button>

          {/* Booking Card */}
          <div className="bg-white border border-[#dee0e3] rounded-[16px] overflow-hidden">
            {/* Status Header */}
            <div className={`${statusInfo.color} border ${statusInfo.color.includes('border') ? '' : 'border-transparent'} px-4 py-2 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                <p className={`text-sm font-semibold tracking-[-0.1px] ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </p>
              </div>
            </div>

            {/* Room Image */}
            <div className="h-[200px] relative">
              <img
                src={booking.roomImageUrl}
                alt={booking.roomName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/logo/desktop_logo.png'
                }}
              />
            </div>

            {/* Room Info */}
            <div className="px-5 py-4">
              <h3 className="text-lg font-bold tracking-[-0.2px] leading-[26px] max-h-[52px] overflow-hidden">
                {booking.roomName}
              </h3>
              <p className="text-lg text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.2px] leading-[26px]">
                {booking.residenceName}
              </p>
              <p className="text-sm text-[rgba(13,17,38,0.6)] font-medium tracking-[-0.1px] leading-[20px] mt-1">
                {booking.residenceFullAddress}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                  ID: {booking.roomIdentifier}
                </span>
              </div>
            </div>

            {/* Check-in / Check-out */}
            <div className="border-t border-[#dee0e3] px-5 py-4 flex items-center justify-between">
              <div className="flex gap-6 items-center flex-1">
                {/* Check-in */}
                <div className="flex flex-col gap-1 flex-1">
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
                <div className="flex flex-col gap-1 flex-1">
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

          {/* Facilities Section */}
          <div className="bg-white rounded-[24px] px-5 py-4 flex flex-col gap-[18px]">
            <p className="text-base font-bold tracking-[-0.2px] leading-[24px]">
              {messages?.reservation?.facilities || "Facilities"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {displayedFacilities.map((facility, index) => (
                <FacilityItem key={index} facility={facility} />
              ))}
            </div>
            {processedFacilities.length > 6 && (
              <button
                onClick={() => setShowAllFacilities(!showAllFacilities)}
                className="bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] flex items-center justify-center gap-[2px] px-[10px] py-[6px] rounded-[10px] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center px-1 py-0">
                  <span className="text-sm font-medium text-[#14151a] tracking-[-0.1px] leading-5">
                    {showAllFacilities
                      ? "Show less"
                      : `Show all ${processedFacilities.length} facilities`}
                  </span>
                </div>
                <div className="relative shrink-0 w-4 h-4 overflow-hidden">
                  <ChevronRight className={`w-full h-full text-[#14151a] transition-transform ${showAllFacilities ? 'rotate-90' : ''}`} />
                </div>
              </button>
            )}
          </div>

          {/* Guest Information Section */}
          <div className="bg-white rounded-[24px] px-5 py-4 flex flex-col gap-[18px]">
            <p className="text-base font-bold tracking-[-0.2px] leading-[24px]">
              Guest Information
            </p>
            <div className="flex flex-col gap-4">
              {/* Name Row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#14151a] tracking-[-0.1px] mb-2 block">
                    {messages?.reservation?.firstName || "First name"}
                  </label>
                  <div className="bg-[#fbfbfb] border border-[#e9eaec] rounded-xl px-3 py-2.5">
                    <p className="text-sm text-[rgba(10,15,41,0.25)] tracking-[-0.1px]">
                      {booking.userFirstName}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#14151a] tracking-[-0.1px] mb-2 block">
                    {messages?.reservation?.lastName || "Last name"}
                  </label>
                  <div className="bg-[#fbfbfb] border border-[#e9eaec] rounded-xl px-3 py-2.5">
                    <p className="text-sm text-[rgba(10,15,41,0.25)] tracking-[-0.1px]">
                      {booking.userLastName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email & Country Row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#14151a] tracking-[-0.1px] mb-2 block">
                    {messages?.reservation?.email || "Email"}
                  </label>
                  <div className="bg-[#fbfbfb] border border-[#e9eaec] rounded-xl px-3 py-2.5">
                    <p className="text-sm text-[rgba(10,15,41,0.25)] tracking-[-0.1px]">
                      {booking.userEmail}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-[#14151a] tracking-[-0.1px] mb-2 block">
                    {messages?.reservation?.countryRegion || "Country/region"}
                  </label>
                  <div className="bg-[#fbfbfb] border border-[#e9eaec] rounded-xl px-3 py-2.5 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[rgba(10,15,41,0.25)]" />
                    <p className="text-sm text-[rgba(10,15,41,0.25)] tracking-[-0.1px]">
                      {booking.userCountryCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-sm font-medium text-[#14151a] tracking-[-0.1px] mb-2 block">
                  {messages?.reservation?.phoneNumber || "Phone number"}
                </label>
                <div className="bg-[#fbfbfb] border border-[#e9eaec] rounded-xl px-3 py-2.5">
                  <p className="text-sm text-[rgba(10,15,41,0.25)] tracking-[-0.1px]">
                    {booking.userPhoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="bg-white rounded-[16px] px-5 py-4 flex flex-col gap-[18px]">
            <p className="text-base font-bold tracking-[-0.2px] leading-[24px]">
              Payment Information
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium tracking-[-0.1px]">
                <span className="text-[rgba(13,17,38,0.4)]">
                  {messages?.reservation?.roomPricePerNight || "Room price per night"}
                </span>
                <span className="text-[#14151a]">
                  ${booking.roomDailyPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium tracking-[-0.1px]">
                <span className="text-[rgba(13,17,38,0.4)]">
                  {messages?.reservation?.nights || "Nights"}
                </span>
                <span className="text-[#14151a]">
                  × {booking.totalNights} {messages?.reservation?.nights || "nights"}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium tracking-[-0.1px]">
                <span className="text-[rgba(13,17,38,0.4)]">Room</span>
                <span className="text-[#14151a]">
                  × 1 room
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium tracking-[-0.1px] text-[#26bd6c]">
                <span>{messages?.reservation?.bookingFees || "Booking fees"}</span>
                <span>{messages?.reservation?.free || "FREE"}</span>
              </div>
              <div className="border-t border-[#e9eaec] my-2" />
              <div className="flex justify-between text-base font-extrabold tracking-[-0.2px] text-[#14151a]">
                <span>{messages?.reservation?.price || "Price"}</span>
                <span className="underline">
                  ${booking.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy Section - APPROVED 또는 RESERVATION_PENDING 상태일 때만 표시 */}
          {(booking.reservationStatus === 'APPROVED' || booking.reservationStatus === 'RESERVATION_PENDING') && (
            <div className="bg-white rounded-[16px] px-5 py-4 flex flex-col gap-[18px]">
              <p className="text-base font-bold tracking-[-0.2px] leading-[24px]">
                Cancellation Policy
              </p>
              <p className="text-sm font-medium text-[#26bd6c] tracking-[-0.1px]">
                Cancel for free before check-in date
              </p>
              <button
                onClick={handleCancelBooking}
                className="bg-[rgba(230,72,61,0.1)] hover:bg-[rgba(230,72,61,0.15)] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-[#e6483d] tracking-[-0.1px]">
                  {messages?.reservation?.cancelReservation || "Cancel my booking"}
                </span>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

