import { useLanguage } from "@/components/language-provider"
import { toast } from "sonner"

// 전역적으로 messages를 사용하기 위해 함수형으로 변경
let globalMessages: any = null

export const setGlobalMessages = (messages: any) => {
  globalMessages = messages
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const clearLoginState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isLoggedIn')
  }
}

const MAX_RETRIES = 2

// 공통 API 응답 형식
export interface ApiResponse<T = any> {
  status: number
  code: number | string
  message: string
  data: T
}

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean // 인증 로직을 스킵할지 여부
}

class ApiError extends Error {
  constructor(public response: ApiResponse<any>, public status: number) {
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
    alert(globalMessages?.auth?.logoutError || "로그아웃 중 오류가 발생했습니다.")
  }

  clearLoginState()

  // 로그인 페이지로 리다이렉트
  if (typeof window !== 'undefined') {
    window.location.href = '/account_check'
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

    if (response.ok) {
      return true // 재발급 성공
    } else {
      // 재발급 실패 - 로그아웃 처리
      toast.error(globalMessages?.auth?.accountLoggedOut || "계정이 로그아웃 되었습니다. 다시 로그인 해주세요")
      await handleLogout()
      return false
    }
  } catch (error) {
    toast.error(globalMessages?.auth?.accountLoggedOut || "계정이 로그아웃 되었습니다. 다시 로그인 해주세요")
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

interface ExecuteRequestOptions {
  skipAuth?: boolean
}

const executeRequest = async (
  requestFn: () => Promise<Response>,
  { skipAuth = false }: ExecuteRequestOptions = {}
): Promise<{ response: Response; data: ApiResponse }> => {
  let retryCount = 0

  while (retryCount < MAX_RETRIES) {
    try {
      const response = await requestFn()
      const data: ApiResponse = await response.json()

      if (response.status === 401 && !skipAuth) {
        const code = String(data.code)
        if (code === "40101") {
          const refreshSuccess = await refreshToken()
          if (refreshSuccess) {
            retryCount++
            continue
          } else {
            throw new ApiError(data, response.status)
          }
        } else if (code === "40102") {
          alert(globalMessages?.auth?.accountLoggedOut || "계정이 로그아웃 되었습니다. 다시 로그인 해주세요")
          await handleLogout()
          throw new ApiError(data, response.status)
        } else {
          clearLoginState()
          throw new ApiError(data, response.status)
        }
      }

      if (response.status === 403 && !skipAuth) {
        handleForbidden()
        throw new ApiError(data, response.status)
      }

      if (response.status === 400) {
        const code = String(data.code)
        if (code === "40106") {
          alert(globalMessages?.auth?.currentPasswordIncorrect || "현재 비밀번호가 일치하지 않습니다.")
          throw new ApiError(data, response.status)
        }
      }

      if (!response.ok) {
        throw new ApiError(data, response.status)
      }

      return { response, data }

    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new Error(globalMessages?.common?.error || '요청 중 오류가 발생했습니다.')
    }
  }

  throw new Error('최대 재시도 횟수를 초과했습니다.')
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

  const { data } = await executeRequest(
    () => fetch(`${BASE_URL}${endpoint}`, defaultOptions),
    { skipAuth }
  )

  return data
}

// 응답 객체를 포함한 API 요청 함수 (응답 코드 확인용)
export const apiRequestWithResponse = async (
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<{ response: Response; data: any }> => {
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

  return executeRequest(
    () => fetch(`${BASE_URL}${endpoint}`, defaultOptions),
    { skipAuth }
  )
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

// 응답 객체를 포함한 POST 요청 함수 (응답 코드 확인용)
export const apiPostWithResponse = async (endpoint: string, data?: any, options: ApiRequestOptions = {}) => {
  return apiRequestWithResponse(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  })
}

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

/**
 * FormData를 사용하는 POST 요청 (multipart/form-data)
 * 이미지 업로드 등에 사용
 */
export const apiPostFormData = async (endpoint: string, formData: FormData, options: ApiRequestOptions = {}) => {
  const { skipAuth = false, ...fetchOptions } = options

  const defaultOptions: RequestInit = {
    credentials: 'include',
    method: 'POST',
    body: formData,
    // Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
    ...fetchOptions,
  }

  const { data } = await executeRequest(
    () => fetch(`${BASE_URL}${endpoint}`, defaultOptions),
    { skipAuth }
  )

  return data
}

/**
 * FormData를 사용하는 PUT 요청 (multipart/form-data)
 * 이미지 수정 등에 사용
 */
export const apiPutFormData = async (endpoint: string, formData: FormData, options: ApiRequestOptions = {}) => {
  const { skipAuth = false, ...fetchOptions } = options

  const defaultOptions: RequestInit = {
    credentials: 'include',
    method: 'PUT',
    body: formData,
    // Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
    ...fetchOptions,
  }

  const { data } = await executeRequest(
    () => fetch(`${BASE_URL}${endpoint}`, defaultOptions),
    { skipAuth }
  )

  return data
}

// 로그아웃 함수 (외부에서 사용할 수 있도록 export)
export const logout = handleLogout
