"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"
import { apiPost } from "@/lib/api"
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

// useSearchParams를 사용하므로 동적 렌더링 강제
export const dynamic = 'force-dynamic'

// 전 세계 주요 국가 목록 (국기 이모지 포함, 알파벳순 정렬)
const countryOptions = [
  { value: 'AF', label: 'Afghanistan 🇦🇫' },
  { value: 'AL', label: 'Albania 🇦🇱' },
  { value: 'DZ', label: 'Algeria 🇩🇿' },
  { value: 'AS', label: 'American Samoa 🇦🇸' },
  { value: 'AD', label: 'Andorra 🇦🇩' },
  { value: 'AO', label: 'Angola 🇦🇴' },
  { value: 'AI', label: 'Anguilla 🇦🇮' },
  { value: 'AQ', label: 'Antarctica 🇦🇶' },
  { value: 'AG', label: 'Antigua and Barbuda 🇦🇬' },
  { value: 'AR', label: 'Argentina 🇦🇷' },
  { value: 'AM', label: 'Armenia 🇦🇲' },
  { value: 'AW', label: 'Aruba 🇦🇼' },
  { value: 'AU', label: 'Australia 🇦🇺' },
  { value: 'AT', label: 'Austria 🇦🇹' },
  { value: 'AZ', label: 'Azerbaijan 🇦🇿' },
  { value: 'BS', label: 'Bahamas 🇧🇸' },
  { value: 'BH', label: 'Bahrain 🇧🇭' },
  { value: 'BD', label: 'Bangladesh 🇧🇩' },
  { value: 'BB', label: 'Barbados 🇧🇧' },
  { value: 'BY', label: 'Belarus 🇧🇾' },
  { value: 'BE', label: 'Belgium 🇧🇪' },
  { value: 'BZ', label: 'Belize 🇧🇿' },
  { value: 'BJ', label: 'Benin 🇧🇯' },
  { value: 'BM', label: 'Bermuda 🇧🇲' },
  { value: 'BT', label: 'Bhutan 🇧🇹' },
  { value: 'BO', label: 'Bolivia 🇧🇴' },
  { value: 'BA', label: 'Bosnia and Herzegovina 🇧🇦' },
  { value: 'BW', label: 'Botswana 🇧🇼' },
  { value: 'BV', label: 'Bouvet Island 🇧🇻' },
  { value: 'BR', label: 'Brazil 🇧🇷' },
  { value: 'IO', label: 'British Indian Ocean Territory 🇮🇴' },
  { value: 'BN', label: 'Brunei 🇧🇳' },
  { value: 'BG', label: 'Bulgaria 🇧🇬' },
  { value: 'BF', label: 'Burkina Faso 🇧🇫' },
  { value: 'BI', label: 'Burundi 🇧🇮' },
  { value: 'KH', label: 'Cambodia 🇰🇭' },
  { value: 'CM', label: 'Cameroon 🇨🇲' },
  { value: 'CA', label: 'Canada 🇨🇦' },
  { value: 'CV', label: 'Cape Verde 🇨🇻' },
  { value: 'KY', label: 'Cayman Islands 🇰🇾' },
  { value: 'CF', label: 'Central African Republic 🇨🇫' },
  { value: 'TD', label: 'Chad 🇹🇩' },
  { value: 'CL', label: 'Chile 🇨🇱' },
  { value: 'CN', label: 'China 🇨🇳' },
  { value: 'CX', label: 'Christmas Island 🇨🇽' },
  { value: 'CC', label: 'Cocos (Keeling) Islands 🇨🇨' },
  { value: 'CO', label: 'Colombia 🇨🇴' },
  { value: 'KM', label: 'Comoros 🇰🇲' },
  { value: 'CG', label: 'Congo 🇨🇬' },
  { value: 'CD', label: 'Congo, Democratic Republic 🇨🇩' },
  { value: 'CK', label: 'Cook Islands 🇨🇰' },
  { value: 'CR', label: 'Costa Rica 🇨🇷' },
  { value: 'CI', label: 'Côte d\'Ivoire 🇨🇮' },
  { value: 'HR', label: 'Croatia 🇭🇷' },
  { value: 'CU', label: 'Cuba 🇨🇺' },
  { value: 'CY', label: 'Cyprus 🇨🇾' },
  { value: 'CZ', label: 'Czech Republic 🇨🇿' },
  { value: 'DK', label: 'Denmark 🇩🇰' },
  { value: 'DJ', label: 'Djibouti 🇩🇯' },
  { value: 'DM', label: 'Dominica 🇩🇲' },
  { value: 'DO', label: 'Dominican Republic 🇩🇴' },
  { value: 'EC', label: 'Ecuador 🇪🇨' },
  { value: 'EG', label: 'Egypt 🇪🇬' },
  { value: 'SV', label: 'El Salvador 🇸🇻' },
  { value: 'GQ', label: 'Equatorial Guinea 🇬🇶' },
  { value: 'ER', label: 'Eritrea 🇪🇷' },
  { value: 'EE', label: 'Estonia 🇪🇪' },
  { value: 'ET', label: 'Ethiopia 🇪🇹' },
  { value: 'FK', label: 'Falkland Islands 🇫🇰' },
  { value: 'FO', label: 'Faroe Islands 🇫🇴' },
  { value: 'FJ', label: 'Fiji 🇫🇯' },
  { value: 'FI', label: 'Finland 🇫🇮' },
  { value: 'FR', label: 'France 🇫🇷' },
  { value: 'GF', label: 'French Guiana 🇬🇫' },
  { value: 'PF', label: 'French Polynesia 🇵🇫' },
  { value: 'TF', label: 'French Southern Territories 🇹🇫' },
  { value: 'GA', label: 'Gabon 🇬🇦' },
  { value: 'GM', label: 'Gambia 🇬🇲' },
  { value: 'GE', label: 'Georgia 🇬🇪' },
  { value: 'DE', label: 'Germany 🇩🇪' },
  { value: 'GH', label: 'Ghana 🇬🇭' },
  { value: 'GI', label: 'Gibraltar 🇬🇮' },
  { value: 'GR', label: 'Greece 🇬🇷' },
  { value: 'GL', label: 'Greenland 🇬🇱' },
  { value: 'GD', label: 'Grenada 🇬🇩' },
  { value: 'GP', label: 'Guadeloupe 🇬🇵' },
  { value: 'GU', label: 'Guam 🇬🇺' },
  { value: 'GT', label: 'Guatemala 🇬🇹' },
  { value: 'GG', label: 'Guernsey 🇬🇬' },
  { value: 'GN', label: 'Guinea 🇬🇳' },
  { value: 'GW', label: 'Guinea-Bissau 🇬🇼' },
  { value: 'GY', label: 'Guyana 🇬🇾' },
  { value: 'HT', label: 'Haiti 🇭🇹' },
  { value: 'HM', label: 'Heard Island and McDonald Islands 🇭🇲' },
  { value: 'VA', label: 'Holy See 🇻🇦' },
  { value: 'HN', label: 'Honduras 🇭🇳' },
  { value: 'HK', label: 'Hong Kong 🇭🇰' },
  { value: 'HU', label: 'Hungary 🇭🇺' },
  { value: 'IS', label: 'Iceland 🇮🇸' },
  { value: 'IN', label: 'India 🇮🇳' },
  { value: 'ID', label: 'Indonesia 🇮🇩' },
  { value: 'IR', label: 'Iran 🇮🇷' },
  { value: 'IQ', label: 'Iraq 🇮🇶' },
  { value: 'IE', label: 'Ireland 🇮🇪' },
  { value: 'IM', label: 'Isle of Man 🇮🇲' },
  { value: 'IL', label: 'Israel 🇮🇱' },
  { value: 'IT', label: 'Italy 🇮🇹' },
  { value: 'JM', label: 'Jamaica 🇯🇲' },
  { value: 'JP', label: 'Japan 🇯🇵' },
  { value: 'JE', label: 'Jersey 🇯🇪' },
  { value: 'JO', label: 'Jordan 🇯🇴' },
  { value: 'KZ', label: 'Kazakhstan 🇰🇿' },
  { value: 'KE', label: 'Kenya 🇰🇪' },
  { value: 'KI', label: 'Kiribati 🇰🇮' },
  { value: 'KP', label: 'Korea, Democratic People\'s Republic 🇰🇵' },
  { value: 'KR', label: 'Korea, Republic of 🇰🇷' },
  { value: 'KW', label: 'Kuwait 🇰🇼' },
  { value: 'KG', label: 'Kyrgyzstan 🇰🇬' },
  { value: 'LA', label: 'Laos 🇱🇦' },
  { value: 'LV', label: 'Latvia 🇱🇻' },
  { value: 'LB', label: 'Lebanon 🇱🇧' },
  { value: 'LS', label: 'Lesotho 🇱🇸' },
  { value: 'LR', label: 'Liberia 🇱🇷' },
  { value: 'LY', label: 'Libya 🇱🇾' },
  { value: 'LI', label: 'Liechtenstein 🇱🇮' },
  { value: 'LT', label: 'Lithuania 🇱🇹' },
  { value: 'LU', label: 'Luxembourg 🇱🇺' },
  { value: 'MO', label: 'Macao 🇲🇴' },
  { value: 'MK', label: 'Macedonia 🇲🇰' },
  { value: 'MG', label: 'Madagascar 🇲🇬' },
  { value: 'MW', label: 'Malawi 🇲🇼' },
  { value: 'MY', label: 'Malaysia 🇲🇾' },
  { value: 'MV', label: 'Maldives 🇲🇻' },
  { value: 'ML', label: 'Mali 🇲🇱' },
  { value: 'MT', label: 'Malta 🇲🇹' },
  { value: 'MH', label: 'Marshall Islands 🇲🇭' },
  { value: 'MQ', label: 'Martinique 🇲🇶' },
  { value: 'MR', label: 'Mauritania 🇲🇷' },
  { value: 'MU', label: 'Mauritius 🇲🇺' },
  { value: 'YT', label: 'Mayotte 🇾🇹' },
  { value: 'MX', label: 'Mexico 🇲🇽' },
  { value: 'FM', label: 'Micronesia 🇫🇲' },
  { value: 'MD', label: 'Moldova 🇲🇩' },
  { value: 'MC', label: 'Monaco 🇲🇨' },
  { value: 'MN', label: 'Mongolia 🇲🇳' },
  { value: 'ME', label: 'Montenegro 🇲🇪' },
  { value: 'MS', label: 'Montserrat 🇲🇸' },
  { value: 'MA', label: 'Morocco 🇲🇦' },
  { value: 'MZ', label: 'Mozambique 🇲🇿' },
  { value: 'MM', label: 'Myanmar 🇲🇲' },
  { value: 'NA', label: 'Namibia 🇳🇦' },
  { value: 'NR', label: 'Nauru 🇳🇷' },
  { value: 'NP', label: 'Nepal 🇳🇵' },
  { value: 'NL', label: 'Netherlands 🇳🇱' },
  { value: 'NC', label: 'New Caledonia 🇳🇨' },
  { value: 'NZ', label: 'New Zealand 🇳🇿' },
  { value: 'NI', label: 'Nicaragua 🇳🇮' },
  { value: 'NE', label: 'Niger 🇳🇪' },
  { value: 'NG', label: 'Nigeria 🇳🇬' },
  { value: 'NU', label: 'Niue 🇳🇺' },
  { value: 'NF', label: 'Norfolk Island 🇳🇫' },
  { value: 'MP', label: 'Northern Mariana Islands 🇲🇵' },
  { value: 'NO', label: 'Norway 🇳🇴' },
  { value: 'OM', label: 'Oman 🇴🇲' },
  { value: 'PK', label: 'Pakistan 🇵🇰' },
  { value: 'PW', label: 'Palau 🇵🇼' },
  { value: 'PS', label: 'Palestine 🇵🇸' },
  { value: 'PA', label: 'Panama 🇵🇦' },
  { value: 'PG', label: 'Papua New Guinea 🇵🇬' },
  { value: 'PY', label: 'Paraguay 🇵🇾' },
  { value: 'PE', label: 'Peru 🇵🇪' },
  { value: 'PH', label: 'Philippines 🇵🇭' },
  { value: 'PN', label: 'Pitcairn 🇵🇳' },
  { value: 'PL', label: 'Poland 🇵🇱' },
  { value: 'PT', label: 'Portugal 🇵🇹' },
  { value: 'PR', label: 'Puerto Rico 🇵🇷' },
  { value: 'QA', label: 'Qatar 🇶🇦' },
  { value: 'RE', label: 'Réunion 🇷🇪' },
  { value: 'RO', label: 'Romania 🇷🇴' },
  { value: 'RU', label: 'Russia 🇷🇺' },
  { value: 'RW', label: 'Rwanda 🇷🇼' },
  { value: 'BL', label: 'Saint Barthélemy 🇧🇱' },
  { value: 'SH', label: 'Saint Helena 🇸🇭' },
  { value: 'KN', label: 'Saint Kitts and Nevis 🇰🇳' },
  { value: 'LC', label: 'Saint Lucia 🇱🇨' },
  { value: 'MF', label: 'Saint Martin 🇲🇫' },
  { value: 'PM', label: 'Saint Pierre and Miquelon 🇵🇲' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines 🇻🇨' },
  { value: 'WS', label: 'Samoa 🇼🇸' },
  { value: 'SM', label: 'San Marino 🇸🇲' },
  { value: 'ST', label: 'Sao Tome and Principe 🇸🇹' },
  { value: 'SA', label: 'Saudi Arabia 🇸🇦' },
  { value: 'SN', label: 'Senegal 🇸🇳' },
  { value: 'RS', label: 'Serbia 🇷🇸' },
  { value: 'SC', label: 'Seychelles 🇸🇨' },
  { value: 'SL', label: 'Sierra Leone 🇸🇱' },
  { value: 'SG', label: 'Singapore 🇸🇬' },
  { value: 'SX', label: 'Sint Maarten 🇸🇽' },
  { value: 'SK', label: 'Slovakia 🇸🇰' },
  { value: 'SI', label: 'Slovenia 🇸🇮' },
  { value: 'SB', label: 'Solomon Islands 🇸🇧' },
  { value: 'SO', label: 'Somalia 🇸🇴' },
  { value: 'ZA', label: 'South Africa 🇿🇦' },
  { value: 'GS', label: 'South Georgia and the South Sandwich Islands 🇬🇸' },
  { value: 'SS', label: 'South Sudan 🇸🇸' },
  { value: 'ES', label: 'Spain 🇪🇸' },
  { value: 'LK', label: 'Sri Lanka 🇱🇰' },
  { value: 'SD', label: 'Sudan 🇸🇩' },
  { value: 'SR', label: 'Suriname 🇸🇷' },
  { value: 'SJ', label: 'Svalbard and Jan Mayen 🇸🇯' },
  { value: 'SZ', label: 'Swaziland 🇸🇿' },
  { value: 'SE', label: 'Sweden 🇸🇪' },
  { value: 'CH', label: 'Switzerland 🇨🇭' },
  { value: 'SY', label: 'Syria 🇸🇾' },
  { value: 'TW', label: 'Taiwan 🇹🇼' },
  { value: 'TJ', label: 'Tajikistan 🇹🇯' },
  { value: 'TZ', label: 'Tanzania 🇹🇿' },
  { value: 'TH', label: 'Thailand 🇹🇭' },
  { value: 'TL', label: 'Timor-Leste 🇹🇱' },
  { value: 'TG', label: 'Togo 🇹🇬' },
  { value: 'TK', label: 'Tokelau 🇹🇰' },
  { value: 'TO', label: 'Tonga 🇹🇴' },
  { value: 'TT', label: 'Trinidad and Tobago 🇹🇹' },
  { value: 'TN', label: 'Tunisia 🇹🇳' },
  { value: 'TR', label: 'Turkey 🇹🇷' },
  { value: 'TM', label: 'Turkmenistan 🇹🇲' },
  { value: 'TC', label: 'Turks and Caicos Islands 🇹🇨' },
  { value: 'TV', label: 'Tuvalu 🇹🇻' },
  { value: 'UG', label: 'Uganda 🇺🇬' },
  { value: 'UA', label: 'Ukraine 🇺🇦' },
  { value: 'AE', label: 'United Arab Emirates 🇦🇪' },
  { value: 'GB', label: 'United Kingdom 🇬🇧' },
  { value: 'US', label: 'United States 🇺🇸' },
  { value: 'UM', label: 'United States Minor Outlying Islands 🇺🇲' },
  { value: 'UY', label: 'Uruguay 🇺🇾' },
  { value: 'UZ', label: 'Uzbekistan 🇺🇿' },
  { value: 'VU', label: 'Vanuatu 🇻🇺' },
  { value: 'VE', label: 'Venezuela 🇻🇪' },
  { value: 'VN', label: 'Vietnam 🇻🇳' },
  { value: 'VG', label: 'Virgin Islands, British 🇻🇬' },
  { value: 'VI', label: 'Virgin Islands, U.S. 🇻🇮' },
  { value: 'WF', label: 'Wallis and Futuna 🇼🇫' },
  { value: 'EH', label: 'Western Sahara 🇪🇭' },
  { value: 'YE', label: 'Yemen 🇾🇪' },
  { value: 'ZM', label: 'Zambia 🇿🇲' },
  { value: 'ZW', label: 'Zimbabwe 🇿🇼' }
]

export default function SignupPage() {
  const { messages } = useLanguage()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [consentAll, setConsentAll] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentThirdParty, setConsentThirdParty] = useState(false)

  // 유효성 검사 에러 상태
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    country: "",
    password: "",
    phoneNumber: "",
    consent: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password: string) => {
    if (!password) {
      return ""
    }

    // 길이 체크 (8-20자)
    if (password.length < 8 || password.length > 20) {
      return messages?.signup?.passwordLengthError || "Password must be 8-20 characters long."
    }

    // 정규식 체크 (영문자, 숫자, 특수문자 포함)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/
    if (!passwordRegex.test(password)) {
      return messages?.signup?.passwordPatternError || "Password must contain at least one letter, one number, and one special character (@, $, !, %, *, ?, &, #)."
    }

    return ""
  }

  // localStorage에서 이메일 읽어오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('signupEmail')
      if (savedEmail) {
        setEmail(savedEmail)
        localStorage.removeItem('signupEmail')
      }
    }
  }, [])

  // 비밀번호 실시간 유효성 검사
  useEffect(() => {
    const error = validatePassword(password)
    setPasswordError(error)
  }, [password, messages])

  // 폼 유효성 검사 함수
  const validateForm = () => {
    const errors = {
      firstName: "",
      lastName: "",
      country: "",
      password: "",
      phoneNumber: "",
      consent: ""
    }

    if (!firstName.trim()) {
      errors.firstName = messages?.signup?.firstNameRequired || "Please enter your first name."
    }

    if (!lastName.trim()) {
      errors.lastName = messages?.signup?.lastNameRequired || "Please enter your last name."
    }

    if (!selectedCountry) {
      errors.country = messages?.signup?.countryRequired || "Please select your country."
    }

    if (!password.trim()) {
      errors.password = messages?.signup?.passwordRequired || "Please enter your password."
    } else if (passwordError) {
      errors.password = passwordError
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = messages?.signup?.phoneRequired || "Please enter your phone number."
    }

    if (!consentTerms || !consentPrivacy || !consentThirdParty) {
      errors.consent = messages?.signup?.consentRequired || "Please agree to the terms."
    }

    setFieldErrors(errors)

    // 모든 필드가 유효한지 확인
    return Object.values(errors).every(error => error === "")
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 폼 유효성 검사
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const data = await apiPost('/api/auth/join', {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        countryCode: selectedCountry
      })

      if (data.code === 200) {
        // 회원가입 성공 - email 정보를 localStorage에 저장하고 verify-email 페이지로 이동
        // 로그인 상태는 이메일 인증 완료 후 설정됨
        if (typeof window !== 'undefined') {
          localStorage.setItem('verifyEmail', email)
        }
        router.push('/verify-email')
      } else {
        // 회원가입 실패
        alert(data.message || (messages?.signup?.signupError || "Failed to create account. Please try again."))
        router.push('/account_check')
      }
    } catch (error) {
      alert(messages?.signup?.signupError || "Failed to create account. Please try again.")
      router.push('/account_check')
    } finally {
      setIsLoading(false)
    }
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
                  className={`rounded-lg border-gray-300 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                />
                {fieldErrors.firstName && (
                  <p className="text-sm text-red-600">{fieldErrors.firstName}</p>
                )}
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
                  className={`rounded-lg border-gray-300 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                />
                {fieldErrors.lastName && (
                  <p className="text-sm text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Country field */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                {messages?.signup?.country || "Country"} <span className="text-primary">*</span>
              </Label>
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                required
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${fieldErrors.country ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">
                  {messages?.signup?.countryPlaceholder || "Select your country"}
                </option>
                {countryOptions.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {fieldErrors.country && (
                <p className="text-sm text-red-600">{fieldErrors.country}</p>
              )}
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
                readOnly
                className="rounded-lg border-gray-300 bg-gray-50 cursor-not-allowed"
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
                className={`rounded-lg border-gray-300 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="space-y-1">
                {passwordError && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-red-600">⚠️ {passwordError}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">ⓘ {messages?.signup?.passwordRule || "Password Rule"}</span>
                </div>
              </div>
            </div>

            {/* Phone number field */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                {messages?.signup?.phoneNumber || "Phone number"} <span className="text-primary">*</span>
              </Label>
              <div className="w-full">
                <PhoneInput
                  defaultCountry="kr"
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber(phone)}
                  inputClassName={`flex-1 rounded-lg ${fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                  inputProps={{
                    id: "phoneNumber",
                    required: true,
                  }}
                />
              </div>
              {fieldErrors.phoneNumber && (
                <p className="text-sm text-red-600">{fieldErrors.phoneNumber}</p>
              )}
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
              {fieldErrors.consent && (
                <p className="text-sm text-red-600 mt-2">{fieldErrors.consent}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="cursor-pointer h-12 w-full rounded-full bg-[#E91E63] text-base font-medium text-white hover:bg-[#E91E63]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (messages?.account_check?.loading || "Loading...") : (messages?.signup?.createAccount || "Create an account")}
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