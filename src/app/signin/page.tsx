"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"
import { apiPost } from "@/lib/api"
import Link from "next/link"

// 완전히 동적 라우트로 설정 (빌드 시 정적 생성 방지)
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const router = useRouter()
  const { messages } = useLanguage()

  // 클라이언트 사이드에서만 URL 파라미터 읽기
  const [redirectUrl, setRedirectUrl] = useState<string>('/')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get('email')
      const redirectParam = urlParams.get('redirect')
      
      if (emailParam) {
        setEmail(emailParam)
      }
      if (redirectParam) {
        setRedirectUrl(decodeURIComponent(redirectParam))
      }
    }
  }, [])

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await apiPost('/api/auth/login', {
        email,
        password,
      })

      if (data.code === 200) {
        // 로그인 상태 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true')
        }
        // 성공 시 redirect URL 또는 루트 페이지로 리다이렉트
        router.push(redirectUrl)
      } else if (data.code === 40107) {
        // 이메일 인증이 필요한 경우 verify-email 페이지로 리다이렉트
        router.push('/verify-email')
      } else {
        // 기타 실패 시 비밀번호 입력란 아래에 에러 메시지 표시
        setLoginError(data.message || messages?.signin?.loginError || "Login failed")
      }
    } catch (error) {
      setLoginError(messages?.signin?.loginError || "Login failed")
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
            <h1 className="text-2xl font-semibold text-center mb-8 text-balance">{messages.signin.title}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-normal">
                  {messages.signin.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={messages.signin.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-normal">
                  {messages.signin.password}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={messages.signin.passwordPlaceholder}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setLoginError("") // 입력 시 에러 메시지 초기화
                  }}
                  className={`w-full ${loginError ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                  disabled={isLoading}
                />
                {loginError && (
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <span className="text-red-600">⚠️ {loginError}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="cursor-pointer w-full bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? messages.common.loading : messages.signin.continue}
              </Button>

              <p className="text-xs text-center text-gray-500 leading-relaxed">
                {messages.signin.termsAgreement}{" "}
                <Link href="#" className="text-gray-600 underline hover:text-gray-900">
                  {messages.signin.termsOfUse}
                </Link>{" "}
                {messages.signin.and}{" "}
                <Link href="#" className="text-gray-600 underline hover:text-gray-900">
                  {messages.signin.privacyPolicy}
                </Link>
                {messages.signin.agreeToTerms}
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
