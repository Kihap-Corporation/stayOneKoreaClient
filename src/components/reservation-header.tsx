"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useLanguage } from "./language-provider"
import { logout } from "@/lib/api"
import { User, Calendar, Heart, LogOut } from "lucide-react"

interface ReservationHeaderProps {
  currentStep?: 1 | 2 | 3
}

export function ReservationHeader({ currentStep = 1 }: ReservationHeaderProps) {
  const { messages } = useLanguage()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const localLoginStatus = localStorage.getItem('isLoggedIn') === 'true'

      if (localLoginStatus) {
        setIsLoggedIn(true)
        return
      }

      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

      const hasToken = !!(cookies.access || cookies.refresh)
      setIsLoggedIn(hasToken)
    }

    checkLoginStatus()
  }, [])

  // 단계 정보
  const steps = [
    { number: 1, label: messages?.reservation?.stepCustomerInfo || "Customer information" },
    { number: 2, label: messages?.reservation?.stepPayment || "Payment information" },
    { number: 3, label: messages?.reservation?.stepConfirmed || "Confirmed" }
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#dee0e3]">
      {/* 데스크톱 헤더 */}
      <div className="hidden lg:block mx-auto max-w-7xl xl:max-w-[1200px] px-4 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Left: Logo */}
          <div className="w-[100px]">
            <Link href="/" className="flex-shrink-0">
              <div className="h-10 w-[100px]">
                <img
                  src="/logo/desktop_logo.png"
                  alt="STAY ONE KOREA"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Center: Stepper */}
          <div className="flex items-start gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center gap-0.5 w-[164px]">
                {/* Step indicator with lines */}
                <div className="flex items-center justify-center w-full gap-0.5">
                  {/* Left line */}
                  <div className="flex-1 flex items-center">
                    <div 
                      className={`flex-1 h-px ${
                        index === 0 
                          ? 'bg-transparent' 
                          : step.number <= currentStep 
                            ? 'bg-[#e0004d]' 
                            : 'bg-[#e9eaec]'
                      }`} 
                    />
                    <div 
                      className={`flex-1 h-px ${
                        index === 0 
                          ? 'bg-transparent' 
                          : step.number <= currentStep 
                            ? 'bg-[#e0004d]' 
                            : 'bg-[#e9eaec]'
                      }`} 
                    />
                  </div>

                  {/* Circle with number */}
                  <div 
                    className={`flex items-center justify-center w-4 h-4 rounded-full ${
                      step.number <= currentStep 
                        ? 'bg-[#e0004d]' 
                        : 'bg-[rgba(10,15,41,0.25)]'
                    }`}
                  >
                    <span className="text-[12px] font-semibold text-white leading-4">
                      {step.number}
                    </span>
                  </div>

                  {/* Right line */}
                  <div className="flex-1 flex items-center">
                    <div 
                      className={`flex-1 h-px ${
                        index === steps.length - 1 
                          ? 'bg-transparent' 
                          : step.number < currentStep 
                            ? 'bg-[#e0004d]' 
                            : 'bg-[#e9eaec]'
                      }`} 
                    />
                    <div 
                      className={`flex-1 h-px ${
                        index === steps.length - 1 
                          ? 'bg-transparent' 
                          : step.number < currentStep 
                            ? 'bg-[#e0004d]' 
                            : 'bg-[#e9eaec]'
                      }`} 
                    />
                  </div>
                </div>

                {/* Step label */}
                <p 
                  className={`text-[12px] font-semibold leading-4 text-center whitespace-nowrap ${
                    step.number <= currentStep 
                      ? 'text-[#e0004d]' 
                      : 'text-[rgba(10,15,41,0.25)]'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Profile */}
          <div className="w-[100px] flex justify-end">
            <div className="relative">
              <button
                className="h-8 w-8 p-0 rounded-full overflow-hidden hover:bg-transparent cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src="/icons/profile.png"
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-[220px] bg-white rounded-2xl shadow-lg border border-[#dee0e3] py-2 px-1">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/mypage"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium text-[#14151a] tracking-tight">My account</span>
                        </Link>
                        <Link
                          href="/bookings"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Calendar className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium text-[#14151a] tracking-tight">Bookings</span>
                        </Link>
                        <Link
                          href="/like"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Heart className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium text-[#14151a] tracking-tight">Saved</span>
                        </Link>
                        <button
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left cursor-pointer"
                          onClick={() => {
                            setIsProfileOpen(false)
                            logout()
                          }}
                        >
                          <LogOut className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium text-[#14151a] tracking-tight">Sign out</span>
                        </button>
                      </>
                    ) : (
                      <button
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left cursor-pointer"
                        onClick={() => {
                          setIsProfileOpen(false)
                          window.location.href = '/account_check'
                        }}
                      >
                        <LogOut className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-[#14151a] tracking-tight">Sign in</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 헤더 */}
      <div className="lg:hidden mx-auto px-4 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="h-8 w-[80px]">
              <img
                src="/logo/mobile_logo.png"
                alt="STAY ONE KOREA"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* Mobile Stepper - Simplified */}
          <div className="flex items-center gap-1">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-6 h-6 rounded-full ${
                    step.number <= currentStep 
                      ? 'bg-[#e0004d]' 
                      : 'bg-[rgba(10,15,41,0.1)]'
                  }`}
                >
                  <span className={`text-[10px] font-semibold ${
                    step.number <= currentStep ? 'text-white' : 'text-[rgba(10,15,41,0.4)]'
                  }`}>
                    {step.number}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-6 h-px mx-1 ${
                      step.number < currentStep 
                        ? 'bg-[#e0004d]' 
                        : 'bg-[#e9eaec]'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              className="h-8 w-8 p-0 rounded-full overflow-hidden hover:bg-transparent cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img
                src="/icons/profile.png"
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-12 z-20 w-[220px] bg-white rounded-2xl shadow-lg border border-[#dee0e3] py-2 px-1">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/mypage"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-[#14151a] tracking-tight">My account</span>
                      </Link>
                      <Link
                        href="/bookings"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-[#14151a] tracking-tight">Bookings</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Heart className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-[#14151a] tracking-tight">Saved</span>
                      </Link>
                      <button
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left cursor-pointer"
                        onClick={() => {
                          setIsProfileOpen(false)
                          logout()
                        }}
                      >
                        <LogOut className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-[#14151a] tracking-tight">Sign out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left cursor-pointer"
                      onClick={() => {
                        setIsProfileOpen(false)
                        window.location.href = '/account_check'
                      }}
                    >
                      <LogOut className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-[#14151a] tracking-tight">Sign in</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

