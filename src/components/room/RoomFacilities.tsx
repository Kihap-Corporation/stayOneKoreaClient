"use client"

import { Wifi, Car, Dumbbell, Flame, Shield, ShieldCheck } from "lucide-react"

interface Facility {
  name: string
  iconName: string
  available: boolean
}

interface RoomFacilitiesProps {
  facilities: Facility[]
}

const iconMap = {
  Wifi,
  Car,
  Dumbbell,
  Flame,
  Shield,
  ShieldCheck,
}

export function RoomFacilities({ facilities }: RoomFacilitiesProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">
        편의시설
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {facilities.map((facility, index) => {
          const IconComponent = iconMap[facility.iconName as keyof typeof iconMap] || Wifi
          return (
            <div key={index} className="flex items-center gap-3">
              <IconComponent className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">{facility.name}</span>
            </div>
          )
        })}
      </div>
      <button className="mt-4 rounded-[10px] bg-[rgba(10,15,41,0.04)] px-4 py-2 text-sm font-medium text-[#14151a] hover:bg-[rgba(10,15,41,0.08)]">
        모든 28개 편의시설 보기
      </button>
    </div>
  )
}
