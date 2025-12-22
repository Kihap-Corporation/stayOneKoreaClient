"use client"

import { useEffect, useRef, useState } from "react"
import { loadNaverMaps } from "@/lib/naver-maps-loader"

// 네이버 지도 타입 정의
declare global {
  interface Window {
    naver?: any
    navermap_authFailure?: () => void
  }
}

interface NaverStaticMapProps {
  center: {
    lat: number
    lng: number
  }
  markers: Array<{
    lat: number
    lng: number
    label?: string
    color?: string
  }>
  width?: number
  height?: number
  level?: number
  onMarkerClick?: (index: number) => void
  onCenterChanged?: (center: { lat: number; lng: number }) => void
  /**
   * Naver Map language
   * - ko, en, zh supported
   * - if omitted, Naver default is used (but we typically pass en/ko/zh)
   */
  language?: 'ko' | 'en' | 'zh'
}

export function NaverStaticMap({
  center,
  markers,
  width = 480,
  height = 818,
  level = 12,
  onMarkerClick,
  onCenterChanged,
  language
}: NaverStaticMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markerInstances, setMarkerInstances] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLOUD_CLIENT_ID

  // language 변경 시 SDK를 재로딩해서 지도 언어가 즉시 반영되도록 한다.
  useEffect(() => {
    if (!CLIENT_ID) return
    const lang = language || 'en'

    // 기존 지도/마커 제거 후 재생성 준비
    markerInstances.forEach((marker) => marker.setMap?.(null))
    setMarkerInstances([])
    setMap(null)
    setIsLoaded(false)

    loadNaverMaps(CLIENT_ID, lang)
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CLIENT_ID, language])

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !CLIENT_ID) return
    
    // 이미 지도가 있으면 초기화하지 않음
    if (map) return


    const mapOptions = {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: level,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.naver.maps.MapTypeControlStyle.BUTTON,
        position: window.naver.maps.Position.TOP_RIGHT
      }
    }

    const mapInstance = new window.naver.maps.Map(mapRef.current, mapOptions)
    setMap(mapInstance)
  }, [isLoaded, CLIENT_ID, map, center.lat, center.lng, level])

  // 지도 중심점 업데이트 (지도 재생성 없이)
  useEffect(() => {
    if (!map || !window.naver) return

    map.setCenter(new window.naver.maps.LatLng(center.lat, center.lng))
    map.setZoom(level)
  }, [map, center.lat, center.lng, level])

  // 사용자 드래그/줌 등으로 중심점이 바뀐 경우 상위로 전달
  useEffect(() => {
    if (!map || !window.naver || !onCenterChanged) return

    const listener = window.naver.maps.Event.addListener(map, 'idle', () => {
      const c = map.getCenter()
      // naver.maps.LatLng: lat(), lng()
      onCenterChanged({ lat: c.lat(), lng: c.lng() })
    })

    return () => {
      try {
        window.naver.maps.Event.removeListener(listener)
      } catch {
        // ignore
      }
    }
  }, [map, onCenterChanged])

  // 마커 생성
  useEffect(() => {
    if (!map || !window.naver) return

    // 기존 마커 제거
    markerInstances.forEach((marker) => {
      marker.setMap(null)
    })

    const newMarkers = markers.map((marker, index) => {
      const markerOptions = {
        position: new window.naver.maps.LatLng(marker.lat, marker.lng),
        map: map,
        title: marker.label || `Marker ${index + 1}`,
        icon: {
          content: `
            <div style="
              background-color: ${marker.color || '#4285F4'};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
              cursor: pointer;
            ">
              ${marker.label || index + 1}
            </div>
          `,
          anchor: new window.naver.maps.Point(16, 16)
        }
      }

      const markerInstance = new window.naver.maps.Marker(markerOptions)

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(markerInstance, 'click', () => {
        if (onMarkerClick) {
          onMarkerClick(index)
        }
      })

      return markerInstance
    })

    setMarkerInstances(newMarkers)
  }, [map, markers, onMarkerClick])

  // API 로드 실패 처리
  useEffect(() => {
    window.navermap_authFailure = () => {
      alert('지도를 불러올 수 없습니다. API 키를 확인해주세요.')
    }
  }, [])

  return (
    <>
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl overflow-hidden naver-map-container"
        style={{
          position: 'relative',
          zIndex: 1
        }}
      >
        {!isLoaded && (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-[#4285F4] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">지도를 불러오는 중...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

