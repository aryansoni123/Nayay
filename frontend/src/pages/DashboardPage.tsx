import { motion } from "framer-motion"
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  MessageSquare,
  Clock,
  ArrowRight,
  BarChart3,
} from "lucide-react"

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      className="p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-[#2B2B2B]">Welcome back, John</h1>
        <p className="text-[#8A8A8A] mt-2">Here's what's happening with your legal cases today</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Cases */}
        <DashboardCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Active Cases"
          value="12"
          subtitle="across 3 law firms"
          color="from-[#C67C4E] to-[#A86039]"
        />

        {/* Documents */}
        <DashboardCard
          icon={<FileText className="w-6 h-6" />}
          title="Documents"
          value="48"
          subtitle="indexed and analyzed"
          color="from-[#10B981] to-[#059669]"
        />

        {/* Conversations */}
        <DashboardCard
          icon={<MessageSquare className="w-6 h-6" />}
          title="Conversations"
          value="156"
          subtitle="total interactions"
          color="from-[#3B82F6] to-[#2563EB]"
        />

        {/* Time Saved */}
        <DashboardCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Time Saved"
          value="24h"
          subtitle="this month"
          color="from-[#F59E0B] to-[#D97706]"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Cases */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Case Summary */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-xs p-6">
            <h2 className="text-lg font-bold text-[#2B2B2B] mb-4">Recent Cases</h2>

            <div className="space-y-4">
              {[
                {
                  name: "Smith v. Johnson Corp.",
                  status: "High Risk",
                  progress: 65,
                  type: "Contract Dispute",
                },
                {
                  name: "Property Lease Review",
                  status: "Medium Risk",
                  progress: 45,
                  type: "Real Estate",
                },
                {
                  name: "Employment Agreement",
                  status: "Low Risk",
                  progress: 85,
                  type: "Labor Law",
                },
              ].map((caseItem, idx) => (
                <div key={idx} className="p-4 border border-[#E3E3E3] rounded-lg hover:bg-[#FAFAFA] transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#2B2B2B]">{caseItem.name}</h3>
                      <p className="text-sm text-[#8A8A8A]">{caseItem.type}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        caseItem.status === "Low Risk"
                          ? "bg-[#D1FAE5] text-[#059669]"
                          : caseItem.status === "Medium Risk"
                            ? "bg-[#FEF3C7] text-[#D97706]"
                            : "bg-[#FEE2E2] text-[#DC2626]"
                      }`}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                  <div className="w-full bg-[#E3E3E3] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#C67C4E] to-[#8B6F47] h-2 rounded-full transition-all"
                      style={{ width: `${caseItem.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[#8A8A8A] mt-2">{caseItem.progress}% analyzed</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] rounded-xl p-6 text-white">
            <h2 className="text-lg font-bold mb-4">AI Recommendations</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Review Contract Clause</p>
                  <p className="text-sm opacity-90">Found potential liability in Smith v. Johnson case</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Precedent Match Found</p>
                  <p className="text-sm opacity-90">Similar employment agreement ruling from 2023</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Quick Stats */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-xs p-6">
            <h2 className="text-lg font-bold text-[#2B2B2B] mb-4">Activity Feed</h2>
            <div className="space-y-4">
              {[
                { icon: FileText, text: "Document uploaded", time: "2h ago" },
                { icon: MessageSquare, text: "Chat analysis completed", time: "5h ago" },
                { icon: TrendingUp, text: "Case assessment updated", time: "1d ago" },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#C67C4E] flex-shrink-0 mt-1.5"></div>
                  <div className="text-sm">
                    <p className="text-[#2B2B2B]">{activity.text}</p>
                    <p className="text-[#8A8A8A] text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-xs p-6">
            <h2 className="text-lg font-bold text-[#2B2B2B] mb-4">This Month</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#5A5A5A]">API Requests</span>
                  <span className="font-semibold text-[#2B2B2B]">2,450 / 10,000</span>
                </div>
                <div className="w-full bg-[#E3E3E3] rounded-full h-2">
                  <div className="bg-[#C67C4E] h-2 rounded-full w-1/4"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#5A5A5A]">Storage</span>
                  <span className="font-semibold text-[#2B2B2B]">24 GB / 500 GB</span>
                </div>
                <div className="w-full bg-[#E3E3E3] rounded-full h-2">
                  <div className="bg-[#10B981] h-2 rounded-full w-1/20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-[#C67C4E] hover:bg-[#A86039] text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
            <span>Start New Case Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

function DashboardCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  color: string
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
      </div>
      <h3 className="text-sm font-semibold opacity-90 mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{subtitle}</p>
    </div>
  )
}