"use client"

import Link from "next/link"
import { useLanguage } from "./language-provider"

export function Footer() {
  const { messages } = useLanguage()

  return (
    <footer className="border-t bg-white mt-auto">
      <div className="mx-auto max-w-7xl xl:max-w-[1200px] px-4 py-8 lg:px-6 xl:px-8">
        {/* Logo */}
        <div className="mb-6">
          <div className="text-2xl font-bold leading-tight">
            <span className="text-black">STAY</span>
            <span className="text-black">ONE</span>
            <br />
            <span className="text-black">KOREA</span>
          </div>
        </div>

        {/* Company Info */}
        <div className="text-sm text-gray-600 space-y-1 mb-6">
          <p>{`${messages?.footer?.company || "Loading..."} | ${messages?.footer?.businessNumber || "Business Number"}: ${messages?.footer?.businessNumber || "Loading..."} | ${messages?.footer?.representative || "Representative"}: ${messages?.footer?.representative || "Loading..."}`}</p>
          <p>{`${messages?.footer?.mailOrderNumber || "Mail Order Number"} ${messages?.footer?.mailOrderNumber || "Loading..."} | ${messages?.footer?.hostingProvider || "Hosting Provider"}: ${messages?.footer?.hostingProvider || "Loading..."}`}</p>
          <p>{`${messages?.footer?.customerService || "Customer Service"}: ${messages?.footer?.customerService || "Loading..."}`}</p>
          <p>{messages?.footer?.inquiryAddress || "Loading..."}</p>
        </div>

        {/* Links */}
        <div className="flex gap-6 mb-6">
          <Link href="#" className="text-sm text-gray-900 hover:underline">
            {messages?.footer?.privacyPolicy || "Loading..."}
          </Link>
          <Link href="#" className="text-sm text-gray-900 hover:underline">
            {messages?.footer?.termsOfService || "Loading..."}
          </Link>
          <Link href="#" className="text-sm text-gray-900 hover:underline">
            {messages?.footer?.aboutGosiwon || "Loading..."}
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>{messages?.footer?.disclaimer?.line1 || "Loading..."}</p>
          <p>
            {messages?.footer?.disclaimer?.line2 ? messages.footer.disclaimer.line2.replace('{companyName}', messages.footer.company || "Company") : "Loading..."}
          </p>
          <p>{messages?.footer?.disclaimer?.copyright ? messages.footer.disclaimer.copyright.replace('{companyName}', messages.footer.company || "Company") : "Loading..."}</p>
          <p>{messages?.footer?.disclaimer?.contentProtection || "Loading..."}</p>
        </div>
      </div>
    </footer>
  )
}
