import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { TrendingSection } from "@/components/home/trending-section"
import { FeaturedRoomsSection } from "@/components/home/featured-rooms-section"

export const metadata: Metadata = {
  title: "Stay One Korea - Find Your Perfect Stay in Korea",
  description: "Find your perfect accommodation in Korea. Discover goshiwon, studios, and apartments with verified hosts. Book your stay with competitive prices and excellent service.",
  keywords: ["accommodation Korea", "goshiwon booking", "Seoul housing", "student accommodation", "short term rental Korea"],
  openGraph: {
    title: "Stay One Korea - Find Your Perfect Stay",
    description: "Discover beautiful accommodations across Korea. Book goshiwon, studios, and apartments with ease.",
    images: [
      {
        url: "/sok-og.png",
        width: 1200,
        height: 630,
        alt: "Stay One Korea Homepage",
      },
    ],
  },
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TrendingSection />
        <FeaturedRoomsSection />
      </main>

      <Footer />
    </div>
  )
}
