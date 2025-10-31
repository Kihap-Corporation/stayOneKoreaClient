"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ReservationHeader } from "@/components/reservation-header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { apiPost } from "@/lib/api"
import { toast } from "sonner"

export default function PaymentProcessingPage() {
  const params = useParams()
  const router = useRouter()
  const { messages } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(true)
  const hasProcessedRef = useRef(false) // 중복 요청 방지를 위한 ref

  useEffect(() => {
    // 이미 처리된 요청이면 중복 실행 방지
    if (hasProcessedRef.current) {
      return
    }

    const processPayment = async () => {
      // URL에서 paymentId 가져오기
      const urlParams = new URLSearchParams(window.location.search)
      const paymentId = urlParams.get('paymentId')

      if (!paymentId) {
        toast.error("결제 정보가 올바르지 않습니다")
        router.push(`/payment/${params.reservationId}`)
        return
      }

      // 요청 시작 전에 플래그 설정 (중복 방지)
      hasProcessedRef.current = true

      try {
        // POST 요청으로 결제 처리
        const verifyResponse = await apiPost('/api/user/payment/complete', {
          paymentId: paymentId,
          reservationId: params.reservationId
        })

        if (verifyResponse.code === 200) {
          // 결제 처리 성공 - 결과 페이지로 이동
          toast.success(messages?.payment?.success || "결제가 완료되었습니다!")
          router.push(`/payment/result/${params.reservationId}`)
        } else {
          toast.error(messages?.payment?.verificationFailed || "결제 확인에 실패했습니다")
          router.push(`/payment/${params.reservationId}`)
        }
      } catch (error) {
        toast.error(messages?.payment?.error || "결제 처리 중 오류가 발생했습니다")
        router.push(`/payment/${params.reservationId}`)
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [params.reservationId, router, messages])

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <ReservationHeader currentStep={2} />

      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-[24px] p-8 shadow-lg max-w-sm w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e0004d] mx-auto mb-4"></div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {messages?.payment?.processing || "결제 처리 중"}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {messages?.payment?.pleaseWait || "잠시만 기다려주세요..."}
            </p>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800 leading-relaxed">
                {messages?.payment?.processingMessage || "결제 처리가 최대 5분 정도 걸릴 수 있습니다. 잠시만 기다려주세요."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
