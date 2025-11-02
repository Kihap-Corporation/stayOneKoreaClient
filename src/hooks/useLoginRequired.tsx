"use client"

import { useState, useCallback } from "react"

export function useLoginRequired() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined)
  const [returnUrl, setReturnUrl] = useState<string | undefined>(undefined)

  /**
   * 로그인이 필요한 작업을 수행하기 전에 로그인 상태를 확인하는 함수
   * @param action 로그인이 확인된 후 실행할 함수
   * @param message 커스텀 메시지 (선택사항)
   * @param customReturnUrl 커스텀 리턴 URL (선택사항)
   */
  const requireLogin = useCallback((
    action: () => void, 
    message?: string,
    customReturnUrl?: string
  ) => {
    // 로그인 상태 확인 (localStorage에서)
    const isLoggedIn = typeof window !== 'undefined' 
      ? localStorage.getItem('isLoggedIn') === 'true'
      : false

    if (isLoggedIn) {
      // 로그인되어 있으면 바로 실행
      action()
    } else {
      // 로그인되어 있지 않으면 모달 표시
      setModalMessage(message)
      setReturnUrl(customReturnUrl)
      setIsModalOpen(true)
    }
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setModalMessage(undefined)
    setReturnUrl(undefined)
  }, [])

  return {
    isModalOpen,
    modalMessage,
    returnUrl,
    requireLogin,
    closeModal,
  }
}

