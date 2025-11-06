"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { apiPost } from "@/lib/api"

interface I18nField {
  ko: string
  en: string
  zh: string
  fr: string
}

export default function AdminKeywordCreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // 다국어 필드
  const [name, setName] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [category, setCategory] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  
  // 위치 정보
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
      const requestData = {
        nameI18n: name,
        categoryI18n: category,
        latitude: Number(latitude),
        longitude: Number(longitude)
      }

      await apiPost("/api/v1/admin/keywords", requestData)

      alert("키워드가 등록되었습니다.")
      router.push("/admin/keywords")
    } catch (error) {
      alert("키워드 등록 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const missingFields = validateRequiredFields()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">키워드 추가</h1>
            <p className="text-gray-600 mt-2">새로운 검색 키워드를 등록합니다</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/keywords")}
            className="cursor-pointer"
            disabled={isLoading}
          >
            목록으로
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isLoading}
                  className={!name[activeTab].trim() ? 'border-red-300' : ''}
                />
                {!name[activeTab].trim() && (
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
                  placeholder="카테고리를 입력하세요 (예: 지역, 대학교, 역 등)"
                  required
                  disabled={isLoading}
                  className={!category[activeTab].trim() ? 'border-red-300' : ''}
                />
                {!category[activeTab].trim() && (
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
                  disabled={isLoading}
                  className={(!latitude.trim() || isNaN(Number(latitude))) ? 'border-red-300' : ''}
                />
                {(!latitude.trim() || isNaN(Number(latitude))) && (
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
                  disabled={isLoading}
                  className={(!longitude.trim() || isNaN(Number(longitude))) ? 'border-red-300' : ''}
                />
                {(!longitude.trim() || isNaN(Number(longitude))) && (
                  <p className="text-xs text-red-500 mt-1">유효한 경도를 입력하세요</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Google Maps 등에서 위치를 검색하여 정확한 좌표를 입력하세요
            </p>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/keywords")}
              className="cursor-pointer"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="cursor-pointer bg-[#E91E63] hover:bg-[#C2185B] text-white"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading 
                ? "등록 중..." 
                : !isFormValid() 
                ? `필수 항목 ${missingFields.length}개 미입력` 
                : "등록하기"
              }
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

