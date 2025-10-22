"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { apiGet, apiDelete } from "@/lib/api"

interface Room {
  identifier: string
  name: string
  pricePerNight: number
}

interface RoomsResponse {
  rooms: Room[]
  currentPage: number
  totalPages: number
  totalElements: number
}

export default function ResidenceRoomsPage() {
  const router = useRouter()
  const params = useParams()
  const residenceIdentifier = params.identifier as string

  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const pageSize = 10

  useEffect(() => {
    fetchRooms(1)
  }, [residenceIdentifier])

  const fetchRooms = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await apiGet(
        `/api/v1/admin/residences/${residenceIdentifier}/rooms?page=${page}&size=${pageSize}`
      )
      const data: RoomsResponse = response.data
      
      setRooms(data.rooms)
      setCurrentPage(data.currentPage)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error("룸 리스트 조회 실패:", error)
      alert("룸 리스트를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchRooms(page)
  }

  // 룸 삭제
  const handleDelete = async (roomIdentifier: string, roomName: string) => {
    const confirmed = confirm(
      `"${roomName}" 룸을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setDeletingId(roomIdentifier)
    try {
      await apiDelete(`/api/v1/admin/residences/${residenceIdentifier}/rooms/${roomIdentifier}`)
      alert("룸이 삭제되었습니다.")
      // 리스트 새로고침
      fetchRooms(currentPage)
    } catch (error) {
      console.error("룸 삭제 실패:", error)
      alert("룸 삭제에 실패했습니다.")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading && rooms.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">룸 관리</h1>
            <p className="text-sm text-gray-600 mt-1">
              총 {totalElements}개의 룸
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/residences/${residenceIdentifier}`)}
              className="cursor-pointer"
            >
              고시원 상세로
            </Button>
            <Button
              onClick={() => router.push(`/admin/residences/${residenceIdentifier}/rooms/create`)}
              className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
            >
              룸 추가
            </Button>
          </div>
        </div>

        {/* 룸 리스트 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 룸이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">새로운 룸을 추가해보세요.</p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push(`/admin/residences/${residenceIdentifier}/rooms/create`)}
                  className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
                >
                  룸 추가하기
                </Button>
              </div>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      룸명
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      1박 가격
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.identifier} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${room.pricePerNight.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/residences/${residenceIdentifier}/rooms/${room.identifier}`)}
                            className="cursor-pointer"
                            disabled={deletingId === room.identifier}
                          >
                            상세보기
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(room.identifier, room.name)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                            disabled={deletingId === room.identifier}
                          >
                            {deletingId === room.identifier ? "삭제 중..." : "삭제"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="cursor-pointer"
                    >
                      이전
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer"
                    >
                      다음
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        총 <span className="font-medium">{totalElements}</span>개 중{' '}
                        <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>-
                        <span className="font-medium">
                          {Math.min(currentPage * pageSize, totalElements)}
                        </span>
                        개 표시
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          이전
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                              page === currentPage
                                ? 'z-10 bg-[#E91E63] border-[#E91E63] text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          다음
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

