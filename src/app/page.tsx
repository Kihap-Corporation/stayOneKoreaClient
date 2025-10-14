"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { messages } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[600px] text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to <span className="text-[#E91E63]">STAY ONE KOREA</span>
          </h1>
          <p className="text-lg text-gray-600">{messages?.home?.title || "Loading..."}</p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full px-8">
              {messages?.home?.explore || "Loading..."}
            </Button>
            <Button variant="outline" className="rounded-full px-8">
              {messages?.home?.host || "Loading..."}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
