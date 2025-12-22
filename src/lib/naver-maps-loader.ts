type NaverMapsLanguage = 'ko' | 'en' | 'zh'

declare global {
  interface Window {
    naver?: any
    navermap_authFailure?: () => void
  }
}

const SCRIPT_ID = 'naver-maps-sdk'

function buildScriptSrc(clientId: string, language: NaverMapsLanguage) {
  return `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&language=${language}`
}

function getExistingScript(): HTMLScriptElement | null {
  if (typeof document === 'undefined') return null
  return document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
}

function removeExistingScriptAndGlobals() {
  const existing = getExistingScript()
  if (existing) existing.remove()

  // 스크립트가 가진 전역을 제거해서, language 변경 시 재로딩이 되도록 강제한다.
  // (동일 페이지에서 Naver 지도를 2개 이상 동시에 쓰는 경우가 아니라는 전제)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).naver = undefined
  } catch {
    // ignore
  }
}

export async function loadNaverMaps(clientId: string, language: NaverMapsLanguage): Promise<void> {
  if (typeof window === 'undefined') return

  // 이미 같은 언어로 로드되어 있고 SDK가 준비되어 있으면 재사용
  const existing = getExistingScript()
  const existingLang = existing?.getAttribute('data-language') as NaverMapsLanguage | null
  if (existing && existingLang === language && window.naver?.maps) {
    return
  }

  // 다른 언어(또는 불완전 로드)면 제거 후 다시 로드
  removeExistingScriptAndGlobals()

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'text/javascript'
    script.async = true
    script.src = buildScriptSrc(clientId, language)
    script.setAttribute('data-language', language)

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Naver Maps SDK load failed'))

    document.head.appendChild(script)
  })
}


