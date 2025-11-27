/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Static export 명시적으로 비활성화
  output: undefined,

  // Export 관련 설정
  trailingSlash: false,

  // 빌드 출력 디렉토리
  distDir: '.next',

  // 서버 설정
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},

  // 이미지 설정
  images: {
    unoptimized: false, // static export에서는 true로 설정해야 하지만, SSR에서는 false
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3845',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // 한국 서비스들
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.naverusercontent.com',
        port: '',
        pathname: '/**',
      },
      // AWS S3나 다른 CDN들
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      // Cloudflare R2
      {
        protocol: 'https',
        hostname: 'img.stayonekorea.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Windows 파일 시스템 에러 방지
  experimental: {
    // Turbopack 최적화 (dev 명령에서 --turbo 사용 시)
    turbo: {
      resolveAlias: {
        // 별칭 최적화
      },
    },
    // Google Fonts 로딩 비활성화 (빌드 시 네트워크 문제 방지)
    disableOptimizedLoading: true,
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
