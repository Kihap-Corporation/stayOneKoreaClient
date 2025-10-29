"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ReservationHeader } from "@/components/reservation-header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, ShieldCheck } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"
import * as PortOne from "@portone/browser-sdk/v2"

interface RoomFacility {
  facilityType: string
  customNameI18n: {
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

interface PaymentPageData {
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

export default function PaymentDyPage() {
  const params = useParams()
  const router = useRouter()
  const { messages, currentLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<PaymentPageData | null>(null)
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [endToReserveTime, setEndToReserveTime] = useState<Date | null>(null)
  
  // Payment loading state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // 예약 정보 조회 및 타이머 설정
  useEffect(() => {
    const initializePayment = async () => {
      try {
        const languageCode = currentLanguage.code
        
        const response = await apiGet(
          `/api/user/reserve/page/${params.reservationId}?languageCode=${languageCode}`
        )
        
        if (response.code === 200 && response.data) {
          const apiData: ReservationAPIResponse = response.data
          
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
          
          // 서버에서 받은 시간 (KST 기준)
          const serverEndTime = new Date(apiData.endToReserve)
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

          if (new Date(isoKST) > serverEndTime) {
            alert(messages?.reservation?.timeExpired || "예약 가능 시간이 만료되었습니다.")
            router.push('/')
            return
          }

          const remainingSeconds = Math.floor((serverEndTime.getTime() - new Date(isoKST).getTime()) / 1000)
          setEndToReserveTime(serverEndTime)
          setTimeRemaining(remainingSeconds)
          
          // 계산된 할인 가격
          const ourPrice = apiData.roomDailyPrice * apiData.totalNights
          const discountPrice = ourPrice - apiData.totalPrice
          
          const transformedData: PaymentPageData = {
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
          
          setPaymentData(transformedData)
        } else if (response.code === 40500) {
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
    
    initializePayment()
  }, [params, router, messages, currentLanguage])

  // 타이머 카운트다운
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || !endToReserveTime) return

    const timer = setInterval(() => {
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
      const remaining = Math.floor((endToReserveTime.getTime() - new Date(isoKST).getTime()) / 1000)
      const newTimeRemaining = Math.max(0, remaining)

      if (newTimeRemaining <= 0) {
        clearInterval(timer)
        alert(messages?.reservation?.timeExpired || "예약 가능 시간이 만료되었습니다.")
        router.push('/')
        return
      }

      setTimeRemaining(newTimeRemaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, endToReserveTime, params.reservationId, router, messages])

  // 타이머 포맷 함수
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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

  // 결제 처리 함수
  const handlePayment = async () => {
    if (!paymentData || isProcessingPayment || (timeRemaining !== null && timeRemaining <= 0)) {
      return
    }

    setIsProcessingPayment(true)

    try {
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_EXIMBAY_CHANNEL_KEY

      if (!storeId || !channelKey) {
        alert(messages?.payment?.configError || "결제 설정이 완료되지 않았습니다. 관리자에게 문의하세요.")
        setIsProcessingPayment(false)
        return
      }

      // PaymentId 생성 (예약 ID 기반)
      const paymentId = `payment-${params.reservationId}-${Date.now()}`

      // 통화 코드 변환 (USD -> USD는 그대로, 필요시 다른 통화도 처리)
      const currency = paymentData.totalPrice > 0 ? 'USD' : 'USD'
      
      // 결제 금액 (센트 단위로 변환: $1.50 -> 150)
      // 현재 totalPrice는 달러 단위이므로 100을 곱해 센트로 변환
      const totalAmount = Math.round(paymentData.totalPrice * 100)

      // 고객 정보 (예약 정보에서 가져오기)
      const reservationInfo = await apiGet(
        `/api/user/reserve/page/${params.reservationId}?languageCode=${currentLanguage.code}`
      )

      if (reservationInfo.code !== 200 || !reservationInfo.data) {
        throw new Error("예약 정보를 불러올 수 없습니다")
      }

      const reservationData = reservationInfo.data as ReservationAPIResponse

      // Portone 결제 요청
      // 엑심베이의 경우 payMethod를 생략하면 모든 결제 수단 표시
      const payment = await PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: `${reservationData.roomName} - ${reservationData.residenceName}`,
        totalAmount: totalAmount,
        currency: currency,
        // payMethod는 엑심베이에서 생략 가능 (엑심베이 결제창에서 선택)
        payMethod: undefined as any, // 엑심베이는 결제 수단을 지정하지 않아도 됨
        customer: {
          fullName: `${reservationData.userFirstName} ${reservationData.userLastName}`,
          firstName: reservationData.userFirstName,
          lastName: reservationData.userLastName,
          email: reservationData.userEmail,
          phoneNumber: reservationData.userPhoneNumber,
        },
        // 엑심베이 특수 파라미터
        bypass: {
          eximbay_v2: {
            // 결제 수단을 지정하지 않으면 엑심베이에서 사용 가능한 모든 수단 표시
            // payment: {
            //   payment_method: "PAYPAL", // 특정 수단만 표시하려면 설정
            //   // 또는 여러 수단 표시
            //   // multi_payment_method: ["PAYPAL", "ALIPAY", "UNIONPAY"]
            // }
          }
        },
      } as any)

      // 결제 실패 처리 (에러 응답 체크)
      if (!payment || 'code' in payment) {
        setIsProcessingPayment(false)
        const errorMessage = payment && 'message' in payment 
          ? (payment as any).message 
          : "알 수 없는 오류가 발생했습니다."
        alert(
          messages?.payment?.paymentFailed || 
          `결제 실패: ${errorMessage}`
        )
        return
      }

      // 결제 성공 - 서버에 결제 확인 요청
      try {
        const confirmResponse = await apiPost(
          `/api/user/reserve/confirm/${params.reservationId}`,
          {
            paymentId: payment.paymentId,
            paymentStatus: 'PAID', // Portone V2에서 결제 성공 시 status는 'PAID'
          }
        )

        if (confirmResponse.code === 200) {
          // 결제 완료 후 북킹 상세 페이지로 이동
          router.push(`/bookings/${params.reservationId}`)
        } else {
          // 서버 확인 실패
          setIsProcessingPayment(false)
          alert(
            messages?.payment?.confirmFailed || 
            "결제는 완료되었으나 서버 확인 중 오류가 발생했습니다. 마이페이지에서 확인해주세요."
          )
          router.push(`/bookings/${params.reservationId}`)
        }
      } catch (confirmError) {
        // 결제는 성공했지만 서버 확인 실패
        console.error("Payment confirmation error:", confirmError)
        setIsProcessingPayment(false)
        alert(
          messages?.payment?.confirmFailed || 
          "결제는 완료되었으나 서버 확인 중 오류가 발생했습니다. 마이페이지에서 확인해주세요."
        )
        router.push(`/bookings/${params.reservationId}`)
      }

    } catch (error) {
      setIsProcessingPayment(false)
      console.error("Payment error:", error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : messages?.payment?.paymentError || "결제 처리 중 오류가 발생했습니다."
      
      alert(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <ReservationHeader currentStep={2} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!paymentData || timeRemaining === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <ReservationHeader currentStep={2} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.error || "Error loading payment information"}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const checkInFormatted = formatDate(paymentData.checkIn)
  const checkOutFormatted = formatDate(paymentData.checkOut)

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <ReservationHeader currentStep={2} />
      
      {/* Timer Banner */}
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
      
      <main className="flex-1 py-4 lg:py-10 px-4">
        <div className="mx-auto max-w-[640px]">
          <div className="flex flex-col gap-4">
            {/* Room Information Card - 모바일 */}
            <div className="lg:hidden flex flex-col gap-0">
              <div className="bg-white border border-[#dee0e3] rounded-t-[16px] overflow-hidden">
                <div className="h-[200px] relative">
                  <img
                    src={paymentData.room.image}
                    alt={paymentData.room.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold tracking-[-0.2px] text-[#14151a] line-clamp-2">
                    {paymentData.room.title}
                  </h3>
                  <p className="text-lg font-medium tracking-[-0.2px] text-[rgba(13,17,38,0.4)]">
                    {paymentData.room.propertyName}
                  </p>
                  <p className="text-sm font-medium tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
                    {paymentData.room.location}
                  </p>
                </div>
              </div>
              
              {/* Dates Card */}
              <div className="bg-white border-l border-r border-b border-[#dee0e3] rounded-b-[16px] p-5 flex items-center justify-between">
                <div className="flex gap-2 items-center flex-1">
                  <div className="flex-1">
                    <p className="text-sm text-[#14151a] font-medium mb-1 tracking-[-0.1px]">
                      {messages?.reservation?.checkIn || "Check-in"}
                    </p>
                    <p className="text-base font-bold tracking-[-0.2px]">
                      {checkInFormatted.weekday}, {checkInFormatted.month} {checkInFormatted.day}
                    </p>
                    <p className="text-xs text-[rgba(13,17,38,0.4)] font-medium">{checkInFormatted.year}</p>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  
                  <div className="flex-1">
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
                  <p className="text-xl font-extrabold tracking-[-0.2px]">{paymentData.nights}</p>
                  <p className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.nights || "nights"}
                  </p>
                </div>
              </div>
            </div>

            {/* Room Information Card - 데스크톱 */}
            <div className="hidden lg:flex flex-col gap-0">
              <div className="bg白 rounded-t-[16px] overflow-hidden border border-[#dee0e3]">
                <div className="flex gap-0">
                  <div className="w-1/2 h-[200px] relative">
                    <img
                      src={paymentData.room.image}
                      alt={paymentData.room.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-1/2 p-5 flex flex-col gap-2">
                    <h3 className="text-lg font-bold tracking-[-0.2px] text-[#14151a] line-clamp-2">
                      {paymentData.room.title}
                    </h3>
                    <p className="text-lg font-medium tracking-[-0.2px] text-[rgba(13,17,38,0.4)]">
                      {paymentData.room.propertyName}
                    </p>
                    <p className="text-sm font-medium tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
                      {paymentData.room.location}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Dates Card */}
              <div className="bg-white border-l border-r border-b border-[#dee0e3] rounded-b-[16px] p-5 flex items-center justify-between">
                <div className="flex gap-6 items-center flex-1">
                  <div className="flex-1">
                    <p className="text-sm text-[#14151a] font-medium mb-1 tracking-[-0.1px]">
                      {messages?.reservation?.checkIn || "Check-in"}
                    </p>
                    <p className="text-base font-bold tracking-[-0.2px]">
                      {checkInFormatted.weekday}, {checkInFormatted.month} {checkInFormatted.day}
                    </p>
                    <p className="text-xs text-[rgba(13,17,38,0.4)] font-medium">{checkInFormatted.year}</p>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  
                  <div className="flex-1">
                    <p className="text-sm text-[#14151a] font-medium mb-1 tracking-[-0.1px]">
                      {messages?.reservation?.checkOut || "Check-out"}
                    </p>
                    <p className="text-base font-bold tracking-[-0.2px]">
                      {checkOutFormatted.weekday}, {checkOutFormatted.month} {checkOutFormatted.day}
                    </p>
                    <p className="text-xs text-[rgba(13,17,38,0.4)] font-medium">{checkOutFormatted.year}</p>
                  </div>
                </div>
                
                <div className="bg-[#f7f7f8] rounded-xl w-16 h-16 flex flex-col items-center justify-center text-center ml-6">
                  <p className="text-xl font-extrabold tracking-[-0.2px]">{paymentData.nights}</p>
                  <p className="text-sm text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.nights || "nights"}
                  </p>
                </div>
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
                    ${paymentData.room.pricePerNight.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.nightsCount?.replace("{count}", String(paymentData.nights)) || `Nights`}
                  </span>
                  <span className="font-medium tracking-[-0.1px]">
                    × {paymentData.nights} nights
                  </span>
                </div>
                
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[rgba(13,17,38,0.4)] font-medium tracking-[-0.1px]">
                    {messages?.reservation?.roomCount?.replace("{count}", "1") || "Room"}
                  </span>
                  <span className="font-medium tracking-[-0.1px]">
                    × 1 room
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
                    ${paymentData.totalPrice.toLocaleString()}
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

            {/* Payment Section */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0px_18px_24px_-5px_rgba(20,21,26,0.1),0px_8px_8px_-5px_rgba(20,21,26,0.05)]">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-center gap-0.5">
                  <ShieldCheck className="h-[18px] w-[18px] text-[#26bd6c]" />
                  <p className="text-base font-bold tracking-[-0.2px] text-[#26bd6c]">
                    {messages?.payment?.securePayment || "Secure payment"}
                  </p>
                </div>
                <div className="text-base font-normal tracking-[-0.2px] text-[#14151a] text-center">
                  <p className="mb-0">
                    {messages?.payment?.encryptedInfo || "All card information is fully encrypted, secure and protected."}
                  </p>
                  <p>
                    {messages?.payment?.paypalOnly || "We only accept payments via PayPal."}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-[6px]">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessingPayment || (timeRemaining !== null && timeRemaining <= 0)}
                  className="w-full bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-base font-medium tracking-[-0.2px]">
                        {messages?.payment?.processing || "결제 처리 중..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-base font-medium tracking-[-0.2px]">
                        {messages?.payment?.bookNow || "지금 결제하기"}
                      </span>
                    </>
                  )}
                </Button>
                <p className="text-base font-medium tracking-[-0.2px] text-[rgba(13,17,38,0.4)] text-center">
                  {messages?.payment?.clickToComplete || "위 버튼을 클릭하여 결제를 진행하고 예약을 완료하세요."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


