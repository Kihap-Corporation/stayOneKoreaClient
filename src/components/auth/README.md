# 로그인 필요 모달 사용 가이드

## 개요

로그인이 필요한 기능을 사용할 때, 사용자에게 로그인을 안내하고 로그인 후 원래 페이지로 돌아올 수 있도록 하는 재사용 가능한 컴포넌트와 훅입니다.

## 사용 방법

### 1. 기본 사용법

```tsx
import { useLoginRequired } from "@/hooks/useLoginRequired"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"

function YourComponent() {
  const { isModalOpen, modalMessage, returnUrl, requireLogin, closeModal } = useLoginRequired()

  const handleSaveClick = () => {
    requireLogin(() => {
      // 로그인이 확인된 후 실행할 코드
      console.log('저장 기능 실행')
      // API 호출 등...
    })
  }

  return (
    <>
      <button onClick={handleSaveClick}>
        저장하기
      </button>

      <LoginRequiredModal
        isOpen={isModalOpen}
        onClose={closeModal}
        message={modalMessage}
        returnUrl={returnUrl}
      />
    </>
  )
}
```

### 2. 커스텀 메시지 사용

```tsx
const handleReserveClick = () => {
  requireLogin(
    () => {
      // 예약 로직
      handleReservation()
    },
    "예약을 진행하려면 로그인이 필요합니다." // 커스텀 메시지
  )
}
```

### 3. 커스텀 리턴 URL 사용

```tsx
const handleLikeClick = () => {
  requireLogin(
    () => {
      // 좋아요 로직
      toggleLike()
    },
    "좋아요 기능을 사용하려면 로그인이 필요합니다.",
    "/room/123" // 커스텀 리턴 URL
  )
}
```

## API 참조

### useLoginRequired Hook

#### 반환값

- `isModalOpen: boolean` - 모달 표시 여부
- `modalMessage: string | undefined` - 모달에 표시할 메시지
- `returnUrl: string | undefined` - 로그인 후 돌아올 URL
- `requireLogin: (action, message?, customReturnUrl?) => void` - 로그인 확인 함수
- `closeModal: () => void` - 모달 닫기 함수

#### requireLogin 함수 파라미터

1. `action: () => void` - 로그인이 확인된 후 실행할 함수 (필수)
2. `message?: string` - 커스텀 메시지 (선택)
3. `customReturnUrl?: string` - 커스텀 리턴 URL (선택, 기본값: 현재 페이지)

### LoginRequiredModal Component

#### Props

- `isOpen: boolean` - 모달 표시 여부 (필수)
- `onClose: () => void` - 모달 닫기 콜백 (필수)
- `message?: string` - 커스텀 메시지 (선택)
- `returnUrl?: string` - 로그인 후 돌아올 URL (선택)

## 실제 사용 예시

### 예시 1: 좋아요 버튼

```tsx
"use client"

import { useLoginRequired } from "@/hooks/useLoginRequired"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"
import { apiPost } from "@/lib/api"

export function LikeButton({ roomId }: { roomId: string }) {
  const { isModalOpen, requireLogin, closeModal } = useLoginRequired()
  const [isLiked, setIsLiked] = useState(false)

  const handleLikeClick = () => {
    requireLogin(async () => {
      // 로그인된 사용자만 실행됨
      const response = await apiPost(`/api/user/like?roomIdentifier=${roomId}`)
      if (response.code === 200) {
        setIsLiked(!isLiked)
      }
    })
  }

  return (
    <>
      <button onClick={handleLikeClick}>
        {isLiked ? '❤️' : '🤍'}
      </button>

      <LoginRequiredModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}
```

### 예시 2: 예약 버튼

```tsx
"use client"

import { useLoginRequired } from "@/hooks/useLoginRequired"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"

export function ReservationButton({ onReserve }: { onReserve: () => void }) {
  const { isModalOpen, requireLogin, closeModal } = useLoginRequired()

  const handleReserveClick = () => {
    requireLogin(
      onReserve,
      "예약을 진행하려면 로그인이 필요합니다."
    )
  }

  return (
    <>
      <button onClick={handleReserveClick}>
        예약하기
      </button>

      <LoginRequiredModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}
```

## 로그인 흐름

1. 사용자가 로그인이 필요한 버튼 클릭
2. `requireLogin` 함수가 로그인 상태 확인 (localStorage)
3. 로그인 안 되어 있으면:
   - 로그인 필요 모달 표시
   - 사용자가 "로그인하러 가기" 클릭
   - `/signin?redirect={현재페이지URL}` 로 이동
4. 사용자가 로그인 완료
5. 원래 페이지로 자동 리다이렉트
6. 사용자가 의도한 작업 수행 가능

## 주의사항

- 로그인 상태는 `localStorage`의 `isLoggedIn` 값으로 확인합니다
- 실제 인증은 서버에서 처리되므로, 이 컴포넌트는 UX 개선을 위한 것입니다
- `returnUrl`이 지정되지 않으면 현재 페이지 URL이 자동으로 사용됩니다

