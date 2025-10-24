import { apiGet, apiPost, apiDelete } from "./api"

export interface RecommendRoom {
  displayOrder: number
  firstGalleryImageUrl: string
  residenceName: string
  fullAddress: string
  roomName: string
  pricePerNight: number
}

export interface RecommendRoomsResponse {
  status: number
  code: string
  message: string
  data: RecommendRoom[]
}

export interface AddRecommendRoomRequest {
  roomIdentifier: string
  displayOrder: number
}

/**
 * 추천 숙소 목록 조회
 * GET /api/recommend-rooms
 */
export async function getRecommendRooms(language: 'ko' | 'en' | 'zh' | 'fr' = 'ko'): Promise<RecommendRoom[]> {
  const response = await apiGet(`/api/recommend-rooms?language=${language}`, { skipAuth: true })
  return response.data as RecommendRoom[]
}

/**
 * 추천 숙소 등록 (관리자)
 * POST /api/v1/admin/recommend-rooms
 */
export async function addRecommendRoom(request: AddRecommendRoomRequest): Promise<void> {
  await apiPost('/api/v1/admin/recommend-rooms', request)
}

/**
 * 추천 숙소 삭제 (관리자)
 * DELETE /api/v1/admin/recommend-rooms/{displayOrder}
 */
export async function deleteRecommendRoom(displayOrder: number): Promise<void> {
  await apiDelete(`/api/v1/admin/recommend-rooms/${displayOrder}`)
}

