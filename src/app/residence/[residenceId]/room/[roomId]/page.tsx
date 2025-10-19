"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { BookingSidebar } from "@/components/room/BookingSidebar"
import { apiGet } from "@/lib/api"
import { Wifi, WashingMachine, Car, AirVent, Bell, Flame, ChevronRight, Camera, ChevronLeft } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"

interface RoomDetailPageProps {
  params: {
    residenceId: string
    roomId: string
  }
}

interface RoomImage {
  imageUrl: string
  imageType: string
  displayOrder: number
}

interface RoomFacility {
  facilityType: string
  customNameI18n: Record<string, string>
  iconUrl?: string
}

interface ReservedDate {
  checkIn: string
  checkOut: string
  reservationStatus: string
}

interface RoomDetail {
  roomIdentifier: string
  roomNameI18n: string
  roomDescriptionI18n: string
  roomRulesI18n: string
  pricePerNight: number
  curUnit: string
  residenceIdentifier: string
  residenceNameI18n: string
  residenceDescriptionI18n: string
  residenceLogoImageUrl: string
  hostingStartDate: string
  residenceFullAddress: string
  residenceSiDo: string
  residenceSiGunGu: string
  residenceDongMyeon: string
  residenceDetail: string
  residenceLatitude: number
  residenceLongitude: number
  roomImages: RoomImage[]
  roomFacilities: RoomFacility[]
  reservedDates: ReservedDate[]
}

interface RelatedRoom {
  roomIdentifier: string
  roomName: string
  residenceFullAddress: string
  pricePerNight: number
  mainImageUrl: string
  residenceIdentifier: string
}

