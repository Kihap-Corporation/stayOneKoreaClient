"use client"

import { useState, useEffect } from "react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import { useLanguage } from "@/components/language-provider"

interface PriceFilterProps {
  onSearch: (min: number, max: number) => void
}

export function PriceFilter({ onSearch }: PriceFilterProps) {
  const { messages } = useLanguage()
  const [localValues, setLocalValues] = useState<[number, number]>([0, 200])

  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      // 슬라이더 변경 시 로컬 상태만 업데이트 (API 호출 안 함)
      setLocalValues([value[0], value[1]])
    }
  }

  const handleSearchClick = () => {
    // Search 버튼 클릭 시에만 부모에게 값 전달
    onSearch(localValues[0], localValues[1])
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`
  }

  return (
    <div className="w-full">
      <h3 className="text-base font-bold text-[#14151a] tracking-[-0.2px] mb-8">
        Filter
      </h3>
      
      <div className="w-full">
        <label className="block text-sm font-medium text-[#14151a] mb-4">
          Price per night
        </label>
        
        <div className="px-5 py-4 bg-white rounded-2xl border border-[#dee0e3]">
          {/* Range Slider */}
          <div className="mb-6 px-2">
            <Slider
              range
              min={0}
              max={200}
              step={5}
              value={localValues}
              onChange={handleSliderChange}
              trackStyle={[{ backgroundColor: '#4285F4', height: 4 }]}
              railStyle={{ backgroundColor: '#dee0e3', height: 4 }}
              handleStyle={[
                {
                  backgroundColor: 'white',
                  border: '2px solid #4285F4',
                  width: 16,
                  height: 16,
                  marginTop: -6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  opacity: 1
                },
                {
                  backgroundColor: 'white',
                  border: '2px solid #4285F4',
                  width: 16,
                  height: 16,
                  marginTop: -6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  opacity: 1
                }
              ]}
            />
          </div>

          {/* Price Display */}
          <div className="flex justify-between items-center text-sm font-medium text-[#14151a]">
            <span>{formatPrice(localValues[0])}</span>
            <span>{formatPrice(localValues[1])}</span>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearchClick}
          className="w-full mt-4 h-12 bg-[#E91E63] hover:bg-[#c2185b] text-white font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          Search
        </button>
      </div>
    </div>
  )
}

