"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"
import { apiGet, apiPost } from "@/lib/api"

// 좋아요한 방 데이터 타입 정의
interface LikedRoom {
  roomIdentifier: string
  roomName: string
  residenceFullAddress: string
  residenceName: string
  pricePerNight: number
  mainImageUrl: string
  residenceIdentifier: string
}

interface LikeListResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: LikedRoom[]
  number: number
  sort: any
  numberOfElements: number
  pageable: any
  empty: boolean
}

export default function LikePage() {
  const { messages, currentLanguage } = useLanguage()
  const [currentPage, setCurrentPage] = useState(0) // API는 0부터 시작
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState<LikedRoom[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 6

  // 좋아요 목록 조회 함수
  const fetchLikedRooms = async (page: number = 0) => {
    try {
      setIsLoading(true)
      setError(null)

      // 쿼리 파라미터 구성
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sortDirection: 'desc',
        languageCode: currentLanguage.code
      })

      const response = await apiGet(`/api/user/like?${params.toString()}`)

      if (response.code === 200) {
        const data: LikeListResponse = response.data
        setRooms(data.content || [])
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } else {
        // 응답 코드가 200이 아닌 경우 빈 상태로 처리
        setRooms([])
        setError('NO_LIKED_ROOMS')
      }
    } catch (error) {
      setRooms([])
      setError('NO_LIKED_ROOMS')
    } finally {
      setIsLoading(false)
    }
  }

  // 좋아요 토글 함수
  const toggleLike = async (roomIdentifier: string) => {
    try {
      const response = await apiPost(`/api/user/like?roomIdentifier=${roomIdentifier}`)

      // 응답 코드가 200인 경우만 처리 (그 외는 무시)
      if (response.code === 200) {
        // 좋아요가 성공적으로 토글되었으므로 목록을 다시 조회
        await fetchLikedRooms(currentPage)
      }
      // 응답 코드가 200이 아닌 경우는 현재 상태를 유지 (alert 없음)
    } catch (error) {
      // 에러 발생 시 현재 상태 유지 (alert 없음)
    }
  }

  // 초기 데이터 로딩 및 페이지 변경 시 데이터 재조회
  useEffect(() => {
    fetchLikedRooms(currentPage)
  }, [currentPage, currentLanguage.code])

  // 페이지네이션 숫자 생성 (API 페이지네이션에 맞춤)
  const getPageNumbers = () => {
    const pages = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage + 1 <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage + 1 >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage, currentPage + 1, currentPage + 2, "...", totalPages)
      }
    }

    return pages
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f8]">
      <Header />
      
      <main className="flex-1 w-full mx-auto max-w-7xl xl:max-w-[1200px] px-14 lg:px-18 xl:px-22">
        <div className="max-w-[640px] mx-auto pt-10 pb-20 lg:max-w-full">
          {/* 타이틀 */}
          <div className="flex items-center gap-2 mb-6">
            <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.6175 2.54996C24.2565 5.19596 24.3475 9.40996 21.8928 12.1586L11.9995 22.066L2.10849 12.1586C-0.346175 9.40996 -0.254008 5.18896 2.38382 2.54996C4.43482 0.50013 7.44249 -0.0132036 9.97182 1.01346L5.40082 5.58446L7.05049 7.2353L12.0007 2.28513L11.9855 2.2688L12.0018 2.28396C14.7423 -0.176537 18.9773 -0.0948704 21.6175 2.54996V2.54996Z" fill="#14151A"/>
            </svg>
            <h1 className="text-[30px] font-bold text-[#14151a] leading-[36px] tracking-[-0.5px]">
              {messages?.like?.title || "Saved"}
            </h1>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex flex-col gap-8 mb-8">
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-6">
                  {Array.from({ length: 2 }).map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-2 animate-pulse w-full">
                      {/* 이미지 스켈레톤 */}
                      <div className="aspect-[3/2] bg-gray-200 rounded-2xl" />
                      
                      {/* 정보 스켈레톤 */}
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="h-6 bg-gray-200 rounded w-3/4" />
                          <div className="h-6 bg-gray-200 rounded w-1/2" />
                          <div className="h-5 bg-gray-200 rounded w-1/3" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="h-6 bg-gray-200 rounded w-2/3" />
                          <div className="h-5 bg-gray-200 rounded w-1/2" />
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* 빈 상태 */}
          {!isLoading && rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="bg-[#f7f7f8] rounded-full p-6 mb-6">
                <svg width="64" height="56" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415ZM3.31033 3.14332C2.06866 4.38498 2.00616 6.37248 3.15033 7.68582L9.00033 13.545L14.8503 7.68665C15.9953 6.37248 15.9328 4.38748 14.6895 3.14165C13.4503 1.89998 11.4553 1.83998 10.1453 2.98665L6.64366 6.48915L5.4645 5.31082L7.81866 2.95498L7.75033 2.89748C6.43783 1.84332 4.5195 1.93332 3.31033 3.14332V3.14332Z" fill="rgba(10,15,41,0.25)"/>
                </svg>
              </div>
              <h2 className="text-[24px] font-bold text-[#14151a] leading-[32px] tracking-[-0.3px] mb-2 text-center">
                {error === 'NO_LIKED_ROOMS'
                  ? (messages?.like?.noLikedRoomsError || "저장된 룸이 존재하지 않습니다")
                  : (messages?.like?.noSavedRooms || "No saved rooms")
                }
              </h2>
              <p className="text-[16px] font-medium text-[rgba(15,19,36,0.6)] leading-6 tracking-[-0.2px] mb-8 text-center">
                {messages?.like?.noSavedRoomsDesc || "Save your favorite rooms to see them here"}
              </p>
              <Link href="/">
                <Button className="bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-full px-6 py-3 shadow-sm hover:shadow transition-all flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  <span className="text-[16px] font-medium tracking-tight">
                    {messages?.mypage?.findStay || "Find a Stay"}
                  </span>
                </Button>
              </Link>
            </div>
          )}

          {/* 룸 그리드 */}
          {!isLoading && rooms.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {rooms.map((room) => (
                <Link
                  key={room.roomIdentifier}
                  href={`/residence/${room.residenceIdentifier}/room/${room.roomIdentifier}`}
                  className="group cursor-pointer"
                >
                {/* 룸 카드 */}
                <div className="flex flex-col gap-2">
                  {/* 이미지 */}
                  <div className="relative aspect-[7/5] rounded-2xl overflow-hidden">
                    {room.mainImageUrl ? (
                      <img
                        src={room.mainImageUrl}
                        alt={room.roomName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-400">{messages?.common?.noImage || "No image"}</span>
                      </div>
                    )}

                    {/* 오버레이 */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      {/* 상단: 하트 버튼만 */}
                      <div className="flex items-start justify-end">
                        <button
                          className="bg-[rgba(10,15,41,0.04)] p-1 rounded-md hover:bg-[rgba(10,15,41,0.1)] transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            toggleLike(room.roomIdentifier) 
                          }}
                        >
                          <svg width="26" height="23" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path 
                              d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z" 
                              fill="white" 
                              stroke="white" 
                              stroke-width="1" 
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="flex flex-col gap-2">
                    {/* 제목 */}
                    <div className="flex flex-col">
                      <h3 className="text-[18px] font-bold text-[#14151a] leading-[26px] tracking-[-0.2px] line-clamp-2">
                        {room.roomName}
                      </h3>
                      <p className="text-[18px] font-medium text-[rgba(13,17,38,0.4)] leading-[26px] tracking-[-0.2px] truncate">
                        {room.residenceName}
                      </p>
                      <p className="text-[14px] font-medium text-[rgba(13,17,38,0.4)] leading-5 tracking-[-0.1px] truncate">
                        {room.residenceFullAddress}
                      </p>
                    </div>

                    {/* 가격 */}
                    <div className="flex flex-col">
                      <div className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">
                        ${room.pricePerNight} per night
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
              ))}
              {rooms.length % 2 === 1 && <div className="hidden lg:block" />}
            </div>
          )}

          {/* 페이지네이션 */}
          {!isLoading && rooms.length > 0 && (
            <div className="flex items-center justify-center gap-2 h-10 w-full mt-8">
            {/* 왼쪽 화살표 */}
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="bg-[rgba(10,15,41,0.04)] p-2.5 rounded-xl hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-[#14151a]" />
            </button>

            {/* 페이지 번호들 */}
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <div
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center p-2.5 rounded-xl h-10 w-10"
                  >
                    <span className="text-[16px] font-medium text-[rgba(15,19,36,0.6)] leading-6 tracking-[-0.2px]">
                      ...
                    </span>
                  </div>
                )
              }
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage((page as number) - 1)} // API는 0부터 시작하므로 1을 빼줌
                  className={`flex items-center justify-center p-2.5 rounded-xl h-10 w-10 transition-colors cursor-pointer ${
                    currentPage === (page as number) - 1
                      ? "bg-[rgba(10,15,41,0.04)]"
                      : "hover:bg-[rgba(10,15,41,0.04)]"
                  }`}
                >
                  <span
                    className={`text-[16px] font-medium leading-6 tracking-[-0.2px] ${
                      currentPage === (page as number) - 1
                        ? "text-[#14151a]"
                        : "text-[rgba(15,19,36,0.6)]"
                    }`}
                  >
                    {page}
                  </span>
                </button>
              )
            })}

            {/* 오른쪽 화살표 */}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="bg-[rgba(10,15,41,0.04)] p-2.5 rounded-xl hover:bg-[rgba(10,15,41,0.08)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 text-[#14151a]" />
            </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

