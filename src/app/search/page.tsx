"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LikedRoomCard } from "@/components/home/liked-room-card"
import { NaverStaticMap } from "@/components/search/naver-static-map"
import { PriceFilter } from "@/components/search/price-filter"
import { Pagination } from "@/components/search/pagination"
import { SortSelector, SortOption } from "@/components/search/sort-selector"
import { searchRooms, SearchRoomResult } from "@/lib/search-api"
import { apiPost } from "@/lib/api"

function SearchResultContent() {
  const { messages, currentLanguage } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [rooms, setRooms] = useState<SearchRoomResult[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false) // 재로딩 상태 추가
  const [error, setError] = useState<string | null>(null)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [priceRange, setPriceRange] = useState({ min: 0, max: undefined as number | undefined })
  const [sortOption, setSortOption] = useState<SortOption>('RECOMMEND')
  const [isInitialLoad, setIsInitialLoad] = useState(true) // 초기 로딩 여부

  // Extract search params
  const latitude = searchParams.get('lat')
  const longitude = searchParams.get('lng')
  const checkInDate = searchParams.get('checkIn')
  const checkOutDate = searchParams.get('checkOut')
  const locationName = searchParams.get('location')

  // Load rooms from API
  useEffect(() => {
    const loadRooms = async () => {
      // Validate required params
      if (!latitude || !longitude || !checkInDate || !checkOutDate) {
        setError('Missing required search parameters')
        setLoading(false)
        setIsInitialLoad(false)
        return
      }

      // 초기 로딩이면 loading, 아니면 isRefreshing 사용
      if (isInitialLoad) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      try {
        const languageMap: { [key: string]: 'KO' | 'EN' | 'ZH' | 'FR' } = {
          ko: 'KO',
          en: 'EN',
          zh: 'ZH',
          fr: 'FR'
        }

        const response = await searchRooms({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          checkInDate,
          checkOutDate,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          sortOption,
          language: languageMap[currentLanguage.code] || 'EN',
          radiusKm: 10,
          page: currentPage,
          size: 20
        })

        setRooms(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } catch (err) {
        console.error('Search error:', err)
        setError(messages?.searchResult?.searchError || 'An error occurred while searching')
      } finally {
        setLoading(false)
        setIsRefreshing(false)
        setIsInitialLoad(false)
      }
    }

    loadRooms()
  }, [latitude, longitude, checkInDate, checkOutDate, currentPage, sortOption, priceRange.min, priceRange.max, currentLanguage.code, isInitialLoad])

  // 지도 중심 좌표 (검색 위치 사용)
  const mapCenter = latitude && longitude
    ? {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      }
    : { lat: 37.5665, lng: 126.9780 } // 서울 시청 기본값

  // 지도 마커 생성
  const mapMarkers = rooms.map((room, index) => ({
    lat: room.latitude,
    lng: room.longitude,
    label: `$${room.pricePerNight}`,
    color: selectedRoomIndex === index ? '#E91E63' : '#4285F4'
  }))

  const handleMarkerClick = (index: number) => {
    setSelectedRoomIndex(index)
    // 스크롤하여 해당 숙소 카드로 이동
    const element = document.getElementById(`room-${rooms[index]?.roomIdentifier}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handlePriceSearch = (min: number, max: number) => {
    // Search 버튼 클릭 시 가격 범위 업데이트 및 API 호출
    // max가 200이면 undefined로 설정 (최대값 제한 없음)
    setPriceRange({ min, max: max === 200 ? undefined : max })
    setCurrentPage(1)
    setSelectedRoomIndex(null)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort)
    // Reset to first page when sort changes
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedRoomIndex(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 좋아요 토글 함수 (낙관적 업데이트)
  const handleLikeToggle = async (roomIdentifier: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // 낙관적 업데이트: 먼저 UI 업데이트
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.roomIdentifier === roomIdentifier
          ? { ...room, isLiked: !room.isLiked }
          : room
      )
    )

    try {
      const response = await apiPost(`/api/user/like?roomIdentifier=${roomIdentifier}`)
      
      // 응답 코드가 200이 아닌 경우 롤백
      if (response.code !== 200) {
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.roomIdentifier === roomIdentifier
              ? { ...room, isLiked: !room.isLiked }
              : room
          )
        )
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
      // 에러 발생 시 롤백
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.roomIdentifier === roomIdentifier
            ? { ...room, isLiked: !room.isLiked }
            : room
        )
      )
    }
  }

  // 방 클릭 핸들러
  const handleRoomClick = (roomIdentifier: string) => {
    const room = rooms.find(r => r.roomIdentifier === roomIdentifier)
    if (room) {
      // residenceIdentifier가 있으면 사용, 없으면 roomIdentifier 사용
      const residenceId = room.residenceIdentifier || roomIdentifier
      router.push(`/residence/${residenceId}/room/${roomIdentifier}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 pt-32 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 pt-32 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-[#E91E63] text-white rounded-xl hover:bg-[#c2185b] transition-colors cursor-pointer"
            >
              {messages?.common?.close || "Go Back"}
            </button>
          </div>
        </main>
        <Footer />
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
              <PriceFilter onSearch={handlePriceSearch} />
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
                {messages?.searchResult?.roomsFound?.replace('{count}', totalElements.toString()) || `${totalElements} rooms found`}
              </h2>
              <div className="flex items-center gap-3">
                {isRefreshing && (
                  <div className="h-4 w-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
                )}
                <SortSelector value={sortOption} onChange={handleSortChange} />
              </div>
            </div>

            {/* 숙소 그리드 */}
            {rooms.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {rooms.map((room, index) => (
                    <div
                      key={room.roomIdentifier}
                      id={`room-${room.roomIdentifier}`}
                      className={`transition-all ${
                        selectedRoomIndex === index ? 'ring-2 ring-[#E91E63] ring-offset-2 rounded-2xl' : ''
                      }`}
                    >
                      <LikedRoomCard
                        roomIdentifier={room.roomIdentifier}
                        image={room.firstGalleryImageUrl}
                        title={room.roomName}
                        provider={room.residenceName}
                        location={room.fullAddress}
                        price={room.pricePerNight}
                        isLiked={room.isLiked}
                        onLikeToggle={handleLikeToggle}
                        onClick={handleRoomClick}
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

export default function SearchResultPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 pt-32 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchResultContent />
    </Suspense>
  )
}
