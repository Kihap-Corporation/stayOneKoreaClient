"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useParams } from "next/navigation"
import { apiGet, apiPutFormData, apiDelete } from "@/lib/api"

interface I18nField {
  ko: string
  en: string
  zh: string
  fr: string
}

interface GalleryImage {
  identifier?: string
  file: File | null
  displayOrder: number
  preview: string
  imageUrl?: string
}

interface CustomFacility {
  type: "AVAILABLE" | "UN_AVAILABLE"
  customNameI18n: I18nField
}

interface Facility {
  facilityType: string
  iconUrl: string
  nameI18n: I18nField
}

interface RoomDetail {
  identifier: string
  nameI18n: I18nField
  descriptionI18n?: I18nField
  rulesI18n?: I18nField
  pricePerNight: number
  galleryImages: Array<{
    identifier: string
    imageUrl: string
    displayOrder: number
  }>
  facilities: Facility[]
  createdDate: string
  modifiedDate: string
}

// 미리 정의된 시설 타입
const PREDEFINED_FACILITIES = [
  {
    type: "WIFI",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/wifi.png",
    nameI18n: { ko: "와이파이", en: "Wi-Fi", zh: "无线网络", fr: "Wi-Fi" }
  },
  {
    type: "WASHING_MACHINE",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/washing_machine.png",
    nameI18n: { ko: "세탁기", en: "Washing machine", zh: "洗衣机", fr: "Lave-linge" }
  },
  {
    type: "KITCHEN",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/lotcjem.png",
    nameI18n: { ko: "주방", en: "Kitchen", zh: "厨房", fr: "Cuisine" }
  },
  {
    type: "TV",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/tv.png",
    nameI18n: { ko: "TV", en: "TV", zh: "电视", fr: "Télévision" }
  },
  {
    type: "FREE_PARKING",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/free_parking_on_premises.png",
    nameI18n: { ko: "무료 주차", en: "Free parking on premises", zh: "免费停车", fr: "Parking gratuit sur place" }
  },
  {
    type: "PAID_PARKING",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/paid_parking_on_premises.png",
    nameI18n: { ko: "유료 주차", en: "Paid parking on premises", zh: "付费停车", fr: "Parking payant sur place" }
  },
  {
    type: "AIR_CONDITIONER",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/air_conditioning.png",
    nameI18n: { ko: "에어컨", en: "Air conditioning", zh: "空调", fr: "Climatisation" }
  },
  {
    type: "DEDICATED_WORKSPACE",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/dedicated_workspace.png",
    nameI18n: { ko: "전용 작업 공간", en: "Dedicated workspace", zh: "专用工作空间", fr: "Espace de travail dédié" }
  },
  {
    type: "POOL",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/pool.png",
    nameI18n: { ko: "수영장", en: "Pool", zh: "游泳池", fr: "Piscine" }
  },
  {
    type: "FIRST_AID_KIT",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/first_aid_kit.png",
    nameI18n: { ko: "구급상자", en: "First aid kit", zh: "急救箱", fr: "Trousse de premiers secours" }
  },
  {
    type: "HOT_TUB",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/hot_tub.png",
    nameI18n: { ko: "온수 욕조", en: "Hot tub", zh: "热水浴缸", fr: "Jacuzzi" }
  },
  {
    type: "SMOKE_ALARM",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/smoke_alarm.png",
    nameI18n: { ko: "화재 경보기", en: "Smoke alarm", zh: "烟雾报警器", fr: "Détecteur de fumée" }
  },
  {
    type: "EXERCISE_EQUIPMENT",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/excercise_equipment.png",
    nameI18n: { ko: "운동 기구", en: "Exercise equipment", zh: "健身器材", fr: "Équipement d'exercice" }
  },
  {
    type: "FIRE_EXTINGUISHER",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/fire_extinguisher.png",
    nameI18n: { ko: "소화기", en: "Fire extinguisher", zh: "灭火器", fr: "Extincteur" }
  },
  {
    type: "CARBON_MONOXIDE_ALARM",
    icon: "https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/carbon_monoxide_alarm.png",
    nameI18n: { ko: "일산화탄소 경보기", en: "Carbon monoxide alarm", zh: "一氧化碳报警器", fr: "Détecteur de monoxyde de carbone" }
  }
]

