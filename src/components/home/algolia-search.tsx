"use client"

import { useState, useRef, useEffect } from "react"
import { searchAlgoliaIndex } from "@/lib/algolia"
import { MapPin } from "lucide-react"

interface AlgoliaSearchProps {
  onSelect?: (location: string) => void
  placeholder?: string
  className?: string
}

interface SearchHit {
  objectID: string
  nameKo: string
  nameEn: string
  nameZh: string
  nameFr: string
  categoryKo: string
  categoryEn: string
  categoryZh: string
  categoryFr: string
  latitude: number
  longitude: number
  _highlightResult?: {
    [key: string]: {
      value: string
      matchLevel: string
      matchedWords: string[]
    }
  }
  [key: string]: any
}

export function AlgoliaSearch({ 
  onSelect, 
  placeholder = "Search destinations",
  className = ""
}: AlgoliaSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchHit[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 매칭된 언어의 name과 category를 자동으로 가져오는 함수
  const getMatchedName = (hit: SearchHit): string => {
    // _highlightResult에서 매칭된 필드 찾기
    if (hit._highlightResult) {
      const nameFields = ['nameKo', 'nameEn', 'nameZh', 'nameFr']
      for (const field of nameFields) {
        if (hit._highlightResult[field]?.matchedWords?.length > 0) {
          return hit[field]
        }
      }
    }
    
    // 매칭된 필드가 없으면 영어 우선, 그 다음 순서대로
    return hit.nameEn || hit.nameKo || hit.nameZh || hit.nameFr || ''
  }

  const getMatchedCategory = (hit: SearchHit): string => {
    // name이 매칭된 언어와 같은 언어의 category 반환
    if (hit._highlightResult) {
      const nameFields = ['nameKo', 'nameEn', 'nameZh', 'nameFr']
      const categoryFields = ['categoryKo', 'categoryEn', 'categoryZh', 'categoryFr']
      
      for (let i = 0; i < nameFields.length; i++) {
        if (hit._highlightResult[nameFields[i]]?.matchedWords?.length > 0) {
          return hit[categoryFields[i]]
        }
      }
    }
    
    // 기본값
    return hit.categoryEn || hit.categoryKo || hit.categoryZh || hit.categoryFr || ''
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 검색 함수
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await searchAlgoliaIndex<SearchHit>('dev_places', {
        query: searchQuery,
        hitsPerPage: 5,
      })
      
      setResults(response.hits)
      setIsOpen(true)
    } catch (error) {
      console.error('Algolia search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // 입력 변경 핸들러 (debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  const handleSelectResult = (result: SearchHit) => {
    const locationName = getMatchedName(result)
    setQuery(locationName)
    setIsOpen(false)
    
    if (onSelect) {
      onSelect(locationName)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          className={`w-full h-10 pl-10 pr-3 rounded-xl border border-[#dee0e3] focus:border-[#E91E63] focus:outline-none text-sm ${className}`}
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-[#E91E63] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#dee0e3] rounded-xl shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {results.map((result) => {
            const name = getMatchedName(result)
            const category = getMatchedCategory(result)
            
            return (
              <button
                key={result.objectID}
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#14151a] truncate">
                      {name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {category}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {isOpen && !isLoading && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#dee0e3] rounded-xl shadow-lg z-50 p-4">
          <p className="text-sm text-gray-500 text-center">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  )
}

