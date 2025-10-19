"use client"

interface RoomCardProps {
  image: string
  title: string
  provider: string
  location: string
  price: number
}

export function RoomCard({ 
  image, 
  title, 
  provider, 
  location, 
  price
}: RoomCardProps) {
  return (
    <div className="flex flex-col gap-2 w-[280px] cursor-pointer group">
      {/* Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        {/* Title & Provider */}
        <div className="flex flex-col">
          <h3 className="font-bold text-lg text-[#14151a] tracking-[-0.2px] line-clamp-2 h-[52px]">
            {title}
          </h3>
          <p className="text-lg font-medium text-[rgba(13,17,38,0.4)] tracking-[-0.2px] truncate">
            {provider}
          </p>
          <p className="text-sm font-medium text-[rgba(13,17,38,0.4)] tracking-[-0.1px] truncate">
            {location}
          </p>
        </div>

        {/* Price */}
        <div className="flex gap-1 items-start">
          <span className="text-lg font-bold text-[#14151a] underline tracking-[-0.2px]">
            ${price} per night
          </span>
        </div>
      </div>
    </div>
  )
}



