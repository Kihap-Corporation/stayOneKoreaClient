"use client"

import { Heart, Share2 } from "lucide-react"

interface RoomImageGalleryProps {
  images: string[]
  roomName: string
  selectedIndex: number
  onImageSelect: (index: number) => void
}

export function RoomImageGallery({ images, roomName, selectedIndex, onImageSelect }: RoomImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {/* 메인 이미지 */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <img
          src={images[selectedIndex]}
          alt={roomName}
          className="h-full w-full object-cover"
        />
        <button className="absolute right-4 top-4 rounded-full bg-white/80 p-2 hover:bg-white">
          <Heart className="h-5 w-5" />
        </button>
        <button className="absolute right-16 top-4 rounded-full bg-white/80 p-2 hover:bg-white">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* 서브 이미지들 */}
      <div className="grid grid-cols-2 gap-2">
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg ${
              index === 3 ? "relative" : ""
            }`}
            onClick={() => onImageSelect(index + 1)}
          >
            <img
              src={image}
              alt={`${roomName} ${index + 2}`}
              className="h-full w-full object-cover"
            />
            {index === 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-lg font-semibold text-white">+ 더보기</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
