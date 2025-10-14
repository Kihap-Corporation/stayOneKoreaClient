"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {Header} from "@/components/header"
import {Footer} from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"

export default function SignupPage() {
  const { messages, phoneFormat } = useLanguage()
  const searchParams = useSearchParams()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [consentAll, setConsentAll] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentThirdParty, setConsentThirdParty] = useState(false)

  // URL 파라미터에서 이메일 읽어오기
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleConsentAllChange = (checked: boolean) => {
    setConsentAll(checked)
    setConsentTerms(checked)
    setConsentPrivacy(checked)
    setConsentThirdParty(checked)
  }

  const handleIndividualConsentChange = () => {
    if (consentTerms && consentPrivacy && consentThirdParty) {
      setConsentAll(true)
    } else {
      setConsentAll(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      consentTerms,
      consentPrivacy,
      consentThirdParty,
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-[600px] rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-center text-2xl font-semibold">{messages?.signup?.title || "Tell us your information"}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  {messages?.signup?.firstName || "First name"} <span className="text-primary">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={messages?.signup?.firstNamePlaceholder || "First name"}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="rounded-lg border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  {messages?.signup?.lastName || "Last name"} <span className="text-primary">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={messages?.signup?.lastNamePlaceholder || "Last name"}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="rounded-lg border-gray-300"
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {messages?.signup?.email || "Email"} <span className="text-primary">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={messages?.signup?.emailPlaceholder || "id@email.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border-gray-300"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {messages?.signup?.password || "Password"} <span className="text-primary">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={messages?.signup?.passwordPlaceholder || "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border-gray-300"
              />
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>ⓘ {messages?.signup?.passwordRule || "Password Rule"}</span>
              </div>
            </div>

            {/* Phone number field */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                {messages?.signup?.phoneNumber || "Phone number"} <span className="text-primary">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 min-w-[100px]">
                  {phoneFormat.flag} {phoneFormat.countryCode}
                </div>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={messages?.signup?.phoneNumberPlaceholder || phoneFormat.placeholder}
                  value={phoneNumber}
                  onChange={(e) => {
                    // 각 나라별 전화번호 형식으로 자동 포맷팅
                    const formattedValue = phoneFormat.format(e.target.value)
                    setPhoneNumber(formattedValue)
                  }}
                  required
                  className="flex-1 rounded-lg border-gray-300"
                  maxLength={phoneFormat.maxLength}
                />
              </div>
            </div>

            {/* Consent checkboxes */}
            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consentAll"
                  checked={consentAll}
                  onCheckedChange={handleConsentAllChange}
                  className="mt-0.5"
                />
                <Label htmlFor="consentAll" className="cursor-pointer text-sm font-medium leading-relaxed">
                  {messages?.signup?.consentAll || "I consent to all of the following:"}
                </Label>
              </div>

              <div className="ml-6 space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consentTerms"
                    checked={consentTerms}
                    onCheckedChange={(checked) => {
                      setConsentTerms(checked as boolean)
                      handleIndividualConsentChange()
                    }}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consentTerms" className="cursor-pointer text-sm leading-relaxed text-gray-700">
                    {messages?.signup?.consentTerms ? messages.signup.consentTerms.replace("Terms of use", messages.signup.termsOfUse || "Terms of Use") : "I consent to the Terms of use, and confirm that I am 18 years old or older."}
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consentPrivacy"
                    checked={consentPrivacy}
                    onCheckedChange={(checked) => {
                      setConsentPrivacy(checked as boolean)
                      handleIndividualConsentChange()
                    }}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consentPrivacy" className="cursor-pointer text-sm leading-relaxed text-gray-700">
                    {messages?.signup?.consentPrivacy ? messages.signup.consentPrivacy.replace("Privacy Policy", messages.signup.privacyPolicy || "Privacy Policy") : "I consent to the collection and use of my personal information in accordance with the Privacy Policy."}
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consentThirdParty"
                    checked={consentThirdParty}
                    onCheckedChange={(checked) => {
                      setConsentThirdParty(checked as boolean)
                      handleIndividualConsentChange()
                    }}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consentThirdParty" className="cursor-pointer text-sm leading-relaxed text-gray-700">
                    {messages?.signup?.consentThirdParty ? messages.signup.consentThirdParty.replace("Privacy Policy", messages.signup.privacyPolicy || "Privacy Policy") : "I consent to sharing of my personal information with third parties, either in Korea or overseas in accordance with the Privacy Policy."}
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-[#E91E63] text-base font-medium text-white hover:bg-[#E91E63]/90"
            >
              {messages?.signup?.createAccount || "Create an account"}
            </Button>

            {/* Terms text */}
            <p className="text-center text-xs text-gray-500">
              {messages?.signup?.termsAgreement || "By creating an account, I agree to Stay One Korea's"}{" "}
              <a href="#" className="text-gray-600 underline hover:no-underline">
                {messages?.signup?.termsOfUse || "Terms of Use"}
              </a>{" "}
              {messages?.signup?.and || "and"}{" "}
              <a href="#" className="text-gray-600 underline hover:no-underline">
                {messages?.signup?.privacyPolicy || "Privacy Policy"}
              </a>
              {messages?.signup?.agreeToTerms || "."}
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
