"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/components/language-provider"

interface PriceFilterProps {
  minPrice: number
  maxPrice: number
  onPriceChange: (min: number, max: number) => void
  onSearch: () => void
}

export function PriceFilter({ minPrice, maxPrice, onPriceChange, onSearch }: PriceFilterProps) {
  const { messages } = useLanguage()
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)
  const minRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalMin(minPrice)
    setLocalMax(maxPrice)
  }, [minPrice, maxPrice])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value <= localMax) {
      setLocalMin(value)
      onPriceChange(value, localMax)
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value >= localMin) {
      setLocalMax(value)
      onPriceChange(localMin, value)
    }
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
          <div className="relative mb-6 h-8">
            {/* Track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#dee0e3] rounded-full -translate-y-1/2"></div>
            
            {/* Active Range */}
            <div 
              className="absolute top-1/2 h-1 bg-[#4285F4] rounded-full -translate-y-1/2"
              style={{
                left: `${(localMin / 300) * 100}%`,
                width: `${((localMax - localMin) / 300) * 100}%`
              }}
            ></div>

            {/* Min Slider - 왼쪽 절반 영역 */}
            <input
              ref={minRef}
              type="range"
              min="0"
              max="300"
              step="5"
              value={localMin}
              onChange={handleMinChange}
              className="absolute w-full h-8 top-0 left-0 opacity-0 cursor-pointer z-10"
              style={{
                pointerEvents: 'auto',
                clipPath: `polygon(0 0, ${(localMin / 300) * 100 + 10}% 0, ${(localMin / 300) * 100 + 10}% 100%, 0 100%)`
              }}
            />
            
            {/* Max Slider - 오른쪽 절반 영역 */}
            <input
              ref={maxRef}
              type="range"
              min="0"
              max="300"
              step="5"
              value={localMax}
              onChange={handleMaxChange}
              className="absolute w-full h-8 top-0 left-0 opacity-0 cursor-pointer z-10"
              style={{
                pointerEvents: 'auto',
                clipPath: `polygon(${(localMax / 300) * 100 - 10}% 0, 100% 0, 100% 100%, ${(localMax / 300) * 100 - 10}% 100%)`
              }}
            />

            {/* Min Handle */}
            <div 
              className="absolute w-4 h-4 bg-white border-2 border-[#4285F4] rounded-full top-1/2 -translate-y-1/2 cursor-pointer shadow-md hover:scale-110 transition-transform z-20"
              style={{
                left: `calc(${(localMin / 300) * 100}% - 8px)`
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                minRef.current?.focus()
              }}
            ></div>

            {/* Max Handle */}
            <div 
              className="absolute w-4 h-4 bg-white border-2 border-[#4285F4] rounded-full top-1/2 -translate-y-1/2 cursor-pointer shadow-md hover:scale-110 transition-transform z-20"
              style={{
                left: `calc(${(localMax / 300) * 100}% - 8px)`
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                maxRef.current?.focus()
              }}
            ></div>
          </div>

          {/* Price Display */}
          <div className="flex justify-between items-center text-sm font-medium text-[#14151a]">
            <span>{formatPrice(localMin)}</span>
            <span>{formatPrice(localMax)}</span>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
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

