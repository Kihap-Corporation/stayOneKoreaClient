"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useParams } from "next/navigation"
import { apiGet, apiPut, apiDelete } from "@/lib/api"

interface I18nField {
  ko: string
  en: string
  zh: string
  fr: string
}

interface KeywordDetail {
  identifier: string
  nameI18n: I18nField
  categoryI18n: I18nField
  latitude: number
  longitude: number
}

export default function AdminKeywordDetailPage() {
  const router = useRouter()
  const params = useParams()
  const identifier = params.identifier as string

  const [keyword, setKeyword] = useState<KeywordDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // 폼 데이터
  const [name, setName] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [category, setCategory] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  
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

    if (!name.ko.trim()) missing.push("키워드명(한국어)")
    if (!name.en.trim()) missing.push("키워드명(English)")
    if (!name.zh.trim()) missing.push("키워드명(中文)")
    if (!name.fr.trim()) missing.push("키워드명(Français)")
    
    if (!category.ko.trim()) missing.push("카테고리(한국어)")
    if (!category.en.trim()) missing.push("카테고리(English)")
    if (!category.zh.trim()) missing.push("카테고리(中文)")
    if (!category.fr.trim()) missing.push("카테고리(Français)")
    
    if (!latitude.trim() || isNaN(Number(latitude))) missing.push("위도")
    if (!longitude.trim() || isNaN(Number(longitude))) missing.push("경도")

    return missing
  }

  // 폼이 유효한지 확인
  const isFormValid = () => {
    return validateRequiredFields().length === 0
  }

  // 데이터 로드
  useEffect(() => {
    fetchKeywordDetail()
  }, [identifier])

  const fetchKeywordDetail = async () => {
    setIsLoading(true)
    try {
      const response = await apiGet(`/api/v1/admin/keywords/${identifier}`)
      const data: KeywordDetail = response.data

      setKeyword(data)
      
      // 폼 데이터 초기화
      setName(data.nameI18n)
      setCategory(data.categoryI18n)
      setLatitude(data.latitude.toString())
      setLongitude(data.longitude.toString())
    } catch (error) {
      console.error("키워드 조회 실패:", error)
      alert("키워드 정보를 불러오는데 실패했습니다.")
      router.push("/admin/keywords")
    } finally {
      setIsLoading(false)
    }
  }

  // 키워드 수정
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
      const requestData = {
        nameI18n: name,
        categoryI18n: category,
        latitude: Number(latitude),
        longitude: Number(longitude)
      }

      await apiPut(`/api/v1/admin/keywords/${identifier}`, requestData)

      alert("키워드가 수정되었습니다.")
      setIsEditMode(false)
      await fetchKeywordDetail()
    } catch (error) {
      console.error("키워드 수정 실패:", error)
      alert("키워드 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  // 키워드 삭제
  const handleDelete = async () => {
    if (!keyword) return
    
    const confirmed = confirm(
      `"${keyword.nameI18n.ko}" 키워드를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await apiDelete(`/api/v1/admin/keywords/${identifier}`)
      alert("키워드가 삭제되었습니다.")
      router.push("/admin/keywords")
    } catch (error) {
      console.error("키워드 삭제 실패:", error)
      alert("키워드 삭제에 실패했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  const missingFields = validateRequiredFields()

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
            <p className="mt-4 text-gray-600">키워드 정보를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!keyword) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "키워드 수정" : "키워드 상세"}
            </h1>
            <p className="text-gray-600 mt-2">{keyword.nameI18n.ko}</p>
          </div>
          <div className="flex space-x-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false)
                    // 원래 데이터로 복원
                    setName(keyword.nameI18n)
                    setCategory(keyword.categoryI18n)
                    setLatitude(keyword.latitude.toString())
                    setLongitude(keyword.longitude.toString())
                  }}
                  className="cursor-pointer"
                  disabled={isSaving}
                >
                  취소
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
                  disabled={isSaving || !isFormValid()}
                >
                  {isSaving 
                    ? "저장 중..." 
                    : !isFormValid() 
                    ? `필수 항목 ${missingFields.length}개 미입력` 
                    : "저장하기"
                  }
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/keywords")}
                  className="cursor-pointer"
                  disabled={isDeleting}
                >
                  목록으로
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">다국어 정보</h3>
            
            <div className="flex space-x-1 mb-4 border-b border-gray-200">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveTab(lang.code)}
                  className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === lang.code
                      ? "text-[#E91E63] border-b-2 border-[#E91E63]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* 키워드명 */}
              <div>
                <Label htmlFor={`name-${activeTab}`}>
                  키워드명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`name-${activeTab}`}
                  value={name[activeTab]}
                  onChange={(e) => setName({ ...name, [activeTab]: e.target.value })}
                  placeholder="키워드명을 입력하세요"
                  required
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  className={isEditMode && !name[activeTab].trim() ? 'border-red-300' : ''}
                />
                {isEditMode && !name[activeTab].trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>

              {/* 카테고리 */}
              <div>
                <Label htmlFor={`category-${activeTab}`}>
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`category-${activeTab}`}
                  value={category[activeTab]}
                  onChange={(e) => setCategory({ ...category, [activeTab]: e.target.value })}
                  placeholder="카테고리를 입력하세요"
                  required
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  className={isEditMode && !category[activeTab].trim() ? 'border-red-300' : ''}
                />
                {isEditMode && !category[activeTab].trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">위치 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">
                  위도 (Latitude) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="37.5665"
                  required
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  className={isEditMode && (!latitude.trim() || isNaN(Number(latitude))) ? 'border-red-300' : ''}
                />
                {isEditMode && (!latitude.trim() || isNaN(Number(latitude))) && (
                  <p className="text-xs text-red-500 mt-1">유효한 위도를 입력하세요</p>
                )}
              </div>
              <div>
                <Label htmlFor="longitude">
                  경도 (Longitude) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="126.9780"
                  required
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  className={isEditMode && (!longitude.trim() || isNaN(Number(longitude))) ? 'border-red-300' : ''}
                />
                {isEditMode && (!longitude.trim() || isNaN(Number(longitude))) && (
                  <p className="text-xs text-red-500 mt-1">유효한 경도를 입력하세요</p>
                )}
              </div>
            </div>
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-2">
                * Google Maps 등에서 위치를 검색하여 정확한 좌표를 입력하세요
              </p>
            )}
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

