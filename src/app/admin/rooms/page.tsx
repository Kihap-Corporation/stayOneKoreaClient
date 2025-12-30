"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { apiGet, apiDelete } from "@/lib/api"

interface Room {
  roomIdentifier: string
  roomName: string
  pricePerNight: number
  roomCreatedAt: string
  residenceIdentifier: string
  residenceName: string
  residenceProfileImageUrl: string
}

interface RoomListResponse {
  rooms: Room[]
  currentPage: number
  totalPages: number
  totalElements: number
}

export default function AdminRoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"createdAt" | "residenceName">("createdAt")
  const [direction, setDirection] = useState<"ASC" | "DESC">("ASC")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 검색 관련 상태
  const [searchType, setSearchType] = useState<"ROOM_NAME" | "RESIDENCE_NAME">("ROOM_NAME")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [inputKeyword, setInputKeyword] = useState("")

  useEffect(() => {
    fetchRooms()
  }, [currentPage, sortBy, direction, searchKeyword])

  const fetchRooms = async () => {
    setIsLoading(true)
    try {
      let url = `/api/v1/admin/rooms?page=${currentPage}&size=20&sortBy=${sortBy}&direction=${direction}`

      if (searchKeyword) {
        url += `&searchType=${searchType}&searchKeyword=${encodeURIComponent(searchKeyword)}`
      }

      const response = await apiGet(url)
      const data: RoomListResponse = response.data

      setRooms(data.rooms)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      alert("룸 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortChange = (newSortBy: "createdAt" | "residenceName") => {
    setSortBy(newSortBy)
    setCurrentPage(1)
  }

  const handleDirectionToggle = () => {
    setDirection(direction === "ASC" ? "DESC" : "ASC")
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchKeyword(inputKeyword)
    setCurrentPage(1)
  }

  const handleSearchReset = () => {
    setInputKeyword("")
    setSearchKeyword("")
    setCurrentPage(1)
  }

  const handleDelete = async (roomIdentifier: string, residenceIdentifier: string, roomName: string) => {
    const confirmed = confirm(
      `"${roomName}" 룸을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setDeletingId(roomIdentifier)
    try {
      await apiDelete(`/api/v1/admin/residences/${residenceIdentifier}/rooms/${roomIdentifier}`)
      alert("룸이 삭제되었습니다.")
      await fetchRooms()
    } catch (error: any) {
      // ApiError에서 이미 alert를 표시하므로 추가 처리 불필요
      console.error("룸 삭제 실패:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">룸 관리</h1>
            <p className="text-gray-600 mt-2">
              총 {totalElements}개의 룸
            </p>
          </div>
        </div>

        {/* 검색 & 정렬 옵션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          {/* 검색 */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as "ROOM_NAME" | "RESIDENCE_NAME")}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63] cursor-pointer"
            >
              <option value="ROOM_NAME">룸명</option>
              <option value="RESIDENCE_NAME">고시원명</option>
            </select>
            <Input
              type="text"
              placeholder="검색어를 입력하세요"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
            >
              검색
            </Button>
            {searchKeyword && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSearchReset}
                className="cursor-pointer"
              >
                초기화
              </Button>
            )}
          </form>

          {/* 정렬 */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSortChange("createdAt")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${sortBy === "createdAt"
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                등록일순
              </button>
              <button
                onClick={() => handleSortChange("residenceName")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${sortBy === "residenceName"
                    ? "bg-[#E91E63] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                고시원명순
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

        {/* 룸 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]"></div>
              <p className="mt-4 text-gray-600">룸 목록을 불러오는 중...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                {searchKeyword ? "검색 결과가 없습니다." : "등록된 룸이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      고시원 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      룸명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가격 (1박)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      등록일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.roomIdentifier} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={room.residenceProfileImageUrl}
                            alt={room.residenceName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {room.residenceName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {room.roomName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#E91E63]">
                          ${room.pricePerNight.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(room.roomCreatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/residences/${room.residenceIdentifier}/rooms/${room.roomIdentifier}`)}
                          className="cursor-pointer"
                          disabled={deletingId === room.roomIdentifier}
                        >
                          상세보기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(room.roomIdentifier, room.residenceIdentifier, room.roomName)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                          disabled={deletingId === room.roomIdentifier}
                        >
                          {deletingId === room.roomIdentifier ? "삭제 중..." : "삭제"}
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

