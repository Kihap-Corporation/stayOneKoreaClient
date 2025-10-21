"use client"

import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"

const destinations = [
  {
    name: "Gangnam, Seoul",
    nameKey: "Gangnam",
    image: "/home-gangnam.png",
    latitude: 37.5110534117843,
    longitude: 127.0354362019722
  },
  {
    name: "Myeong-dong, Seoul",
    nameKey: "Myeongdong",
    image: "/home-myeong-dong.png",
    latitude: 37.565923566825326,
    longitude: 126.98074651612093
  },
  {
    name: "Hong-dae, Seoul",
    nameKey: "Hongdae",
    image: "/home-hong-dae.png",
    latitude: 37.5488326432062,
    longitude: 126.9129208053439
  }
]

export function TrendingSection() {
  const { messages } = useLanguage()
  const router = useRouter()

  // Format date as yyyy-MM-dd
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDestinationClick = (destination: typeof destinations[0]) => {
    // Get today and 5 days later (4 nights)
    const today = new Date()
    const checkOutDate = new Date(today)
    checkOutDate.setDate(checkOutDate.getDate() + 5)

    // Build query params
    const params = new URLSearchParams({
      lat: destination.latitude.toString(),
      lng: destination.longitude.toString(),
      checkIn: formatDate(today),
      checkOut: formatDate(checkOutDate),
      location: destination.nameKey
    })

    // Navigate to search page
    router.push(`/search?${params.toString()}`)
  }

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
              onClick={() => handleDestinationClick(destination)}
              className="relative h-[200px] rounded-lg overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
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




