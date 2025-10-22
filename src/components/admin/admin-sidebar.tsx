"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface MenuItem {
  icon: string
  label: string
  href: string
}

const menuItems: MenuItem[] = [
  {
    icon: "🏠",
    label: "대시보드",
    href: "/admin"
  },
  {
    icon: "🏢",
    label: "고시원 관리",
    href: "/admin/residences"
  },
  {
    icon: "🛏️",
    label: "룸 관리",
    href: "/admin/rooms"
  },
  {
    icon: "📅",
    label: "예약 관리",
    href: "/admin/bookings"
  },
  {
    icon: "👥",
    label: "사용자 관리",
    href: "/admin/users"
  },
  {
    icon: "🔍",
    label: "검색 키워드 관리",
    href: "/admin/keywords"
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* 로고 영역 */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-[#E91E63]">
            Stay One Korea
          </div>
        </div>
      </div>

      {/* 관리자 배지 */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-[#E91E63] text-white rounded">
            관리자
          </span>
          <span className="text-sm text-gray-600">Admin Panel</span>
        </div>
      </div>

      {/* 메뉴 목록 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-200 cursor-pointer
                  ${
                    isActive(item.href)
                      ? "bg-[#E91E63] text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Version 1.0.0
        </div>
      </div>
    </aside>
  )
}


