"use client"

interface RoomDescriptionProps {
  description: string
  rules: string
}

export function RoomDescription({ description, rules }: RoomDescriptionProps) {
  return (
    <>
      {/* 숙소 소개 */}
      <div className="mb-8">
        <h2 className="mb-4 text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">
          숙소 소개
        </h2>
        <p className="mb-4 text-[16px] leading-[24px] text-[#14151a]">
          {description}
        </p>
        <button className="rounded-[10px] bg-[rgba(10,15,41,0.04)] px-4 py-2 text-sm font-medium text-[#14151a] hover:bg-[rgba(10,15,41,0.08)]">
          더 보기
        </button>
      </div>

      {/* 이용규칙 */}
      <div className="mb-8">
        <h2 className="mb-4 text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">
          이용규칙
        </h2>
        <p className="mb-4 text-[16px] leading-[24px] text-[#14151a]">
          {rules}
        </p>
        <button className="rounded-[10px] bg-[rgba(10,15,41,0.04)] px-4 py-2 text-sm font-medium text-[#14151a] hover:bg-[rgba(10,15,41,0.08)]">
          더 보기
        </button>
      </div>
    </>
  )
}
