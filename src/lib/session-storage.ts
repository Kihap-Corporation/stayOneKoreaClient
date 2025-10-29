/**
 * 세션 스토리지를 사용한 날짜 관리 유틸리티
 * 브라우저 탭/창이 열려있는 동안 체크인/체크아웃 날짜 유지
 */

const CHECK_IN_KEY = 'booking_check_in'
const CHECK_OUT_KEY = 'booking_check_out'

/**
 * 체크인 날짜 저장
 */
export const saveCheckInDate = (date: Date | null): void => {
  if (typeof window === 'undefined') return

  if (date) {
    sessionStorage.setItem(CHECK_IN_KEY, date.toISOString())
  } else {
    sessionStorage.removeItem(CHECK_IN_KEY)
  }
}

/**
 * 체크아웃 날짜 저장
 */
export const saveCheckOutDate = (date: Date | null): void => {
  if (typeof window === 'undefined') return

  if (date) {
    sessionStorage.setItem(CHECK_OUT_KEY, date.toISOString())
  } else {
    sessionStorage.removeItem(CHECK_OUT_KEY)
  }
}

/**
 * 체크인 날짜 가져오기
 */
export const getCheckInDate = (): Date | null => {
  if (typeof window === 'undefined') return null

  const dateStr = sessionStorage.getItem(CHECK_IN_KEY)
  if (!dateStr) return null

  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * 체크아웃 날짜 가져오기
 */
export const getCheckOutDate = (): Date | null => {
  if (typeof window === 'undefined') return null

  const dateStr = sessionStorage.getItem(CHECK_OUT_KEY)
  if (!dateStr) return null

  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * 체크인과 체크아웃 날짜 모두 저장
 */
export const saveBookingDates = (checkIn: Date | null, checkOut: Date | null): void => {
  saveCheckInDate(checkIn)
  saveCheckOutDate(checkOut)
}

/**
 * 체크인과 체크아웃 날짜 모두 가져오기
 */
export const getBookingDates = (): { checkIn: Date | null; checkOut: Date | null } => {
  return {
    checkIn: getCheckInDate(),
    checkOut: getCheckOutDate()
  }
}

/**
 * 저장된 날짜 모두 삭제
 */
export const clearBookingDates = (): void => {
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(CHECK_IN_KEY)
  sessionStorage.removeItem(CHECK_OUT_KEY)
}
