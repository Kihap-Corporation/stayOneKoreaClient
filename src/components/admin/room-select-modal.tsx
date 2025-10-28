"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiGet } from "@/lib/api"

interface Room {
  roomIdentifier: string
  roomName: string
  pricePerNight: number
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

interface RoomSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (roomIdentifier: string) => void
  displayOrder: number
}

export function RoomSelectModal({ isOpen, onClose, onSelect, displayOrder }: RoomSelectModalProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<"ROOM_NAME" | "RESIDENCE_NAME">("ROOM_NAME")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [inputKeyword, setInputKeyword] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchRooms()
    }
  }, [isOpen, currentPage, searchKeyword])

  const fetchRooms = async () => {
    setIsLoading(true)
    try {
      let url = `/api/v1/admin/rooms?page=${currentPage}&size=10&sortBy=createdAt&direction=DESC`
      
      if (searchKeyword) {
        url += `&searchType=${searchType}&searchKeyword=${encodeURIComponent(searchKeyword)}`
      }

      const response = await apiGet(url)
      const data: RoomListResponse = response.data
      
      setRooms(data.rooms)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("룸 목록 조회 실패:", error)
      alert("룸 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
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

  const handleSelect = (roomIdentifier: string) => {
    onSelect(roomIdentifier)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              추천룸 선택 (슬롯 #{displayOrder})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 검색 폼 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as "ROOM_NAME" | "RESIDENCE_NAME")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] cursor-pointer"
            >
              <option value="ROOM_NAME">룸 이름</option>
              <option value="RESIDENCE_NAME">고시원 이름</option>
            </select>
            <Input
              type="text"
              placeholder="검색어 입력..."
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-[#E91E63] hover:bg-[#C2185B] cursor-pointer">
              검색
            </Button>
            {searchKeyword && (
              <Button
                type="button"
                onClick={handleSearchReset}
                variant="outline"
                className="cursor-pointer"
              >
                초기화
              </Button>
            )}
          </form>
        </div>

        {/* 룸 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              룸이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <button
                  key={room.roomIdentifier}
                  onClick={() => handleSelect(room.roomIdentifier)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#E91E63] hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* 이미지 */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={room.residenceProfileImageUrl}
                        alt={room.roomName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 truncate">
                        {room.roomName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {room.residenceName}
                      </p>
                      <p className="text-sm font-bold text-[#E91E63]">
                        ${room.pricePerNight} / 박
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {!isLoading && rooms.length > 0 && totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="cursor-pointer"
              >
                이전
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="cursor-pointer"
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

