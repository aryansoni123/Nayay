import { motion } from "framer-motion"
import { Users, Plus, Mail, Shield, Trash2, Edit2, CheckCircle, Clock } from "lucide-react"

export default function TeamPage() {
  return (
    <motion.div
      className="p-8 max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2B2B2B]">Team Management</h1>
        <p className="text-[#8A8A8A] mt-2">Manage team members and permissions</p>
      </div>

      {/* Current Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E3E3E3]">
              <h2 className="text-lg font-bold text-[#2B2B2B]">Team Members (3/5)</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all">
                <Plus className="w-4 h-4" />
                Invite Member
              </button>
            </div>

            {/* Members */}
            <div className="divide-y divide-[#E3E3E3]">
              {[
                {
                  name: "John Doe",
                  email: "john@example.com",
                  role: "Owner",
                  joinDate: "Jan 15, 2024",
                  status: "active",
                },
                {
                  name: "Sarah Smith",
                  email: "sarah@example.com",
                  role: "Editor",
                  joinDate: "Feb 20, 2024",
                  status: "active",
                },
                {
                  name: "Mike Johnson",
                  email: "mike@example.com",
                  role: "Viewer",
                  joinDate: "Mar 01, 2024",
                  status: "pending",
                },
              ].map((member, idx) => (
                <div key={idx} className="p-6 hover:bg-[#FAFAFA] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#2B2B2B]">{member.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            member.status === "active"
                              ? "bg-[#D1FAE5] text-[#059669]"
                              : "bg-[#FEF3C7] text-[#D97706]"
                          }`}
                        >
                          {member.status === "active" ? "Active" : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-[#8A8A8A]">{member.email}</p>
                      <p className="text-xs text-[#8A8A8A] mt-2">Joined {member.joinDate}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={member.role}
                        className="px-3 py-1 text-sm border border-[#E3E3E3] rounded-lg text-[#2B2B2B] bg-white"
                      >
                        <option>Owner</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                      <button className="p-2 hover:bg-[#E3E3E3] rounded-lg transition-all text-[#8A8A8A]">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-all text-[#EF4444]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Role Description */}
                  <div className="text-xs text-[#8A8A8A] bg-[#FAFAFA] p-2 rounded">
                    {member.role === "Owner" && "Full access to all features and settings"}
                    {member.role === "Editor" && "Can view, edit, and analyze cases"}
                    {member.role === "Viewer" && "Read-only access to cases and documents"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invite Section */}
        <div className="space-y-6">
          {/* Team Stats */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
            <h3 className="text-lg font-bold text-[#2B2B2B] mb-4">Team Overview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#8A8A8A] mb-1">Total Members</p>
                <p className="text-3xl font-bold text-[#2B2B2B]">3</p>
              </div>
              <div>
                <p className="text-sm text-[#8A8A8A] mb-1">Available Seats</p>
                <p className="text-3xl font-bold text-[#C67C4E]">2</p>
              </div>
              <button className="w-full px-4 py-2 border border-[#E3E3E3] rounded-lg hover:bg-[#FAFAFA] transition-all text-[#5A5A5A] font-semibold">
                Upgrade for More Seats
              </button>
            </div>
          </div>

          {/* Roles Info */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
            <h3 className="text-lg font-bold text-[#2B2B2B] mb-4">Roles & Permissions</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-[#2B2B2B] mb-1">👑 Owner</p>
                <p className="text-[#8A8A8A]">Full access and control</p>
              </div>
              <div>
                <p className="font-semibold text-[#2B2B2B] mb-1">✏️ Editor</p>
                <p className="text-[#8A8A8A]">Can create and edit cases</p>
              </div>
              <div>
                <p className="font-semibold text-[#2B2B2B] mb-1">👁️ Viewer</p>
                <p className="text-[#8A8A8A]">Read-only access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Form Section */}
      <motion.div
        className="mt-8 bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] text-white rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6">Invite a New Team Member</h2>

        <div className="bg-white/10 backdrop-blur p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              placeholder="colleague@example.com"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/50 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Role</label>
            <select className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white outline-none">
              <option value="editor" className="text-[#2B2B2B]">
                Editor
              </option>
              <option value="viewer" className="text-[#2B2B2B]">
                Viewer
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Send Invitation</label>
            <p className="text-sm opacity-75 mb-4">They'll receive an email invitation to join your workspace</p>
            <button className="w-full px-4 py-3 bg-white text-[#C67C4E] font-semibold rounded-lg hover:bg-[#FAFAFA] transition-all">
              Send Invitation
            </button>
          </div>
        </div>
      </motion.div>

      {/* Pending Invitations */}
      <div className="mt-8 bg-white rounded-xl border border-[#E3E3E3] p-6">
        <h2 className="text-lg font-bold text-[#2B2B2B] mb-4">Pending Invitations</h2>

        <div className="space-y-3">
          {[
            { email: "intern@example.com", sentDate: "2 days ago" },
            { email: "contractor@example.com", sentDate: "1 week ago" },
          ].map((invite, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-[#E3E3E3] rounded-lg">
              <div>
                <p className="font-semibold text-[#2B2B2B]">{invite.email}</p>
                <p className="text-sm text-[#8A8A8A]">Invited {invite.sentDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-[#F59E0B]">
                  <Clock className="w-4 h-4" />
                  Pending
                </span>
                <button className="text-[#EF4444] hover:bg-[#FEE2E2] px-3 py-1 rounded transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
