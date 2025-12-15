"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useParams } from "next/navigation"
import { apiGet, apiPutFormData, apiDelete } from "@/lib/api"
import { AddressSearchInput } from "@/components/admin/address-search-input"

interface I18nField {
  ko: string
  en: string
  zh: string
  fr: string
}

interface GalleryImage {
  identifier?: string  // 기존 이미지는 identifier 있음
  file: File | null
  displayOrder: number
  preview: string
  imageUrl?: string  // 기존 이미지 URL
}

interface ResidenceDetail {
  identifier: string
  nameI18n: I18nField
  descriptionI18n: I18nField
  address: {
    fullAddress: string
    detail: string
  }
  hostingStartDate: string
  contactNumber: string
  email: string
  profileImage: {
    identifier: string
    imageType: string
    imageUrl: string
    displayOrder: number
  } | null  // null 허용
  galleryImages: Array<{
    identifier: string
    imageType: string
    imageUrl: string
    displayOrder: number
  }>
}

export default function ResidenceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const identifier = params.identifier as string

  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 고시원 데이터
  const [residence, setResidence] = useState<ResidenceDetail | null>(null)

  // 수정 폼 데이터
  const [name, setName] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [description, setDescription] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [address, setAddress] = useState("")
  const [addressDetail, setAddressDetail] = useState("")
  const [zipNo, setZipNo] = useState("") // 우편번호 추가
  const [hostingStartDate, setHostingStartDate] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  
  // 주소 검색 결과 콜백 핸들러
  const handleAddressSelected = (roadAddr: string, zipNo: string) => {
    setAddress(roadAddr)
    setZipNo(zipNo)
    
    // 상세주소 입력란에 포커스
    setTimeout(() => {
      document.getElementById('addressDetail')?.focus()
    }, 100)
  }
  
  // 이미지
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [profileImageIdentifier, setProfileImageIdentifier] = useState<string>("")  // 프로필 이미지 identifier
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])

  // 현재 언어 탭
  const [activeTab, setActiveTab] = useState<keyof I18nField>("ko")

  const languages = [
    { code: "ko" as const, label: "한국어" },
    { code: "en" as const, label: "English" },
    { code: "zh" as const, label: "中文" },
    { code: "fr" as const, label: "Français" }
  ]

  // 필수 필드 검증
  const validateRequiredFields = () => {
    const missing: string[] = []

    if (!name.ko.trim()) missing.push("고시원명(한국어)")
    if (!name.en.trim()) missing.push("고시원명(English)")
    if (!name.zh.trim()) missing.push("고시원명(中文)")
    if (!name.fr.trim()) missing.push("고시원명(Français)")
    
    if (!description.ko.trim()) missing.push("설명(한국어)")
    if (!description.en.trim()) missing.push("설명(English)")
    if (!description.zh.trim()) missing.push("설명(中文)")
    if (!description.fr.trim()) missing.push("설명(Français)")
    
    if (!address.trim()) missing.push("주소")
    if (!addressDetail.trim()) missing.push("상세 주소")
    if (!hostingStartDate) missing.push("호스팅 시작일")
    if (!contactNumber.trim()) missing.push("연락처")
    if (!email.trim()) missing.push("이메일")
    
    // 수정 페이지에서는 프로필 이미지가 기존에 있으면 OK (새로 업로드 안 해도 됨)
    // 생성 페이지에서는 필수

    return missing
  }

  // 폼이 유효한지 확인
  const isFormValid = () => {
    return validateRequiredFields().length === 0
  }

  // 데이터 로드
  useEffect(() => {
    fetchResidenceDetail()
  }, [identifier])

  const fetchResidenceDetail = async () => {
    setIsLoading(true)
    try {
      const response = await apiGet(`/api/v1/admin/residences/${identifier}`)
      const data: ResidenceDetail = response.data

      setResidence(data)
      
      // 폼 데이터 초기화
      setName(data.nameI18n)
      setDescription(data.descriptionI18n)
      setAddress(data.address.fullAddress)
      setAddressDetail(data.address.detail)
      setHostingStartDate(data.hostingStartDate)
      setContactNumber(data.contactNumber)
      setEmail(data.email)
      setProfileImagePreview(data.profileImage?.imageUrl || "")
      setProfileImageIdentifier(data.profileImage?.identifier || "")
      
      // 갤러리 이미지 초기화
      setGalleryImages(
        data.galleryImages.map(img => ({
          identifier: img.identifier,
          file: null,
          displayOrder: img.displayOrder,
          preview: img.imageUrl,
          imageUrl: img.imageUrl
        }))
      )
    } catch (error) {
      alert("고시원 정보를 불러오는데 실패했습니다.")
      router.push("/admin/residences")
    } finally {
      setIsLoading(false)
    }
  }

  // 고시원 삭제
  const handleDelete = async () => {
    if (!residence) return
    
    const confirmed = confirm(
      `"${residence.nameI18n.ko}" 고시원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 관련된 모든 룸 정보도 함께 삭제됩니다.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await apiDelete(`/api/v1/admin/residences/${identifier}`)
      alert("고시원이 삭제되었습니다.")
      router.push("/admin/residences")
    } catch (error) {
      alert("고시원 삭제에 실패했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  // 프로필 이미지 변경
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 체크 (30MB = 30 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB
      if (file.size > MAX_FILE_SIZE) {
        alert(`파일 크기가 30MB를 초과합니다.\n\n파일명: ${file.name}\n파일 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\n30MB 이하의 파일만 업로드 가능합니다.`)
        // input 값 초기화
        e.target.value = ''
        return
      }

      setProfileImage(file)
      setProfileImageIdentifier("")  // 새 파일 선택 시 기존 identifier 제거
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 갤러리 이미지 추가
  const handleAddGalleryImage = (file: File) => {
    // 파일 크기 체크 (30MB = 30 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB
    if (file.size > MAX_FILE_SIZE) {
      alert(`파일 크기가 30MB를 초과합니다.\n\n파일명: ${file.name}\n파일 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\n30MB 이하의 파일만 업로드 가능합니다.`)
      return
    }

    const newImage: GalleryImage = {
      file,
      displayOrder: galleryImages.length,
      preview: URL.createObjectURL(file)
    }
    setGalleryImages([...galleryImages, newImage])
  }

  const triggerFileInput = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleAddGalleryImage(file)
      }
    }
    input.click()
  }

  // 갤러리 이미지 제거
  const handleRemoveGalleryImage = (index: number) => {
    const newImages = galleryImages.filter((_, i) => i !== index)
    newImages.forEach((img, i) => {
      img.displayOrder = i
    })
    setGalleryImages(newImages)
  }

  // 드래그 앤 드롭
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...galleryImages]
    const draggedImage = newImages[draggedIndex]
    
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)
    
    newImages.forEach((img, i) => {
      img.displayOrder = i
    })
    
    setGalleryImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // 수정 제출
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    const missingFields = validateRequiredFields()
    if (missingFields.length > 0) {
      alert(`다음 필수 항목을 입력해주세요:\n\n${missingFields.join('\n')}`)
      return
    }

    setIsSaving(true)

    try {
      const formData = new FormData()
      
      // 다국어 필드
      formData.append("nameI18n[ko]", name.ko)
      formData.append("nameI18n[en]", name.en)
      formData.append("nameI18n[zh]", name.zh)
      formData.append("nameI18n[fr]", name.fr)
      
      formData.append("descriptionI18n[ko]", description.ko)
      formData.append("descriptionI18n[en]", description.en)
      formData.append("descriptionI18n[zh]", description.zh)
      formData.append("descriptionI18n[fr]", description.fr)
      
      // 기본 필드
      formData.append("address", address)
      formData.append("addressDetail", addressDetail)
      formData.append("hostingStartDate", hostingStartDate)
      formData.append("contactNumber", contactNumber)
      formData.append("email", email)
      
      // 프로필 이미지 - 필수 필드이므로 항상 보내야 함
      if (profileImage) {
        // 새로 업로드한 경우
        formData.append("profileImage", profileImage)
      } else if (residence?.profileImage?.imageUrl) {
        // 기존 이미지를 다시 보내야 함 - URL에서 fetch해서 File로 변환
        try {
          const response = await fetch(residence.profileImage.imageUrl)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const blob = await response.blob()

          const filename = residence.profileImage.imageUrl.split('/').pop() || 'profile.png'
          const file = new File([blob], filename, { type: blob.type })
          formData.append("profileImage", file)
        } catch (error) {
          alert(`프로필 이미지 로드 실패:\n${error instanceof Error ? error.message : '알 수 없는 오류'}\n\nCloudflare R2 CORS 설정을 확인하거나 이미지를 새로 업로드해주세요.`)
          setIsSaving(false)
          return
        }
      } else {
        alert("프로필 이미지를 업로드해주세요.")
        setIsSaving(false)
        return
      }
      
      // 갤러리 이미지 - 모든 이미지를 File로 변환해서 보내야 함
      const galleryPromises = galleryImages.map(async (img, index) => {
        if (img.file) {
          // 새로 추가한 이미지
          return {
            displayOrder: img.displayOrder,
            file: img.file
          }
        } else if (img.imageUrl) {
          // 기존 이미지 - URL에서 fetch해서 File로 변환
          try {
            const response = await fetch(img.imageUrl)

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const blob = await response.blob()
            
            const filename = img.imageUrl.split('/').pop() || `gallery_${index}.png`
            const file = new File([blob], filename, { type: blob.type })
            return {
              displayOrder: img.displayOrder,
              file: file
            }
          } catch (error) {
            return null
          }
        }
        return null
      })

      const galleryFiles = await Promise.all(galleryPromises)
      
      // null이 아닌 것만 FormData에 추가
      galleryFiles.forEach((item, index) => {
        if (item && item.file) {
          formData.append(`galleryImages[${index}].displayOrder`, item.displayOrder.toString())
          formData.append(`galleryImages[${index}].file`, item.file)
        }
      })

      await apiPutFormData(`/api/v1/admin/residences/${identifier}`, formData)

      alert("고시원이 수정되었습니다.")
      setIsEditMode(false)
      fetchResidenceDetail()  // 데이터 다시 로드
    } catch (error) {
      alert("고시원 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!residence) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">고시원을 찾을 수 없습니다.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? "고시원 수정" : "고시원 상세"}
            </h1>
            <p className="text-gray-600">
              {residence.nameI18n.ko}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false)
                    fetchResidenceDetail()  // 원래 데이터로 복구
                  }}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  취소
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isSaving || !isFormValid()}
                  className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? "저장 중..." : isFormValid() ? "저장" : `필수 항목 ${validateRequiredFields().length}개 미입력`}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/residences")}
                  className="cursor-pointer"
                  disabled={isDeleting}
                >
                  목록으로
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/residences/${identifier}/rooms`)}
                  className="cursor-pointer border-blue-500 text-blue-500 hover:bg-blue-50"
                  disabled={isDeleting}
                >
                  룸 관리
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  disabled={isDeleting}
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </Button>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
                  disabled={isDeleting}
                >
                  수정
                </Button>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* 다국어 탭 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4 border-b border-gray-200">
              <div className="flex gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveTab(lang.code)}
                    className={`pb-2 px-2 font-medium transition-colors cursor-pointer ${
                      activeTab === lang.code
                        ? "text-[#E91E63] border-b-2 border-[#E91E63]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* 고시원명 */}
              <div>
                <Label htmlFor={`name-${activeTab}`}>
                  고시원명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`name-${activeTab}`}
                  value={name[activeTab]}
                  onChange={(e) => setName({ ...name, [activeTab]: e.target.value })}
                  placeholder="고시원명을 입력하세요"
                  required
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  className={isEditMode && !name[activeTab].trim() ? 'border-red-300' : ''}
                />
                {isEditMode && !name[activeTab].trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>

              {/* 설명 */}
              <div>
                <Label htmlFor={`description-${activeTab}`}>
                  설명 <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id={`description-${activeTab}`}
                  value={description[activeTab]}
                  onChange={(e) => setDescription({ ...description, [activeTab]: e.target.value })}
                  placeholder="고시원 설명을 입력하세요"
                  required
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:border-transparent disabled:bg-gray-50 ${
                    isEditMode && !description[activeTab].trim() ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {isEditMode && !description[activeTab].trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
            
            <div className="space-y-4">
              {/* 주소 검색 */}
              <div>
                <Label htmlFor="address">
                  주소 <span className="text-red-500">*</span>
                </Label>
                {isEditMode ? (
                  <div className="mt-1">
                    <AddressSearchInput
                      onAddressSelected={handleAddressSelected}
                      disabled={isSaving}
                    />
                  </div>
                ) : (
                  <Input
                    id="address"
                    value={address}
                    readOnly
                    disabled
                    className="mt-1"
                  />
                )}
                {address && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      {isEditMode ? (
                        <>
                          <span className="font-semibold">선택된 주소:</span> {address}
                        </>
                      ) : (
                        address
                      )}
                    </p>
                    {zipNo && (
                      <p className="text-xs text-gray-500 mt-1">우편번호: {zipNo}</p>
                    )}
                  </div>
                )}
                {isEditMode && !address.trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>

              {/* 상세 주소 */}
              <div>
                <Label htmlFor="addressDetail">
                  상세 주소 <span className="text-red-500">*</span>
                </Label>
                {isEditMode && (
                  <p className="text-xs text-gray-500 mt-1 mb-1">
                    Please enter in English (e.g., 2F, Room 201)
                  </p>
                )}
                <Input
                  id="addressDetail"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder={isEditMode ? "2F, Room 201" : ""}
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  className={isEditMode && !addressDetail.trim() ? 'border-red-300' : ''}
                />
                {isEditMode && !addressDetail.trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hostingStartDate">
                    호스팅 시작일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hostingStartDate"
                    type="date"
                    value={hostingStartDate}
                    onChange={(e) => setHostingStartDate(e.target.value)}
                    required
                    disabled={!isEditMode || isSaving}
                    readOnly={!isEditMode}
                    className={isEditMode && !hostingStartDate ? 'border-red-300' : ''}
                  />
                  {isEditMode && !hostingStartDate && (
                    <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contactNumber">
                    연락처 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    disabled={!isEditMode || isSaving}
                    readOnly={!isEditMode}
                    className={isEditMode && !contactNumber.trim() ? 'border-red-300' : ''}
                  />
                  {isEditMode && !contactNumber.trim() && (
                    <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  className={isEditMode && !email.trim() ? 'border-red-300' : ''}
                />
                {isEditMode && !email.trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 이미지 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">이미지</h3>
            
            {/* 프로필 이미지 */}
            <div className="mb-6">
              <Label htmlFor="profileImage">
                프로필 이미지 <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                {profileImagePreview && (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <Image
                      src={profileImagePreview}
                      alt="프로필 미리보기"
                      fill
                      className="object-cover"
                    />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImage(null)
                          setProfileImagePreview(residence?.profileImage?.imageUrl || "")
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                {isEditMode && (
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    disabled={isSaving}
                  />
                )}
              </div>
            </div>

            {/* 갤러리 이미지 */}
            <div>
              <Label>갤러리 이미지</Label>
              {isEditMode && (
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  이미지를 드래그하여 순서를 변경할 수 있습니다
                </p>
              )}
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                {galleryImages.map((img, index) => (
                  <div
                    key={img.identifier || index}
                    draggable={isEditMode}
                    onDragStart={() => isEditMode && handleDragStart(index)}
                    onDragOver={(e) => isEditMode && handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group ${isEditMode ? 'cursor-move' : ''} ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                      <Image
                        src={img.preview}
                        alt={`갤러리 ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {isEditMode && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                      </>
                    )}
                    
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-sm font-medium px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {isEditMode && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={isSaving}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#E91E63] bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 group-hover:bg-[#E91E63] flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-[#E91E63] transition-colors font-medium">
                      이미지 추가
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
