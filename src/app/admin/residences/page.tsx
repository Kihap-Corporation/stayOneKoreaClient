"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { apiGet, apiDelete } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Residence {
  identifier: string
  name: string
  profileImageUrl: string
  fullAddress: string
}

interface ResidenceListResponse {
  residences: Residence[]
  currentPage: number
  totalPages: number
  totalElements: number
}

export default function ResidencesPage() {
  const router = useRouter()
  const [residences, setResidences] = useState<Residence[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const pageSize = 10

  // 고시원 리스트 조회
  const fetchResidences = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await apiGet(`/api/v1/admin/residences?page=${page}&size=${pageSize}`)
      const data: ResidenceListResponse = response.data

      setResidences(data.residences)
      setCurrentPage(data.currentPage)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error("고시원 리스트 조회 실패:", error)
      alert("고시원 리스트를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 고시원 삭제
  const handleDelete = async (identifier: string, name: string) => {
    const confirmed = confirm(`"${name}" 고시원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    if (!confirmed) return

    setDeletingId(identifier)
    try {
      await apiDelete(`/api/v1/admin/residences/${identifier}`)
      alert("고시원이 삭제되었습니다.")
      // 리스트 새로고침
      fetchResidences(currentPage)
    } catch (error) {
      console.error("고시원 삭제 실패:", error)
      alert("고시원 삭제에 실패했습니다.")
    } finally {
      setDeletingId(null)
    }
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchResidences(page)
  }

  // 초기 로드
  useEffect(() => {
    fetchResidences(1)
  }, [])

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              고시원 관리
            </h1>
            <p className="text-gray-600">
              전체 {totalElements}개의 고시원
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/residences/create')}
            className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
          >
            + 고시원 등록
          </Button>
        </div>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
          </div>
        ) : residences.length === 0 ? (
          /* 빈 상태 */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              등록된 고시원이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              첫 번째 고시원을 등록해보세요
            </p>
            <Button
              onClick={() => router.push('/admin/residences/create')}
              className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
            >
              + 고시원 등록
            </Button>
          </div>
        ) : (
          <>
            {/* 고시원 리스트 테이블 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이미지
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      고시원명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주소
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {residences.map((residence) => (
                    <tr key={residence.identifier} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {residence.profileImageUrl ? (
                            <img
                              src={residence.profileImageUrl}
                              alt={residence.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                              🏢
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {residence.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {residence.identifier}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {residence.fullAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => router.push(`/admin/residences/${residence.identifier}`)}
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                          >
                            상세
                          </Button>
                          <Button
                            onClick={() => handleDelete(residence.identifier, residence.name)}
                            variant="outline"
                            size="sm"
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === residence.identifier}
                          >
                            {deletingId === residence.identifier ? "삭제 중..." : "삭제"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  이전
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 현재 페이지 근처만 표시
                    if (
                      page === 1 ||
                      page === totalPages ||
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
                          {page}
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
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

