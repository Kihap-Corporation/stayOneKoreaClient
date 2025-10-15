"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"


// Vercel에서는 Environment Variables에서 NEXT_PUBLIC_BASE_URL 설정 필요
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://your-backend-api.com"

export default function AccountCheckPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { messages } = useLanguage()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setIsLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/api/auth/email-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      })

      const data = await response.json()

      if (data.code === 200) {
        // 회원가입 페이지로 이동 (이메일 기억)
        router.push(`/signup?email=${encodeURIComponent(email)}`)
      } else if (data.code === 400) {
        // 로그인 페이지로 이동
        router.push('/signin')
      } else {
        // 기타 에러 처리
        console.error('Unexpected response:', data)
        alert('오류가 발생했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('API call failed:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[600px]">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-semibold text-center mb-8 text-balance">
              {messages?.account_check?.title || "Sign in or create an account"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-normal">
                  {messages?.account_check?.emailLabel || "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={messages?.account_check?.emailPlaceholder || "id@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (messages?.account_check?.loading || "Loading...") : (messages?.account_check?.continue || "Continue")}
              </Button>

              <p className="text-xs text-center text-gray-500 leading-relaxed">
                {messages?.account_check?.termsAgreement || "By signing in, I agree to Stay One Korea's"}{" "}
                <Link href="#" className="text-gray-600 underline hover:text-gray-900">
                  {messages?.account_check?.termsOfUse || "Terms of Use"}
                </Link>{" "}
                {messages?.account_check?.and || "and"}{" "}
                <Link href="#" className="text-gray-600 underline hover:text-gray-900">
                  {messages?.account_check?.privacyPolicy || "Privacy Policy"}
                </Link>
                {messages?.account_check?.agreeToTerms || "."}
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
