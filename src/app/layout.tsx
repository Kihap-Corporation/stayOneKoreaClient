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
  title: "Stay One Korea",
  description: "A platform that introduces beautiful accommodations in Korea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
          rel="stylesheet"
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
