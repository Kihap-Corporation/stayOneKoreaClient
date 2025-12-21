import { NextRequest, NextResponse } from 'next/server'

/**
 * 이미지 프록시 API
 * CORS 문제를 해결하기 위해 서버 사이드에서 이미지를 다운로드하여 반환합니다.
 * 수정 제출 시 기존 이미지를 다시 다운로드할 때 사용됩니다.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json(
      { error: '이미지 URL이 필요합니다.' },
      { status: 400 }
    )
  }

  try {
    // URL 검증 (보안을 위해 특정 도메인만 허용)
    const allowedDomains = [
      'img.stayonekorea.com',
      'stayonekorea.com',
      'localhost',
    ]

    const url = new URL(imageUrl)
    const isAllowed = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    )

    if (!isAllowed) {
      return NextResponse.json(
        { error: '허용되지 않은 도메인입니다.' },
        { status: 403 }
      )
    }

    // 이미지 다운로드
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `이미지 다운로드 실패: ${response.status}` },
        { status: response.status }
      )
    }

    // 이미지 데이터 가져오기
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // CORS 헤더 추가하여 반환
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (error) {
    console.error('이미지 프록시 오류:', error)
    return NextResponse.json(
      { error: '이미지 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
