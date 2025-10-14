# Stay One Korea

한국의 아름다운 숙박시설을 소개하는 플랫폼입니다. 전국 각지의 특별한 숙소를 만나보세요.

## 🚀 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Font**: Pretendard (한국어 웹 폰트)
- **Icons**: Lucide React
- **UI Components**: Radix UI + Custom Components
- **Linting**: ESLint

## 📦 주요 라이브러리

- `clsx` - 조건부 클래스명 관리
- `class-variance-authority` - 컴포넌트 변형 관리
- `lucide-react` - 아이콘 라이브러리
- `@radix-ui/react-slot` - 컴포넌트 슬롯 기능

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn 또는 pnpm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린팅 실행
npm run lint
```

개발 서버가 시작되면 [http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── components/            # 재사용 컴포넌트
│   └── ui/               # UI 컴포넌트들
│       └── button.tsx    # 버튼 컴포넌트
├── lib/                  # 유틸리티 함수들
│   └── utils.ts         # 공통 유틸리티
├── types/               # TypeScript 타입 정의
│   └── index.ts        # 기본 타입들
└── utils/              # 추가 유틸리티 함수들
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: Blue (#2563eb)
- **Secondary**: Gray (#f1f5f9)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### 타이포그래피

- **Font Family**: Pretendard Variable
- **Fallback**: system-ui, -apple-system, BlinkMacSystemFont

### 다크 모드 지원

자동으로 시스템 설정에 따라 라이트/다크 모드를 전환합니다.

## 🔧 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

주요 환경 변수:
- `DATABASE_URL` - 데이터베이스 연결 URL
- `NEXTAUTH_SECRET` - NextAuth 인증 시크릿
- `API_BASE_URL` - 외부 API 베이스 URL

## 🚢 배포

### Vercel (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 기타 플랫폼

다른 플랫폼에 배포할 경우 `npm run build`로 빌드 후 생성된 `.next` 폴더를 배포하세요.

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs) - Next.js 기능 및 API 학습
- [Tailwind CSS 문서](https://tailwindcss.com/docs) - 스타일링 가이드
- [TypeScript 문서](https://www.typescriptlang.org/docs/) - 타입 정의 가이드
- [Radix UI 문서](https://www.radix-ui.com/) - 접근성 있는 컴포넌트 가이드

## 🤝 기여 방법

1. 이 저장소를 포크하세요
2. 새로운 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

**즐거운 코딩 되세요! 🎉**
