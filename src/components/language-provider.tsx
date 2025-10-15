"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"

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

// 각 언어의 메시지를 직접 정의
const messagesData = {
  ko: {
    header: {
      search: { placeholder: "한국의 숙소를 찾아보세요" },
      navigation: { stays: "숙박", about: "고시원 소개" }
    },
    footer: {
      company: "스테이원코리아",
      businessNumber: "123-45-67890",
      representative: "김대표",
      mailOrderNumber: "제2024-서울강남-0123호",
      hostingProvider: "AWS",
      customerService: "02-1234-5678",
      inquiryAddress: "서울특별시 강남구 테헤란로 123",
      privacyPolicy: "개인정보처리방침",
      termsOfService: "이용약관",
      aboutGosiwon: "고시원 소개",
      disclaimer: {
        line1: "본 사이트에서 판매되는 상품 중에는 등록된 개별 판매자가 판매하는 상품이 포함되어 있습니다.",
        line2: "개별 판매자 판매 상품의 경우 {companyName}는 통신판매중개자로서 통신판매의 당사자가 아니므로, 개별 판매자가 등록한 상품, 거래정보 및 거래 등에 대해 책임을 지지 않습니다.",
        copyright: "Copyright © 2025 {companyName} All right reserved.",
        contentProtection: "본 사이트의 컨텐츠는 저작권법의 보호를 받는 바 무단 전재, 복사, 배포 등을 금합니다."
      }
    },
    home: {
      title: "한국의 아름다운 숙박시설을 소개하는 플랫폼입니다.",
      subtitle: "전국 각지의 특별한 숙소를 만나보세요.",
      explore: "숙소 둘러보기",
      host: "호스트 등록하기",
      search: { title: "다양한 숙소 검색", description: "지역, 가격, 시설 등 원하시는 조건으로 숙소를 찾아보세요." },
      booking: { title: "안전한 예약 시스템", description: "신뢰할 수 있는 예약 시스템으로 안전하게 숙소를 예약하세요." },
      experience: { title: "특별한 경험", description: "한국의 전통과 현대가 어우러진 특별한 숙박 경험을 제공합니다." }
    },
    account_check: {
      title: "로그인하거나 계정을 생성하세요",
      emailLabel: "이메일",
      emailPlaceholder: "id@email.com",
      continue: "계속하기",
      termsAgreement: "로그인하면 Stay One Korea의",
      termsOfUse: "이용약관",
      privacyPolicy: "개인정보처리방침",
      and: "및",
      agreeToTerms: "에 동의합니다."
    },
    signup: {
      title: "회원 정보를 알려주세요",
      firstName: "이름",
      lastName: "성",
      firstNamePlaceholder: "이름",
      lastNamePlaceholder: "성",
      password: "비밀번호",
      passwordPlaceholder: "비밀번호",
      passwordRule: "비밀번호 규칙",
      phoneNumber: "휴대폰 번호",
      phoneNumberPlaceholder: "휴대폰 번호",
      southKorea: "대한민국",
      usa: "미국",
      consentAll: "다음의 모든 항목에 동의합니다:",
      consentTerms: "이용약관에 동의하며, 만 18세 이상임을 확인합니다.",
      consentPrivacy: "개인정보처리방침에 따라 개인정보의 수집 및 이용에 동의합니다.",
      consentThirdParty: "개인정보처리방침에 따라 국내외 제3자와 개인정보 공유에 동의합니다.",
      termsOfUse: "이용약관",
      privacyPolicy: "개인정보처리방침",
      createAccount: "계정 생성하기",
      termsAgreement: "계정을 생성하면 Stay One Korea의",
      and: "및",
      agreeToTerms: "에 동의합니다."
    },
    verifyEmail: {
      title: "이메일을 확인하세요",
      subtitle: "귀하의 이메일 주소로 인증 이메일을 보냈습니다.",
      description: "계정을 활성화하려면 버튼을 클릭하세요.",
      findStay: "숙소 찾기"
    },
    common: {
      loading: "로딩 중...",
      error: "오류가 발생했습니다",
      success: "성공했습니다",
      cancel: "취소",
      confirm: "확인",
      save: "저장",
      delete: "삭제",
      edit: "편집",
      close: "닫기"
    }
  },
  en: {
    header: {
      search: { placeholder: "Find your stay in Korea" },
      navigation: { stays: "Stays", about: "About Gosiwon" }
    },
    footer: {
      company: "Company Name",
      businessNumber: "Business Registration Number",
      representative: "Representative Name",
      mailOrderNumber: "Mail Order License Number",
      hostingProvider: "Hosting Service Provider",
      customerService: "Customer Service Contact",
      inquiryAddress: "Inquiry Address",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      aboutGosiwon: "About Gosiwon",
      disclaimer: {
        line1: "Some products sold on this site are sold by registered individual sellers.",
        line2: "For products sold by individual sellers, {companyName} is a mail order intermediary and is not a party to the mail order transaction, so we are not responsible for products, transaction information, and transactions registered by individual sellers.",
        copyright: "Copyright © 2025 {companyName} All right reserved.",
        contentProtection: "The content of this site is protected by copyright law and unauthorized reproduction, copying, or distribution is prohibited."
      }
    },
    home: {
      title: "A platform that introduces beautiful accommodations in Korea.",
      subtitle: "Discover special accommodations throughout Korea.",
      explore: "Explore Accommodations",
      host: "Become a Host",
      search: { title: "Diverse Accommodation Search", description: "Find accommodations based on your preferred location, price, and amenities." },
      booking: { title: "Secure Booking System", description: "Book accommodations safely with our reliable booking system." },
      experience: { title: "Special Experience", description: "Experience the perfect blend of Korean tradition and modernity." }
    },
    account_check: {
      title: "Sign in or create an account",
      emailLabel: "Email",
      emailPlaceholder: "id@email.com",
      continue: "Continue",
      termsAgreement: "By signing in, I agree to Stay One Korea's",
      termsOfUse: "Terms of Use",
      privacyPolicy: "Privacy Policy",
      and: "and",
      agreeToTerms: "."
    },
    signup: {
      title: "Tell us your information",
      firstName: "First name",
      lastName: "Last name",
      firstNamePlaceholder: "First name",
      lastNamePlaceholder: "Last name",
      password: "Password",
      passwordPlaceholder: "Password",
      passwordRule: "Password Rule",
      phoneNumber: "Phone number",
      phoneNumberPlaceholder: "Phone number",
      southKorea: "South Korea",
      usa: "USA",
      consentAll: "I consent to all of the following:",
      consentTerms: "I consent to the Terms of use, and confirm that I am 18 years old or older.",
      consentPrivacy: "I consent to the collection and use of my personal information in accordance with the Privacy Policy.",
      consentThirdParty: "I consent to sharing of my personal information with third parties, either in Korea or overseas in accordance with the Privacy Policy.",
      termsOfUse: "Terms of Use",
      privacyPolicy: "Privacy Policy",
      createAccount: "Create an account",
      termsAgreement: "By creating an account, I agree to Stay One Korea's",
      and: "and",
      agreeToTerms: "."
    },
    verifyEmail: {
      title: "Check your inbox",
      subtitle: "We've sent you a verification email to your email address.",
      description: "Click the button to activate your account.",
      findStay: "Find your stay"
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close"
    }
  },
  zh: {
    header: {
      search: { placeholder: "在韩国寻找您的住宿" },
      navigation: { stays: "住宿", about: "关于考試院" }
    },
    footer: {
      company: "公司名称",
      businessNumber: "营业执照号码",
      representative: "代表姓名",
      mailOrderNumber: "邮购申报号码",
      hostingProvider: "托管服务提供商",
      customerService: "客服联系方式",
      inquiryAddress: "咨询地址",
      privacyPolicy: "隐私政策",
      termsOfService: "使用条款",
      aboutGosiwon: "关于考試院",
      disclaimer: {
        line1: "本网站销售的产品中包含注册的个人卖家销售的产品。",
        line2: "对于个人卖家销售的产品，{companyName}作为邮购中介，不是邮购交易的当事人，因此对个人卖家注册的产品、交易信息和交易不承担责任。",
        copyright: "版权所有 © 2025 {companyName}",
        contentProtection: "本网站的内容受版权法保护，禁止未经授权的转载、复制、分发。"
      }
    },
    home: {
      title: "介绍韩国美丽住宿设施的平台。",
      subtitle: "发现全国各地的特色住宿。",
      explore: "浏览住宿",
      host: "成为房东",
      search: { title: "多样化住宿搜索", description: "根据您喜欢的地点、价格和设施找到住宿。" },
      booking: { title: "安全的预订系统", description: "通过我们可靠的预订系统安全地预订住宿。" },
      experience: { title: "特别体验", description: "体验韩国传统与现代完美融合的住宿体验。" }
    },
    account_check: {
      title: "登录或创建账户",
      emailLabel: "邮箱",
      emailPlaceholder: "id@email.com",
      continue: "继续",
      termsAgreement: "登录即表示我同意 Stay One Korea 的",
      termsOfUse: "使用条款",
      privacyPolicy: "隐私政策",
      and: "和",
      agreeToTerms: "。"
    },
    signup: {
      title: "请告诉我们您的信息",
      firstName: "名",
      lastName: "姓",
      firstNamePlaceholder: "名",
      lastNamePlaceholder: "姓",
      password: "密码",
      passwordPlaceholder: "密码",
      passwordRule: "密码规则",
      phoneNumber: "手机号码",
      phoneNumberPlaceholder: "手机号码",
      southKorea: "韩国",
      usa: "美国",
      consentAll: "我同意以下所有内容：",
      consentTerms: "我同意使用条款，并确认我已满18岁。",
      consentPrivacy: "我同意根据隐私政策收集和使用我的个人信息。",
      consentThirdParty: "我同意根据隐私政策与韩国境内外的第三方共享我的个人信息。",
      termsOfUse: "使用条款",
      privacyPolicy: "隐私政策",
      createAccount: "创建账户",
      termsAgreement: "创建账户即表示我同意 Stay One Korea 的",
      and: "和",
      agreeToTerms: "。"
    },
    verifyEmail: {
      title: "检查您的收件箱",
      subtitle: "我们已向您的邮箱发送了验证邮件。",
      description: "点击按钮激活您的账户。",
      findStay: "寻找住宿"
    },
    common: {
      loading: "加载中...",
      error: "发生错误",
      success: "成功",
      cancel: "取消",
      confirm: "确认",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      close: "关闭"
    }
  },
  fr: {
    header: {
      search: { placeholder: "Trouvez votre séjour en Corée" },
      navigation: { stays: "Séjours", about: "À propos de Gosiwon" }
    },
    footer: {
      company: "Nom de l'entreprise",
      businessNumber: "Numéro d'enregistrement d'entreprise",
      representative: "Nom du représentant",
      mailOrderNumber: "Numéro de déclaration de vente par correspondance",
      hostingProvider: "Fournisseur de services d'hébergement",
      customerService: "Contact du service client",
      inquiryAddress: "Adresse de demande",
      privacyPolicy: "Politique de confidentialité",
      termsOfService: "Conditions d'utilisation",
      aboutGosiwon: "À propos de Gosiwon",
      disclaimer: {
        line1: "Parmi les produits vendus sur ce site, certains sont vendus par des vendeurs individuels enregistrés.",
        line2: "Pour les produits vendus par des vendeurs individuels, {companyName} agit en tant qu'intermédiaire de vente par correspondance et n'est pas partie prenante de la transaction de vente par correspondance, donc nous ne sommes pas responsables des produits, informations de transaction et transactions enregistrés par les vendeurs individuels.",
        copyright: "Copyright © 2025 {companyName} Tous droits réservés.",
        contentProtection: "Le contenu de ce site est protégé par la loi sur le droit d'auteur et la reproduction, copie ou distribution non autorisée est interdite."
      }
    },
    home: {
      title: "Une plateforme qui présente de belles installations d'hébergement en Corée.",
      subtitle: "Découvrez des hébergements spéciaux dans tout le pays.",
      explore: "Explorer les hébergements",
      host: "Devenir hôte",
      search: { title: "Recherche d'hébergement diversifiée", description: "Trouvez des hébergements selon votre lieu, prix et équipements préférés." },
      booking: { title: "Système de réservation sécurisé", description: "Réservez des hébergements en toute sécurité avec notre système de réservation fiable." },
      experience: { title: "Expérience spéciale", description: "Vivez l'expérience parfaite du mélange de la tradition et de la modernité coréennes." }
    },
    account_check: {
      title: "Se connecter ou créer un compte",
      emailLabel: "Email",
      emailPlaceholder: "id@email.com",
      continue: "Continuer",
      termsAgreement: "En me connectant, j'accepte les",
      termsOfUse: "Conditions d'utilisation",
      privacyPolicy: "Politique de confidentialité",
      and: "et",
      agreeToTerms: "de Stay One Korea."
    },
    signup: {
      title: "Dites-nous vos informations",
      firstName: "Prénom",
      lastName: "Nom de famille",
      firstNamePlaceholder: "Prénom",
      lastNamePlaceholder: "Nom de famille",
      password: "Mot de passe",
      passwordPlaceholder: "Mot de passe",
      passwordRule: "Règle de mot de passe",
      phoneNumber: "Numéro de téléphone",
      phoneNumberPlaceholder: "Numéro de téléphone",
      southKorea: "Corée du Sud",
      usa: "États-Unis",
      consentAll: "J'accepte tous les éléments suivants :",
      consentTerms: "J'accepte les Conditions d'utilisation et confirme que j'ai 18 ans ou plus.",
      consentPrivacy: "J'accepte la collecte et l'utilisation de mes informations personnelles conformément à la Politique de confidentialité.",
      consentThirdParty: "J'accepte le partage de mes informations personnelles avec des tiers, en Corée ou à l'étranger, conformément à la Politique de confidentialité.",
      termsOfUse: "Conditions d'utilisation",
      privacyPolicy: "Politique de confidentialité",
      createAccount: "Créer un compte",
      termsAgreement: "En créant un compte, j'accepte les",
      and: "et",
      agreeToTerms: "de Stay One Korea."
    },
    verifyEmail: {
      title: "Vérifiez votre boîte de réception",
      subtitle: "Nous vous avons envoyé un e-mail de vérification à votre adresse e-mail.",
      description: "Cliquez sur le bouton pour activer votre compte.",
      findStay: "Trouvez votre séjour"
    },
    common: {
      loading: "Chargement...",
      error: "Une erreur s'est produite",
      success: "Succès",
      cancel: "Annuler",
      confirm: "Confirmer",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      close: "Fermer"
    }
  }
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

  // 언어 변경 시 메시지 업데이트, 브라우저 lang 속성 변경, localStorage 저장
  const handleLanguageChange = (language: typeof languages[number]) => {
    setCurrentLanguage(language)
    document.documentElement.lang = language.code
    setMessages(messagesData[language.code as keyof typeof messagesData])
    setPhoneFormat(phoneFormats[language.code as keyof typeof phoneFormats])

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
