"use client"

import { Button } from "@/components/ui/button"
import { Heart, ShieldCheck } from "lucide-react"

interface Room {
  id: number
  name: string
  location: string
  price: number
  image: string
  isVerified: boolean
  hasFreeCancellation: boolean
}

interface RelatedRoomsProps {
  title: string
  rooms: Room[]
}

export function RelatedRooms({ title, rooms }: RelatedRoomsProps) {
  return (
    <div className="bg-[#f7f7f8] py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 xl:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#14151a]">{title}</h2>
          <Button variant="outline" className="rounded-full">
            더 보기
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <div key={room.id} className="group cursor-pointer">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <img
                  src={room.image}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {room.isVerified && (
                  <div className="absolute left-3 top-3 rounded bg-green-100 px-2 py-1">
                    <span className="text-xs font-medium text-green-800">인증됨</span>
                  </div>
                )}
                <button className="absolute right-3 top-3 rounded-full bg-white/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[#14151a]">{room.name}</h3>
                  {room.hasFreeCancellation && (
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                      무료취소
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{room.location}</p>
                <p className="mt-1 font-semibold text-[#14151a]">₩{room.price.toLocaleString()} /박</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
