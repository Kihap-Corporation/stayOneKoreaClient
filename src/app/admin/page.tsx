"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useRouter } from "next/navigation"

export default function AdminHomePage() {
  const router = useRouter()

  const menuItems = [
    {
      icon: "🏢",
      title: "고시원 관리",
      description: "고시원 정보를 등록하고 관리합니다",
      href: "/admin/residences",
      color: "blue"
    },
    {
      icon: "🛏️",
      title: "룸 관리",
      description: "룸 정보를 등록하고 관리합니다",
      href: "/admin/rooms",
      color: "purple"
    },
    {
      icon: "⭐",
      title: "추천룸 관리",
      description: "홈페이지에 노출될 추천룸을 관리합니다",
      href: "/admin/recommend-rooms",
      color: "yellow"
    },
    {
      icon: "📅",
      title: "예약 관리",
      description: "예약 내역을 조회하고 관리합니다",
      href: "/admin/reservations",
      color: "green"
    },
    {
      icon: "👥",
      title: "사용자 관리",
      description: "사용자 정보를 조회하고 관리합니다",
      href: "/admin/users",
      color: "orange"
    },
    {
      icon: "🔍",
      title: "검색 키워드 관리",
      description: "검색 키워드를 관리합니다",
      href: "/admin/keywords",
      color: "pink"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; icon: string }> = {
      blue: { bg: "bg-blue-600", hover: "hover:bg-blue-700", icon: "bg-blue-100" },
      purple: { bg: "bg-purple-600", hover: "hover:bg-purple-700", icon: "bg-purple-100" },
      yellow: { bg: "bg-yellow-600", hover: "hover:bg-yellow-700", icon: "bg-yellow-100" },
      green: { bg: "bg-green-600", hover: "hover:bg-green-700", icon: "bg-green-100" },
      orange: { bg: "bg-orange-600", hover: "hover:bg-orange-700", icon: "bg-orange-100" },
      pink: { bg: "bg-pink-600", hover: "hover:bg-pink-700", icon: "bg-pink-100" }
    }
    return colors[color] || colors.blue
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            관리자 대시보드
          </h1>
          <p className="text-gray-600">
            Stay One Korea 관리 시스템
          </p>
        </div>

        {/* 관리 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const colors = getColorClasses(item.color)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${colors.icon} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#E91E63] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {item.description}
                </p>
                <div className={`inline-flex items-center text-sm font-medium ${colors.bg.replace('bg-', 'text-')} group-hover:underline`}>
                  바로가기 →
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </AdminLayout>
  )
}

