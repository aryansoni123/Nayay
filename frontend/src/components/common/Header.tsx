import { Menu, Search, Bell, HelpCircle, Shield, User } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-[#E3E3E3] shadow-xs flex items-center justify-between px-8">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all text-[#5A5A5A]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-[#FAFAFA] border border-[#E3E3E3] rounded-lg px-4 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search laws, documents, conversations..."
            className="flex-1 bg-transparent text-sm text-[#2B2B2B] placeholder-[#8A8A8A] outline-none"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Trust Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-[#D1FAE5] rounded-lg">
          <Shield className="w-4 h-4 text-[#10B981]" />
          <span className="text-xs font-medium text-[#10B981]">Enterprise Grade</span>
        </div>

        {/* Help */}
        <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all text-[#5A5A5A]" title="Help">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all text-[#5A5A5A] relative" title="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-[#F5F5F5] rounded-lg transition-all">
          <div className="w-8 h-8 bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[#2B2B2B]">John Doe</p>
            <p className="text-xs text-[#8A8A8A]">Pro Plan</p>
          </div>
        </button>
      </div>
    </header>
  )
}