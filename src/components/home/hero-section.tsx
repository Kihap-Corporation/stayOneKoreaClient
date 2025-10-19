"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/language-provider"
import { MapPin, Calendar, Users } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export function HeroSection() {
  const { messages } = useLanguage()
  const [people, setPeople] = useState(1)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)

  return (
    <div className="relative w-full py-20 px-4 flex items-center justify-center overflow-hidden">
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
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Where */}
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-[#14151a]">
                Where
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search destinations"
                  className="w-full h-10 pl-10 rounded-xl border border-[#dee0e3] focus:border-[#E91E63]"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Check-in */}
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-[#14151a]">
                Check-in
              </label>
              <div className="relative">
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  placeholderText="Select..."
                  dateFormat="MM/dd/yyyy"
                  className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#dee0e3] focus:border-[#E91E63] focus:outline-none text-sm"
                  minDate={new Date()}
                  popperClassName="datepicker-popper"
                  popperPlacement="bottom-start"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Check-out */}
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-[#14151a]">
                Check-out
              </label>
              <div className="relative">
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  placeholderText="Select..."
                  dateFormat="MM/dd/yyyy"
                  className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#dee0e3] focus:border-[#E91E63] focus:outline-none text-sm"
                  minDate={checkIn || new Date()}
                  popperClassName="datepicker-popper"
                  popperPlacement="bottom-start"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* People */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#14151a]">
                People
              </label>
              <div className="bg-white border border-[#dee0e3] rounded-full flex items-center justify-between px-3 h-10 w-[108px]">
                <button
                  onClick={() => setPeople(Math.max(1, people - 1))}
                  className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <span className="text-lg">−</span>
                </button>
                <span className="text-sm font-medium w-7 text-center">{people}</span>
                <button
                  onClick={() => setPeople(people + 1)}
                  className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            className="w-full mt-4 bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-xl h-12 text-base font-medium shadow-sm cursor-pointer"
          >
            {messages?.home?.hero?.searchButton || "Search 5days in Seoul"}
          </Button>
        </div>
      </div>
    </div>
  )
}




