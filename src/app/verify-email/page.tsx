"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { apiPost } from "@/lib/api"
import Link from "next/link"

export default function VerifyEmailPage() {
  const { messages } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)

  // 초기화 - 로그인 상태와 관계없이 접근 허용
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('verifyEmail')

      // 이메일 정보가 있으면 표시
      if (savedEmail) {
        setEmail(savedEmail)
      }
      setIsAuthorized(true)
    }
  }, [])

  // 다른 페이지로 이동할 때 email 정보 삭제
  const handleNavigation = (path: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('verifyEmail')
    }
    router.push(path)
  }

  // 이메일 재전송 API 호출
  const handleResendEmail = async () => {
    if (!email) return

    try {
      const data = await apiPost('/api/auth/resend/verification_email', {
        email: email
      })

      if (data.code === 200) {
        alert(messages?.verifyEmail?.emailResent || "Verification email has been resent.")
      } else {
        alert(data.message || (messages?.common?.error || "An error occurred"))
      }
    } catch (error) {
      console.error('Resend email API call failed:', error)
      alert(messages?.common?.error || "An error occurred")
    }
  }

  // 권한이 확인되지 않은 경우 로딩 화면 표시
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
        <div className="w-full max-w-[600px] rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold text-gray-900">
              {messages?.verifyEmail?.title || "Check your inbox"}
            </h1>
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              {messages?.verifyEmail?.subtitle || "We've sent you a verification email to your email address."}
            </p>
            {email ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{messages?.verifyEmail?.emailLabel || "Email:"}</span> {email}
                </p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {messages?.verifyEmail?.checkLoginEmail || "Please check the email associated with your account."}
                </p>
              </div>
            )}
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              {messages?.verifyEmail?.activationInstructions || "To activate your account, please check your email and click the verification button in the email."}
            </p>

            {email && (
              <p className="mb-6 text-sm text-gray-600">
                {messages?.verifyEmail?.subtitle || "We've sent you a verification email to your email address."}{" "}
                <br></br>
                <br></br>
                <button
                  onClick={handleResendEmail}
                  className="text-[#E91E63] underline hover:no-underline font-medium"
                >
                  {messages?.verifyEmail?.resendVerificationEmail || "Resend verification email"}
                </button>
              </p>
            )}

            <button
              onClick={() => handleNavigation('/signin')}
              className="inline-block w-full rounded-full bg-[#E91E63] px-6 py-3 text-center font-medium text-white transition-colors hover:bg-[#C2185B]"
            >
              {messages?.verifyEmail?.goToSignin || "Go to Sign In"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
