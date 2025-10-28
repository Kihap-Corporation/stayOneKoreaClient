"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiGet, apiPut, apiPost } from "@/lib/api"
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

  // Account deletion fields
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [passwordError, setPasswordError] = useState("")

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

  // 회원탈퇴 API 호출
  const handleAccountDeletion = async () => {
    setDeleteLoading(true)
    setDeleteError("")
    setPasswordError("")

    try {
      const response = await apiPost('/api/auth/withdraw', {
        currentPassword: currentPassword,
      })

      if (response.code === 200) {
        // 성공 시 성공 메시지 표시 후 account_check 페이지로 리다이렉트
        alert(messages?.mypage?.deleteSuccess || "Account has been successfully deleted.")
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/account_check'
      } else if (response.code === 40103) {
        // 로그인 다시하라는 메시지 후 강제 로그아웃
        alert(messages?.auth?.sessionExpired || "Session expired. Please login again.")
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/signin'
      } else if (response.code === 40106) {
        // 비밀번호가 틀렸다는 메시지 (비밀번호 입력칸 아래에 표시)
        setPasswordError(messages?.mypage?.wrongPassword || "Current password is incorrect. Please try again.")
      } else {
        setDeleteError(response.message || "Failed to delete account")
      }
    } catch (error: any) {
      console.error('Account deletion error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        response: error.response
      })

      // 더 구체적인 오류 메시지 처리
      if (error.message?.includes('Network')) {
        setDeleteError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.")
      } else if (error.status === 404) {
        setDeleteError("회원탈퇴 서비스를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.")
      } else if (error.status === 500) {
        setDeleteError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      } else {
        setDeleteError(messages?.common?.error || "Failed to delete account")
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <Header />

      <main className="flex-1 bg-[#f7f7f8]">
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
              <div className="mb-6 flex items-center gap-2">
                <svg className="h-7 w-7 text-[#14151a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h1 className="text-[30px] font-bold leading-[36px] tracking-[-0.5px] text-[#14151a]">My account</h1>
              </div>

              {/* Name Section */}
              <div className="mb-6">
                <div className="rounded-[24px] bg-white px-5 py-4">
                  <h2 className="mb-[18px] text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">Name</h2>
                  <div className="mb-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="px-0 py-0.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">First name</label>
                      <input
                        type="text"
                        value={userData.firstName}
                        disabled={editingSection !== "name"}
                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                        placeholder="First name"
                        className="w-full rounded-[12px] border border-[#e9eaec] bg-[#fbfbfb] px-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[rgba(10,15,41,0.25)] disabled:bg-[#fbfbfb] disabled:text-[rgba(10,15,41,0.25)] enabled:bg-white enabled:text-[#14151a]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="px-0 py-0.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">Last name</label>
                      <input
                        type="text"
                        value={userData.lastName}
                        disabled={editingSection !== "name"}
                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                        placeholder="Last name"
                        className="w-full rounded-[12px] border border-[#e9eaec] bg-[#fbfbfb] px-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[rgba(10,15,41,0.25)] disabled:bg-[#fbfbfb] disabled:text-[rgba(10,15,41,0.25)] enabled:bg-white enabled:text-[#14151a]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={editingSection === "name" ? handleNameChange : () => handleEdit("name")}
                    disabled={editingSection === "name" && (!userData.firstName.trim() || !userData.lastName.trim())}
                    className="w-full rounded-[10px] bg-[rgba(10,15,41,0.04)] px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] hover:bg-[rgba(10,15,41,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editingSection === "name" ? "Save" : "Edit"}
                  </button>
                </div>
              </div>

              {/* Email Section */}
              <div className="mb-6">
                <div className="rounded-[24px] bg-white px-5 py-4">
                  <h2 className="mb-[18px] text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">Email</h2>
                  <div className="mb-4">
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      placeholder="em****@email.com"
                      className="w-full rounded-[12px] border border-[#e9eaec] bg-[#fbfbfb] px-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[rgba(10,15,41,0.25)] cursor-not-allowed"
                    />
                  </div>
                  <button
                    disabled
                    className="w-full rounded-[10px] bg-[rgba(10,15,41,0.04)] px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] cursor-not-allowed opacity-50"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Phone Number Section */}
              <div className="mb-6">
                <div className="rounded-[24px] bg-white px-5 py-4">
                  <h2 className="mb-[18px] text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">Phone number</h2>
                  <div className="mb-4">
                    <PhoneInput
                      defaultCountry="kr"
                      value={userData.phoneNumber}
                      onChange={(phone) => setUserData({ ...userData, phoneNumber: phone })}
                      disabled={editingSection !== "phone"}
                      inputClassName={`flex-1 rounded-[12px] border-[#e9eaec] ${editingSection !== "phone" ? 'bg-[#fbfbfb] text-[rgba(10,15,41,0.25)]' : 'bg-white text-[#14151a]'}`}
                      inputProps={{
                        id: "phoneNumber",
                      }}
                    />
                  </div>
                  <button
                    onClick={editingSection === "phone" ? handlePhoneChange : () => handleEdit("phone")}
                    disabled={editingSection === "phone" && !userData.phoneNumber.trim()}
                    className="w-full rounded-[10px] bg-[rgba(10,15,41,0.04)] px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] hover:bg-[rgba(10,15,41,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editingSection === "phone" ? "Save" : "Edit"}
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div className="mb-6">
                <div className="rounded-[24px] bg-white px-5 py-4">
                  <h2 className="mb-[18px] text-[18px] font-bold leading-[26px] tracking-[-0.2px] text-[#14151a]">Password</h2>
                  {editingSection === "password" ? (
                    <>
                      <div className="mb-2">
                        <label className="mb-2 block px-0 py-0.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">Current password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full rounded-[12px] border border-[#e9eaec] bg-white px-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[#14151a]"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block px-0 py-0.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">New password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className={`w-full rounded-[12px] border px-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] ${newPasswordError ? 'border-red-500 focus:border-red-500' : 'border-[#e9eaec] bg-white'} text-[#14151a]`}
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
                        className="w-full rounded-[10px] bg-[rgba(10,15,41,0.04)] px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] hover:bg-[rgba(10,15,41,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="w-full rounded-[12px] border border-[#e9eaec] bg-[#fbfbfb] px-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[rgba(10,15,41,0.25)] cursor-not-allowed"
                        />
                      </div>
                      <button
                        onClick={() => handleEdit("password")}
                        className="w-full rounded-[10px] bg-[rgba(10,15,41,0.04)] px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] hover:bg-[rgba(10,15,41,0.08)]"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Delete Account */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="cursor-pointer rounded-[10px] bg-transparent px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[rgba(15,19,36,0.6)] hover:text-[rgba(15,19,36,0.8)]"
                >
                  Delete my account
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 mx-4">
            <div className="mb-6">
              <h2 className="mb-4 text-[20px] font-bold leading-[28px] tracking-[-0.2px] text-[#14151a]">
                {messages?.mypage?.deleteAccountTitle || "Delete Account"}
              </h2>

              {/* Warning Message */}
              <div className="mb-6 rounded-[12px] bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-[20px]">⚠️</span>
                  <div className="text-red-800 text-sm leading-[20px]">
                    <p className="font-medium mb-1">
                      {messages?.mypage?.deleteWarningTitle || "Warning"}
                    </p>
                    <p>
                      {messages?.mypage?.deleteWarningMessage || "Once you delete your account, all your bookings, payments, and other data will be permanently deleted and cannot be recovered."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Password Input */}
              <div className="mb-4">
                <label className="mb-2 block px-0 py-0.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a]">
                  {messages?.mypage?.currentPassword || "Current Password"}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    setPasswordError("") // 입력 시 에러 메시지 초기화
                  }}
                  placeholder={messages?.mypage?.enterCurrentPassword || "Enter current password"}
                  className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-[14px] leading-[20px] tracking-[-0.1px] text-[#14151a] ${passwordError ? 'border-red-500' : 'border-[#e9eaec]'}`}
                />
                {passwordError && (
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <span className="text-red-600">⚠️ {passwordError}</span>
                  </div>
                )}
              </div>


              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteError("")
                    setPasswordError("")
                    setCurrentPassword("")
                  }}
                  disabled={deleteLoading}
                  className="flex-1 rounded-[10px] bg-[rgba(10,15,41,0.04)] px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#14151a] hover:bg-[rgba(10,15,41,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {messages?.common?.cancel || "Cancel"}
                </button>
                <button
                  onClick={handleAccountDeletion}
                  disabled={deleteLoading || !currentPassword}
                  className="flex-1 rounded-[10px] bg-red-600 px-2.5 py-1.5 text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteLoading ? (messages?.common?.loading || "Loading...") : (messages?.mypage?.deleteAccount || "Delete Account")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
