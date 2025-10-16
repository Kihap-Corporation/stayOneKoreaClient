"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { useRouter } from "next/navigation"

export default function AccessDeniedPage() {
  const { messages } = useLanguage()
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[600px]">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {messages?.error?.accessDenied || "Access Denied"}
              </h1>
              <p className="text-gray-600">
                {messages?.error?.accessDeniedDescription || "You do not have permission to access this page."}
              </p>
            </div>

            <Button
              onClick={handleGoHome}
              className="bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full h-12 px-8"
            >
              {messages?.error?.goHome || "Go Home"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
