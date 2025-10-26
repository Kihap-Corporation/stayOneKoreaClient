"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

interface User {
  identifier: string
  email: string
  fullName: string
  countryCode: string
  phoneNumber: string
  createdAt: string
  deletedAt: string | null
}

interface UserListResponse {
  users: User[]
  currentPage: number
  totalPages: number
  totalElements: number
}

export default function AdminUsersPage() {
  const { messages } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"createdAt" | "name">("createdAt")
  const [direction, setDirection] = useState<"ASC" | "DESC">("DESC")
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, sortBy, direction, pageSize])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const url = `/api/admin/users?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&direction=${direction}`
      const response = await apiGet(url)
      const data: UserListResponse = response.data
      
      setUsers(data.users)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error("유저 목록 조회 실패:", error)
      alert(messages.admin.users.loadError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortChange = (newSortBy: "createdAt" | "name") => {
    setSortBy(newSortBy)
    setCurrentPage(1)
  }

  const handleDirectionToggle = () => {
    setDirection(direction === "ASC" ? "DESC" : "ASC")
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatPhoneNumber = (countryCode: string, phoneNumber: string) => {
    return `+${countryCode} ${phoneNumber}`
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{messages.admin.users.title}</h1>
            <p className="text-gray-600 mt-2">
              {messages.admin.users.totalUsers}: {totalElements}
            </p>
          </div>
        </div>

        {/* 정렬 옵션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* 정렬 */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">{messages.admin.users.sortBy}:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSortChange("createdAt")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    sortBy === "createdAt"
                      ? "bg-[#E91E63] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {messages.admin.users.sortByCreatedAt}
                </button>
                <button
                  onClick={() => handleSortChange("name")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    sortBy === "name"
                      ? "bg-[#E91E63] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {messages.admin.users.sortByName}
                </button>
              </div>
              <button
                onClick={handleDirectionToggle}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {direction === "ASC" ? `↑ ${messages.admin.users.asc}` : `↓ ${messages.admin.users.desc}`}
              </button>
            </div>

            {/* 페이지 크기 선택 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{messages.admin.users.perPage}:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>
        </div>

        {/* 유저 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]"></div>
              <p className="mt-4 text-gray-600">{messages.common.loading}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">{messages.admin.users.noUsers}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {messages.admin.users.email}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {messages.admin.users.fullName}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {messages.admin.users.phoneNumber}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {messages.admin.users.createdAt}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {messages.admin.users.status}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.identifier} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatPhoneNumber(user.countryCode, user.phoneNumber)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.deletedAt ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {messages.admin.users.deleted}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {messages.admin.users.active}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className="cursor-pointer"
            >
              {messages.common.cancel === "취소" ? "이전" : "Previous"}
            </Button>
            <span className="text-sm text-gray-600">
              {messages.admin.users.page} {currentPage} {messages.admin.users.of} {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="cursor-pointer"
            >
              {messages.common.cancel === "취소" ? "다음" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

