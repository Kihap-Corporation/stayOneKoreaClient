"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { toast } from "sonner"
import { ChevronRight, Calendar, Clock, User, Phone } from "lucide-react"

interface Reservation {
  reservationIdentifier: string
  checkInDate: string
  checkOutDate: string
  totalNights: number
  reservationStatus: string
  roomName: string
  roomIdentifier: string
  residenceName: string
  residenceIdentifier: string
  roomImageUrl: string
  createdAt: string
  approvalTime?: string
  rejectedTime?: string
  cancelledTime?: string
  userEmail: string
  userFirstName: string
  userLastName: string
  userPhoneNumber: string
  userCountryCode: string
  paymentStatus: string
  paymentCreatedAt?: string
  paymentUpdatedAt?: string
  reservationReason?: string
}

interface ReservationListResponse {
  code: number
  message: string
  data: {
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    content: Reservation[]
    number: number
    sort: any
    pageable: any
    numberOfElements: number
    empty: boolean
  }
}

type ReservationStatus = 'RESERVATION_PENDING' | 'APPROVED' | 'REJECTED' | 'RESERVATION_UNDER_WAY'

const statusLabels = {
  RESERVATION_PENDING: '예약됨',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  RESERVATION_UNDER_WAY: '진행중'
}

const statusColors = {
  RESERVATION_PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  RESERVATION_UNDER_WAY: 'bg-blue-100 text-blue-800'
}

function AdminReservationsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '0'))
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | ''>('')
  const [selectedResidence, setSelectedResidence] = useState<string>('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'checkInDate'>('createdAt')
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC')

  const pageSize = 10

  // 예약 리스트 조회
  const fetchReservations = async () => {
    setIsLoading(true)
    try {
      let url = `/api/v1/admin/reservation?page=${currentPage}&size=${pageSize}&sort=${sortBy}&direction=${sortDirection}&languageCode=ko`

      if (selectedStatus) {
        url += `&reservationStatus=${selectedStatus}`
      }

      if (selectedResidence) {
        url += `&residenceIdentifier=${selectedResidence}`
      }

      const response = await apiGet(url)
      const data: ReservationListResponse = response

      if (data.code === 200) {
        setReservations(data.data.content)
        setTotalPages(data.data.totalPages)
        setTotalElements(data.data.totalElements)
      } else {
        toast.error("예약 목록을 불러오는데 실패했습니다.")
      }
    } catch (error) {
      toast.error("예약 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 상태 필터 변경
  const handleStatusFilter = (status: ReservationStatus | '') => {
    setSelectedStatus(status)
    setCurrentPage(0)
    router.push(`/admin/reservations?page=0`)
  }

  // 거주지 필터 변경
  const handleResidenceFilter = (residenceIdentifier: string) => {
    setSelectedResidence(residenceIdentifier)
    setCurrentPage(0)
    router.push(`/admin/reservations?page=0`)
  }

  // 정렬 변경
  const handleSortChange = (newSortBy: 'createdAt' | 'checkInDate') => {
    setSortBy(newSortBy)
    setCurrentPage(0)
    router.push(`/admin/reservations?page=0`)
  }

  // 정렬 방향 토글
  const handleDirectionToggle = () => {
    setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')
    setCurrentPage(0)
    router.push(`/admin/reservations?page=0`)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    router.push(`/admin/reservations?page=${page}`)
  }

  // 예약 클릭 (상세페이지 이동)
  const handleReservationClick = (reservationIdentifier: string) => {
    router.push(`/admin/reservations/${reservationIdentifier}`)
  }

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 데이터 로드
  useEffect(() => {
    fetchReservations()
  }, [currentPage, selectedStatus, selectedResidence, sortBy, sortDirection])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">예약 관리</h1>
            <p className="text-gray-600 mt-2">
              총 {totalElements}개의 예약
            </p>
          </div>
        </div>

        {/* 필터 및 정렬 옵션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          {/* 상태 필터 */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">상태 필터:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === ''
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => handleStatusFilter('RESERVATION_PENDING')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === 'RESERVATION_PENDING'
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                예약됨
              </button>
              <button
                onClick={() => handleStatusFilter('APPROVED')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === 'APPROVED'
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                승인됨
              </button>
              <button
                onClick={() => handleStatusFilter('REJECTED')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === 'REJECTED'
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                거절됨
              </button>
            </div>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSortChange('createdAt')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  sortBy === 'createdAt'
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                생성일순
              </button>
              <button
                onClick={() => handleSortChange('checkInDate')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  sortBy === 'checkInDate'
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                체크인순
              </button>
            </div>
            <button
              onClick={handleDirectionToggle}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {sortDirection === 'ASC' ? '↑ 오름차순' : '↓ 내림차순'}
            </button>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]"></div>
              <p className="mt-4 text-gray-600">예약 목록을 불러오는 중...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">조회되는 예약이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div
                  key={reservation.reservationIdentifier}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleReservationClick(reservation.reservationIdentifier)}
                >
                  <div className="flex items-start gap-4">
                    {/* 이미지 */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {reservation.roomName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {reservation.residenceName}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {reservation.reservationIdentifier}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[reservation.reservationStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[reservation.reservationStatus as keyof typeof statusLabels] || reservation.reservationStatus}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(reservation.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* 예약 정보 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{formatDate(reservation.checkInDate)}</p>
                            <p className="text-xs text-gray-500">체크인</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
                            <p className="text-xs text-gray-500">체크아웃</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{reservation.totalNights}박</p>
                            <p className="text-xs text-gray-500">숙박 기간</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{reservation.userFirstName} {reservation.userLastName}</p>
                            <p className="text-xs text-gray-500">{reservation.userEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* 연락처 정보 */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>+{reservation.userCountryCode} {reservation.userPhoneNumber}</span>
                      </div>
                    </div>

                    {/* 화살표 */}
                    <div className="flex-shrink-0">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              처음
            </Button>

            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              이전
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                // 현재 페이지 근처만 표시
                if (
                  page === 0 ||
                  page === totalPages - 1 ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`cursor-pointer ${
                        currentPage === page
                          ? "bg-[#E91E63] hover:bg-[#C2185B] text-white"
                          : ""
                      }`}
                    >
                      {page + 1}
                    </Button>
                  )
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
            </div>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              다음
            </Button>

            <Button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              마지막
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AdminReservationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AdminReservationsPageContent />
    </Suspense>
  )
}
