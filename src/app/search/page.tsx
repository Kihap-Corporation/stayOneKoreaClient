"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RoomCard } from "@/components/home/room-card"
import { NaverStaticMap } from "@/components/search/naver-static-map"
import { PriceFilter } from "@/components/search/price-filter"
import { Pagination } from "@/components/search/pagination"

// Mock 데이터 타입
interface Room {
  id: number
  roomName: string
  residenceName: string
  address: string
  price: number
  imageUrl: string
  latitude: number
  longitude: number
}

export default function SearchResultPage() {
  const { messages, currentLanguage } = useLanguage()
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 })
  
  const itemsPerPage = 12

  // Mock 데이터 로드
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true)
      
      // Mock 데이터 생성
      const mockRooms: Room[] = [
        {
          id: 1,
          roomName: "Cozy Studio in Hongdae",
          residenceName: "Hongdae Residence",
          address: "Hongdae, Seoul",
          price: 45,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5563,
          longitude: 126.9240
        },
        {
          id: 2,
          roomName: "Modern Room in Gangnam",
          residenceName: "Gangnam Stay",
          address: "Gangnam, Seoul",
          price: 65,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5172,
          longitude: 127.0473
        },
        {
          id: 3,
          roomName: "Comfortable Studio near Itaewon",
          residenceName: "Itaewon Residence",
          address: "Itaewon, Seoul",
          price: 55,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5347,
          longitude: 126.9947
        },
        {
          id: 4,
          roomName: "Affordable Room in Myeongdong",
          residenceName: "Myeongdong Stay",
          address: "Myeongdong, Seoul",
          price: 50,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5636,
          longitude: 126.9867
        },
        {
          id: 5,
          roomName: "Quiet Studio in Sinchon",
          residenceName: "Sinchon Residence",
          address: "Sinchon, Seoul",
          price: 48,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5560,
          longitude: 126.9369
        },
        {
          id: 6,
          roomName: "Bright Room in Jongno",
          residenceName: "Jongno Stay",
          address: "Jongno, Seoul",
          price: 52,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5730,
          longitude: 126.9794
        },
        {
          id: 7,
          roomName: "Spacious Studio in Apgujeong",
          residenceName: "Apgujeong Residence",
          address: "Apgujeong, Seoul",
          price: 70,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5270,
          longitude: 127.0284
        },
        {
          id: 8,
          roomName: "Budget-Friendly Room in Dongdaemun",
          residenceName: "Dongdaemun Stay",
          address: "Dongdaemun, Seoul",
          price: 42,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5663,
          longitude: 127.0077
        },
        {
          id: 9,
          roomName: "Luxury Studio in Yeouido",
          residenceName: "Yeouido Residence",
          address: "Yeouido, Seoul",
          price: 75,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5219,
          longitude: 126.9242
        },
        {
          id: 10,
          roomName: "Central Room in Insadong",
          residenceName: "Insadong Stay",
          address: "Insadong, Seoul",
          price: 58,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5730,
          longitude: 126.9910
        },
        {
          id: 11,
          roomName: "Compact Studio in Seongsu",
          residenceName: "Seongsu Residence",
          address: "Seongsu, Seoul",
          price: 46,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5446,
          longitude: 127.0559
        },
        {
          id: 12,
          roomName: "Cozy Room in Hapjeong",
          residenceName: "Hapjeong Stay",
          address: "Hapjeong, Seoul",
          price: 44,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5495,
          longitude: 126.9139
        },
        {
          id: 13,
          roomName: "Modern Studio in Sangam",
          residenceName: "Sangam Residence",
          address: "Sangam, Seoul",
          price: 49,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5774,
          longitude: 126.8915
        },
        {
          id: 14,
          roomName: "Affordable Room in Guro",
          residenceName: "Guro Stay",
          address: "Guro, Seoul",
          price: 40,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.4954,
          longitude: 126.8874
        },
        {
          id: 15,
          roomName: "Bright Studio in Mokdong",
          residenceName: "Mokdong Residence",
          address: "Mokdong, Seoul",
          price: 47,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5423,
          longitude: 126.8797
        },
        {
          id: 16,
          roomName: "Spacious Room in Jamsil",
          residenceName: "Jamsil Stay",
          address: "Jamsil, Seoul",
          price: 60,
          imageUrl: "/home-hong-dae.png",
          latitude: 37.5133,
          longitude: 127.1000
        }
      ]

      setRooms(mockRooms)
      setFilteredRooms(mockRooms)
      setLoading(false)
    }

    loadMockData()
  }, [])

  // 가격 필터 적용
  useEffect(() => {
    const filtered = rooms.filter(
      room => room.price >= priceRange.min && room.price <= priceRange.max
    )
    setFilteredRooms(filtered)
    setCurrentPage(1)
  }, [priceRange, rooms])

  // 페이지네이션
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRooms = filteredRooms.slice(startIndex, endIndex)

  // 지도 중심 좌표 계산 (모든 숙소의 평균)
  const mapCenter = filteredRooms.length > 0
    ? {
        lat: filteredRooms.reduce((sum, room) => sum + room.latitude, 0) / filteredRooms.length,
        lng: filteredRooms.reduce((sum, room) => sum + room.longitude, 0) / filteredRooms.length
      }
    : { lat: 37.5665, lng: 126.9780 } // 서울 시청 기본값

  // 지도 마커 생성
  const mapMarkers = filteredRooms.map((room, index) => ({
    lat: room.latitude,
    lng: room.longitude,
    label: `${room.price}`,
    color: selectedRoomIndex === index ? '#E91E63' : '#4285F4'
  }))

  const handleMarkerClick = (index: number) => {
    setSelectedRoomIndex(index)
    // 스크롤하여 해당 숙소 카드로 이동
    const element = document.getElementById(`room-${currentRooms[index]?.id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max })
  }

  const handleSearch = () => {
    // API 검색 요청을 보낼 함수
    console.log('Search with filters:', {
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    })
    
    // TODO: 실제 API 호출로 대체
    // const searchRooms = async () => {
    //   const response = await apiGet(`/api/rooms/search?minPrice=${priceRange.min}&maxPrice=${priceRange.max}`)
    //   setRooms(response.data)
    // }
    // searchRooms()
    
    // 페이지를 첫 페이지로 리셋
    setCurrentPage(1)
    setSelectedRoomIndex(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedRoomIndex(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">{messages?.common?.loading || "Loading..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 pt-32">
        <div className="max-w-7xl xl:max-w-[1200px] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽: 지도 & 필터 */}
          <div className="w-full lg:w-[480px] flex-shrink-0">
            {/* 가격 필터 */}
            <div className="mb-6">
              <PriceFilter
                minPrice={priceRange.min}
                maxPrice={priceRange.max}
                onPriceChange={handlePriceChange}
                onSearch={handleSearch}
              />
            </div>

            {/* 지도 */}
            <div className="w-full h-[818px] flex-shrink-0">
              <NaverStaticMap
                center={mapCenter}
                markers={mapMarkers}
                width={480}
                height={818}
                level={12}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </div>

          {/* 오른쪽: 숙소 리스트 */}
          <div className="flex-1">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-[#14151a] tracking-[-0.2px]">
                {messages?.searchResult?.roomsFound?.replace('{count}', filteredRooms.length.toString()) || `${filteredRooms.length} rooms found`}
              </h2>
            </div>

            {/* 숙소 그리드 */}
            {currentRooms.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentRooms.map((room, index) => (
                    <div
                      key={room.id}
                      id={`room-${room.id}`}
                      className={`transition-all ${
                        selectedRoomIndex === index ? 'ring-2 ring-[#E91E63] ring-offset-2 rounded-2xl' : ''
                      }`}
                    >
                      <RoomCard
                        image={room.imageUrl}
                        title={room.roomName}
                        provider={room.residenceName}
                        location={room.address}
                        price={room.price}
                      />
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {messages?.searchResult?.noResults || "No results found"}
                </p>
                <p className="text-sm text-gray-500">
                  {messages?.searchResult?.noResultsDesc || "Try searching with different criteria"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  )
}

