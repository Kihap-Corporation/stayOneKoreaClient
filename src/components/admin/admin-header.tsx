"use client"

import { Button } from "@/components/ui/button"
import { logout } from "@/lib/api"

interface AdminHeaderProps {
  email: string | null
}

export function AdminHeader({ email }: AdminHeaderProps) {
  const handleLogout = async () => {
    const confirmed = confirm("로그아웃 하시겠습니까?")
    if (confirmed) {
      await logout()
    }
  }

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* 왼쪽: 페이지 제목 영역 (각 페이지에서 커스터마이징 가능) */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">
            관리자 페이지
          </h1>
        </div>

        {/* 오른쪽: 사용자 정보 및 로그아웃 */}
        <div className="flex items-center gap-4">
          {/* 알림 아이콘 (추후 구현) */}
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="알림"
          >
            <span className="text-xl">🔔</span>
          </button>

          {/* 사용자 정보 */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">관리자</div>
              <div className="text-xs text-gray-500">{email}</div>
            </div>

            {/* 로그아웃 버튼 */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}