// 시설 아이콘 매핑
const getFacilityIcon = (facilityType: string) => {
  const lowerFacility = facilityType.toLowerCase()
  if (lowerFacility.includes('wifi') || lowerFacility.includes('wi-fi')) return Wifi
  if (lowerFacility.includes('washing') || lowerFacility.includes('machine')) return WashingMachine
  if (lowerFacility.includes('air') || lowerFacility.includes('conditioning')) return AirVent
  if (lowerFacility.includes('smoke') || lowerFacility.includes('alarm')) return Bell
  if (lowerFacility.includes('carbon') || lowerFacility.includes('monoxide')) return Flame
  if (lowerFacility.includes('parking')) return Car
  return Wifi // 기본 아이콘
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  const router = useRouter()
  const { messages, currentLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [roomData, setRoomData] = useState<RoomDetail | null>(null)
  const [relatedRooms, setRelatedRooms] = useState<RelatedRoom[]>([])
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)
  const [guests, setGuests] = useState(1)
  const [showAllFacilities, setShowAllFacilities] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showFullRules, setShowFullRules] = useState(false)
  const [currentRoomPage, setCurrentRoomPage] = useState(0)
  const [totalRoomPages, setTotalRoomPages] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleGuestsChange = (newGuests: number) => {
    setGuests(Math.max(1, Math.min(1, newGuests)))
  }

  // 호스팅 시작 연도 계산
  const getHostingYears = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const years = now.getFullYear() - start.getFullYear()
    return years > 0 ? years : 1
  }

  // 방 상세 정보 조회
  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const languageCode = currentLanguage.code
        
        const response = await apiGet(
          `/api/user/room/detail?residenceIdentifier=${params.residenceId}&roomIdentifier=${params.roomId}&languageCode=${languageCode}`
        )

        if (response.code === 200 && response.data) {
          setRoomData(response.data)
        } else if (response.code === 40500) {
          alert(messages?.roomDetail?.roomNotFound || "방을 찾을 수 없습니다.")
          setError("ROOM_NOT_FOUND")
        } else {
          setError("LOAD_ERROR")
        }
      } catch (error) {
        console.error('Error fetching room detail:', error)
        setError("LOAD_ERROR")
      } finally {
        setLoading(false)
      }
    }

    fetchRoomDetail()
  }, [params.residenceId, params.roomId, currentLanguage])

  // 관련 방 목록 조회
  useEffect(() => {
    const fetchRelatedRooms = async () => {
      if (!roomData) return

      try {
        const languageCode = currentLanguage.code
        
        const response = await apiGet(
          `/api/user/room/list?residenceIdentifier=${params.residenceId}&excludeRoomIdentifier=${params.roomId}&languageCode=${languageCode}&page=${currentRoomPage}&size=5`
        )

        if (response.code === 200 && response.data) {
          setRelatedRooms(response.data.content || [])
          setTotalRoomPages(response.data.totalPages || 0)
        } else if (response.code === 40500) {
          alert(messages?.roomDetail?.roomNotFound || "방을 찾을 수 없습니다.")
          setRelatedRooms([])
        } else {
          // 다른 에러의 경우 조용히 처리
          setRelatedRooms([])
        }
      } catch (error) {
        console.error('Error fetching related rooms:', error)
        setRelatedRooms([])
      }
    }

    fetchRelatedRooms()
  }, [roomData, params.residenceId, params.roomId, currentLanguage, currentRoomPage])

  // 예약된 날짜 필터링 함수
  const filterReservedDates = (date: Date) => {
    if (!roomData?.reservedDates) return true

    const dateStr = date.toISOString().split('T')[0]
    
    for (const reserved of roomData.reservedDates) {
      const checkIn = new Date(reserved.checkIn)
      const checkOut = new Date(reserved.checkOut)
      const currentDate = new Date(dateStr)
      
      // 체크인과 체크아웃 사이의 날짜는 선택 불가
      if (currentDate >= checkIn && currentDate <= checkOut) {
        return false
      }
    }
    
    return true
  }

  const handlePreviousPage = () => {
    if (currentRoomPage > 0) {
      setCurrentRoomPage(currentRoomPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentRoomPage < totalRoomPages - 1) {
      setCurrentRoomPage(currentRoomPage + 1)
    }
  }

  const handleRoomClick = (residenceIdentifier: string, roomIdentifier: string) => {
    router.push(`/residence/${residenceIdentifier}/room/${roomIdentifier}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !roomData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-[#14151a]">
              {messages?.roomDetail?.cannotLoadRoom || "방 정보를 조회할 수 없습니다."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const sortedImages = [...roomData.roomImages].sort((a, b) => a.displayOrder - b.displayOrder)
  const displayedFacilities = showAllFacilities 
    ? roomData.roomFacilities 
    : roomData.roomFacilities.slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <Header />

      <main className="flex-1">
        {/* 타이틀 섹션 */}
        <div className="bg-[#f7f7f8] pt-10 pb-0">
          <div className="mx-auto max-w-[1200px] px-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-extrabold leading-[32px] tracking-[-0.3px] text-[#14151a]">
                {roomData.roomNameI18n}
              </h1>
              <p className="text-[18px] font-medium leading-[26px] tracking-[-0.2px] text-[rgba(13,17,38,0.4)]">
                {roomData.residenceFullAddress}
              </p>
            </div>
          </div>
        </div>

        {/* 이미지 갤러리 섹션 */}
        <div className="bg-[#f7f7f8] pt-[18px]">
          <div className="mx-auto max-w-[1200px] px-4">
            <div className="bg-white rounded-[16px] overflow-hidden flex gap-1">
              {/* 메인 이미지 */}
              <div className="flex-1 relative">
                {sortedImages[0] && (
                  <img
                    src={sortedImages[0].imageUrl}
                    alt={roomData.roomNameI18n}
                    className="w-full h-[404px] object-cover"
                  />
                )}
              </div>
              
              {/* 작은 이미지 그리드 */}
              <div className="flex flex-col gap-1 w-[290px]">
                <div className="flex gap-1">
                  <div className="flex-1 h-[200px] relative">
                    {sortedImages[1] && (
                      <img
                        src={sortedImages[1].imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 h-[200px] relative">
                    {sortedImages[2] && (
                      <img
                        src={sortedImages[2].imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-[200px] relative">
                    {sortedImages[3] && (
                      <img
                        src={sortedImages[3].imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 h-[200px] relative">
                    <div className="relative w-full h-full">
                      {sortedImages[4] && (
                        <img
                          src={sortedImages[4].imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      {sortedImages.length > 5 && (
                        <button className="absolute inset-0 bg-[rgba(224,0,77,0.7)] backdrop-blur-[6px] flex flex-col items-center justify-center gap-2 cursor-pointer">
                          <Camera className="h-8 w-8 text-white" />
                          <span className="text-[24px] font-bold leading-[32px] tracking-[-0.3px] text-white">
                            Show all photos
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-[#f7f7f8] pt-10">
          <div className="mx-auto max-w-[1200px] px-4">
            <div className="flex gap-6">
              {/* 좌측 컨텐츠 */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Facilities */}
                {roomData.roomFacilities.length > 0 && (
                  <div className="bg-white rounded-[24px] px-5 py-4 flex flex-col gap-[18px]">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      Facilities
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {displayedFacilities.map((facility, index) => {
                        const Icon = getFacilityIcon(facility.facilityType)
                        const facilityName = facility.customNameI18n?.[currentLanguage.code] || facility.facilityType
                        
                        return (
                          <div key={index} className="flex items-center gap-2">
                            {facility.iconUrl ? (
                              <img 
                                src={facility.iconUrl} 
                                alt={facilityName}
                                className="h-5 w-5 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Icon className="h-5 w-5 text-[#14151a]" />
                            )}
                            <span className="text-[16px] font-medium leading-[24px] tracking-[-0.2px] text-[#14151a]">
                              {facilityName}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {roomData.roomFacilities.length > 6 && (
                      <button
                        onClick={() => setShowAllFacilities(!showAllFacilities)}
                        className="bg-[rgba(10,15,41,0.04)] rounded-[10px] px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                      >
                        <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                          {showAllFacilities ? "Show less" : `Show all ${roomData.roomFacilities.length} facilities`}
                        </span>
                        <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showAllFacilities ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                )}

                {/* About this room */}
                {roomData.roomDescriptionI18n && (
                  <div className="bg-white rounded-[24px] px-5 py-4 flex flex-col gap-2">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      About this room
                    </p>
                    <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-4 max-h-[96px] overflow-hidden' : ''}`}>
                      {roomData.roomDescriptionI18n}
                    </p>
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="bg-[rgba(10,15,41,0.04)] rounded-full px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                    >
                      <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                        {showFullDescription ? "Show less" : "Show more"}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Rules */}
                {roomData.roomRulesI18n && (
                  <div className="bg-white rounded-[24px] px-5 py-4 flex flex-col gap-2">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      Rules
                    </p>
                    <p className={`text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[#14151a] whitespace-pre-wrap ${!showFullRules ? 'line-clamp-4 max-h-[96px] overflow-hidden' : ''}`}>
                      {roomData.roomRulesI18n}
                    </p>
                    <button
                      onClick={() => setShowFullRules(!showFullRules)}
                      className="bg-[rgba(10,15,41,0.04)] rounded-full px-[10px] py-[6px] flex items-center justify-center gap-[2px] cursor-pointer hover:bg-[rgba(10,15,41,0.08)]"
                    >
                      <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] px-1">
                        {showFullRules ? "Show less" : "Show more"}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-[#14151a] transition-transform ${showFullRules ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Room location */}
                <div className="bg-white rounded-[24px] px-5 py-4 flex flex-col gap-2">
                  <div className="flex flex-col gap-0">
                    <p className="text-[16px] font-bold leading-[24px] tracking-[-0.2px] text-[#14151a]">
                      Room location
                    </p>
                    <p className="text-[14px] font-semibold leading-[20px] tracking-[-0.1px] text-[rgba(15,19,36,0.6)]">
                      {roomData.residenceFullAddress}
                    </p>
                  </div>
                  <div className="h-[200px] rounded-[12px] bg-gray-200 overflow-hidden flex items-center justify-center">
                    {/* TODO: 지도 구현 예정 */}
                  </div>
                </div>
              </div>

              {/* 우측 예약 사이드바 */}
              <div className="w-[368px]">
                <BookingSidebar
                  price={roomData.pricePerNight}
                  originalPrice={roomData.pricePerNight}
                  nights={1}
                  totalPrice={roomData.pricePerNight}
                  host={{
                    name: roomData.residenceNameI18n,
                    isVerified: true,
                    joinYear: getHostingYears(roomData.hostingStartDate),
                    description: roomData.residenceDescriptionI18n,
                    avatar: roomData.residenceLogoImageUrl
                  }}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  guests={guests}
                  onCheckInDateChange={setCheckInDate}
                  onCheckOutDateChange={setCheckOutDate}
                  onGuestsChange={handleGuestsChange}
                  roomId={params.roomId}
                  filterDate={filterReservedDates}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 관련 숙소들 - content가 있을 때만 표시 */}
        {relatedRooms.length > 0 && (
          <>
            {/* Divider */}
            <div className="bg-[#f7f7f8] py-12">
              <div className="mx-auto max-w-[1200px] px-4">
                <div className="h-px bg-[#e9eaec] w-full" />
              </div>
            </div>

            <div className="bg-[#f7f7f8] pb-20">
              <div className="mx-auto max-w-[1200px] px-4">
                <div className="flex items-center justify-between mb-[18px]">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-extrabold leading-[28px] tracking-[-0.2px] text-[#14151a]">
                      Find more rooms by this host
                    </h2>
                  </div>
                  
                  {totalRoomPages > 1 && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentRoomPage === 0}
                        className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 text-[#14151a]" />
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentRoomPage >= totalRoomPages - 1}
                        className="bg-[rgba(10,15,41,0.04)] rounded-full p-2 cursor-pointer hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4 text-[#14151a]" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {relatedRooms.map((room) => (
                    <div 
                      key={room.roomIdentifier} 
                      className="flex flex-col gap-2 cursor-pointer"
                      onClick={() => handleRoomClick(room.residenceIdentifier, room.roomIdentifier)}
                    >
                      <div className="relative aspect-square rounded-[16px] overflow-hidden bg-gray-200">
                        {room.mainImageUrl ? (
                          <img
                            src={room.mainImageUrl}
                            alt={room.roomName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm text-gray-400">{messages?.common?.noImage || "No image"}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <h3 className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a] line-clamp-2 max-h-[52px] overflow-hidden">
                            {room.roomName}
                          </h3>
                          <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
                            {room.residenceFullAddress}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">
                            ${room.pricePerNight} per night
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
