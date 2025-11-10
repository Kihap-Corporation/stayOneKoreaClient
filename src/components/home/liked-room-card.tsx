"use client"

import Image from "next/image"
import { LikeButton } from "@/components/ui/like-button"

interface LikedRoomCardProps {
  roomIdentifier: string
  image: string
  title: string
  provider: string
  location: string
  price: number
  isLiked: boolean
  onLikeToggle?: (roomIdentifier: string, e: React.MouseEvent) => void
  onClick?: (roomIdentifier: string) => void
}

export function LikedRoomCard({ 
  roomIdentifier,
  image, 
  title, 
  provider, 
  location, 
  price,
  isLiked,
  onLikeToggle,
  onClick
}: LikedRoomCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(roomIdentifier)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault() // 기본 동작 방지
    e.stopPropagation() // 이벤트 버블링 방지
    if (onLikeToggle) {
      onLikeToggle(roomIdentifier, e)
    }
  }

  return (
    <div 
      className="flex flex-col gap-2 w-full cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* 좋아요 버튼 */}
        <div className="absolute top-3 right-3">
          <LikeButton
            isLiked={isLiked}
            onClick={handleLikeClick}
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        {/* Title & Provider */}
        <div className="flex flex-col">
          <h3 className="font-bold text-base text-[#14151a] tracking-[-0.2px] line-clamp-2 h-[44px]">
            {title}
          </h3>
          <p className="text-sm font-medium text-[rgba(13,17,38,0.4)] tracking-[-0.2px] truncate">
            {provider}
          </p>
          <p className="text-xs font-medium text-[rgba(13,17,38,0.4)] tracking-[-0.1px] truncate">
            {location}
          </p>
        </div>

        {/* Price */}
        <div className="flex gap-1 items-start">
          <span className="text-base font-bold text-[#14151a] underline tracking-[-0.2px]">
            ${price} per night
          </span>
        </div>
      </div>
    </div>
  )
}

