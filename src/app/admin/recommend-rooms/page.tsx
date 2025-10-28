"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { getRecommendRooms, deleteRecommendRoom, addRecommendRoom, RecommendRoom } from "@/lib/recommend-rooms-api"
import { RoomSelectModal } from "@/components/admin/room-select-modal"

export default function RecommendRoomsPage() {
  const [recommendRooms, setRecommendRooms] = useState<Map<number, RecommendRoom>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [deletingOrder, setDeletingOrder] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number>(0)

  useEffect(() => {
    fetchRecommendRooms()
  }, [])

  const fetchRecommendRooms = async () => {
    setIsLoading(true)
    try {
      const rooms = await getRecommendRooms('ko')
      const roomMap = new Map<number, RecommendRoom>()
      rooms.forEach(room => {
        roomMap.set(room.displayOrder, room)
      })
      setRecommendRooms(roomMap)
    } catch (error) {
      console.error("추천룸 조회 실패:", error)
      alert("추천룸 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (displayOrder: number) => {
    const room = recommendRooms.get(displayOrder)
    if (!room) return

    const confirmed = confirm(`"${room.roomName}" 추천룸을 삭제하시겠습니까?`)
    if (!confirmed) return

    setDeletingOrder(displayOrder)
    try {
      await deleteRecommendRoom(displayOrder)
      alert("추천룸이 삭제되었습니다.")
      await fetchRecommendRooms()
    } catch (error) {
      console.error("추천룸 삭제 실패:", error)
      alert("추천룸 삭제에 실패했습니다.")
    } finally {
      setDeletingOrder(null)
    }
  }

  const handleAddRoom = (displayOrder: number) => {
    setSelectedSlot(displayOrder)
    setIsModalOpen(true)
  }

  const handleRoomSelect = async (roomIdentifier: string) => {
    try {
      await addRecommendRoom({
        roomIdentifier,
        displayOrder: selectedSlot
      })
      alert("추천룸이 등록되었습니다.")
      setIsModalOpen(false)
      await fetchRecommendRooms()
    } catch (error) {
      console.error("추천룸 등록 실패:", error)
      alert("추천룸 등록에 실패했습니다.")
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            추천룸 관리
          </h1>
          <p className="text-gray-600">
            홈페이지에 노출될 추천 숙소를 관리합니다 (최대 8개)
          </p>
        </div>

        {/* 추천룸 그리드 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, index) => {
              const room = recommendRooms.get(index)
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {room ? (
                    <>
                      {/* 이미지 */}
                      <div className="relative aspect-square">
                        <img
                          src={room.firstGalleryImageUrl}
                          alt={room.roomName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#E91E63] text-white text-xs font-bold px-2 py-1 rounded">
                          #{index}
                        </div>
                      </div>

                      {/* 정보 */}
                      <div className="p-4">
                        <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-1">
                          {room.roomName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                          {room.residenceName}
                        </p>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                          {room.fullAddress}
                        </p>
                        <p className="text-base font-bold text-[#E91E63] mb-3">
                          ${room.pricePerNight} / 박
                        </p>

                        {/* 삭제 버튼 */}
                        <Button
                          onClick={() => handleDelete(index)}
                          disabled={deletingOrder === index}
                          className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                        >
                          {deletingOrder === index ? "삭제 중..." : "삭제"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* 빈 슬롯 */
                    <button
                      onClick={() => handleAddRoom(index)}
                      className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer border-2 border-dashed border-gray-300 rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">+</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">
                          추천룸 추가
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          슬롯 #{index}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 룸 선택 모달 */}
      <RoomSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleRoomSelect}
        displayOrder={selectedSlot}
      />
    </AdminLayout>
  )
}

