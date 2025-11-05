"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminConfirmationDialog } from "@/components/admin-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { apiGet, apiPatch } from "@/lib/api"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface ReservationDetail {
  reservationIdentifier: string
  checkInDate: string
  checkOutDate: string
  totalNights: number
  reservationStatus: string
  roomDailyPrice: number
  totalPrice: number
  curUnit: string
  createdAt: string
  approvalTime?: string
  rejectedTime?: string
  cancelledTime?: string
  reservationReason?: string
  roomName: string
  roomIdentifier: string
  residenceName: string
  residenceIdentifier: string
  residenceFullAddress: string
  residenceSiDo: string
  residenceSiGunGu: string
  residenceDongMyeon: string
  residenceDetail: string
  roomFacilities: Array<{
    facilityType: string
    customNameI18n: Record<string, string>
  }>
  roomImageUrl: string
  userEmail: string
  userFirstName: string
  userLastName: string
  userPhoneNumber: string
  userCountryCode: string
  userIdentifier: string
  paymentStatus: string
  paymentCreatedAt?: string
  paymentUpdatedAt?: string
  refundStatus?: string
}

interface ReservationDetailResponse {
  code: number
  message: string
  data: ReservationDetail
}

const statusLabels = {
  RESERVATION_UNDER_WAY: '진행중',
  RESERVATION_PENDING: '예약됨',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  CANCELLED: '취소됨'
}

const statusColors = {
  RESERVATION_UNDER_WAY: 'bg-blue-100 text-blue-800',
  RESERVATION_PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
}

const paymentStatusLabels = {
  PENDING: '결제 대기',
  COMPLETED: '결제 완료',
  FAILED: '결제 실패',
  CANCELLED: '결제 취소',
  REFUNDED: '환불됨'
}

const paymentStatusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-blue-100 text-blue-800'
}

