"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { RoomImageGallery } from "@/components/room/RoomImageGallery"
import { RoomInfo } from "@/components/room/RoomInfo"
import { RoomFacilities } from "@/components/room/RoomFacilities"
import { RoomDescription } from "@/components/room/RoomDescription"
import { RoomLocation } from "@/components/room/RoomLocation"
import { BookingSidebar } from "@/components/room/BookingSidebar"
import { RelatedRooms } from "@/components/room/RelatedRooms"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface RoomDetailPageProps {
  params: {
    gosiwonId: string
    roomId: string
  }
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { messages } = useLanguage()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)
  const [guests, setGuests] = useState(1) // 무조건 1명 고정

  // 인원은 무조건 1명으로 고정
  const handleGuestsChange = (newGuests: number) => {
    // 최소 1명, 최대 1명으로 제한
    setGuests(Math.max(1, Math.min(1, newGuests)))
  }

  // 실제 구현 시 API 호출로 변경 필요
  // const roomData = await apiGet(`/api/gosiwon/${params.gosiwonId}/room/${params.roomId}`)

  // 샘플 데이터 (실제로는 API에서 가져올 것임)
  const roomData = {
    name: "럭셔리 강남 풀빌라",
    location: "서울특별시 강남구 테헤란로 123",
    price: 149,
    originalPrice: 249,
    nights: 7,
    totalPrice: 1043,
    rating: 4.8,
    reviewCount: 127,
    images: [
      "/api/placeholder/800/600", // 실제 이미지들로 교체 필요
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
      "/api/placeholder/800/600",
    ],
    facilities: [
      { name: "Wi-Fi", iconName: "Wifi", available: true },
      { name: "주차장", iconName: "Car", available: true },
      { name: "에어컨", iconName: "Flame", available: true },
      { name: "운동시설", iconName: "Dumbbell", available: true },
      { name: "화재감지기", iconName: "Shield", available: true },
      { name: "일산화탄소감지기", iconName: "ShieldCheck", available: true },
    ],
    host: {
      name: "김호스트",
      isVerified: true,
      joinYear: 2019,
      description: "안녕하세요! 저는 2019년부터 에어비앤비 호스트로 활동하고 있습니다. 게스트분들께 최고의 숙박 경험을 제공하기 위해 최선을 다하고 있습니다."
    },
    description: "강남 중심부에 위치한 럭셔리 풀빌라입니다. 현대적인 인테리어와 편안한 분위기가 돋보이는 공간으로, 여행객들에게 최고의 휴식을 제공합니다.",
    rules: "체크인: 오후 3:00 이후, 체크아웃: 오전 11:00 이전. 파티 및 흡연 금지.",
    relatedRooms: [
      {
        id: 1,
        name: "모던 스튜디오 아파트",
        location: "강남구 역삼동",
        price: 89,
        image: "/api/placeholder/400/300",
        isVerified: false,
        hasFreeCancellation: false
      },
      {
        id: 2,
        name: "한옥 스타일 게스트하우스",
        location: "종로구 북촌",
        price: 120,
        image: "/api/placeholder/400/300",
        isVerified: true,
        hasFreeCancellation: true
      },
      {
        id: 3,
        name: "바다 전망 펜트하우스",
        location: "해운대구 센텀동",
        price: 200,
        image: "/api/placeholder/400/300",
        isVerified: true,
        hasFreeCancellation: true
      },
      {
        id: 4,
        name: "도심 속 정원 하우스",
        location: "마포구 홍대입구",
        price: 95,
        image: "/api/placeholder/400/300",
        isVerified: false,
        hasFreeCancellation: true
      }
    ]
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <Header />

      <main className="flex-1">
        {/* 이미지 갤러리 섹션 */}
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-8">
            <RoomImageGallery
              images={roomData.images}
              roomName={roomData.name}
              selectedIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
            />
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-[#f7f7f8]">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* 메인 정보 */}
              <div className="lg:col-span-2">
                <RoomInfo
                  name={roomData.name}
                  location={roomData.location}
                  facilities={roomData.facilities}
                  description={roomData.description}
                  rules={roomData.rules}
                />

                <RoomLocation location={roomData.location} />
              </div>

              {/* 예약 사이드바 */}
              <div className="lg:col-span-1">
                <BookingSidebar
                  price={roomData.price}
                  originalPrice={roomData.originalPrice}
                  nights={roomData.nights}
                  totalPrice={roomData.totalPrice}
                  host={roomData.host}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  guests={guests}
                  onCheckInDateChange={setCheckInDate}
                  onCheckOutDateChange={setCheckOutDate}
                  onGuestsChange={handleGuestsChange}
                  roomId={params.roomId}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 관련 숙소들 */}
        <RelatedRooms
          title="이 호스트의 다른 숙소"
          rooms={roomData.relatedRooms}
        />
      </main>

      <Footer />
    </div>
  )
}
