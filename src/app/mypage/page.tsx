"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function MyPage() {
  const [editingSection, setEditingSection] = useState<string | null>(null)

  // Mock user data
  const [userData, setUserData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "ent***@email.com",
    phoneCountry: "South Korea +82",
    phoneNumber: "10-1234-5678",
    password: "••••••••••••••••••",
  })

  const handleEdit = (section: string) => {
    setEditingSection(editingSection === section ? null : section)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6 xl:px-8 xl:py-12 xl:max-w-[600px]">
          {/* Page Title */}
          <div className="mb-8 flex items-center gap-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h1 className="text-2xl font-semibold">My account</h1>
          </div>

          {/* Name Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Name</h2>
            <div className="rounded-lg bg-white p-6">
              <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-600">First name</label>
                  <input
                    type="text"
                    value={userData.firstName}
                    disabled={editingSection !== "name"}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-600">Last name</label>
                  <input
                    type="text"
                    value={userData.lastName}
                    disabled={editingSection !== "name"}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
              <button
                onClick={() => handleEdit("name")}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100"
              >
                {editingSection === "name" ? "Save" : "Edit"}
              </button>
            </div>
          </div>

          {/* Email Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Email</h2>
            <div className="rounded-lg bg-white p-6">
              <div className="mb-4">
                <input
                  type="email"
                  value={userData.email}
                  disabled={editingSection !== "email"}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="ent***@email.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <button
                onClick={() => handleEdit("email")}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100"
              >
                {editingSection === "email" ? "Save" : "Edit"}
              </button>
            </div>
          </div>

          {/* Phone Number Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Phone number</h2>
            <div className="rounded-lg bg-white p-6">
              <div className="mb-4 flex gap-2">
                <select
                  disabled={editingSection !== "phone"}
                  value={userData.phoneCountry}
                  onChange={(e) => setUserData({ ...userData, phoneCountry: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option>South Korea +82</option>
                </select>
                <input
                  type="tel"
                  value={userData.phoneNumber}
                  disabled={editingSection !== "phone"}
                  onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                  placeholder="10-1234-5678"
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <button
                onClick={() => handleEdit("phone")}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100"
              >
                {editingSection === "phone" ? "Save" : "Edit"}
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-base font-semibold">Password</h2>
            <div className="rounded-lg bg-white p-6">
              <div className="mb-4">
                <input
                  type="password"
                  value={userData.password}
                  disabled={editingSection !== "password"}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <button
                onClick={() => handleEdit("password")}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium hover:bg-gray-100"
              >
                {editingSection === "password" ? "Save" : "Edit"}
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="mt-8 text-center">
            <button className="text-sm text-gray-400 hover:text-gray-600">Delete my account</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
