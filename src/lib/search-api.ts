import { apiGet } from "./api"

export interface SearchRoomsParams {
  latitude: number
  longitude: number
  checkInDate: string // yyyy-MM-dd
  checkOutDate: string // yyyy-MM-dd
  minPrice?: number
  maxPrice?: number
  sortOption?: 'RECOMMEND' | 'PRICE_LOW' | 'PRICE_HIGH'
  language: 'KO' | 'EN' | 'ZH' | 'FR'
  radiusKm?: number // default 10
  page?: number // default 1
  size?: number // default 20
}

export interface SearchRoomResult {
  roomIdentifier: string
  residenceIdentifier?: string // optional for backward compatibility
  firstGalleryImageUrl: string
  residenceName: string
  fullAddress: string
  pricePerNight: number
  totalPrice: number
  latitude: number
  longitude: number
  isLiked: boolean
}

export interface SearchRoomsResponse {
  content: SearchRoomResult[]
  currentPage: number
  size: number
  totalElements: number
  totalPages: number
  isLast: boolean
  message: string | null
}

export async function searchRooms(params: SearchRoomsParams): Promise<SearchRoomsResponse> {
  const queryParams = new URLSearchParams({
    latitude: params.latitude.toString(),
    longitude: params.longitude.toString(),
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    sortOption: params.sortOption || 'RECOMMEND',
    language: params.language,
    radiusKm: (params.radiusKm || 10).toString(),
    page: (params.page || 1).toString(),
    size: (params.size || 20).toString()
  })

  // minPrice는 0보다 클 때만 전달 (백엔드 검증: 0보다 커야 함)
  if (params.minPrice !== undefined && params.minPrice > 0) {
    queryParams.append('minPrice', params.minPrice.toString())
  }

  // maxPrice는 값이 있을 때만 전달
  if (params.maxPrice !== undefined) {
    queryParams.append('maxPrice', params.maxPrice.toString())
  }

  // apiGet은 HTTP 상태 코드로 성공/실패 판단하고, 200이면 전체 응답 반환
  const response = await apiGet(`/api/search/rooms?${queryParams.toString()}`, { skipAuth: true })

  // response.data에 실제 데이터가 들어있음
  return response.data as SearchRoomsResponse
}

