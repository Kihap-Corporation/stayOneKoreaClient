"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

// 네이버 지도 타입 정의
declare global {
  interface Window {
    naver: any
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
}

export function NaverStaticMap({
  center,
  markers,
  width = 480,
  height = 818,
  level = 12,
  onMarkerClick
}: NaverStaticMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markerInstances, setMarkerInstances] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLOUD_CLIENT_ID

  // Check if script is already loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.naver && window.naver.maps && !isLoaded) {
      setIsLoaded(true)
    }
  }, [isLoaded])

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
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`}
        strategy="lazyOnload"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(false)
        }}
      />

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

