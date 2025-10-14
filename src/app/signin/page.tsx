"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign in submitted:", { email, password })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[600px]">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-semibold text-center mb-8 text-balance">Sign in</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-normal">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="id@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-normal">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-full h-12 text-base font-medium"
              >
                Continue
              </Button>

              <p className="text-xs text-center text-gray-500 leading-relaxed">
                By signing in, I agree to Stay One Korea's{" "}
                <Link href="#" className="text-gray-600 underline hover:text-gray-900">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-gray-600 underline hover:text-gray-900">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
