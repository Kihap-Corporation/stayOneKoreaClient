"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { Calendar, Users, X } from "lucide-react"
import { CustomDateRangePicker } from "@/components/home/custom-date-range-picker"
import { MobileCustomDateRangePicker } from "@/components/home/mobile-custom-date-range-picker"
import { AlgoliaSearch, SearchHit } from "@/components/home/algolia-search"
import { getBookingDates, saveBookingDates } from "@/lib/session-storage"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { messages, currentLanguage } = useLanguage()
  const router = useRouter()
  
  // 세션 스토리지에서 날짜 가져오기 (하이드레이션 에러 방지)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  
  useEffect(() => {
    if (isOpen) {
      const { checkIn, checkOut } = getBookingDates()
      setCheckIn(checkIn)
      setCheckOut(checkOut)
    }
  }, [isOpen])
  
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedLocationData, setSelectedLocationData] = useState<SearchHit | null>(null)
  const checkInRef = useRef<HTMLDivElement>(null)

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // 달력 외부 클릭 감지 (데스크톱 전용)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024) return
      
      const target = event.target as HTMLElement
      
      if (checkInRef.current && checkInRef.current.contains(target)) {
        return
      }
      
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
    return selectedLocationData && checkIn && checkOut && nights >= 1
  }

  // Get validation message
  const getValidationMessage = () => {
    if (!selectedLocationData) {
      return messages?.home?.hero?.searchRequirements?.selectLocation || "Please select a location"
    }
    if (!checkIn || !checkOut) {
      return messages?.home?.hero?.searchRequirements?.selectDates || "Please select dates"
    }
    if (nights < 1) {
      return messages?.home?.hero?.searchRequirements?.minimumStay || "Please select at least 1 night"
    }
    return null
  }

  // Helper function to get location name
  const getLocationName = (location: SearchHit) => {
    const langMap: { [key: string]: string } = {
      ko: location.nameKo,
      en: location.nameEn,
      zh: location.nameZh,
      fr: location.nameFr
    }
    return langMap[currentLanguage.code] || location.nameEn || location.nameKo
  }

  // Handle search
  const handleSearch = () => {
    if (!selectedLocationData) {
      alert(messages?.searchResult?.validation?.selectLocation || "Please select a location")
      return
    }

    if (!checkIn || !checkOut) {
      alert(messages?.searchResult?.validation?.selectDates || "Please select dates")
      return
    }

    if (nights < 1) {
      alert(messages?.searchResult?.validation?.minStay || "Minimum stay is 1 day")
      return
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const params = new URLSearchParams({
      lat: selectedLocationData.latitude.toString(),
      lng: selectedLocationData.longitude.toString(),
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      location: getLocationName(selectedLocationData),
      sort: 'RECOMMEND'
    })

    onClose()
    router.push(`/search?${params.toString()}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 h-screen">
        <img 
          src="/home-search-background.png" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] w-full mx-4 flex flex-col items-center gap-[18px]">
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

              {/* Desktop Calendar */}
              {showDatePicker && (
                <div className="hidden lg:block absolute top-full left-0 mt-2 z-50">
                  <CustomDateRangePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={(date) => {
                      setCheckIn(date)
                      saveBookingDates(date, checkOut)
                    }}
                    onCheckOutChange={(date) => {
                      setCheckOut(date)
                      saveBookingDates(checkIn, date)
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
      <MobileCustomDateRangePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={(date) => {
          setCheckIn(date)
          saveBookingDates(date, checkOut)
        }}
        onCheckOutChange={(date) => {
          setCheckOut(date)
          saveBookingDates(checkIn, date)
        }}
        locale={currentLanguage.code}
      />
    </div>
  )
}

