"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiGet } from "@/lib/api"

interface AdminAuthResult {
  isAdmin: boolean
  isLoading: boolean
  email: string | null
}

/**
 * 관리자 권한 확인 훅
 * /api/admin/auth 엔드포인트를 호출하여 관리자 권한 검증
 */
export function useAdminAuth(redirectToSignin = true): AdminAuthResult {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await apiGet("/api/admin/auth", { skipAuth: false })
        
        // apiGet 성공 = HTTP 200 = 관리자 권한 있음
        setIsAdmin(true)
        setEmail(response.data?.email || null)
      } catch (error) {
        // 403 에러 = 관리자 권한 없음
        setIsAdmin(false)
        if (redirectToSignin) {
          router.push("/admin/signin")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAuth()
  }, [router, redirectToSignin])

  return { isAdmin, isLoading, email }
}

