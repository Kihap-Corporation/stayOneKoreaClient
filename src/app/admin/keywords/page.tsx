"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { apiGet, apiDelete } from "@/lib/api"

interface I18nField {
  ko: string
  en: string
  zh: string
  fr: string
}

interface Keyword {
  identifier: string
  nameI18n: I18nField
  categoryI18n: I18nField
  latitude: number
  longitude: number
}

interface KeywordListResponse {
  content: Keyword[]
  currentPage: number
  size: number
  totalElements: number
  totalPages: number
  isLast: boolean
}

export default function AdminKeywordsPage() {
  const router = useRouter()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("name")
  const [direction, setDirection] = useState<"ASC" | "DESC">("ASC")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchKeywords()
  }, [currentPage, sortBy, direction])

  const fetchKeywords = async () => {
    setIsLoading(true)
    try {
      const response = await apiGet(
        `/api/v1/admin/keywords?page=${currentPage}&size=20&sortBy=${sortBy}&direction=${direction}`
      )
      const data: KeywordListResponse = response.data
      
      setKeywords(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      alert("키워드 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortChange = (newSortBy: "name" | "createdAt") => {
    setSortBy(newSortBy)
    setCurrentPage(1)
  }

  const handleDirectionToggle = () => {
    setDirection(direction === "ASC" ? "DESC" : "ASC")
    setCurrentPage(1)
  }

  const handleDelete = async (identifier: string, name: string) => {
    const confirmed = confirm(
      `"${name}" 키워드를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setDeletingId(identifier)
    try {
      await apiDelete(`/api/v1/admin/keywords/${identifier}`)
      alert("키워드가 삭제되었습니다.")
      await fetchKeywords()
    } catch (error) {
      alert("키워드 삭제에 실패했습니다.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">검색 키워드 관리</h1>
            <p className="text-gray-600 mt-2">
              총 {totalElements}개의 키워드
            </p>
          </div>
          <Button
            onClick={() => router.push("/admin/keywords/create")}
            className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
          >
            + 키워드 추가
          </Button>
        </div>

        {/* 정렬 옵션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSortChange("name")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  sortBy === "name"
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                이름순
              </button>
              <button
                onClick={() => handleSortChange("createdAt")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  sortBy === "createdAt"
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                등록일순
              </button>
            </div>
            <button
              onClick={handleDirectionToggle}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {direction === "ASC" ? "↑ 오름차순" : "↓ 내림차순"}
            </button>
          </div>
        </div>

        {/* 키워드 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]"></div>
              <p className="mt-4 text-gray-600">키워드 목록을 불러오는 중...</p>
            </div>
          ) : keywords.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">등록된 키워드가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      키워드명 (한국어)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리 (한국어)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      위치 (위도/경도)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {keywords.map((keyword) => (
                    <tr key={keyword.identifier} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {keyword.nameI18n.ko}
                        </div>
                        <div className="text-xs text-gray-500">
                          {keyword.nameI18n.en}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {keyword.categoryI18n.ko}
                        </div>
                        <div className="text-xs text-gray-500">
                          {keyword.categoryI18n.en}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-xs text-gray-500">위도:</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {keyword.latitude.toFixed(6)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">경도:</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {keyword.longitude.toFixed(6)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/keywords/${keyword.identifier}`)}
                          className="cursor-pointer"
                          disabled={deletingId === keyword.identifier}
                        >
                          상세보기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(keyword.identifier, keyword.nameI18n.ko)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                          disabled={deletingId === keyword.identifier}
                        >
                          {deletingId === keyword.identifier ? "삭제 중..." : "삭제"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className="cursor-pointer"
            >
              이전
            </Button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="cursor-pointer"
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

