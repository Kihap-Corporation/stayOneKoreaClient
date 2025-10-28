/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 중 두 번 호출 문제 해결을 위해 임시로 비활성화
  // 프로덕션에서는 다시 활성화하는 것을 권장합니다
  reactStrictMode: true,
  eslint: {
    // 빌드 중 ESLint 오류 무시
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
