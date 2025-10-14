// 기본 타입 정의들
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 사용자 관련 타입들 (필요시 확장)
export interface User extends BaseEntity {
  email: string
  name?: string
  avatar?: string
}

// 폼 관련 타입들
export interface FormField {
  name: string
  label: string
  type: string
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}

// 공통 UI 타입들
export type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
export type Size = 'sm' | 'md' | 'lg' | 'xl'
