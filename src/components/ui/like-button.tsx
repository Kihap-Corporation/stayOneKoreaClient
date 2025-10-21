"use client"

import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"

interface LikeButtonProps {
  isLiked: boolean
  onClick: (e: React.MouseEvent) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'always-filled' // always-filled는 좋아요 페이지용
}

export function LikeButton({
  isLiked,
  onClick,
  size = 'md',
  className = '',
  variant = 'default'
}: LikeButtonProps) {
  const router = useRouter()
  const { messages } = useLanguage()

  // 사이즈별 설정
  const sizeConfig = {
    sm: {
      button: 'p-1',
      svg: { width: 18, height: 16 }
    },
    md: {
      button: 'p-1',
      svg: { width: 26, height: 23 }
    },
    lg: {
      button: 'p-2',
      svg: { width: 32, height: 28 }
    }
  }

  const config = sizeConfig[size]

  // 클릭 핸들러 (로그인 체크 포함)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 이벤트 버블링 방지
    
    // 로그인 상태 확인
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'
    
    if (!isLoggedIn) {
      // 로그인하지 않은 경우
      if (confirm(messages?.auth?.loginRequired || "로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push('/account_check')
      }
      return
    }

    // 로그인되어 있는 경우 원래 onClick 실행
    onClick(e)
  }

  // always-filled 변형 (좋아요 페이지용)
  if (variant === 'always-filled') {
    return (
      <button
        className={`bg-[rgba(10,15,41,0.04)] ${config.button} rounded-md hover:bg-[rgba(10,15,41,0.1)] transition-colors cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <svg
          width={config.svg.width}
          height={config.svg.height}
          viewBox="0 0 18 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z"
            fill="white"
            stroke="white"
            strokeWidth="1"
          />
        </svg>
      </button>
    )
  }

  // 기본 변형 (isLiked 상태에 따라 색상 변경)
  return (
    <button
      className={`bg-[rgba(10,15,41,0.04)] ${config.button} rounded-md hover:bg-[rgba(10,15,41,0.1)] transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {isLiked ? (
        // 좋아요된 상태: 빨간색 채움
        <svg
          width={config.svg.width}
          height={config.svg.height}
          viewBox="0 0 18 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415Z"
            fill="#e0004d"
          />
        </svg>
      ) : (
        // 좋아요 안된 상태: 흰색 아웃라인
        <svg
          width={config.svg.width}
          height={config.svg.height}
          viewBox="0 0 18 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.8695 1.96415C17.7545 3.85415 17.8195 6.86415 16.0662 8.82748L8.9995 15.9041L1.9345 8.82748C0.181164 6.86415 0.246997 3.84915 2.13116 1.96415C4.01866 0.0774834 7.03783 0.0141499 9.00116 1.77415C10.9587 0.0166499 13.9837 0.0749834 15.8695 1.96415V1.96415ZM3.31033 3.14332C2.06866 4.38498 2.00616 6.37248 3.15033 7.68582L9.00033 13.545L14.8503 7.68665C15.9953 6.37248 15.9328 4.38748 14.6895 3.14165C13.4503 1.89998 11.4553 1.83998 10.1453 2.98665L6.64366 6.48915L5.4645 5.31082L7.81866 2.95498L7.75033 2.89748C6.43783 1.84332 4.5195 1.93332 3.31033 3.14332V3.14332Z"
            fill="#FFF"
          />
        </svg>
      )}
    </button>
  )
}

