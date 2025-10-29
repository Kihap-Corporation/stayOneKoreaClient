# 환경변수 설정 가이드

## .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경변수를 추가하세요.

```bash
# Backend API Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:8080

# Portone V2 Settings (Portone 콘솔에서 발급 필요)
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxxxx-xxxxx
NEXT_PUBLIC_PORTONE_EXIMBAY_CHANNEL_KEY=channel-key-xxxxx-xxxxx

# Payment Redirect URLs (결제 완료/취소/실패 후 이동)
NEXT_PUBLIC_PAYMENT_RETURN_URL=http://localhost:3000/bookings/{reservationId}
NEXT_PUBLIC_PAYMENT_CANCEL_URL=http://localhost:3000/reservation/{reservationId}?status=cancelled
NEXT_PUBLIC_PAYMENT_FAIL_URL=http://localhost:3000/payment-dy/{reservationId}?status=failed
```

## Portone 콘솔에서 필요한 값 가져오기

1. **Store ID** (`NEXT_PUBLIC_PORTONE_STORE_ID`)

   - Portone 콘솔 → 내 식별코드 → Store ID
   - 공개값이므로 프론트엔드에서 사용 가능

2. **Channel Key** (`NEXT_PUBLIC_PORTONE_EXIMBAY_CHANNEL_KEY`)

   - Portone 콘솔 → 연동 정보 → 엑심베이 채널 연동
   - 채널 연동 완료 후 생성된 채널 키
   - 공개값이므로 프론트엔드에서 사용 가능

3. **API Secret** (백엔드 전용)
   - Portone 콘솔 → 내 식별코드 → API Keys → V2 Secret
   - **절대 프론트엔드에서 사용하지 마세요!**
   - 백엔드 서버 환경변수에서만 사용

## 중요 사항

- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- 프로덕션 배포 시 Vercel 등의 환경변수 설정에서도 동일한 값들을 설정해야 합니다.
- `channelKey`는 환경변수로 관리할 수도 있고, 코드에 직접 하드코딩할 수도 있습니다.
  - 환경변수 사용을 권장합니다 (설정 관리의 일관성)
