/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Windows 파일 시스템 에러 방지
  experimental: {
    // Turbopack 최적화 (dev 명령에서 --turbo 사용 시)
    turbo: {
      resolveAlias: {
        // 별칭 최적화
      },
    },
  },
  
  // 웹팩 설정 (Turbopack 사용하지 않을 때)
  webpack: (config, { isServer }) => {
    // Windows에서 파일 감시 최적화
    config.watchOptions = {
      poll: 1000, // 1초마다 폴링
      aggregateTimeout: 300,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.git/**',
      ],
    };
    
    return config;
  },
};

module.exports = nextConfig;
