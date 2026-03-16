import { Outlet } from "react-router-dom"
import Sidebar from "../components/common/Sidebar"
import Header from "../components/common/Header"
import { useState } from "react"

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-[#ECECEC]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>

        {/* Footer / Legal Notice */}
        <footer className="bg-white border-t border-[#E3E3E3] px-8 py-4 text-xs text-[#8A8A8A]">
          <p>
            ⚠️ <strong>Legal Disclaimer:</strong> This AI provides information only. Not a substitute for licensed legal advice.
          </p>
        </footer>
      </div>
    </div>
  )
}