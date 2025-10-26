"use client"

import { useLanguage } from "@/components/language-provider"

interface RelatedRoom {
  roomIdentifier: string
  roomName: string
  residenceFullAddress: string
  pricePerNight: number
  mainImageUrl: string
  residenceIdentifier: string
  roomLikeCheck: boolean
}

interface RelatedRoomCardProps {
  room: RelatedRoom
  variant?: 'desktop' | 'mobile'
  onClick?: (residenceIdentifier: string, roomIdentifier: string) => void
  onLikeToggle?: (roomIdentifier: string, e: React.MouseEvent) => void
}

export function RelatedRoomCard({
  room,
  variant = 'desktop',
  onClick,
  onLikeToggle
}: RelatedRoomCardProps) {
  const { messages } = useLanguage()

  const handleClick = () => {
    if (onClick) {
      onClick(room.residenceIdentifier, room.roomIdentifier)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLikeToggle) {
      onLikeToggle(room.roomIdentifier, e)
    }
  }

  if (variant === 'mobile') {
    return (
      <div
        className="flex-shrink-0 w-[196px] flex flex-col gap-2 cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative aspect-square rounded-[16px] overflow-hidden bg-gray-200">
          {room.mainImageUrl ? (
            <img
              src={room.mainImageUrl}
              alt={room.roomName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm text-gray-400">{messages?.common?.noImage || "No image"}</span>
            </div>
          )}

          {/* 좋아요 버튼 */}
          <div className="absolute top-3 right-3">
            <button
              className="bg-[rgba(10,15,41,0.04)] p-1 rounded-md hover:bg-[rgba(10,15,41,0.1)] transition-colors"
              onClick={handleLikeClick}
            >
              {room.roomLikeCheck ? (
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z"
                    fill="#e0004d"
                  />
                </svg>
              ) : (
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415ZM3.31033 3.14332C2.06866 4.38498 2.00616 6.37248 3.15033 7.68582L9.00033 13.545L14.8503 7.68665C15.9953 6.37248 15.9328 4.38748 14.6895 3.14165C13.4503 1.89998 11.4553 1.83998 10.1453 2.98665L6.64366 6.48915L5.4645 5.31082L7.81866 2.95498L7.75033 2.89748C6.43783 1.84332 4.5195 1.93332 3.31033 3.14332V3.14332Z"
                    fill="#FFF"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h3 className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a] line-clamp-2 max-h-[52px] overflow-hidden">
              {room.roomName}
            </h3>
            <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.4)] truncate">
              {room.residenceFullAddress}
            </p>
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a] underline">
              ${room.pricePerNight} per night
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 데스크톱 버전
  return (
    <div
      className="flex flex-col gap-2 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-square rounded-[16px] overflow-hidden bg-gray-200">
        {room.mainImageUrl ? (
          <img
            src={room.mainImageUrl}
            alt={room.roomName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm text-gray-400">{messages?.common?.noImage || "No image"}</span>
          </div>
        )}

        {/* 좋아요 버튼 */}
        <div className="absolute top-3 right-3">
          <button
            className="bg-[rgba(10,15,41,0.04)] p-1 rounded-md hover:bg-[rgba(10,15,41,0.1)] transition-colors"
            onClick={handleLikeClick}
          >
            {room.roomLikeCheck ? (
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z"
                  fill="#e0004d"
                />
              </svg>
            ) : (
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415ZM3.31033 3.14332C2.06866 4.38498 2.00616 6.37248 3.15033 7.68582L9.00033 13.545L14.8503 7.68665C15.9953 6.37248 15.9328 4.38748 14.6895 3.14165C13.4503 1.89998 11.4553 1.83998 10.1453 2.98665L6.64366 6.48915L5.4645 5.31082L7.81866 2.95498L7.75033 2.89748C6.43783 1.84332 4.5195 1.93332 3.31033 3.14332V3.14332Z"
                  fill="#FFF"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <h3 className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a] line-clamp-2 max-h-[52px] overflow-hidden">
            {room.roomName}
          </h3>
          <p className="text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.4)]">
            {room.residenceFullAddress}
          </p>
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">
            ${room.pricePerNight} per night
          </span>
        </div>
      </div>
    </div>
  )
}
