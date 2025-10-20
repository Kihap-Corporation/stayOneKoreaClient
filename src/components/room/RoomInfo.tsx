"use client"

import { MapPin } from "lucide-react"
import { RoomFacilities } from "./RoomFacilities"
import { RoomDescription } from "./RoomDescription"

interface Facility {
  name: string
  iconName: string
  available: boolean
}

interface RoomInfoProps {
  name: string
  location: string
  facilities: Facility[]
  description: string
  rules: string
}

export function RoomInfo({ name, location, facilities, description, rules }: RoomInfoProps) {
  return (
    <>
      {/* 제목과 위치 */}
      <div className="mb-6">
        <h1 className="mb-2 text-[24px] font-bold leading-[32px] tracking-[-0.3px] text-[#14151a]">
          {name}
        </h1>
        <div className="flex items-center gap-1 text-[18px] text-[rgba(13,17,38,0.4)]">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </div>

      {/* 편의시설 */}
      <RoomFacilities facilities={facilities} />

      {/* 숙소 소개 */}
      <RoomDescription description={description} rules={rules} />
    </>
  )
}
