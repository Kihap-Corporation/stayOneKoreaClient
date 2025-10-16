import { useLanguage } from "@/components/language-provider"

// 전역적으로 messages를 사용하기 위해 함수형으로 변경
let globalMessages: any = null

export const setGlobalMessages = (messages: any) => {
  globalMessages = messages
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

interface ApiResponse {
  code: number
  message: string
  data: any
}

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean // 인증 로직을 스킵할지 여부
}

class ApiError extends Error {
  constructor(public response: ApiResponse, public status: number) {
    super(response.message)
    this.name = 'ApiError'
  }
}

// 로그아웃 처리 함수
const handleLogout = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    const data = await response.json()

    if (response.ok && data.code === 200) {
      // 로그아웃 성공 - alert 제거
    } else {
      alert(data.message || (globalMessages?.auth?.logoutError || "로그아웃 중 오류가 발생했습니다."))
    }
  } catch (error) {
    console.error('Logout error:', error)
    alert(globalMessages?.auth?.logoutError || "로그아웃 중 오류가 발생했습니다.")
  }

  // 로그인 상태 제거
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isLoggedIn')
  }

  // 로그인 페이지로 리다이렉트
  if (typeof window !== 'undefined') {
    window.location.href = '/signin'
  }
}

// 토큰 재발급 함수
const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/token/reissue`, {
      method: 'POST',
      credentials: 'include',
    })

    const data: ApiResponse = await response.json()

    if (response.ok && data.code === 200) {
      return true // 재발급 성공
    } else {
      // 재발급 실패 - 로그아웃 처리
      alert(globalMessages?.auth?.accountLoggedOut || "계정이 로그아웃 되었습니다. 다시 로그인 해주세요")
      await handleLogout()
      return false
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    alert(globalMessages?.auth?.accountLoggedOut || "계정이 로그아웃 되었습니다. 다시 로그인 해주세요")
    await handleLogout()
    return false
  }
}

// 403 에러 처리 함수
const handleForbidden = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/access-denied'
  }
}

// 메인 API 요청 함수
export const apiRequest = async (
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<any> => {
  const { skipAuth = false, ...fetchOptions } = options

  // 기본 옵션 설정
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  }

  // 최대 재시도 횟수 설정 (무한 루프 방지)
  const maxRetries = 2
  let retryCount = 0

  while (retryCount < maxRetries) {
    try {
      let response = await fetch(`${BASE_URL}${endpoint}`, defaultOptions)
      let data: ApiResponse = await response.json()

      // 401 에러 처리 (토큰 만료)
      if (response.status === 401 && !skipAuth) {
        if (data.code === 40101) {
          // 토큰 재발급 시도
          console.log(`🔄 토큰 재발급 시도... (${retryCount + 1}/${maxRetries})`)
          const refreshSuccess = await refreshToken()
          if (refreshSuccess) {
            console.log('✅ 토큰 재발급 성공!')
            retryCount++
            continue // 재시도
          } else {
            // 재발급 실패
            console.error('❌ 토큰 재발급 실패')
            throw new ApiError(data, response.status)
          }
        } else if (data.code === 40102) {
          // 토큰 재발급 실패 - 더 이상 시도하지 않음
          console.error('❌ 토큰 재발급 최종 실패')
          alert(globalMessages?.auth?.accountLoggedOut || "계정이 로그아웃 되었습니다. 다시 로그인 해주세요")
          await handleLogout()
          throw new ApiError(data, response.status)
        }
      }

      // 403 에러 처리 (접근 권한 없음)
      if (response.status === 403) {
        handleForbidden()
        throw new ApiError(data, response.status)
      }

      // 400 에러 처리 (특별한 경우들)
      if (response.status === 400) {
        // 비밀번호 변경 시 현재 비밀번호 불일치 (40106)
        if (data.code === 40106) {
          alert(globalMessages?.auth?.currentPasswordIncorrect || "현재 비밀번호가 일치하지 않습니다.")
          throw new ApiError(data, response.status)
        }
      }

      // 기타 에러 처리
      if (!response.ok) {
        throw new ApiError(data, response.status)
      }

      // 성공 시 데이터 반환
      console.log(`✅ API 요청 성공: ${endpoint}`)
      return data

    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      // 네트워크 에러 등
      console.error('❌ API 요청 실패:', error)
      throw new Error(globalMessages?.common?.error || '요청 중 오류가 발생했습니다.')
    }
  }

  // 최대 재시도 횟수 초과
  throw new Error('최대 재시도 횟수를 초과했습니다.')
}

// 편의 함수들
export const apiGet = (endpoint: string, options: ApiRequestOptions = {}) =>
  apiRequest(endpoint, { ...options, method: 'GET' })

export const apiPost = (endpoint: string, data?: any, options: ApiRequestOptions = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  })

export const apiPut = (endpoint: string, data?: any, options: ApiRequestOptions = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })

export const apiPatch = (endpoint: string, data?: any, options: ApiRequestOptions = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined
  })

export const apiDelete = (endpoint: string, options: ApiRequestOptions = {}) =>
  apiRequest(endpoint, { ...options, method: 'DELETE' })

// 로그아웃 함수 (외부에서 사용할 수 있도록 export)
export const logout = handleLogout
