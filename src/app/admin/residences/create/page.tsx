"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { apiPostFormData } from "@/lib/api"
import { AddressSearchInput } from "@/components/admin/address-search-input"

interface I18nField {
  ko: string
  en: string
  zh: string
  fr: string
}

interface GalleryImage {
  file: File | null
  displayOrder: number
  preview: string
}

export default function CreateResidencePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // 다국어 필드
  const [name, setName] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [description, setDescription] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  
  // 기본 필드
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
  
  // 이미지 필드
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])

  // 현재 선택된 언어 탭
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
    if (!profileImage) missing.push("프로필 이미지")

    return missing
  }

  // 폼이 유효한지 확인
  const isFormValid = () => {
    return validateRequiredFields().length === 0
  }

  // 프로필 이미지 선택
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 갤러리 이미지 추가 (단일 이미지)
  const handleAddGalleryImage = (file: File) => {
    const newImage: GalleryImage = {
      file,
      displayOrder: galleryImages.length,
      preview: URL.createObjectURL(file)
    }
    setGalleryImages([...galleryImages, newImage])
  }

  // + 카드 클릭 시 파일 선택
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
    // displayOrder 재정렬
    newImages.forEach((img, i) => {
      img.displayOrder = i
    })
    setGalleryImages(newImages)
  }

  // 드래그 앤 드롭 관련 상태
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...galleryImages]
    const draggedImage = newImages[draggedIndex]
    
    // 배열에서 제거하고 새 위치에 삽입
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)
    
    // displayOrder 재정렬
    newImages.forEach((img, i) => {
      img.displayOrder = i
    })
    
    setGalleryImages(newImages)
    setDraggedIndex(index)
  }

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 필수 필드 검증
    const missingFields = validateRequiredFields()
    if (missingFields.length > 0) {
      alert(`다음 필수 항목을 입력해주세요:\n\n${missingFields.join('\n')}`)
      return
    }

    setIsLoading(true)

    try {
      // FormData 생성
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
          
          // 프로필 이미지 (검증을 통과했으므로 반드시 존재함)
          if (profileImage) {
            formData.append("profileImage", profileImage)
          }
      
      // 갤러리 이미지
      galleryImages.forEach((img, index) => {
        if (img.file) {
          formData.append(`galleryImages[${index}].displayOrder`, img.displayOrder.toString())
          formData.append(`galleryImages[${index}].file`, img.file)
        }
      })

      // API 호출 (api.ts의 apiPostFormData 사용)
      await apiPostFormData('/api/v1/admin/residences', formData)

      alert("고시원이 등록되었습니다.")
      router.push("/admin/residences")
    } catch (error) {
      alert("고시원 등록 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            고시원 등록
          </h1>
          <p className="text-gray-600">
            새로운 고시원 정보를 등록합니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isLoading}
                  className={!name[activeTab].trim() ? 'border-red-300' : ''}
                />
                {!name[activeTab].trim() && (
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
                  disabled={isLoading}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:border-transparent ${
                    !description[activeTab].trim() ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {!description[activeTab].trim() && (
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
                <div className="mt-1">
                  <AddressSearchInput
                    onAddressSelected={handleAddressSelected}
                    disabled={isLoading}
                  />
                </div>
                {address && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">선택된 주소:</span> {address}
                    </p>
                    {zipNo && (
                      <p className="text-xs text-gray-500 mt-1">우편번호: {zipNo}</p>
                    )}
                  </div>
                )}
                {!address.trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>

              {/* 상세 주소 */}
              <div>
                <Label htmlFor="addressDetail">
                  상세 주소 <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-1 mb-1">
                  Please enter in English (e.g., 2F, Room 201)
                </p>
                <Input
                  id="addressDetail"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="2F, Room 201"
                  disabled={isLoading}
                  className={!addressDetail.trim() ? 'border-red-300' : ''}
                />
                {!addressDetail.trim() && (
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
                    disabled={isLoading}
                    className={!hostingStartDate ? 'border-red-300' : ''}
                  />
                  {!hostingStartDate && (
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
                    placeholder="+82 10-5017-2468"
                    disabled={isLoading}
                    className={!contactNumber.trim() ? 'border-red-300' : ''}
                  />
                  {!contactNumber.trim() && (
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
                  placeholder="stayone@example.com"
                  disabled={isLoading}
                  className={!email.trim() ? 'border-red-300' : ''}
                />
                {!email.trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">이미지</h3>
            
            {/* 프로필 이미지 */}
            <div className="mb-6">
              <Label htmlFor="profileImage">
                프로필 이미지 <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                {profileImagePreview ? (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <img
                      src={profileImagePreview}
                      alt="프로필 미리보기"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage(null)
                        setProfileImagePreview("")
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : null}
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* 갤러리 이미지 */}
            <div>
              <Label>갤러리 이미지</Label>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                이미지를 드래그하여 순서를 변경할 수 있습니다
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {/* 기존 이미지들 */}
                {galleryImages.map((img, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-[#E91E63] transition-colors">
                      <img
                        src={img.preview}
                        alt={`갤러리 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* 순서 번호 */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-sm font-medium px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    
                    {/* 드래그 아이콘 */}
                    <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                  </div>
                ))}
                
                {/* + 추가 카드 */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isLoading}
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
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/residences")}
              disabled={isLoading}
              className="cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "등록 중..." : isFormValid() ? "등록하기" : `필수 항목 ${validateRequiredFields().length}개 미입력`}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
