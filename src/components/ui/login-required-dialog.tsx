"use client"

import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LoginRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginRequiredDialog({ open, onOpenChange }: LoginRequiredDialogProps) {
  const router = useRouter()
  const { messages } = useLanguage()

  const handleConfirm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    onOpenChange(false)
    router.push('/account_check')
  }

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="max-w-md bg-white rounded-[24px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[20px] font-bold leading-[28px] tracking-[-0.2px] text-[#14151a] text-center">
            {messages?.auth?.loginRequired || "로그인이 필요한 서비스입니다"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[16px] font-normal leading-[24px] tracking-[-0.2px] text-[rgba(15,19,36,0.6)] text-center mt-2">
            {messages?.auth?.loginRequiredDesc || "로그인 페이지로 이동하시겠습니까?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="w-full sm:flex-1 h-12 rounded-full bg-white border border-[#dee0e3] hover:bg-gray-50 text-[16px] font-medium text-[#14151a] transition-colors"
          >
            {messages?.common?.cancel || "취소"}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="w-full sm:flex-1 h-12 rounded-full bg-[#e0004d] hover:bg-[#c2003f] text-[16px] font-medium text-white shadow-sm transition-colors"
          >
            {messages?.common?.confirm || "확인"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

