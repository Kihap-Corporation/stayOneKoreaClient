"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RoomCard } from "@/components/home/room-card"
import { NaverStaticMap } from "@/components/search/naver-static-map"
import { PriceFilter } from "@/components/search/price-filter"
import { Pagination } from "@/components/search/pagination"
import { SortSelector, SortOption } from "@/components/search/sort-selector"
import { searchRooms, SearchRoomResult } from "@/lib/search-api"

export default function SearchResultPage() {
  const { messages, currentLanguage } = useLanguage()
  const searchParams = useSearchParams()
  
  const [rooms, setRooms] = useState<SearchRoomResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 })
  const [sortOption, setSortOption] = useState<SortOption>('RECOMMEND')

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
        return
      }

      setLoading(true)
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
      }
    }

    loadRooms()
  }, [latitude, longitude, checkInDate, checkOutDate, currentPage, sortOption, priceRange.min, priceRange.max, currentLanguage.code])

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

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max })
    // Reset to first page when filter changes
    setCurrentPage(1)
  }

  const handleSearch = () => {
    // Reload with new price filters
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
                {messages?.searchResult?.roomsFound?.replace('{count}', totalElements.toString()) || `${totalElements} rooms found`}
              </h2>
              <SortSelector value={sortOption} onChange={handleSortChange} />
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
                      <RoomCard
                        image={room.firstGalleryImageUrl}
                        title={room.residenceName}
                        provider={room.residenceName}
                        location={room.fullAddress}
                        price={room.pricePerNight}
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

