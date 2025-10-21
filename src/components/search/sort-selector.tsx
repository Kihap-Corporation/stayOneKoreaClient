"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export type SortOption = 'RECOMMEND' | 'PRICE_LOW' | 'PRICE_HIGH'

interface SortSelectorProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortSelector({ value, onChange }: SortSelectorProps) {
  const { messages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const options: { value: SortOption; label: string }[] = [
    { value: 'RECOMMEND', label: messages?.searchResult?.sortRecommend || 'Recommended' },
    { value: 'PRICE_LOW', label: messages?.searchResult?.sortPriceLow || 'Price: Low to High' },
    { value: 'PRICE_HIGH', label: messages?.searchResult?.sortPriceHigh || 'Price: High to Low' }
  ]

  const selectedOption = options.find(opt => opt.value === value)

  // Close dropdown when clicking outside
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

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 px-3 bg-white border border-[#dee0e3] rounded-full flex items-center gap-1 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-xs font-medium text-[#14151a]">
          {selectedOption?.label}
        </span>
        <ChevronDown className={`h-3 w-3 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#dee0e3] rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                option.value === value ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

