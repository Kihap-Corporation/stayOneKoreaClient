import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google"; // 빌드 시 네트워크 문제로 임시 주석 처리
import { LanguageProvider } from "@/components/language-provider";
import { Toaster } from "sonner";
import "./globals.css";

// Google Fonts 임시 비활성화 - 빌드 시 네트워크 문제 방지
// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   display: "swap",
//   preload: false,
// });

// const jetbrainsMono = JetBrains_Mono({
//   variable: "--font-jetbrains-mono",
//   subsets: ["latin"],
//   display: "swap",
//   preload: false,
// });

// SUIT Variable 폰트 설정
const suit = {
  variable: "--font-suit",
  style: {
    fontFamily: "'SUIT Variable', sans-serif",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL('https://stayonekorea.com'),
  title: {
    default: "Stay One Korea - Find Your Perfect Stay in Korea",
    template: "%s | Stay One Korea"
  },
  description: "Discover beautiful accommodations across Korea. Book goshiwon, studios, and apartments with ease. Find your perfect stay with verified hosts and competitive prices.",
  keywords: ["Korea accommodation", "goshiwon", "stay in Korea", "Korean housing", "Seoul accommodation", "short term rental", "student housing"],
  authors: [{ name: "Stay One Korea" }],
  creator: "Stay One Korea",
  publisher: "Stay One Korea",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/sok_logo.ico",
    shortcut: "/sok_logo.ico",
    apple: "/sok_logo.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://stayonekorea.com",
    title: "Stay One Korea - Find Your Perfect Stay in Korea",
    description: "Discover beautiful accommodations across Korea. Book goshiwon, studios, and apartments with ease.",
    siteName: "Stay One Korea",
    images: [
      {
        url: "/sok-og.png",
        width: 1200,
        height: 630,
        alt: "Stay One Korea - Korean Accommodation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stay One Korea - Find Your Perfect Stay in Korea",
    description: "Discover beautiful accommodations across Korea. Book goshiwon, studios, and apartments with ease.",
    images: ["/sok-og.png"],
    creator: "@stayonekorea",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Stay One Korea",
    "url": "https://stayonekorea.com",
    "logo": "https://stayonekorea.com/icons/sok_logo.png",
    "description": "A platform that introduces beautiful accommodations in Korea",
    "sameAs": [
      "https://facebook.com/stayonekorea",
      "https://twitter.com/stayonekorea",
      "https://instagram.com/stayonekorea"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "stayonekoreaofficial@gmail.com",
      "contactType": "customer service",
      "availableLanguage": ["Korean", "English", "Chinese", "French"]
    }
  };

  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body
        className={`${suit.variable} antialiased`}
        style={{ fontFamily: "'SUIT Variable', sans-serif" }}
      >
        <LanguageProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
