"use client"

interface RoomLocationProps {
  location: string
}

export function RoomLocation({ location }: RoomLocationProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">
        위치
      </h2>
      <p className="mb-4 text-sm font-semibold text-[rgba(15,19,36,0.6)]">
        {location}
      </p>
      <div className="aspect-video rounded-xl bg-gray-200">
        {/* 지도 컴포넌트가 들어갈 자리 */}
        <div className="flex h-full items-center justify-center text-gray-500">
          지도 컴포넌트
        </div>
      </div>
    </div>
  )
}
