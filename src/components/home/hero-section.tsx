"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/language-provider"
import { Calendar, Users } from "lucide-react"
import { CustomDateRangePicker } from "./custom-date-range-picker"
import { AlgoliaSearch, SearchHit } from "./algolia-search"

export function HeroSection() {
  const { messages, currentLanguage } = useLanguage()
  const router = useRouter()
  const [people, setPeople] = useState(1)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedLocationData, setSelectedLocationData] = useState<SearchHit | null>(null)
  const checkInRef = useRef<HTMLDivElement>(null)

  // 달력 외부 클릭 감지 (데스크톱 전용)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 모바일에서는 모달이므로 외부 클릭 감지 불필요
      if (window.innerWidth < 1024) return
      
      const target = event.target as HTMLElement
      
      // Check-in div 내부 클릭은 무시
      if (checkInRef.current && checkInRef.current.contains(target)) {
        return
      }
      
      // DatePicker 내부 클릭인지 확인
      if (!target.closest('.react-datepicker') && !target.closest('.react-datepicker-popper')) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  // 모바일 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (showDatePicker && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showDatePicker])

  // Calculate nights
  const nights = checkIn && checkOut 
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Dynamic button text
  const getButtonText = () => {
    if (nights > 0) {
      return `Search ${nights}days in Seoul`
    }
    return messages?.home?.hero?.searchButton || "Search 5days in Seoul"
  }

  // Validation
  const isSearchValid = () => {
    return selectedLocationData && checkIn && checkOut && nights >= 3
  }

  // Get validation message
  const getValidationMessage = () => {
    if (!selectedLocationData) {
      return messages?.home?.hero?.searchRequirements?.selectLocation || "Please select a location"
    }
    if (!checkIn || !checkOut) {
      return messages?.home?.hero?.searchRequirements?.selectDates || "Please select dates"
    }
    if (nights < 3) {
      return messages?.home?.hero?.searchRequirements?.minimumStay || "Please select at least 3 nights"
    }
    return null
  }

  // Helper function to get location name based on current language
  const getLocationName = (location: SearchHit) => {
    const langMap: { [key: string]: string } = {
      ko: location.nameKo,
      en: location.nameEn,
      zh: location.nameZh,
      fr: location.nameFr
    }
    return langMap[currentLanguage.code] || location.nameEn || location.nameKo
  }

  // Handle search button click
  const handleSearch = () => {
    // Validate location
    if (!selectedLocationData) {
      alert(messages?.searchResult?.validation?.selectLocation || "Please select a location from Algolia search")
      return
    }

    // Validate dates
    if (!checkIn || !checkOut) {
      alert(messages?.searchResult?.validation?.selectDates || "Please select check-in and check-out dates")
      return
    }

    // Validate minimum stay
    if (nights < 3) {
      alert(messages?.searchResult?.validation?.minStay || "Minimum stay is 3 days")
      return
    }

    // Format dates as yyyy-MM-dd
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Build query params
    const params = new URLSearchParams({
      lat: selectedLocationData.latitude.toString(),
      lng: selectedLocationData.longitude.toString(),
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      location: getLocationName(selectedLocationData),
      sort: 'RECOMMEND'
    })

    // Navigate to search results page
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="relative w-full py-20 px-4 flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/home-search-background.png" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] w-full flex flex-col items-center gap-[18px]">
        <h1 className="text-[30px] font-bold leading-[36px] text-white text-center tracking-[-0.5px]">
          {messages?.home?.hero?.title || "Find Your Stay in Korea"}
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-2xl p-6 w-full shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 relative">
            {/* Where */}
            <div className="flex-[0.30] flex flex-col gap-2">
              <label className="text-sm font-medium text-[#14151a]">
                Where
              </label>
              <AlgoliaSearch
                placeholder="Search destinations"
                onSelect={(location) => setSelectedLocationData(location)}
              />
            </div>

            {/* Check-in & Check-out wrapper */}
            <div className="flex-[0.60] flex flex-col lg:flex-row gap-4 relative" ref={checkInRef}>
              {/* Check-in */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-medium text-[#14151a]">
                  Check-in
                </label>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setShowDatePicker(true)}
                >
                  <div className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#dee0e3] flex items-center">
                    {checkIn ? (
                      <span className="text-sm text-[#14151a]">
                        {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Select...</span>
                    )}
                  </div>
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Check-out */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-medium text-[#14151a]">
                  Check-out
                </label>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setShowDatePicker(true)}
                >
                  <div className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#dee0e3] flex items-center">
                    {checkOut ? (
                      <span className="text-sm text-[#14151a]">
                        {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Select...</span>
                    )}
                  </div>
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Desktop Calendar - absolute positioning below check-in/check-out wrapper */}
              {showDatePicker && (
                <div className="hidden lg:block absolute top-full left-0 mt-2 z-50">
                  <CustomDateRangePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={(date) => {
                      setCheckIn(date)
                    }}
                    onCheckOutChange={(date) => {
                      setCheckOut(date)
                      // 체크아웃이 선택되면 달력 닫기
                      if (date) {
                        setShowDatePicker(false)
                      }
                    }}
                    locale={currentLanguage.code}
                  />
                </div>
              )}
            </div>

            {/* People - Fixed to 1 */}
            <div className="flex-[0.10] flex flex-col gap-2">
              <label className="text-sm font-medium text-[#14151a]">
                People
              </label>
              <div className="bg-white border border-[#dee0e3] rounded-full flex items-center justify-center h-10 w-[108px]">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium">1</span>
              </div>
            </div>
          </div>

          {/* Validation Message */}
          {!isSearchValid() && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              {getValidationMessage()}
            </div>
          )}

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            disabled={!isSearchValid()}
            className="w-full mt-2 bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-xl h-12 text-base font-medium shadow-sm cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
      {/* Mobile Calendar Modal */}
      {showDatePicker && (
      <div className="lg:hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowDatePicker(false)}
        />
        
        {/* Modal Content */}
        <div 
          className="relative bg-white rounded-[24px] w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#e9eaec]">
            <h3 className="text-[18px] font-bold text-[#14151a]">Select dates</h3>
            <button
              onClick={() => setShowDatePicker(false)}
              className="bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] rounded-full p-2 transition-colors"
            >
              <span className="text-[20px] leading-none">✕</span>
            </button>
          </div>

          {/* Calendar */}
          <div className="p-4">
            <CustomDateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInChange={(date) => {
                setCheckIn(date)
              }}
              onCheckOutChange={(date) => {
                setCheckOut(date)
                // 체크아웃이 선택되면 달력 닫기
                if (date) {
                  setShowDatePicker(false)
                }
              }}
              locale={currentLanguage.code}
              monthsShown={1}
              showBorder={false}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  )
}




