"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiPost, apiGet } from "@/lib/api"

export default function AdminSignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    try {
      // 1. 일반 로그인 API 호출
      const loginData = await apiPost('/api/auth/login', {
        email,
        password,
      }, { skipAuth: true })

      // 2. 로그인 응답의 role 확인 (최초 로그인 시)
      if (loginData.data?.role === "ROLE_ADMIN") {
        // 관리자 권한 있음 - 관리자 홈으로 이동
        router.push('/admin')
      } else {
        // 관리자 권한 없음
        setLoginError("관리자 권한이 없습니다.")
      }
    } catch (error) {
      setLoginError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[600px]">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 관리자 로고/타이틀 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              관리자 로그인
            </h1>
            <p className="text-gray-600">
              Stay One Korea 관리자 페이지
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-normal">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@stayonekorea.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-normal">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
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
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              관리자 계정으로만 로그인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

