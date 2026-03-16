import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Scale,
  BookOpen,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { colors } from "../../styles/theme"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? `bg-[#C67C4E] text-white font-medium`
        : `text-[#5A5A5A] hover:bg-[#E3E3E3]`
    }`

  const sectionTitle = "text-xs font-bold text-[#8A8A8A] uppercase tracking-wider mt-6 mb-3 px-4"

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-[#E3E3E3] shadow-sm transition-all duration-300 flex flex-col ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-[#E3E3E3]">
          <div className={`flex items-center ${!isOpen && "justify-center w-full"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            {isOpen && (
              <div className="ml-3">
                <h1 className="font-bold text-[#2B2B2B] text-lg">Legal AI</h1>
                <p className="text-xs text-[#8A8A8A]">Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {/* Main Section */}
          {isOpen && <div className={sectionTitle}>Platform</div>}

          <NavLink
            to="/dashboard"
            className={({ isActive }) => navItemClass(isActive)}
            title={!isOpen ? "Dashboard" : ""}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/"
            className={({ isActive }) => navItemClass(isActive)}
            title={!isOpen ? "Chat" : ""}
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>AI Legal Chat</span>}
          </NavLink>

          {/* Tools Section */}
          {isOpen && <div className={sectionTitle}>Tools</div>}

          <NavLink
            to="/documents"
            className={({ isActive }) => navItemClass(isActive)}
            title={!isOpen ? "Documents" : ""}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Documents</span>}
          </NavLink>

          <NavLink
            to="/legal-meter"
            className={({ isActive }) => navItemClass(isActive)}
            title={!isOpen ? "Case Analysis" : ""}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Case Analysis</span>}
          </NavLink>

          <NavLink
            to="/laws"
            className={({ isActive }) => navItemClass(isActive)}
            title={!isOpen ? "Laws" : ""}
          >
            <Scale className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Laws & References</span>}
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => navItemClass(isActive)}
            title={!isOpen ? "History" : ""}
          >
            <History className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Chat History</span>}
          </NavLink>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#E3E3E3] p-3 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) => navItemClass(isActive)}
            title={!isOpen ? "Settings" : ""}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Settings</span>}
          </NavLink>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-[#5A5A5A] hover:bg-[#FEE2E2] hover:text-[#EF4444] rounded-lg transition-all"
            title={!isOpen ? "Sign Out" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse Button */}
        {isOpen && (
          <div className="p-3 border-t border-[#E3E3E3]">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center py-2 text-[#8A8A8A] hover:bg-[#F5F5F5] rounded-lg transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Collapsed Sidebar Expand Button */}
      {!isOpen && (
        <div className="flex items-center justify-center py-6">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-[#E3E3E3] rounded-lg transition-all"
          >
            <ChevronRight className="w-4 h-4 text-[#8A8A8A]" />
          </button>
        </div>
      )}
    </>
  )
}