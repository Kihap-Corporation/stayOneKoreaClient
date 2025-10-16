"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { setGlobalMessages } from "@/lib/api"
import koMessages from "@/messages/ko"
import enMessages from "@/messages/en"
import frMessages from "@/messages/fr"
import zhMessages from "@/messages/zh"

export const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
] as const

// 언어 상태를 관리하는 Context
interface LanguageContextType {
  currentLanguage: typeof languages[number]
  setCurrentLanguage: (language: typeof languages[number]) => void
  currentCurrency: typeof currencies[number]
  setCurrentCurrency: (currency: typeof currencies[number]) => void
  messages: any
  setMessages: (messages: any) => void
  phoneFormat: typeof phoneFormats.ko
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 메시지 파일들을 객체로 구성
const messagesData = {
  ko: koMessages,
  en: enMessages,
  zh: zhMessages,
  fr: frMessages
}

interface LanguageProviderProps {
  children: ReactNode
}

// 각 언어별 전화번호 포맷 정의
const phoneFormats = {
  ko: {
    countryCode: '+82',
    flag: '🇰🇷',
    placeholder: '010-1234-5678',
    format: (value: string) => {
      const digits = value.replace(/[^\d]/g, '')
      if (digits.length <= 3) return digits
      if (digits.length <= 7) return digits.slice(0, 3) + '-' + digits.slice(3)
      return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7, 11)
    },
    maxLength: 13
  },
  en: {
    countryCode: '+1',
    flag: '🇺🇸',
    placeholder: '(123) 456-7890',
    format: (value: string) => {
      const digits = value.replace(/[^\d]/g, '')
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3)
      return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6, 10)
    },
    maxLength: 14
  },
  zh: {
    countryCode: '+86',
    flag: '🇨🇳',
    placeholder: '138 0013 8000',
    format: (value: string) => {
      const digits = value.replace(/[^\d]/g, '')
      if (digits.length <= 3) return digits
      if (digits.length <= 7) return digits.slice(0, 3) + ' ' + digits.slice(3)
      return digits.slice(0, 3) + ' ' + digits.slice(3, 7) + ' ' + digits.slice(7, 11)
    },
    maxLength: 13
  },
  fr: {
    countryCode: '+33',
    flag: '🇫🇷',
    placeholder: '06 12 34 56 78',
    format: (value: string) => {
      const digits = value.replace(/[^\d]/g, '')
      if (digits.length <= 2) return digits
      if (digits.length <= 4) return digits.slice(0, 2) + ' ' + digits.slice(2)
      if (digits.length <= 6) return digits.slice(0, 2) + ' ' + digits.slice(2, 4) + ' ' + digits.slice(4)
      if (digits.length <= 8) return digits.slice(0, 2) + ' ' + digits.slice(2, 4) + ' ' + digits.slice(4, 6) + ' ' + digits.slice(6)
      return digits.slice(0, 2) + ' ' + digits.slice(2, 4) + ' ' + digits.slice(4, 6) + ' ' + digits.slice(6, 8) + ' ' + digits.slice(8, 10)
    },
    maxLength: 14
  }
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // 서버와 클라이언트 모두에서 동일한 초기값 사용 (hydration 불일치 방지)
  const [currentLanguage, setCurrentLanguage] = useState<typeof languages[number]>(languages[0]) // 항상 한국어로 시작
  const [currentCurrency, setCurrentCurrency] = useState<typeof currencies[number]>(currencies[1]) // 항상 KRW로 시작
  const [messages, setMessages] = useState<any>(messagesData.ko) // 항상 한국어 메시지로 시작
  const [phoneFormat, setPhoneFormat] = useState(phoneFormats.ko) // 항상 한국 전화번호 포맷으로 시작

  // 클라이언트 사이드에서 localStorage 값 불러와서 업데이트
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    const savedCurrency = localStorage.getItem('selectedCurrency')

    let newLanguage: typeof languages[number] = languages[0] // 기본값
    let newCurrency: typeof currencies[number] = currencies[1] // 기본값

    if (savedLanguage) {
      const found = languages.find(lang => lang.code === savedLanguage)
      if (found) {
        newLanguage = found
      }
    }

    if (savedCurrency) {
      const found = currencies.find(curr => curr.code === savedCurrency)
      if (found) {
        newCurrency = found
      }
    }

    // 저장된 값으로 상태 업데이트
    if (newLanguage.code !== currentLanguage.code) {
      setCurrentLanguage(newLanguage)
      setMessages(messagesData[newLanguage.code as keyof typeof messagesData])
      setPhoneFormat(phoneFormats[newLanguage.code as keyof typeof phoneFormats])
    }

    if (newCurrency.code !== currentCurrency.code) {
      setCurrentCurrency(newCurrency)
    }
  }, [])

  // HTML lang 속성 설정 (클라이언트 사이드에서만)
  useEffect(() => {
    document.documentElement.lang = currentLanguage.code
  }, [currentLanguage])

  // 초기 메시지 설정
  useEffect(() => {
    setGlobalMessages(messages)
  }, [messages])

  // 언어 변경 시 메시지 업데이트, 브라우저 lang 속성 변경, localStorage 저장
  const handleLanguageChange = (language: typeof languages[number]) => {
    setCurrentLanguage(language)
    document.documentElement.lang = language.code
    const newMessages = messagesData[language.code as keyof typeof messagesData]
    setMessages(newMessages)
    setPhoneFormat(phoneFormats[language.code as keyof typeof phoneFormats])

    // API 유틸리티에 메시지 설정
    setGlobalMessages(newMessages)

    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', language.code)
    }
  }

  const handleCurrencyChange = (currency: typeof currencies[number]) => {
    setCurrentCurrency(currency)

    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', currency.code)
    }
  }

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setCurrentLanguage: handleLanguageChange,
      currentCurrency,
      setCurrentCurrency: handleCurrencyChange,
      messages,
      setMessages,
      phoneFormat
    }}>
      {children}
    </LanguageContext.Provider>
  )
}
