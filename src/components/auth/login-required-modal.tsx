"use client"

import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  returnUrl?: string
}

export function LoginRequiredModal({ 
  isOpen, 
  onClose, 
  message,
  returnUrl 
}: LoginRequiredModalProps) {
  const router = useRouter()
  const { messages } = useLanguage()

  if (!isOpen) return null

  const handleLoginClick = () => {
    // 현재 페이지 URL을 returnUrl로 저장
    const redirectUrl = returnUrl || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')
    router.push(`/signin?redirect=${encodeURIComponent(redirectUrl)}`)
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-[0px_20px_40px_0px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#ffe5ef] rounded-full flex items-center justify-center">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                stroke="#e0004d" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" 
                stroke="#e0004d" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* 제목 */}
        <h2 className="text-[20px] font-bold leading-[28px] tracking-[-0.2px] text-[#14151a] text-center mb-2">
          {messages?.auth?.loginRequired || '로그인이 필요합니다'}
        </h2>

        {/* 메시지 */}
        <p className="text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[rgba(13,17,38,0.6)] text-center mb-6">
          {message || messages?.auth?.loginRequiredMessage || '이 기능을 사용하려면 로그인이 필요합니다.'}
        </p>

        {/* 버튼들 */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleLoginClick}
            className="w-full h-12 rounded-full bg-[#e0004d] hover:bg-[#c2003f] text-white text-[16px] font-medium leading-[24px] tracking-[-0.2px]"
          >
            {messages?.auth?.goToLogin || '로그인하러 가기'}
          </Button>
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 text-[#14151a] text-[16px] font-medium leading-[24px] tracking-[-0.2px] shadow-none"
          >
            {messages?.common?.cancel || '취소'}
          </Button>
        </div>
      </div>
    </div>
  )
}


