import { motion } from "framer-motion"
import { BarChart3, TrendingUp, FileText, MessageSquare, Download } from "lucide-react"

export default function UsageAnalyticsPage() {
  return (
    <motion.div
      className="p-8 max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#2B2B2B]">Usage Analytics</h1>
          <p className="text-[#8A8A8A] mt-2">Track your API usage, document processing, and AI interactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2 mb-8">
        {["Today", "This Week", "This Month", "This Year", "Custom"].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-lg transition-all ${
              period === "This Month"
                ? "bg-[#C67C4E] text-white"
                : "bg-white text-[#5A5A5A] border border-[#E3E3E3] hover:border-[#C67C4E]"
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          icon={<MessageSquare className="w-6 h-6" />}
          title="API Requests"
          value="2,450"
          limit="10,000"
          percentage={24.5}
          color="from-[#3B82F6] to-[#2563EB]"
        />
        <AnalyticsCard
          icon={<FileText className="w-6 h-6" />}
          title="Documents Processed"
          value="156"
          limit="500"
          percentage={31.2}
          color="from-[#10B981] to-[#059669]"
        />
        <AnalyticsCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Active Cases"
          value="12"
          limit="Unlimited"
          percentage={0}
          color="from-[#F59E0B] to-[#D97706]"
        />
        <AnalyticsCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Storage Used"
          value="24 GB"
          limit="500 GB"
          percentage={4.8}
          color="from-[#C67C4E] to-[#8B6F47]"
        />
      </div>

      {/* Detailed Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* API Usage Trend */}
        <motion.div
          className="bg-white rounded-xl border border-[#E3E3E3] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-[#2B2B2B] mb-6">API Requests Trend</h2>
          <div className="space-y-4">
            {[
              { day: "Mon", value: 280, percentage: 45 },
              { day: "Tue", value: 350, percentage: 56 },
              { day: "Wed", value: 420, percentage: 68 },
              { day: "Thu", value: 390, percentage: 63 },
              { day: "Fri", value: 510, percentage: 82 },
              { day: "Sat", value: 280, percentage: 45 },
              { day: "Sun", value: 220, percentage: 35 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A5A5A]">{item.day}</span>
                  <span className="font-semibold text-[#2B2B2B]">{item.value}</span>
                </div>
                <div className="w-full bg-[#E3E3E3] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Document Processing */}
        <motion.div
          className="bg-white rounded-xl border border-[#E3E3E3] p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-[#2B2B2B] mb-6">Document Processing Time</h2>
          <div className="space-y-4">
            {[
              { type: "Contracts", avg: "3.2s", count: 45 },
              { type: "Agreements", avg: "2.8s", count: 38 },
              { type: "Declarations", avg: "1.9s", count: 25 },
              { type: "Pleadings", avg: "2.4s", count: 30 },
              { type: "Other", avg: "1.5s", count: 18 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-[#E3E3E3] rounded-lg"
              >
                <div>
                  <p className="font-semibold text-[#2B2B2B]">{item.type}</p>
                  <p className="text-sm text-[#8A8A8A]">{item.count} documents</p>
                </div>
                <p className="font-semibold text-[#C67C4E]">{item.avg}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Usage */}
      <motion.div
        className="bg-white rounded-xl border border-[#E3E3E3] p-6 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-bold text-[#2B2B2B] mb-6">Feature Usage Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E3E3E3]">
                <th className="text-left py-3 text-[#5A5A5A] font-semibold">Feature</th>
                <th className="text-right py-3 text-[#5A5A5A] font-semibold">Usage Count</th>
                <th className="text-right py-3 text-[#5A5A5A] font-semibold">Last Used</th>
                <th className="text-right py-3 text-[#5A5A5A] font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E3E3]">
              {[
                { feature: "AI Chat Analysis", usage: "1,250", lastUsed: "2h ago", trend: "📈" },
                { feature: "Document Upload", usage: "156", lastUsed: "4h ago", trend: "📈" },
                { feature: "Case Assessment", usage: "89", lastUsed: "1h ago", trend: "📊" },
                { feature: "Law References", usage: "645", lastUsed: "45m ago", trend: "📈" },
                { feature: "Export Reports", usage: "23", lastUsed: "3d ago", trend: "📉" },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAFAFA] transition-all">
                  <td className="py-3 text-[#2B2B2B] font-medium">{item.feature}</td>
                  <td className="py-3 text-right text-[#2B2B2B] font-semibold">{item.usage}</td>
                  <td className="py-3 text-right text-[#8A8A8A]">{item.lastUsed}</td>
                  <td className="py-3 text-right text-lg">{item.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Usage Limits */}
      <motion.div
        className="bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] text-white rounded-xl p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Current Plan Limits (Pro Plan)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">API Requests</span>
              <span>2,450 / 10,000</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full w-1/4"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Document Storage</span>
              <span>24 GB / 500 GB</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full w-1/20"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Team Members</span>
              <span>3 / 5</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full w-3/5"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Cases</span>
              <span>12 / Unlimited</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full w-full"></div>
            </div>
          </div>
        </div>

        <button className="mt-8 px-6 py-3 bg-white text-[#C67C4E] font-semibold rounded-lg hover:bg-[#FAFAFA] transition-all">
          Upgrade Plan for Higher Limits
        </button>
      </motion.div>
    </motion.div>
  )
}

function AnalyticsCard({
  icon,
  title,
  value,
  limit,
  percentage,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string
  limit: string
  percentage: number
  color: string
}) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
      </div>
      <h3 className="text-sm font-semibold opacity-90 mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-3">{value}</p>
      <div className="flex items-center justify-between text-xs opacity-75">
        <span>Limit: {limit}</span>
        {percentage > 0 && <span>{percentage.toFixed(1)}% used</span>}
      </div>
      {percentage > 0 && (
        <div className="w-full bg-white/20 rounded-full h-2 mt-3">
          <div className="bg-white h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
      )}
    </div>
  )
}