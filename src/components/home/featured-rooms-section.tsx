"use client"

import { useLanguage } from "@/components/language-provider"
import { RoomCard } from "./room-card"
import { apiGet } from "@/lib/api"
import { useEffect, useState } from "react"

// API 응답 타입
interface RecommendedRoom {
  displayOrder: number
  firstGalleryImageUrl: string
  residenceName: string
  fullAddress: string
  roomName: string
  pricePerNight: number
  roomIdentifier: string
  residenceIdentifier: string
}

// UI에서 사용하는 Room 타입
interface Room {
  displayOrder: number
  roomName: string
  residenceName: string
  address: string
  price: number
  imageUrl: string
  roomIdentifier: string
  residenceIdentifier: string
}

export function FeaturedRoomsSection() {
  const { messages, currentLanguage } = useLanguage()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        // language 파라미터 추가 (ko, en, zh, fr)
        const response = await apiGet(`/api/recommend-rooms?language=${currentLanguage.code}`, { skipAuth: true })
        
        if ((response.status === 200 || response.code === 200) && response.data) {
          // API 응답 데이터를 Room 형식으로 변환
          const recommendedRooms: RecommendedRoom[] = response.data
          const formattedRooms: Room[] = recommendedRooms.map((item) => ({
            displayOrder: item.displayOrder,
            roomName: item.roomName,
            residenceName: item.residenceName,
            address: item.fullAddress,
            price: item.pricePerNight,
            imageUrl: item.firstGalleryImageUrl,
            roomIdentifier: item.roomIdentifier,
            residenceIdentifier: item.residenceIdentifier
          }))
          setRooms(formattedRooms)
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err)
        setError('Failed to load rooms')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [currentLanguage.code])

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="w-full bg-white pb-20 pt-10 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[18px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold text-[#14151a] tracking-[-0.3px]">
              {messages?.home?.featuredRooms?.title || "Featured rooms"}
            </h2>
            <p className="text-base font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.2px]">
              {messages?.home?.featuredRooms?.subtitle || "Recommended rooms by Stay One Korea"}
            </p>
          </div>
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </div>
      </div>
    )
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="w-full bg-white pb-20 pt-10 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[18px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold text-[#14151a] tracking-[-0.3px]">
              {messages?.home?.featuredRooms?.title || "Featured rooms"}
            </h2>
            <p className="text-base font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.2px]">
              {messages?.home?.featuredRooms?.subtitle || "Recommended rooms by Stay One Korea"}
            </p>
          </div>
          <div className="flex items-center justify-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // 데이터 없을 때
  if (rooms.length === 0) {
    return (
      <div className="w-full bg-white pb-20 pt-10 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[18px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold text-[#14151a] tracking-[-0.3px]">
              {messages?.home?.featuredRooms?.title || "Featured rooms"}
            </h2>
            <p className="text-base font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.2px]">
              {messages?.home?.featuredRooms?.subtitle || "Recommended rooms by Stay One Korea"}
            </p>
          </div>
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">No rooms available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white pb-20 pt-10 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-[18px]">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold text-[#14151a] tracking-[-0.3px]">
            {messages?.home?.featuredRooms?.title || "Featured rooms"}
          </h2>
          <p className="text-base font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.2px]">
            {messages?.home?.featuredRooms?.subtitle || "Recommended rooms by Stay One Korea"}
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.displayOrder}
              image={room.imageUrl}
              title={room.roomName}
              provider={room.residenceName}
              location={room.address}
              price={room.price}
              roomId={room.roomIdentifier}
              residenceId={room.residenceIdentifier}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
