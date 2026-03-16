import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Users,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [showPassword, setShowPassword] = useState(false)

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "team", label: "Team & Billing", icon: Users },
  ]

  return (
    <motion.div
      className="p-8 max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2B2B2B]">Settings</h1>
        <p className="text-[#8A8A8A] mt-2">Manage your account, security, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-[#E3E3E3]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[#C67C4E] text-[#C67C4E]"
                  : "border-transparent text-[#8A8A8A] hover:text-[#5A5A5A]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Account Settings */}
        {activeTab === "account" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Info */}
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Profile Information</h2>

              <div className="mb-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] rounded-full"></div>
                <button className="px-4 py-2 bg-[#E3E3E3] text-[#2B2B2B] rounded-lg hover:bg-[#D9D9D9] transition-all">
                  Change Photo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingInput label="First Name" previewValue="John" />
                <SettingInput label="Last Name" previewValue="Doe" />
                <SettingInput label="Email" previewValue="john@example.com" type="email" />
                <SettingInput label="Phone" previewValue="+1 (555) 123-4567" />
              </div>

              <textarea
                className="w-full mt-6 p-3 border border-[#E3E3E3] rounded-lg text-[#2B2B2B] placeholder-[#8A8A8A]"
                placeholder="Bio / Professional Summary"
                rows={3}
              ></textarea>

              <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all font-semibold">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

            {/* Workspace Info */}
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Workspace</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingInput label="Workspace Name" previewValue="My Law Firm" />
                <SettingInput label="Industry" previewValue="Corporate Law" />
              </div>

              <button className="mt-6 px-6 py-3 border border-[#E3E3E3] text-[#2B2B2B] rounded-lg hover:bg-[#FAFAFA] transition-all font-semibold">
                Delete Workspace
              </button>
            </div>
          </motion.div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Password */}
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Password</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2B2B2B] mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full p-3 border border-[#E3E3E3] rounded-lg text-[#2B2B2B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2B2B2B] mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-3 border border-[#E3E3E3] rounded-lg text-[#2B2B2B]"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button className="mt-6 px-6 py-3 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all font-semibold">
                  Update Password
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#2B2B2B]">Two-Factor Authentication</h3>
                  <p className="text-[#8A8A8A] text-sm mt-1">Add an extra layer of security to your account</p>
                </div>
                <span className="px-3 py-1 bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold rounded-full">
                  Disabled
                </span>
              </div>
              <button className="px-6 py-3 border border-[#E3E3E3] text-[#2B2B2B] rounded-lg hover:bg-[#FAFAFA] transition-all font-semibold">
                Enable 2FA
              </button>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Active Sessions</h2>

              <div className="space-y-3">
                {[
                  { device: "MacBook Pro", location: "San Francisco, CA", lastActive: "Just now" },
                  { device: "iPhone 14", location: "San Francisco, CA", lastActive: "2 hours ago" },
                ].map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-[#E3E3E3] rounded-lg">
                    <div>
                      <p className="font-semibold text-[#2B2B2B]">{session.device}</p>
                      <p className="text-sm text-[#8A8A8A]">{session.location}</p>
                      <p className="text-xs text-[#8A8A8A]">{session.lastActive}</p>
                    </div>
                    <button className="text-[#EF4444] hover:bg-[#FEE2E2] px-3 py-2 rounded transition-all">
                      Logout
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E3E3E3] p-6"
          >
            <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Notification Preferences</h2>

            <div className="space-y-4">
              {[
                { title: "Case Updates", description: "New analysis results and recommendations" },
                { title: "Documents", description: "When documents are uploaded and processed" },
                { title: "Legal Alerts", description: "Important legal precedents and changes" },
                { title: "Weekly Summary", description: "Summary of your activities and insights" },
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 p-4 border border-[#E3E3E3] rounded-lg cursor-pointer hover:bg-[#FAFAFA]">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#2B2B2B]">{item.title}</p>
                    <p className="text-sm text-[#8A8A8A]">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <button className="mt-6 px-6 py-3 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all font-semibold">
              Save Preferences
            </button>
          </motion.div>
        )}

        {/* Team & Billing */}
        {activeTab === "team" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Team Members */}
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#2B2B2B]">Team Members</h2>
                <button className="px-4 py-2 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all">
                  Invite Member
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "You", role: "Owner", email: "john@example.com" },
                  { name: "Sarah Smith", role: "Editor", email: "sarah@example.com" },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-[#E3E3E3] rounded-lg">
                    <div>
                      <p className="font-semibold text-[#2B2B2B]">{member.name}</p>
                      <p className="text-sm text-[#8A8A8A]">{member.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#E3E3E3] text-[#5A5A5A] text-xs font-semibold rounded-full">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Billing Information</h2>

              <div className="bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] text-white rounded-lg p-6 mb-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <p className="text-sm opacity-90">Current Plan</p>
                    <h3 className="text-2xl font-bold">Pro Plan</h3>
                    <p className="text-sm opacity-75 mt-1">$99/month • Renews on April 15, 2026</p>
                  </div>
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all font-semibold">
                    Upgrade
                  </button>
                </div>
              </div>

              <div className="border border-[#E3E3E3] rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-[#2B2B2B] mb-4">Payment Method</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2B2B2B]">Visa ending in 4242</p>
                    <p className="text-sm text-[#8A8A8A]">Expires 12/2026</p>
                  </div>
                  <button className="text-[#C67C4E] hover:text-[#A86039] font-semibold">Edit</button>
                </div>
              </div>

              <button className="w-full px-4 py-3 border border-[#E3E3E3] rounded-lg hover:bg-[#FAFAFA] transition-all font-semibold">
                Download Invoice
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function SettingInput({
  label,
  previewValue,
  type = "text",
}: {
  label: string
  previewValue: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2B2B2B] mb-2">{label}</label>
      <input
        type={type}
        defaultValue={previewValue}
        className="w-full p-3 border border-[#E3E3E3] rounded-lg text-[#2B2B2B] placeholder-[#8A8A8A]"
      />
    </div>
  )
}
