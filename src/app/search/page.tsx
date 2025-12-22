"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
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
  const [mapViewCenter, setMapViewCenter] = useState<{ lat: number; lng: number } | null>(null)

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

  const naverMapLanguage = useMemo<'ko' | 'en' | 'zh'>(() => {
    if (currentLanguage.code === 'ko') return 'ko'
    if (currentLanguage.code === 'zh') return 'zh'
    return 'en' // en + fr fallback
  }, [currentLanguage.code])

  // 최초에는 검색 위치를 지도 뷰 중심으로 사용
  useEffect(() => {
    setMapViewCenter(mapCenter)
  }, [mapCenter.lat, mapCenter.lng])

  const hasMapMoved = useMemo(() => {
    if (!mapViewCenter) return false
    const dLat = Math.abs(mapViewCenter.lat - mapCenter.lat)
    const dLng = Math.abs(mapViewCenter.lng - mapCenter.lng)
    // 아주 미세한 흔들림은 무시
    return dLat > 0.0003 || dLng > 0.0003
  }, [mapViewCenter, mapCenter.lat, mapCenter.lng])

  const handleSearchThisArea = () => {
    if (!mapViewCenter) return
    if (!checkInDate || !checkOutDate) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('lat', mapViewCenter.lat.toString())
    params.set('lng', mapViewCenter.lng.toString())
    // page는 URL에 없지만, UX 상 첫 페이지로 리셋
    setCurrentPage(1)
    setSelectedRoomIndex(null)
    router.push(`/search?${params.toString()}`)
  }

  // 지도 마커 생성 (같은 고시원의 최소 가격 표시)
  const residenceMarkerData = useMemo(() => {
    const groups = new Map<string, { lat: number; lng: number; minPrice: number; roomIndex: number }>()

    rooms.forEach((room, index) => {
      const key = room.residenceIdentifier || room.roomIdentifier
      const existing = groups.get(key)

      if (!existing || room.pricePerNight < existing.minPrice) {
        groups.set(key, {
          lat: room.latitude,
          lng: room.longitude,
          minPrice: room.pricePerNight,
          roomIndex: index
        })
      }
    })

    return Array.from(groups.values())
  }, [rooms])

  const mapMarkers = residenceMarkerData.map((marker) => ({
    lat: marker.lat,
    lng: marker.lng,
    label: `$${marker.minPrice}`,
    color: selectedRoomIndex === marker.roomIndex ? '#E91E63' : '#4285F4'
  }))

  const handleMarkerClick = (index: number) => {
    const markerData = residenceMarkerData[index]
    if (!markerData) return

    const roomIndex = markerData.roomIndex
    setSelectedRoomIndex(roomIndex)

    // 스크롤하여 해당 숙소 카드로 이동
    const targetRoom = rooms[roomIndex]
    const element = targetRoom ? document.getElementById(`room-${targetRoom.roomIdentifier}`) : null
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
        <main className="flex-1 pt-10 flex items-center justify-center">
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
        <main className="flex-1 pt-20 flex items-center justify-center">
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

      <main className="flex-1 pt-10 pb-10">
        <div className="max-w-7xl xl:max-w-[1200px] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽: 지도 & 필터 */}
          <div className="w-full lg:w-[480px] flex-shrink-0">
            {/* 가격 필터 */}
            <div className="mb-6">
              <PriceFilter onSearch={handlePriceSearch} />
            </div>

            {/* 지도 */}
            <div className="w-full h-[300px] lg:h-[600px] flex-shrink-0">
              <div className="relative w-full h-full">
                <NaverStaticMap
                  center={mapCenter}
                  markers={mapMarkers}
                  width={480}
                  height={818}
                  level={12}
                  onMarkerClick={handleMarkerClick}
                  onCenterChanged={(c) => setMapViewCenter(c)}
                  language={naverMapLanguage}
                />

                {hasMapMoved && (
                  <button
                    type="button"
                    onClick={handleSearchThisArea}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white text-[#14151a] shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {messages?.searchResult?.searchThisArea || "Search this area"}
                  </button>
                )}
              </div>
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
                  <div className="mb-6">
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
        <main className="flex-1 pt-20 lg:pt-32 flex items-center justify-center">
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
