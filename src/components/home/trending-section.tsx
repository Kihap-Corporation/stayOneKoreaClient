"use client"

import { useLanguage } from "@/components/language-provider"

const destinations = [
  {
    name: "Gangnam, Seoul",
    image: "/home-gangnam.png"
  },
  {
    name: "Myeong-dong, Seoul",
    image: "/home-myeong-dong.png"
  },
  {
    name: "Hong-dae, Seoul",
    image: "/home-hong-dae.png"
  }
]

export function TrendingSection() {
  const { messages } = useLanguage()

  return (
    <div className="w-full bg-white py-10 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-[18px]">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold text-[#14151a] tracking-[-0.3px]">
            {messages?.home?.trending?.title || "Trending destinations"}
          </h2>
          <p className="text-base font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.2px]">
            {messages?.home?.trending?.subtitle || "Most popular stay locations"}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className="relative h-[200px] rounded-lg overflow-hidden group cursor-pointer"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-semibold text-white tracking-[-0.2px]">
                  {destination.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}




