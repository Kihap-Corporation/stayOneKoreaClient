import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

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
        className={`${inter.variable} ${jetbrainsMono.variable} ${suit.variable} antialiased`}
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
