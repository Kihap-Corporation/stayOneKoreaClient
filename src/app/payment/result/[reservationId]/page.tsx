"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ReservationHeader } from "@/components/reservation-header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { apiGet, apiRequestWithResponse } from "@/lib/api"
import { toast } from "sonner"

interface RoomFacility {
  facilityType: string
  iconUrl?: string
  nameI18n?: {
    [key: string]: string
  }
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

interface BookingResultData {
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
  totalPrice: number
  discountPrice: number
  ourPrice: number
}

export default function BookingResultPage() {
  const params = useParams()
  const router = useRouter()
  const { messages, currentLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState<BookingResultData | null>(null)
  const [reservationData, setReservationData] = useState<ReservationAPIResponse | null>(null)

  // 예약 정보 조회
  useEffect(() => {
    const initializeBookingResult = async () => {
      try {
        // 먼저 결제 상태 확인 (HTTP status와 body code 모두 확인)
        const { response: paymentResponse, data: paymentData } = await apiRequestWithResponse(`/api/user/payment/complete/${params.reservationId}`)

        // HTTP status가 400번대이고 body code가 40901인 경우
        if (paymentResponse.status >= 400 && paymentResponse.status < 500 && paymentData.code === 40901) {
          toast.error(messages?.common?.accessDenied || "해당 페이지에 접근할 수 없습니다")
          router.push('/bookings')
          return
        }

        if (paymentData.code === 20102) {
          // 결제 실패
          toast.error(messages?.payment?.failed || "결제에 실패했습니다")
          router.push('/bookings')
          return
        } else if (paymentData.code === 40901) {
          // 40901 에러
          router.push('/bookings')
          return
        } else if (paymentData.code !== 20101) {
          // 다른 에러
          toast.error(messages?.common?.error || "알 수 없는 오류가 발생했습니다")
          router.push('/bookings')
          return
        }

        // 결제 성공인 경우에만 예약 정보 로딩
        const languageCode = currentLanguage.code
        const response = await apiGet(
          `/api/user/reserve/page/${params.reservationId}?languageCode=${languageCode}`
        )

        if (response.code === 200 && response.data) {
          const apiData: ReservationAPIResponse = response.data

          // 예약 정보 저장
          setReservationData(apiData)

          // 계산된 할인 가격
          const ourPrice = apiData.roomDailyPrice * apiData.totalNights
          const discountPrice = ourPrice - apiData.totalPrice

          const transformedData: BookingResultData = {
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
            totalPrice: apiData.totalPrice,
            discountPrice: discountPrice,
            ourPrice: ourPrice
          }

          setBookingData(transformedData)
        } else {
          const errorMessage = currentLanguage.code === 'ko'
            ? '예약 정보를 불러오는 중 오류가 발생했습니다'
            : currentLanguage.code === 'en'
            ? 'Failed to load booking information'
            : currentLanguage.code === 'zh'
            ? '加载预订信息失败'
            : 'Échec du chargement des informations de réservation'

          alert(messages?.reservation?.loadError || errorMessage)
          router.push('/')
          return
        }
      } catch (error) {
        const errorMessage = currentLanguage.code === 'ko'
          ? '예약 정보를 불러오는 중 오류가 발생했습니다'
          : currentLanguage.code === 'en'
          ? 'Failed to load booking information'
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

    initializeBookingResult()
  }, [params, router, messages, currentLanguage])

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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <ReservationHeader currentStep={3} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!bookingData || !reservationData) {
    return (
      <div className="flex min-h-screen flex-col">
        <ReservationHeader currentStep={3} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.error || "Error loading booking information"}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // TypeScript를 위한 타입 가드
  const safeBookingData = bookingData
  const checkInFormatted = formatDate(safeBookingData.checkIn)
  const checkOutFormatted = formatDate(safeBookingData.checkOut)

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <ReservationHeader currentStep={3} />

      <main className="flex-1 py-8 md:py-10">
        <div className="mx-auto max-w-[600px] px-4">
          <div className="flex flex-col gap-4 md:gap-5 items-center justify-center text-center">
            {/* Header Section - Desktop */}
            <div className="hidden md:flex flex-col gap-4">
              {/* Title with Icon */}
              <div className="flex gap-4 items-center justify-center">
                <div className="overflow-clip relative shrink-0 w-[28px] h-[32px]">
                  <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.2664 0C10.5758 0 10.8725 0.122916 11.0913 0.341709C11.3101 0.560501 11.433 0.857247 11.433 1.16667V4.66667C11.433 4.97609 11.3101 5.27283 11.0913 5.49162C10.8725 5.71042 10.5758 5.83333 10.2664 5.83333C9.95695 5.83333 9.6602 5.71042 9.44141 5.49162C9.22262 5.27283 9.0997 4.97609 9.0997 4.66667V1.16667C9.0997 0.857247 9.22262 0.560501 9.44141 0.341709C9.6602 0.122916 9.95695 0 10.2664 0ZM10.2664 17.5C10.5758 17.5 10.8725 17.6229 11.0913 17.8417C11.3101 18.0605 11.433 18.3572 11.433 18.6667V22.1667C11.433 22.4761 11.3101 22.7728 11.0913 22.9916C10.8725 23.2104 10.5758 23.3333 10.2664 23.3333C9.95695 23.3333 9.6602 23.2104 9.44141 22.9916C9.22262 22.7728 9.0997 22.4761 9.0997 22.1667V18.6667C9.0997 18.3572 9.22262 18.0605 9.44141 17.8417C9.6602 17.6229 9.95695 17.5 10.2664 17.5ZM20.3697 5.83333C20.5244 6.10129 20.5663 6.41973 20.4863 6.7186C20.4062 7.01747 20.2107 7.27229 19.9427 7.427L16.9117 9.177C16.779 9.25481 16.6322 9.3056 16.4797 9.32645C16.3273 9.34729 16.1722 9.33778 16.0235 9.29845C15.8747 9.25912 15.7352 9.19076 15.613 9.0973C15.4908 9.00384 15.3882 8.88713 15.3113 8.75388C15.2344 8.62064 15.1846 8.47349 15.1647 8.32091C15.1449 8.16834 15.1554 8.01334 15.1958 7.86486C15.2361 7.71637 15.3054 7.57733 15.3996 7.45573C15.4939 7.33413 15.6113 7.23238 15.745 7.15633L18.776 5.40633C19.044 5.25163 19.3624 5.20971 19.6613 5.28978C19.9602 5.36986 20.215 5.56538 20.3697 5.83333ZM5.2147 14.5833C5.36941 14.8513 5.41133 15.1697 5.33125 15.4686C5.25117 15.7675 5.05565 16.0223 4.7877 16.177L1.7567 17.927C1.62397 18.0048 1.47716 18.0556 1.32471 18.0764C1.17227 18.0973 1.01721 18.0878 0.868465 18.0484C0.719716 18.0091 0.580214 17.9408 0.457993 17.8473C0.335771 17.7538 0.233243 17.6371 0.156311 17.5039C0.0793793 17.3706 0.0295637 17.2235 0.00973199 17.0709C-0.0100997 16.9183 0.000444409 16.7633 0.0407571 16.6149C0.0810698 16.4664 0.150355 16.3273 0.244624 16.2057C0.338892 16.0841 0.456282 15.9824 0.590035 15.9063L3.62104 14.1563C3.88899 14.0016 4.20743 13.9597 4.5063 14.0398C4.80517 14.1199 5.05999 14.3154 5.2147 14.5833ZM20.3697 17.5C20.215 17.768 19.9602 17.9635 19.6613 18.0435C19.3624 18.1236 19.044 18.0817 18.776 17.927L15.745 16.177C15.4793 16.0212 15.2859 15.7666 15.2072 15.4687C15.1284 15.1709 15.1707 14.854 15.3247 14.5872C15.4788 14.3204 15.7321 14.1253 16.0294 14.0446C16.3267 13.9639 16.6439 14.0041 16.9117 14.1563L19.9427 15.9063C20.2107 16.061 20.4062 16.3159 20.4863 16.6147C20.5663 16.9136 20.5244 17.232 20.3697 17.5ZM5.2147 8.75C5.05999 9.01795 4.80517 9.21347 4.5063 9.29355C4.20743 9.37363 3.88899 9.3317 3.62104 9.177L0.590035 7.427C0.456282 7.35095 0.338892 7.2492 0.244624 7.1276C0.150355 7.006 0.0810698 6.86696 0.0407571 6.71847C0.000444409 6.56999 -0.0100997 6.415 0.00973199 6.26242C0.0295637 6.10984 0.0793793 5.9627 0.156311 5.82945C0.233243 5.69621 0.335771 5.57949 0.457993 5.48603C0.580214 5.39257 0.719716 5.32421 0.868465 5.28488C1.01721 5.24556 1.17227 5.23604 1.32471 5.25689C1.47716 5.27773 1.62397 5.32852 1.7567 5.40633L4.7877 7.15633C5.05565 7.31105 5.25117 7.56587 5.33125 7.86473C5.41133 8.1636 5.36941 8.48204 5.2147 8.75Z" fill="#0F1324" fill-opacity="0.6"/>
                  </svg>
                </div>
                <h1 className="font-['SUIT:Bold',sans-serif] font-bold leading-[40px] text-[32px] text-[#0f1324] tracking-[-0.5px]">
                  {messages?.bookingResult?.title || "Your Stay is Almost Ready"}
                </h1>
              </div>

              {/* Subtitle */}
              <div className="font-['SUIT:Medium',sans-serif] font-medium leading-[28px] text-[18px] text-[#0d1126] tracking-[-0.2px] text-center max-w-[480px]">
                <p className="mb-1">{messages?.bookingResult?.subtitle1 || "Your host is reviewing your booking request."}</p>
                <p>{messages?.bookingResult?.subtitle2 || "You'll receive a confirmation within 24 hours."}</p>
              </div>
            </div>

            {/* Header Section - Mobile */}
            <div className="md:hidden flex flex-col gap-3">
              {/* Title with Icon */}
              <div className="flex gap-3 items-center justify-center">
                <div className="overflow-clip relative shrink-0 w-[20px] h-[24px]">
                  <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.2664 0C10.5758 0 10.8725 0.122916 11.0913 0.341709C11.3101 0.560501 11.433 0.857247 11.433 1.16667V4.66667C11.433 4.97609 11.3101 5.27283 11.0913 5.49162C10.8725 5.71042 10.5758 5.83333 10.2664 5.83333C9.95695 5.83333 9.6602 5.71042 9.44141 5.49162C9.22262 5.27283 9.0997 4.97609 9.0997 4.66667V1.16667C9.0997 0.857247 9.22262 0.560501 9.44141 0.341709C9.6602 0.122916 9.95695 0 10.2664 0ZM10.2664 17.5C10.5758 17.5 10.8725 17.6229 11.0913 17.8417C11.3101 18.0605 11.433 18.3572 11.433 18.6667V22.1667C11.433 22.4761 11.3101 22.7728 11.0913 22.9916C10.8725 23.2104 10.5758 23.3333 10.2664 23.3333C9.95695 23.3333 9.6602 23.2104 9.44141 22.9916C9.22262 22.7728 9.0997 22.4761 9.0997 22.1667V18.6667C9.0997 18.3572 9.22262 18.0605 9.44141 17.8417C9.6602 17.6229 9.95695 17.5 10.2664 17.5ZM20.3697 5.83333C20.5244 6.10129 20.5663 6.41973 20.4863 6.7186C20.4062 7.01747 20.2107 7.27229 19.9427 7.427L16.9117 9.177C16.779 9.25481 16.6322 9.3056 16.4797 9.32645C16.3273 9.34729 16.1722 9.33778 16.0235 9.29845C15.8747 9.25912 15.7352 9.19076 15.613 9.0973C15.4908 9.00384 15.3882 8.88713 15.3113 8.75388C15.2344 8.62064 15.1846 8.47349 15.1647 8.32091C15.1449 8.16834 15.1554 8.01334 15.1958 7.86486C15.2361 7.71637 15.3054 7.57733 15.3996 7.45573C15.4939 7.33413 15.6113 7.23238 15.745 7.15633L18.776 5.40633C19.044 5.25163 19.3624 5.20971 19.6613 5.28978C19.9602 5.36986 20.215 5.56538 20.3697 5.83333ZM5.2147 14.5833C5.36941 14.8513 5.41133 15.1697 5.33125 15.4686C5.25117 15.7675 5.05565 16.0223 4.7877 16.177L1.7567 17.927C1.62397 18.0048 1.47716 18.0556 1.32471 18.0764C1.17227 18.0973 1.01721 18.0878 0.868465 18.0484C0.719716 18.0091 0.580214 17.9408 0.457993 17.8473C0.335771 17.7538 0.233243 17.6371 0.156311 17.5039C0.0793793 17.3706 0.0295637 17.2235 0.00973199 17.0709C-0.0100997 16.9183 0.000444409 16.7633 0.0407571 16.6149C0.0810698 16.4664 0.150355 16.3273 0.244624 16.2057C0.338892 16.0841 0.456282 15.9824 0.590035 15.9063L3.62104 14.1563C3.88899 14.0016 4.20743 13.9597 4.5063 14.0398C4.80517 14.1199 5.05999 14.3154 5.2147 14.5833ZM20.3697 17.5C20.215 17.768 19.9602 17.9635 19.6613 18.0435C19.3624 18.1236 19.044 18.0817 18.776 17.927L15.745 16.177C15.4793 16.0212 15.2859 15.7666 15.2072 15.4687C15.1284 15.1709 15.1707 14.854 15.3247 14.5872C15.4788 14.3204 15.7321 14.1253 16.0294 14.0446C16.3267 13.9639 16.6439 14.0041 16.9117 14.1563L19.9427 15.9063C20.2107 16.061 20.4062 16.3159 20.4863 16.6147C20.5663 16.9136 20.5244 17.232 20.3697 17.5ZM5.2147 8.75C5.05999 9.01795 4.80517 9.21347 4.5063 9.29355C4.20743 9.37363 3.88899 9.3317 3.62104 9.177L0.590035 7.427C0.456282 7.35095 0.338892 7.2492 0.244624 7.1276C0.150355 7.006 0.0810698 6.86696 0.0407571 6.71847C0.000444409 6.56999 -0.0100997 6.415 0.00973199 6.26242C0.0295637 6.10984 0.0793793 5.9627 0.156311 5.82945C0.233243 5.69621 0.335771 5.57949 0.457993 5.48603C0.580214 5.39257 0.719716 5.32421 0.868465 5.28488C1.01721 5.24556 1.17227 5.23604 1.32471 5.25689C1.47716 5.27773 1.62397 5.32852 1.7567 5.40633L4.7877 7.15633C5.05565 7.31105 5.25117 7.56587 5.33125 7.86473C5.41133 8.1636 5.36941 8.48204 5.2147 8.75Z" fill="#0F1324" fill-opacity="0.6"/>
                  </svg>
                </div>
                <h1 className="font-['SUIT:Bold',sans-serif] font-bold leading-[32px] text-[26px] text-[#0f1324] tracking-[-0.4px]">
                  {messages?.bookingResult?.title || "Your Stay is Almost Ready"}
                </h1>
              </div>

              {/* Subtitle */}
              <div className="font-['SUIT:Medium',sans-serif] font-medium leading-[24px] text-[16px] text-[#0d1126] tracking-[-0.15px] text-center max-w-[320px]">
                <p className="mb-1">{messages?.bookingResult?.subtitle1 || "Your host is reviewing your booking request."}</p>
                <p>{messages?.bookingResult?.subtitle2 || "You'll receive a confirmation within 24 hours."}</p>
              </div>
            </div>

            {/* Room Card - Desktop */}
            <div className="hidden md:flex flex-col w-full">
              {/* Room Item */}
              <div className="bg-white border border-[#dee0e3] rounded-t-[16px] overflow-clip relative w-full">
                <div className="flex gap-4 w-full">
                  {/* Image */}
                  <div className="flex-shrink-0 aspect-square w-[200px] relative">
                    <Image
                      alt=""
                      fill
                      className="object-cover"
                      src={bookingData.room.image}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col gap-[8px] justify-center p-[20px] min-w-0">
                    {/* Title */}
                    <div className="flex flex-col items-start w-full">
                      <h3 className="font-['SUIT:Bold',sans-serif] font-bold leading-[26px] text-[18px] text-[#14151a] tracking-[-0.2px] break-words">
                        {bookingData.room.title}
                      </h3>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[26px] text-[18px] text-[rgba(13,17,38,0.4)] tracking-[-0.2px] break-words">
                        {bookingData.room.propertyName}
                      </p>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[20px] text-[14px] text-[rgba(13,17,38,0.4)] tracking-[-0.1px] break-words">
                        {bookingData.room.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Card - Mobile */}
            <div className="md:hidden flex flex-col w-full">
              {/* Room Item */}
              <div className="bg-white border border-[#dee0e3] rounded-t-[16px] overflow-clip relative w-full">
                <div className="flex gap-3 w-full">
                  {/* Image */}
                  <div className="flex-shrink-0 aspect-square w-[120px] relative">
                    <Image
                      alt=""
                      fill
                      className="object-cover"
                      src={bookingData.room.image}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col gap-[6px] justify-center p-[16px] min-w-0">
                    {/* Title */}
                    <div className="flex flex-col items-start w-full">
                      <h3 className="font-['SUIT:Bold',sans-serif] font-bold leading-[22px] text-[16px] text-[#14151a] tracking-[-0.15px] break-words">
                        {bookingData.room.title}
                      </h3>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[22px] text-[16px] text-[rgba(13,17,38,0.4)] tracking-[-0.15px] break-words">
                        {bookingData.room.propertyName}
                      </p>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[18px] text-[12px] text-[rgba(13,17,38,0.4)] tracking-[-0.08px] break-words">
                        {bookingData.room.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Dates Card - Desktop */}
              <div className="hidden md:block bg-white border-[0px_1px_1px] border-[#dee0e3] border-solid box-border content-stretch flex items-center justify-between max-w-[1200px] px-[20px] py-[16px] relative rounded-bl-[16px] rounded-br-[16px] shrink-0 w-full">
                <div className="basis-0 content-stretch flex gap-[24px] grow items-center min-h-px min-w-px relative shrink-0">
                  {/* Check-in */}
                  <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start min-h-px min-w-px relative shrink-0">
                    <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-[#14151a] tracking-[-0.1px] w-full">
                      Check-in
                    </p>
                    <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full">
                      <p className="font-['SUIT:Bold',sans-serif] font-bold leading-[24px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-[#14151a] tracking-[-0.2px] w-full">
                        {checkInFormatted.weekday}, {checkInFormatted.month} {checkInFormatted.day}
                      </p>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[16px] overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-[rgba(13,17,38,0.4)] tracking-0 w-full">
                        {checkInFormatted.year}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="overflow-clip relative shrink-0 size-[16px]">
                    <div className="absolute inset-[17.59%_16.67%]">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 9L10.5 6L7.5 3" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1.5 6H10.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start min-h-px min-w-px relative shrink-0">
                    <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-[#14151a] tracking-[-0.1px] w-full">
                      Check-out
                    </p>
                    <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full">
                      <p className="font-['SUIT:Bold',sans-serif] font-bold leading-[24px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-[#14151a] tracking-[-0.2px] w-full">
                        {checkOutFormatted.weekday}, {checkOutFormatted.month} {checkOutFormatted.day}
                      </p>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[16px] overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-[rgba(13,17,38,0.4)] tracking-0 w-full">
                        {checkOutFormatted.year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nights Badge */}
                <div className="bg-[#f7f7f8] box-border content-stretch flex flex-col items-center justify-center pb-[8px] pt-[4px] px-0 relative rounded-[12px] shrink-0 size-[64px] text-center">
                  <p className="font-['SUIT:Extra_Bold',sans-serif] font-extrabold leading-[28px] overflow-ellipsis overflow-hidden relative shrink-0 text-[20px] text-[#14151a] tracking-[-0.2px] w-full">
                    {bookingData.nights}
                  </p>
                  <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-[rgba(13,17,38,0.4)] tracking-[-0.1px] w-full">
                    nights
                  </p>
                </div>
              </div>

              {/* Dates Card - Mobile */}
              <div className="md:hidden bg-white border-[0px_1px_1px] border-[#dee0e3] border-solid box-border content-stretch flex items-center justify-between px-[16px] py-[12px] relative rounded-bl-[16px] rounded-br-[16px] shrink-0 w-full">
                <div className="content-stretch flex gap-[12px] grow items-center min-h-px min-w-px relative shrink-0">
                  {/* Check-in */}
                  <div className="content-stretch flex flex-col gap-[2px] grow items-start min-h-px min-w-px relative shrink-0">
                    <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[18px] overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-[#14151a] tracking-[-0.08px] w-full">
                      Check-in
                    </p>
                    <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full">
                      <p className="font-['SUIT:Bold',sans-serif] font-bold leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-[#14151a] tracking-[-0.15px] w-full">
                        {checkInFormatted.month} {checkInFormatted.day}
                      </p>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[14px] overflow-ellipsis overflow-hidden relative shrink-0 text-[10px] text-[rgba(13,17,38,0.4)] tracking-0 w-full">
                        {checkInFormatted.year}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="overflow-clip relative shrink-0 size-[14px]">
                    <div className="absolute inset-[14.29%_14.29%]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.25 7.5L8.75 5L6.25 2.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1.25 5H8.75" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="content-stretch flex flex-col gap-[2px] grow items-start min-h-px min-w-px relative shrink-0">
                    <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[18px] overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-[#14151a] tracking-[-0.08px] w-full">
                      Check-out
                    </p>
                    <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full">
                      <p className="font-['SUIT:Bold',sans-serif] font-bold leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-[#14151a] tracking-[-0.15px] w-full">
                        {checkOutFormatted.month} {checkOutFormatted.day}
                      </p>
                      <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[14px] overflow-ellipsis overflow-hidden relative shrink-0 text-[10px] text-[rgba(13,17,38,0.4)] tracking-0 w-full">
                        {checkOutFormatted.year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nights Badge */}
                <div className="bg-[#f7f7f8] box-border content-stretch flex flex-col items-center justify-center pb-[6px] pt-[3px] px-0 relative rounded-[10px] shrink-0 w-[48px] h-[40px] text-center ml-2">
                  <p className="font-['SUIT:Extra_Bold',sans-serif] font-extrabold leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-[#14151a] tracking-[-0.15px] w-full">
                    {bookingData.nights}
                  </p>
                  <p className="font-['SUIT:Medium',sans-serif] font-medium leading-[16px] overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-[rgba(13,17,38,0.4)] tracking-[-0.08px] w-full">
                    nights
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden md:block mt-6">
              <Button
                onClick={() => router.push('/bookings')}
                className="w-full bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-full py-3 flex items-center justify-center gap-2"
              >
                <span className="text-base font-medium tracking-[-0.2px]">
                  {messages?.bookingResult?.viewDetails || "View details in My Bookings"}
                </span>
              </Button>
            </div>

            {/* CTA Button - Mobile */}
            <div className="md:hidden mt-5">
              <Button
                onClick={() => router.push('/bookings')}
                className="w-full bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-full py-3 flex items-center justify-center gap-2"
              >
                <span className="text-sm font-medium tracking-[-0.15px]">
                  {messages?.bookingResult?.viewDetails || "View details in My Bookings"}
                </span>
              </Button>
            </div>
        </div>
    
        </main>

      <Footer />
    </div>
  )
}
