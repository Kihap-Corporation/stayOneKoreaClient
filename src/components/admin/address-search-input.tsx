"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"

interface AddressResult {
  roadAddr: string
  roadAddrPart1: string
  roadAddrPart2: string
  jibunAddr: string
  engAddr: string
  zipNo: string
  admCd: string
  rnMgtSn: string
  bdMgtSn: string
  detBdNmList: string
  bdNm: string
  bdKdcd: string
  siNm: string
  sggNm: string
  emdNm: string
  liNm: string
  rn: string
  udrtYn: string
  buldMnnm: string
  buldSlno: string
  mtYn: string
  lnbrMnnm: string
  lnbrSlno: string
  emdNo: string
}

interface AddressSearchInputProps {
  onAddressSelected: (roadAddr: string, zipNo: string) => void
  disabled?: boolean
}

export function AddressSearchInput({ onAddressSelected, disabled }: AddressSearchInputProps) {
  const [searchText, setSearchText] = useState("")
  const [results, setResults] = useState<AddressResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const searchAddress = async (page: number = 1) => {
    if (!searchText.trim()) {
      alert("주소를 입력해주세요")
      return
    }

    const confmKey = process.env.NEXT_PUBLIC_JUSO_API_KEY
    if (!confmKey) {
      alert("주소 검색 API Key가 설정되지 않았습니다.")
      return
    }

    setIsSearching(true)
    try {
      const url = `https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${confmKey}&currentPage=${page}&countPerPage=5&keyword=${encodeURIComponent(searchText)}&resultType=json`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.results.common.errorCode === "0") {
        setResults(data.results.juso || [])
        setTotalCount(parseInt(data.results.common.totalCount))
        setCurrentPage(page)
        setShowResults(true)
      } else {
        alert(`검색 실패: ${data.results.common.errorMessage}`)
        setResults([])
      }
    } catch (error) {
      console.error("주소 검색 실패:", error)
      alert("주소 검색 중 오류가 발생했습니다.")
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelect = (result: AddressResult) => {
    onAddressSelected(result.roadAddrPart1, result.zipNo)
    setShowResults(false)
    setSearchText("")
    setResults([])
  }

  const totalPages = Math.ceil(totalCount / 5)

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAddress(1)}
            placeholder="도로명, 건물명, 지번 입력"
            disabled={disabled || isSearching}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => searchAddress(1)}
          disabled={disabled || isSearching}
          className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B]"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? "검색중..." : "검색"}
        </Button>
      </div>

      {/* 검색 결과 */}
      {showResults && (
        <div className="border rounded-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <>
              {/* 결과 리스트 */}
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(result)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            도로명
                          </span>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.roadAddr}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            지번
                          </span>
                          <p className="text-xs text-gray-600 truncate">
                            {result.jibunAddr}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {result.zipNo}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="p-3 bg-gray-50 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => searchAddress(currentPage - 1)}
                    disabled={currentPage === 1 || isSearching}
                    className="cursor-pointer"
                  >
                    이전
                  </Button>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-600">{currentPage}</span>
                    {" "}/{" "}{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => searchAddress(currentPage + 1)}
                    disabled={currentPage === totalPages || isSearching}
                    className="cursor-pointer"
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 검색 팁 */}
      {!showResults && (
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
          <p className="font-semibold">TIP</p>
          <p>• 도로명 + 건물번호: 예) 테헤란로 152</p>
          <p>• 동/읍/면/리 + 번지: 예) 역삼동 737</p>
          <p>• 건물명, 아파트명: 예) 삼성동 힐스테이트</p>
        </div>
      )}
    </div>
  )
}

