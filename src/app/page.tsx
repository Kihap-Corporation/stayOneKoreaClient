"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { TrendingSection } from "@/components/home/trending-section"
import { FeaturedRoomsSection } from "@/components/home/featured-rooms-section"

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
