"use client"

import Link from "next/link"
import { Search, User, ChevronDown, Globe, Menu, X, Heart, LogOut, Calendar, Bed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage, languages } from "./language-provider"
import { logout } from "@/lib/api"
import { useState, useEffect } from "react"

export function Header() {
  const { currentLanguage, setCurrentLanguage, messages } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      // localStorage에서 로그인 상태 우선 확인
      const localLoginStatus = localStorage.getItem('isLoggedIn') === 'true'

      if (localLoginStatus) {
        setIsLoggedIn(true)
        return
      }

      // 쿠키에서 액세스 토큰이나 리프레시 토큰 확인
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

      const hasToken = !!(cookies.access || cookies.refresh)
      setIsLoggedIn(hasToken)
    }

    checkLoginStatus()

    // 주기적으로 확인 (선택사항)
    // const interval = setInterval(checkLoginStatus, 5000)
    // return () => clearInterval(interval)
  }, [])

  // 모든 페이지에서 모바일 메뉴 검색바 숨김
  const shouldHideMobileMenuSearch = () => {
    // 모든 페이지에서 모바일 메뉴의 검색바를 숨김
    return true
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#dee0e3]">
      <div className="mx-auto w-full lg:max-w-[1200px] px-4 py-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            {/* Left: Logo + Search Bar */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <div className="h-10 w-[100px]">
                  <img
                    src="/logo/desktop_logo.png"
                    alt="STAY ONE KOREA"
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>

              {/* Search Bar */}
              <div className="w-[300px]">
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder={messages?.header?.search?.placeholder || "Find your stay in Korea"}
                    className="w-full h-10 pr-10 pl-4 rounded-full border border-[#dee0e3] hover:border-gray-300 focus:border-[#E91E63] transition-colors bg-white text-sm"
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#e0004d] hover:bg-[#C2185B] shadow-sm transition-all"
                  >
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Language + Currency + Notification + Profile */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1 px-1 hover:bg-transparent">
                      {currentLanguage.code === 'ko' ? (
                        <img src="/icons/kor.png" alt="한국어" className="w-5 h-5 rounded-sm" />
                      ) : currentLanguage.code === 'en' ? (
                        <img src="/icons/usa.png" alt="English" className="w-5 h-5 rounded-sm" />
                      ) : (
                        <span className="text-lg">{currentLanguage.flag}</span>
                      )}
                      <span className="uppercase text-[#14151a] text-sm font-medium tracking-tight">{currentLanguage.code}</span>
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {languages.map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => setCurrentLanguage(language)}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${language.code === currentLanguage.code ? "bg-pink-50 text-[#E91E63]" : "hover:bg-gray-50"}`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-[#e9eaec]" />

              <div className="flex items-center gap-4">
                {/* Profile Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-8 p-0 rounded-full overflow-hidden hover:bg-transparent"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <img
                      src="/icons/profile.png"
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </Button>

                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <div className="absolute right-0 top-12 z-20 w-[220px] bg-white rounded-2xl shadow-lg border border-[#dee0e3] py-2 px-1">
                        {isLoggedIn ? (
                          <>
                            <Link
                              href="/mypage"
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <User className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-[#14151a] tracking-tight">My account</span>
                            </Link>
                            <Link
                              href="/bookings"
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Calendar className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-[#14151a] tracking-tight">Bookings</span>
                            </Link>
                            <Link
                              href="/like"
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Heart className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-[#14151a] tracking-tight">Saved</span>
                            </Link>
                            <button
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
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
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
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

          {/* Desktop Navigation Buttons */}
          <div className="flex items-center gap-2 w-full">
            <Button className="bg-[#e0004d] hover:bg-[#C2185B] text-white rounded-full px-3 py-1.5 shadow-sm hover:shadow transition-all flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span className="text-sm font-medium tracking-tight">{messages?.header?.navigation?.stays || "Stays"}</span>
            </Button>
            <Button variant="ghost" className="hover:bg-transparent text-[rgba(15,19,36,0.6)] hover:text-[#14151a] px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <img
                src="/icons/info.png"
                alt="About"
                className="h-4 w-4"
              />
              <span className="text-sm font-medium tracking-tight">{messages?.header?.navigation?.about || "About Gosiwon"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            {/* Mobile Logo - Left */}
            <Link href="/" className="flex-shrink-0">
              <div className="h-8 w-20">
                <img
                  src="/logo/mobile_logo.png"
                  alt="STAY ONE KOREA"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            {/* Mobile Profile + Hamburger - Right */}
            <div className="flex items-center gap-2">
              {/* Mobile Profile Icon */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-8 p-0 rounded-full overflow-hidden hover:bg-transparent"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <img
                    src="/icons/profile.png"
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </Button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 top-12 z-20 w-[220px] bg-white rounded-2xl shadow-lg border border-[#dee0e3] py-2 px-1">
                      {isLoggedIn ? (
                        <>
                          <Link
                            href="/mypage"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-[#14151a] tracking-tight">My account</span>
                          </Link>
                            <Link
                              href="/bookings"
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Calendar className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-[#14151a] tracking-tight">Bookings</span>
                            </Link>
                          <Link
                            href="/like"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Heart className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-[#14151a] tracking-tight">Saved</span>
                          </Link>
                          <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
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
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
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

              {/* Mobile Hamburger Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 p-2.5 hover:bg-transparent rounded-xl transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                  setIsProfileOpen(false)
                }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" style={{ width: '20px', height: '20px' }} />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" style={{ width: '20px', height: '20px' }} />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar - 헤더 밑에 항상 표시 */}
          <div className="relative w-full">
            <Input
              type="text"
              placeholder={messages?.header?.search?.placeholder || "Find your stay in Korea"}
              className="w-full h-11 pr-14 pl-5 rounded-full border-2 border-gray-200 hover:border-gray-300 focus:border-[#E91E63] transition-colors bg-gray-50/50 focus:bg-white"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#E91E63] hover:bg-[#C2185B] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Search className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>


        {/* Mobile Menu - Hidden Desktop Elements */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white/95 backdrop-blur mt-3 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4">

              {/* Mobile Search Bar - 특정 페이지에서만 숨김 */}
              {!shouldHideMobileMenuSearch() && (
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={messages?.header?.search?.placeholder || "Loading..."}
                    className="w-full h-11 pr-14 pl-5 rounded-full border-2 border-gray-200 hover:border-gray-300 focus:border-[#E91E63] transition-colors bg-gray-50/50 focus:bg-white"
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#E91E63] hover:bg-[#C2185B] shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </div>
              )}

              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3">
                <Button className="bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full justify-start h-11 shadow-lg hover:shadow-xl transition-all duration-200">
                  <span className="font-medium">{messages?.header?.navigation?.stays || "Loading..."}</span>
                </Button>
                <Link href="#" className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <img
                    src="/icons/info.png"
                    alt="About"
                    className="h-5 w-5"
                  />
                  <span className="font-medium">{messages?.header?.navigation?.about || "Loading..."}</span>
                </Link>
              </div>

              {/* Mobile Settings & Language */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-sm h-11 border-2 hover:border-gray-300 transition-colors">
                      <Globe className="h-4 w-4 mr-2 text-gray-600" />
                      {currentLanguage.code === 'ko' ? (
                        <img src="/icons/kor.png" alt="한국어" className="w-5 h-5 mr-2 rounded-sm" />
                      ) : currentLanguage.code === 'en' ? (
                        <img src="/icons/usa.png" alt="English" className="w-5 h-5 mr-2 rounded-sm" />
                      ) : (
                        <span className="text-lg mr-2">{currentLanguage.flag}</span>
                      )}
                      <span className="font-medium">{currentLanguage.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-full">
                    {languages.map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => setCurrentLanguage(language)}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${language.code === currentLanguage.code ? "bg-pink-50 text-[#E91E63]" : "hover:bg-gray-50"}`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