function AdminReservationDetailPageContent() {
  const params = useParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<ReservationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const reservationId = params.identifier as string

  // 예약 상세 정보 조회
  const fetchReservationDetail = async () => {
    setIsLoading(true)
    try {
      const response = await apiGet(`/api/v1/admin/reservation/${reservationId}?languageCode=ko`)
      const data: ReservationDetailResponse = response

      if (data.code === 200) {
        setReservation(data.data)
      } else {
        toast.error("예약 정보를 불러오는데 실패했습니다.")
        router.push('/admin/reservations')
      }
    } catch (error) {
      toast.error("예약 정보를 불러오는데 실패했습니다.")
      router.push('/admin/reservations')
    } finally {
      setIsLoading(false)
    }
  }

  // 예약 상태 변경
  const updateReservationStatus = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!reservation) return

    setIsUpdatingStatus(true)
    try {
      // 오늘 날짜 (한국 시간 기준) - YYYY-MM-DD 형식
      const today = new Date()
      const requestTime = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(today)

      const response = await apiPatch('/api/v1/admin/reservation/status', {
        reservationIdentifier: reservation.reservationIdentifier,
        reservationStatus: newStatus,
        reason: "관리자 처리",
        requestTime: requestTime
      })

      if (response.code === 200) {
        toast.success(`예약이 ${newStatus === 'APPROVED' ? '승인' : '거절'}되었습니다.`)
        // 상태 업데이트 후 새로고침
        await fetchReservationDetail()
      } else {
        handleStatusUpdateError(response, newStatus)
      }
    } catch (error) {
      toast.error("예약 상태 변경에 실패했습니다.")
    } finally {
      setIsUpdatingStatus(false)
      setShowApproveDialog(false)
      setShowRejectDialog(false)
    }
  }

  // 상태 변경 에러 처리
  const handleStatusUpdateError = (response: any, newStatus: 'APPROVED' | 'REJECTED') => {
    const actionText = newStatus === 'APPROVED' ? '승인' : '거절'

    if (response.status === 400 && response.code === 40503) {
      toast.error("예약이 존재하지 않습니다.")
    } else if (newStatus === 'REJECTED') {
      if (response.code === 40904) {
        toast.error("체크인 당일이나 이후에는 환불이 불가능합니다.")
      } else if (response.code === 40905) {
        toast.error("결제가 완료되지 않아서 환불이 불가능합니다. 결제가 완료된 후, 환불을 시도해주세요.")
      } else if (response.code === 40906) {
        toast.error("이미 환불이 완료되어 환불이 불가능합니다.")
      } else if (response.code === 40903) {
        toast.error("환불을 실패했습니다.")
      } else {
        toast.error(`예약 ${actionText} 처리에 실패했습니다.`)
      }
    } else {
      toast.error(`예약 ${actionText} 처리에 실패했습니다.`)
    }
  }

  // 승인 처리
  const handleApprove = () => {
    updateReservationStatus('APPROVED')
  }

  // 거절 처리
  const handleReject = () => {
    updateReservationStatus('REJECTED')
  }

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 날짜 시간 포맷 함수
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  useEffect(() => {
    fetchReservationDetail()
  }, [reservationId])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto mb-4"></div>
            <p className="text-gray-600">예약 정보를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!reservation) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-gray-500">예약 정보를 찾을 수 없습니다.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // 승인된 예약은 다시 거절할 수 있고, 거절된 예약은 승인으로 변경할 수 없음
  const canApprove = reservation.reservationStatus === 'RESERVATION_PENDING'
  const canReject = reservation.reservationStatus === 'RESERVATION_PENDING' || reservation.reservationStatus === 'APPROVED'

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/admin/reservations')}
            variant="outline"
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">예약 상세</h1>
            <p className="text-gray-600 mt-1">
              예약 ID: {reservation.reservationIdentifier}
            </p>
          </div>
        </div>

        {/* 상태 및 액션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${statusColors[reservation.reservationStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[reservation.reservationStatus as keyof typeof statusLabels] || reservation.reservationStatus}
              </span>
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${paymentStatusColors[reservation.paymentStatus as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                {paymentStatusLabels[reservation.paymentStatus as keyof typeof paymentStatusColors] || reservation.paymentStatus}
              </span>
            </div>
            {(canApprove || canReject) && (
              <div className="flex gap-3">
                {canApprove && (
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    승인
                  </Button>
                )}
                {canReject && (
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isUpdatingStatus}
                    variant="outline"
                    className="cursor-pointer text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거절
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 예약 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 숙소 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">숙소 정보</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {reservation.roomImageUrl ? (
                    <img
                      src={reservation.roomImageUrl}
                      alt={reservation.roomName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      🏠
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{reservation.roomName}</h3>
                  <p className="text-gray-600">{reservation.residenceName}</p>
                  <p className="text-sm text-gray-500">방 ID: {reservation.roomIdentifier}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{reservation.residenceFullAddress}</span>
                  </div>
                </div>
              </div>

              {/* 시설 정보 */}
              {reservation.roomFacilities && reservation.roomFacilities.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">시설</h4>
                  <div className="flex flex-wrap gap-2">
                    {reservation.roomFacilities.map((facility, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {facility.customNameI18n?.ko || facility.facilityType}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 예약 일정 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 일정</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">체크인</p>
                    <p className="font-medium">{formatDate(reservation.checkInDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">체크아웃</p>
                    <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">숙박 기간</p>
                    <p className="font-medium">{reservation.totalNights}박</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">가격 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">1박 요금</span>
                  <span className="font-medium">${reservation.roomDailyPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">숙박 기간</span>
                  <span className="font-medium">{reservation.totalNights}박</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>총 금액</span>
                    <span>${reservation.totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">통화: {reservation.curUnit}</p>
                </div>
              </div>
            </div>

            {/* 예약 사유 */}
            {reservation.reservationReason && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 사유</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{reservation.reservationReason}</p>
              </div>
            )}
          </div>

          {/* 우측: 고객 정보 */}
          <div className="space-y-6">
            {/* 고객 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">고객 정보</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{reservation.userFirstName} {reservation.userLastName}</p>
                    <p className="text-sm text-gray-500">고객 ID: {reservation.userIdentifier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm">{reservation.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm">+{reservation.userCountryCode} {reservation.userPhoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 상태</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[reservation.paymentStatus as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {paymentStatusLabels[reservation.paymentStatus as keyof typeof paymentStatusLabels] || reservation.paymentStatus}
                  </span>
                </div>
                {reservation.paymentCreatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 일시</span>
                    <span className="text-sm">{formatDateTime(reservation.paymentCreatedAt)}</span>
                  </div>
                )}
                {reservation.paymentUpdatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 업데이트</span>
                    <span className="text-sm">{formatDateTime(reservation.paymentUpdatedAt)}</span>
                  </div>
                )}
                {reservation.refundStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">환불 상태</span>
                    <span className="text-sm text-red-600">{reservation.refundStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 타임라인 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">처리 내역</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">예약 생성</p>
                    <p className="text-xs text-gray-500">{formatDateTime(reservation.createdAt)}</p>
                  </div>
                </div>
                {reservation.approvalTime && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-green-600">승인 완료</p>
                      <p className="text-xs text-gray-500">{formatDateTime(reservation.approvalTime)}</p>
                    </div>
                  </div>
                )}
                {reservation.rejectedTime && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-red-600">거절 처리</p>
                      <p className="text-xs text-gray-500">{formatDateTime(reservation.rejectedTime)}</p>
                    </div>
                  </div>
                )}
                {reservation.cancelledTime && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">취소됨</p>
                      <p className="text-xs text-gray-500">{formatDateTime(reservation.cancelledTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 승인 확인 모달 */}
      <AdminConfirmationDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="예약 승인"
        description="정말 예약 상태를 승인으로 변경하시겠습니까?"
        confirmText="승인"
        isLoading={isUpdatingStatus}
        variant="approve"
      />

      {/* 거절 확인 모달 */}
      <AdminConfirmationDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        title="예약 거절"
        description="예약 상태를 거절로 변경하시겠습니까? 거절로 변경하면 상태를 되돌릴 수 없습니다. 동시에 고객에게 환불이 진행됩니다."
        confirmText="거절"
        isLoading={isUpdatingStatus}
        variant="reject"
      />
    </AdminLayout>
  )
}

export default function AdminReservationDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AdminReservationDetailPageContent />
    </Suspense>
  )
}