export default function RoomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const residenceIdentifier = params.identifier as string
  const roomIdentifier = params.roomIdentifier as string

  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 룸 데이터
  const [room, setRoom] = useState<RoomDetail | null>(null)

  // 수정 폼 데이터
  const [name, setName] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [description, setDescription] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [rules, setRules] = useState<I18nField>({ ko: "", en: "", zh: "", fr: "" })
  const [pricePerNight, setPricePerNight] = useState("")
  
  // 갤러리 이미지
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  
  // 시설
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [customAvailableFacilities, setCustomAvailableFacilities] = useState<CustomFacility[]>([])
  const [customUnavailableFacilities, setCustomUnavailableFacilities] = useState<CustomFacility[]>([])

  // 현재 언어 탭
  const [activeTab, setActiveTab] = useState<keyof I18nField>("ko")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const languages = [
    { code: "ko" as const, label: "한국어" },
    { code: "en" as const, label: "English" },
    { code: "zh" as const, label: "中文" },
    { code: "fr" as const, label: "Français" }
  ]

  // 필수 필드 검증
  const validateRequiredFields = () => {
    const missing: string[] = []

    if (!name.ko.trim()) missing.push("룸명(한국어)")
    if (!name.en.trim()) missing.push("룸명(English)")
    if (!name.zh.trim()) missing.push("룸명(中文)")
    if (!name.fr.trim()) missing.push("룸명(Français)")
    
    if (!description.ko.trim()) missing.push("설명(한국어)")
    if (!description.en.trim()) missing.push("설명(English)")
    if (!description.zh.trim()) missing.push("설명(中文)")
    if (!description.fr.trim()) missing.push("설명(Français)")
    
    if (!rules.ko.trim()) missing.push("규칙(한국어)")
    if (!rules.en.trim()) missing.push("규칙(English)")
    if (!rules.zh.trim()) missing.push("규칙(中文)")
    if (!rules.fr.trim()) missing.push("규칙(Français)")
    
    if (!pricePerNight || Number(pricePerNight) <= 0) missing.push("1박 가격")

    // 커스텀 시설 검증 - 추가한 경우 모든 언어 필수
    customAvailableFacilities.forEach((facility, index) => {
      if (!facility.customNameI18n.ko.trim()) missing.push(`커스텀 시설(이용 가능) ${index + 1} - 한국어`)
      if (!facility.customNameI18n.en.trim()) missing.push(`커스텀 시설(이용 가능) ${index + 1} - English`)
      if (!facility.customNameI18n.zh.trim()) missing.push(`커스텀 시설(이용 가능) ${index + 1} - 中文`)
      if (!facility.customNameI18n.fr.trim()) missing.push(`커스텀 시설(이용 가능) ${index + 1} - Français`)
    })

    customUnavailableFacilities.forEach((facility, index) => {
      if (!facility.customNameI18n.ko.trim()) missing.push(`커스텀 시설(이용 불가) ${index + 1} - 한국어`)
      if (!facility.customNameI18n.en.trim()) missing.push(`커스텀 시설(이용 불가) ${index + 1} - English`)
      if (!facility.customNameI18n.zh.trim()) missing.push(`커스텀 시설(이용 불가) ${index + 1} - 中文`)
      if (!facility.customNameI18n.fr.trim()) missing.push(`커스텀 시설(이용 불가) ${index + 1} - Français`)
    })

    return missing
  }

  // 폼이 유효한지 확인
  const isFormValid = () => {
    return validateRequiredFields().length === 0
  }

  // 데이터 로드
  useEffect(() => {
    fetchRoomDetail()
  }, [roomIdentifier])

  const fetchRoomDetail = async () => {
    setIsLoading(true)
    try {
      const response = await apiGet(
        `/api/v1/admin/residences/${residenceIdentifier}/rooms/${roomIdentifier}`
      )
      const data: RoomDetail = response.data

      setRoom(data)
      
      // 폼 데이터 초기화
      setName(data.nameI18n)
      setDescription(data.descriptionI18n || { ko: "", en: "", zh: "", fr: "" })
      setRules(data.rulesI18n || { ko: "", en: "", zh: "", fr: "" })
      setPricePerNight(data.pricePerNight.toString())
      
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

      // 시설 초기화
      const predefinedFacilities: string[] = []
      const availableCustoms: CustomFacility[] = []
      const unavailableCustoms: CustomFacility[] = []

      data.facilities.forEach(facility => {
        if (facility.facilityType === "AVAILABLE") {
          // 커스텀 이용 가능 시설
          availableCustoms.push({
            type: "AVAILABLE",
            customNameI18n: facility.nameI18n
          })
        } else if (facility.facilityType === "UN_AVAILABLE") {
          // 커스텀 이용 불가 시설
          unavailableCustoms.push({
            type: "UN_AVAILABLE",
            customNameI18n: facility.nameI18n
          })
        } else {
          // 미리 정의된 시설
          predefinedFacilities.push(facility.facilityType)
        }
      })

      setSelectedFacilities(predefinedFacilities)
      setCustomAvailableFacilities(availableCustoms)
      setCustomUnavailableFacilities(unavailableCustoms)
    } catch (error) {
      console.error("룸 조회 실패:", error)
      alert("룸 정보를 불러오는데 실패했습니다.")
      router.push(`/admin/residences/${residenceIdentifier}/rooms`)
    } finally {
      setIsLoading(false)
    }
  }

  // 룸 삭제
  const handleDelete = async () => {
    if (!room) return
    
    const confirmed = confirm(
      `"${room.nameI18n.ko}" 룸을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await apiDelete(`/api/v1/admin/residences/${residenceIdentifier}/rooms/${roomIdentifier}`)
      alert("룸이 삭제되었습니다.")
      router.push(`/admin/residences/${residenceIdentifier}/rooms`)
    } catch (error) {
      console.error("룸 삭제 실패:", error)
      alert("룸 삭제에 실패했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  // 갤러리 이미지 추가
  const handleAddGalleryImage = (file: File) => {
    const newImage: GalleryImage = {
      file,
      displayOrder: galleryImages.length,
      preview: URL.createObjectURL(file)
    }
    setGalleryImages([...galleryImages, newImage])
  }

  // 갤러리 이미지 제거
  const handleRemoveGalleryImage = (index: number) => {
    const newImages = galleryImages.filter((_, i) => i !== index)
    setGalleryImages(newImages.map((img, i) => ({ ...img, displayOrder: i })))
  }

  // 드래그 앤 드롭
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...galleryImages]
    const draggedItem = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)
    
    setGalleryImages(newImages.map((img, i) => ({ ...img, displayOrder: i })))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // 미리 정의된 시설 선택/해제
  const toggleFacility = (facilityType: string) => {
    if (selectedFacilities.includes(facilityType)) {
      setSelectedFacilities(selectedFacilities.filter(f => f !== facilityType))
    } else {
      setSelectedFacilities([...selectedFacilities, facilityType])
    }
  }

  // 커스텀 시설 추가
  const addCustomFacility = (type: "AVAILABLE" | "UN_AVAILABLE") => {
    const newFacility: CustomFacility = {
      type,
      customNameI18n: { ko: "", en: "", zh: "", fr: "" }
    }
    
    if (type === "AVAILABLE") {
      setCustomAvailableFacilities([...customAvailableFacilities, newFacility])
    } else {
      setCustomUnavailableFacilities([...customUnavailableFacilities, newFacility])
    }
  }

  // 커스텀 시설 제거
  const removeCustomFacility = (type: "AVAILABLE" | "UN_AVAILABLE", index: number) => {
    if (type === "AVAILABLE") {
      setCustomAvailableFacilities(customAvailableFacilities.filter((_, i) => i !== index))
    } else {
      setCustomUnavailableFacilities(customUnavailableFacilities.filter((_, i) => i !== index))
    }
  }

  // 커스텀 시설 이름 변경
  const updateCustomFacilityName = (
    type: "AVAILABLE" | "UN_AVAILABLE",
    index: number,
    lang: keyof I18nField,
    value: string
  ) => {
    if (type === "AVAILABLE") {
      const updated = [...customAvailableFacilities]
      updated[index].customNameI18n[lang] = value
      setCustomAvailableFacilities(updated)
    } else {
      const updated = [...customUnavailableFacilities]
      updated[index].customNameI18n[lang] = value
      setCustomUnavailableFacilities(updated)
    }
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
      
      // 다국어 필드 - 룸명 (필수)
      formData.append("nameI18n[ko]", name.ko)
      formData.append("nameI18n[en]", name.en)
      formData.append("nameI18n[zh]", name.zh)
      formData.append("nameI18n[fr]", name.fr)
      
      // 설명 (필수)
      formData.append("descriptionI18n[ko]", description.ko)
      formData.append("descriptionI18n[en]", description.en)
      formData.append("descriptionI18n[zh]", description.zh)
      formData.append("descriptionI18n[fr]", description.fr)
      
      // 규칙 (필수)
      formData.append("rulesI18n[ko]", rules.ko)
      formData.append("rulesI18n[en]", rules.en)
      formData.append("rulesI18n[zh]", rules.zh)
      formData.append("rulesI18n[fr]", rules.fr)
      
      // 가격 (필수)
      formData.append("pricePerNight", pricePerNight)
      
      // 갤러리 이미지 - 모든 이미지를 File로 변환
      const galleryPromises = galleryImages.map(async (img, index) => {
        if (img.file) {
          return {
            displayOrder: img.displayOrder,
            file: img.file
          }
        } else if (img.imageUrl) {
          try {
            const response = await fetch(img.imageUrl)
            if (!response.ok) {
              console.warn(`갤러리 이미지 ${index} 로드 실패: ${response.status}`)
              return null
            }
            
            const blob = await response.blob()
            const filename = img.imageUrl.split('/').pop() || `gallery_${index}.png`
            const file = new File([blob], filename, { type: blob.type })
            return {
              displayOrder: img.displayOrder,
              file: file
            }
          } catch (error) {
            console.error(`갤러리 이미지 ${index} 로드 실패:`, error)
            return null
          }
        }
        return null
      })

      const galleryFiles = await Promise.all(galleryPromises)
      
      // null이 아닌 것만 FormData에 추가
      let galleryIndex = 0
      galleryFiles.forEach((item) => {
        if (item && item.file) {
          formData.append(`galleryImages[${galleryIndex}].displayOrder`, galleryIndex.toString())
          formData.append(`galleryImages[${galleryIndex}].file`, item.file)
          galleryIndex++
        }
      })

      // 시설 - 미리 정의된 시설
      selectedFacilities.forEach((facilityType, index) => {
        formData.append(`facilities[${index}].facilityType`, facilityType)
      })

      // 시설 - 커스텀 AVAILABLE (검증 통과한 것만)
      let facilityIndex = selectedFacilities.length
      customAvailableFacilities.forEach((facility) => {
        // 모든 언어가 입력된 경우만 전송
        if (facility.customNameI18n.ko.trim() && 
            facility.customNameI18n.en.trim() && 
            facility.customNameI18n.zh.trim() && 
            facility.customNameI18n.fr.trim()) {
          formData.append(`facilities[${facilityIndex}].facilityType`, "AVAILABLE")
          formData.append(`facilities[${facilityIndex}].customNameI18n[ko]`, facility.customNameI18n.ko)
          formData.append(`facilities[${facilityIndex}].customNameI18n[en]`, facility.customNameI18n.en)
          formData.append(`facilities[${facilityIndex}].customNameI18n[zh]`, facility.customNameI18n.zh)
          formData.append(`facilities[${facilityIndex}].customNameI18n[fr]`, facility.customNameI18n.fr)
          facilityIndex++
        }
      })

      // 시설 - 커스텀 UN_AVAILABLE (검증 통과한 것만)
      customUnavailableFacilities.forEach((facility) => {
        // 모든 언어가 입력된 경우만 전송
        if (facility.customNameI18n.ko.trim() && 
            facility.customNameI18n.en.trim() && 
            facility.customNameI18n.zh.trim() && 
            facility.customNameI18n.fr.trim()) {
          formData.append(`facilities[${facilityIndex}].facilityType`, "UN_AVAILABLE")
          formData.append(`facilities[${facilityIndex}].customNameI18n[ko]`, facility.customNameI18n.ko)
          formData.append(`facilities[${facilityIndex}].customNameI18n[en]`, facility.customNameI18n.en)
          formData.append(`facilities[${facilityIndex}].customNameI18n[zh]`, facility.customNameI18n.zh)
          formData.append(`facilities[${facilityIndex}].customNameI18n[fr]`, facility.customNameI18n.fr)
          facilityIndex++
        }
      })

      await apiPutFormData(
        `/api/v1/admin/residences/${residenceIdentifier}/rooms/${roomIdentifier}`,
        formData
      )

      alert("룸이 수정되었습니다.")
      setIsEditMode(false)
      fetchRoomDetail()
    } catch (error) {
      console.error("룸 수정 실패:", error)
      alert("룸 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!room) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">룸을 찾을 수 없습니다.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{room.nameI18n.ko}</h1>
            <p className="text-sm text-gray-600 mt-1">
              룸 상세 정보
            </p>
          </div>
          <div className="flex gap-3">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false)
                    fetchRoomDetail()
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
                  onClick={() => router.push(`/admin/residences/${residenceIdentifier}/rooms`)}
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
              {/* 룸명 */}
              <div>
                <Label htmlFor={`name-${activeTab}`}>
                  룸명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`name-${activeTab}`}
                  value={name[activeTab]}
                  onChange={(e) => setName({ ...name, [activeTab]: e.target.value })}
                  placeholder="룸명을 입력하세요"
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
                  placeholder="룸 설명을 입력하세요"
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

              {/* 규칙 */}
              <div>
                <Label htmlFor={`rules-${activeTab}`}>
                  규칙 <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id={`rules-${activeTab}`}
                  value={rules[activeTab]}
                  onChange={(e) => setRules({ ...rules, [activeTab]: e.target.value })}
                  placeholder="룸 규칙을 입력하세요"
                  required
                  disabled={!isEditMode || isSaving}
                  readOnly={!isEditMode}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:border-transparent disabled:bg-gray-50 ${
                    isEditMode && !rules[activeTab].trim() ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {isEditMode && !rules[activeTab].trim() && (
                  <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 가격 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">가격</h3>
            <div>
              <Label htmlFor="pricePerNight">
                1박 가격 (USD) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pricePerNight"
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder="50"
                min="0"
                step="1"
                required
                disabled={!isEditMode || isSaving}
                readOnly={!isEditMode}
                className={isEditMode && (!pricePerNight || Number(pricePerNight) <= 0) ? 'border-red-300' : ''}
              />
              {isEditMode && (!pricePerNight || Number(pricePerNight) <= 0) && (
                <p className="text-xs text-red-500 mt-1">필수 입력 항목입니다</p>
              )}
            </div>
          </div>

          {/* 시설 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">시설</h3>
            
            {!isEditMode ? (
              // 조회 모드
              <div className="space-y-4">
                {selectedFacilities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">기본 시설</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {selectedFacilities.map((facilityType) => {
                        const facility = PREDEFINED_FACILITIES.find(f => f.type === facilityType)
                        if (!facility) return null
                        return (
                          <div key={facilityType} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                            <img src={facility.icon} alt={facility.nameI18n.ko} className="w-6 h-6" />
                            <span className="text-sm text-gray-700">{facility.nameI18n.ko}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {customAvailableFacilities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">커스텀 시설 (이용 가능)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {customAvailableFacilities.map((facility, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <img
                            src="https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/available_custom.png"
                            alt="Available"
                            className="w-6 h-6"
                          />
                          <span className="text-sm text-gray-700">{facility.customNameI18n.ko}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {customUnavailableFacilities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">커스텀 시설 (이용 불가)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {customUnavailableFacilities.map((facility, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <img
                            src="https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/un_available_custom.png"
                            alt="Unavailable"
                            className="w-6 h-6"
                          />
                          <span className="text-sm text-gray-700">{facility.customNameI18n.ko}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedFacilities.length === 0 && customAvailableFacilities.length === 0 && customUnavailableFacilities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">등록된 시설이 없습니다</p>
                )}
              </div>
            ) : (
              // 수정 모드
              <>
                {/* 미리 정의된 시설 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">기본 시설</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {PREDEFINED_FACILITIES.map((facility) => (
                      <label
                        key={facility.type}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedFacilities.includes(facility.type)
                            ? 'border-[#E91E63] bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFacilities.includes(facility.type)}
                          onChange={() => toggleFacility(facility.type)}
                          className="rounded text-[#E91E63] focus:ring-[#E91E63] cursor-pointer"
                        />
                        <img src={facility.icon} alt={facility.nameI18n.ko} className="w-6 h-6" />
                        <span className="text-sm text-gray-700">{facility.nameI18n.ko}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 커스텀 시설 - AVAILABLE */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">커스텀 시설 (이용 가능)</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomFacility("AVAILABLE")}
                      className="cursor-pointer"
                    >
                      + 추가
                    </Button>
                  </div>
                  {customAvailableFacilities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      추가된 커스텀 시설이 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customAvailableFacilities.map((facility, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img
                                src="https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/available_custom.png"
                                alt="Available"
                                className="w-6 h-6"
                              />
                              <span className="text-sm font-medium text-gray-700">커스텀 시설 {index + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCustomFacility("AVAILABLE", index)}
                              className="text-red-600 hover:text-red-700 text-sm cursor-pointer"
                            >
                              삭제
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {languages.map((lang) => (
                              <Input
                                key={lang.code}
                                placeholder={`시설명 (${lang.label})`}
                                value={facility.customNameI18n[lang.code]}
                                onChange={(e) => updateCustomFacilityName("AVAILABLE", index, lang.code, e.target.value)}
                                disabled={isSaving}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 커스텀 시설 - UN_AVAILABLE */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">커스텀 시설 (이용 불가)</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomFacility("UN_AVAILABLE")}
                      className="cursor-pointer"
                    >
                      + 추가
                    </Button>
                  </div>
                  {customUnavailableFacilities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      추가된 커스텀 시설이 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customUnavailableFacilities.map((facility, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img
                                src="https://pub-8b0dd235649e4440bed055194eae710b.r2.dev/icon/un_available_custom.png"
                                alt="Unavailable"
                                className="w-6 h-6"
                              />
                              <span className="text-sm font-medium text-gray-700">커스텀 시설 {index + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCustomFacility("UN_AVAILABLE", index)}
                              className="text-red-600 hover:text-red-700 text-sm cursor-pointer"
                            >
                              삭제
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {languages.map((lang) => (
                              <Input
                                key={lang.code}
                                placeholder={`시설명 (${lang.label})`}
                                value={facility.customNameI18n[lang.code]}
                                onChange={(e) => updateCustomFacilityName("UN_AVAILABLE", index, lang.code, e.target.value)}
                                disabled={isSaving}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 갤러리 이미지 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">갤러리 이미지</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  draggable={isEditMode}
                  onDragStart={() => isEditMode && handleDragStart(index)}
                  onDragOver={(e) => isEditMode && handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group ${isEditMode ? 'cursor-move' : ''} ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                    <img
                      src={img.preview}
                      alt={`갤러리 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleAddGalleryImage(file)
                    }
                    input.click()
                  }}
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
        </form>
      </div>
    </AdminLayout>
  )
}

