"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiGet, apiPut } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

export default function MyPage() {
  const { messages } = useLanguage()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User data from API
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "••••••••••••••••••",
  })

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  const [newPasswordError, setNewPasswordError] = useState("")

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

  // 새 비밀번호 실시간 유효성 검사
  useEffect(() => {
    const error = validatePassword(newPassword)
    setNewPasswordError(error)
  }, [newPassword, messages])

  // Fetch user data on component mount
  useEffect(() => {
    let isMounted = true

    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const response = await apiGet('/api/user/detail')

        // 컴포넌트가 아직 마운트되어 있는지 확인
        if (!isMounted) return

        if (response.code === 200) {
          const { firstName, lastName, email, phoneNumber, phoneCountry } = response.data
          // PhoneInput에서 사용할 수 있도록 전체 전화번호 형식으로 조합
          const fullPhoneNumber = phoneCountry && phoneNumber ? `+${phoneCountry}${phoneNumber}` : phoneNumber || ""
          setUserData({
            firstName: firstName || "",
            lastName: lastName || "",
            email: email || "",
            phoneNumber: fullPhoneNumber,
            password: "••••••••••••••••••",
          })
        } else {
          if (isMounted) {
            setError(response.message || "Failed to load user data")
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch user data:', error)
          setError("Failed to load user data")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [])

  const handleEdit = (section: string) => {
    setEditingSection(editingSection === section ? null : section)
  }

  // 이름 변경 API 호출
  const handleNameChange = async () => {
    try {
      const response = await apiPut('/api/user/name', {
        firstName: userData.firstName,
        lastName: userData.lastName,
      })

      if (response.code === 200) {
        setEditingSection(null)
      } else {
        alert(response.message || "Failed to update name")
      }
    } catch (error) {
      console.error('Name change error:', error)
      alert(messages?.common?.error || "Failed to update name")
    }
  }

  // 휴대폰 번호 변경 API 호출
  const handlePhoneChange = async () => {
    try {
      // PhoneInput의 전체 전화번호에서 국가 코드와 번호 분리
      const phoneValue = userData.phoneNumber
      let phoneCountry = ""
      let phoneNumber = ""

      if (phoneValue.startsWith('+')) {
        // +82 10-1234-5678 형식에서 국가 코드 추출
        const spaceIndex = phoneValue.indexOf(' ')
        if (spaceIndex > 0) {
          phoneCountry = phoneValue.substring(1, spaceIndex) // + 제거하고 국가 코드만
          phoneNumber = phoneValue.substring(spaceIndex + 1) // 번호 부분
        } else {
          // +821012345678 형식인 경우 처리
          phoneNumber = phoneValue
        }
      } else {
        phoneNumber = phoneValue
      }

      const response = await apiPut('/api/user/phone', {
        phoneNumber: phoneNumber,
        phoneCountry: phoneCountry,
      })

      if (response.code === 200) {
        setEditingSection(null)
      } else {
        alert(response.message || "Failed to update phone number")
      }
    } catch (error) {
      console.error('Phone change error:', error)
      alert(messages?.common?.error || "Failed to update phone number")
    }
  }

  // 비밀번호 변경 API 호출
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      alert(messages?.common?.error || "Please fill in all password fields")
      return
    }

    // 새 비밀번호 유효성 검사
    if (newPasswordError) {
      alert(newPasswordError)
      return
    }

    setPasswordChangeLoading(true)
    try {
      const response = await apiPut('/api/user/password', {
        currentPassword,
        newPassword,
      })

      if (response.code === 200) {
        alert(messages?.common?.success || "Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setNewPasswordError("")
        setEditingSection(null)
      } else {
        alert(response.message || "Failed to update password")
      }
    } catch (error: any) {
      // API 레벨에서 40106 처리가 되므로 여기서는 일반 에러만 처리
      // alert(messages?.common?.error || "Failed to update password")
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6 xl:px-8 xl:py-12 xl:max-w-[600px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Content - Only show when not loading and no error */}
          {!isLoading && !error && (
            <>
              {/* Page Title */}
          <div className="mb-8 flex items-center gap-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h1 className="text-2xl font-semibold">My account</h1>
          </div>

          {/* Name Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Name</h2>
            <div className="rounded-lg bg-white p-6">
              <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-600">First name</label>
                  <input
                    type="text"
                    value={userData.firstName}
                    disabled={editingSection !== "name"}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-600">Last name</label>
                  <input
                    type="text"
                    value={userData.lastName}
                    disabled={editingSection !== "name"}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
              <button
                onClick={editingSection === "name" ? handleNameChange : () => handleEdit("name")}
                disabled={editingSection === "name" && (!userData.firstName.trim() || !userData.lastName.trim())}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSection === "name" ? "Save" : "Edit"}
              </button>
            </div>
          </div>

            {/* Email Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Email</h2>
            <div className="rounded-lg bg-white p-6">
              <div className="mb-4">
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  placeholder="ent***@email.com"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Phone Number Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Phone number</h2>
            <div className="rounded-lg bg-white p-6">
              <div className="mb-4">
                <PhoneInput
                  defaultCountry="kr"
                  value={userData.phoneNumber}
                  onChange={(phone) => setUserData({ ...userData, phoneNumber: phone })}
                  disabled={editingSection !== "phone"}
                  inputClassName={`flex-1 rounded-lg border-gray-300 ${editingSection !== "phone" ? 'bg-gray-50 text-gray-400' : ''}`}
                  inputProps={{
                    id: "phoneNumber",
                  }}
                />
              </div>
              <button
                onClick={editingSection === "phone" ? handlePhoneChange : () => handleEdit("phone")}
                disabled={editingSection === "phone" && !userData.phoneNumber.trim()}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSection === "phone" ? "Save" : "Edit"}
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Password</h2>
            <div className="rounded-lg bg-white p-6">
              {editingSection === "password" ? (
                <>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm text-gray-600">Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm text-gray-600">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`w-full rounded-lg border px-4 py-3 text-sm ${newPasswordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 bg-white'}`}
                    />
                    {newPasswordError && (
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        <span className="text-red-600">⚠️ {newPasswordError}</span>
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <span className="text-gray-500">ⓘ {messages?.signup?.passwordRule || "Password Rule"}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordChangeLoading || !currentPassword || !newPassword || !!newPasswordError}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordChangeLoading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <input
                      type="password"
                      value={userData.password}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={() => handleEdit("password")}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100"
                  >
                    Change Password
                  </button>
                </>
              )}
            </div>
          </div>

              {/* Delete Account */}
              <div className="mt-8 text-center">
                <button className="text-sm text-gray-400 hover:text-gray-600">Delete my account</button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
