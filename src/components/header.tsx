"use client"

import Link from "next/link"
import { Search, Bell, User, Bed, ChevronDown, Globe, DollarSign, Menu, X, Heart, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "./language-provider"
import { useState } from "react"

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
] as const

export function Header() {
  const { currentLanguage, setCurrentLanguage, currentCurrency, setCurrentCurrency, messages } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl xl:max-w-[1200px] px-4 py-4 lg:px-6 xl:px-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold leading-tight">
              <span className="text-[#E91E63]">STAY</span>
              <span className="text-[#E91E63]">ONE</span>
              <br />
              <span className="text-[#E91E63]">KOREA</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder={messages?.header?.search?.placeholder || "Loading..."}
              className="w-full pr-12 rounded-full border-gray-300"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#E91E63] hover:bg-[#C2185B]"
            >
              <Search className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span className="text-xl">{currentLanguage.flag}</span>
                  <span className="uppercase">{currentLanguage.code}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => setCurrentLanguage(language)}
                    className={language.code === currentLanguage.code ? "bg-accent" : ""}
                  >
                    <span className="text-xl mr-2">{language.flag}</span>
                    {language.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{currentCurrency.symbol} {currentCurrency.code}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currencies.map((currency) => (
                  <DropdownMenuItem
                    key={currency.code}
                    onClick={() => setCurrentCurrency(currency)}
                    className={currency.code === currentCurrency.code ? "bg-accent" : ""}
                  >
                    <span className="mr-2">{currency.symbol}</span>
                    {currency.code} - {currency.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            {/* Profile Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-blue-100"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User className="h-5 w-5 text-blue-400" />
              </Button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 py-2">
                    <Link
                      href="/mypage"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-base">My account</span>
                    </Link>
                    <Link
                      href="/mypage"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Bed className="h-5 w-5 text-gray-600" />
                      <span className="text-base">Bookings</span>
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart className="h-5 w-5 text-gray-600" />
                      <span className="text-base">Saved</span>
                    </Link>
                    <button
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                      onClick={() => {
                        setIsProfileOpen(false)
                        // 로그아웃 로직 추가 가능
                      }}
                    >
                      <LogOut className="h-5 w-5 text-gray-600" />
                      <span className="text-base">Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between">
          {/* Mobile Logo - Left */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-lg font-bold leading-tight">
              <span className="text-[#E91E63]">STAY ONE</span>
              <br />
              <span className="text-[#E91E63]">KOREA</span>
            </div>
          </Link>

          {/* Mobile Profile + Hamburger - Right */}
          <div className="flex items-center gap-2">
            {/* Mobile Profile Icon */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-blue-100"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User className="h-5 w-5 text-blue-400" />
              </Button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 py-2">
                    <Link
                      href="/mypage"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-base">My account</span>
                    </Link>
                    <Link
                      href="/mypage"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Bed className="h-5 w-5 text-gray-600" />
                      <span className="text-base">Bookings</span>
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart className="h-5 w-5 text-gray-600" />
                      <span className="text-base">Saved</span>
                    </Link>
                    <button
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                      onClick={() => {
                        setIsProfileOpen(false)
                        // 로그아웃 로직 추가 가능
                      }}
                    >
                      <LogOut className="h-5 w-5 text-gray-600" />
                      <span className="text-base">Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen)
                setIsProfileOpen(false) // 햄버거 메뉴 열 때 프로필 메뉴 닫기
              }}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>


        {/* Mobile Menu - Hidden Desktop Elements */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white mt-4 py-4">
            <div className="flex flex-col gap-4">

              {/* Mobile Search Bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder={messages?.header?.search?.placeholder || "Loading..."}
                  className="w-full pr-12 rounded-full border-gray-300"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#E91E63] hover:bg-[#C2185B]"
                >
                  <Search className="h-4 w-4 text-white" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              <div className="flex flex-col gap-3">
                <Button className="bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full justify-start">
                  <Bed className="h-4 w-4 mr-2" />
                  {messages?.header?.navigation?.stays || "Loading..."}
                </Button>
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 py-2">
                  <span className="text-lg">ℹ️</span>
                  {messages?.header?.navigation?.about || "Loading..."}
                </Link>
              </div>

              {/* Mobile Settings & Language */}
              <div className="border-t pt-4 space-y-3">
                {/* Notifications */}
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Bell className="h-4 w-4 mr-2" />
                  {messages?.header?.profile?.notifications || "Notifications"}
                </Button>

                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="text-xl mr-2">{currentLanguage.flag}</span>
                      {currentLanguage.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-full">
                    {languages.map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => setCurrentLanguage(language)}
                        className={language.code === currentLanguage.code ? "bg-accent" : ""}
                      >
                        <span className="text-xl mr-2">{language.flag}</span>
                        {language.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Currency Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {currentCurrency.symbol} {currentCurrency.code}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-full">
                    {currencies.map((currency) => (
                      <DropdownMenuItem
                        key={currency.code}
                        onClick={() => setCurrentCurrency(currency)}
                        className={currency.code === currentCurrency.code ? "bg-accent" : ""}
                      >
                        <span className="mr-2">{currency.symbol}</span>
                        {currency.code} - {currency.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 mt-4">
          <Button className="bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full">
            <Bed className="h-4 w-4 mr-2" />
            {messages?.header?.navigation?.stays || "Loading..."}
          </Button>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            {messages?.header?.navigation?.about || "Loading..."}
          </Link>
        </div>
      </div>
    </header>
  )
}
