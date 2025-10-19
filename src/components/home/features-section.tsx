"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { DollarSign, Home, MapPin } from "lucide-react"

export function FeaturesSection() {
  const { messages } = useLanguage()

  return (
    <div className="w-full bg-[#f7f7f8] py-10 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-[18px]">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-extrabold text-[#14151a] tracking-[-0.3px]">
            {messages?.home?.features?.title || "GOSIWON, K-Compact Studio"}
          </h2>
          <Button 
            variant="outline" 
            className="bg-[rgba(10,15,41,0.04)] hover:bg-[rgba(10,15,41,0.08)] text-[#14151a] rounded-full px-3 py-1.5 h-8 text-sm font-medium cursor-pointer"
          >
            {messages?.home?.features?.learnMore || "Learn More"}
            <span className="ml-1 text-sm">+</span>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
          {/* Feature 1 */}
          <div className="bg-white border border-[#dee0e3] rounded-2xl p-6 flex flex-col gap-2">
            <div className="h-10 w-10 flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-[#14151a]" />
            </div>
            <h3 className="text-base font-extrabold text-[#14151a] tracking-[-0.2px]">
              {messages?.home?.features?.deposit?.title || "Near-Zero Deposit & Flexible Lease"}
            </h3>
            <p className="text-sm font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.1px]">
              {messages?.home?.features?.deposit?.description || "Flexible daily, weekly, and monthly contracts with the lowest deposit in Korea, tailored to your stay purpose."}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-[#dee0e3] rounded-2xl p-6 flex flex-col gap-2">
            <div className="h-10 w-10 flex items-center justify-center">
              <Home className="h-10 w-10 text-[#14151a]" />
            </div>
            <h3 className="text-base font-extrabold text-[#14151a] tracking-[-0.2px]">
              {messages?.home?.features?.furnished?.title || "Fully Furnished & All-Inclusive"}
            </h3>
            <p className="text-sm font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.1px]">
              {messages?.home?.features?.furnished?.description || "Fully furnished with appliances — all utilities included, no extra charges."}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-[#dee0e3] rounded-2xl p-6 flex flex-col gap-2">
            <div className="h-10 w-10 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-[#14151a]" />
            </div>
            <h3 className="text-base font-extrabold text-[#14151a] tracking-[-0.2px]">
              {messages?.home?.features?.safety?.title || "Safety & Prime Location"}
            </h3>
            <p className="text-sm font-medium text-[rgba(15,19,36,0.6)] tracking-[-0.1px]">
              {messages?.home?.features?.safety?.description || "24-hour security and prime locations near subway stations, universities, and business districts across Seoul."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}




