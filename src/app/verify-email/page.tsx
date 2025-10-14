"use client"

import {Header} from "@/components/header"
import {Footer} from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

export default function VerifyEmailPage() {
  const { messages } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
        <div className="w-full max-w-[600px] rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold text-gray-900">
              {messages?.verifyEmail?.title || "Check your inbox"}
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-gray-600">
              {messages?.verifyEmail?.subtitle || "We've sent you a verification email to your email address."}
              <br />
              {messages?.verifyEmail?.description || "Click the button to activate your account."}
            </p>

            <Link
              href="/"
              className="inline-block w-full rounded-full bg-[#E91E63] px-6 py-3 text-center font-medium text-white transition-colors hover:bg-[#C2185B]"
            >
              {messages?.verifyEmail?.findStay || "Find your stay"}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
