import { motion } from "framer-motion"
import { AlertTriangle, TrendingUp, FileText, Users, Target, Shield, CheckCircle, Clock } from "lucide-react"

export default function LegalMeterPage() {
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
        <h1 className="text-4xl font-bold text-[#2B2B2B]">Case Analysis & Strength Assessment</h1>
        <p className="text-[#8A8A8A] mt-2">Comprehensive evaluation of your case based on AI analysis</p>
      </motion.div>

      {/* Main Gauge Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Case Strength Gauge */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E3E3E3] p-8 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 mb-6">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E3E3E3" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={`${(72 / 100) * 282.7} 282.7`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C67C4E" />
                  <stop offset="100%" stopColor="#8B6F47" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-[#2B2B2B]">72%</p>
              <p className="text-xs text-[#8A8A8A] mt-1">Case Strength</p>
            </div>
          </div>

          <div className="text-center space-y-2 w-full pt-4 border-t border-[#E3E3E3]">
            <span className="inline-block px-3 py-1 bg-[#FEF3C7] text-[#D97706] text-xs font-bold rounded-full">
              GOOD POSITION
            </span>
            <p className="text-xs text-[#8A8A8A] mt-2">
              Based on evidence and legal precedents
            </p>
          </div>
        </div>

        {/* Risk AssessmentMetrics */}
        <div className="lg:col-span-2 space-y-4">
          {/* Likelihood of Success */}
          <MetricCard
            title="Likelihood of Success"
            value="72%"
            description="Based on similar precedents"
            icon={<TrendingUp className="w-5 h-5" />}
            color="from-[#10B981] to-[#059669]"
          />

          {/* Confidence Level */}
          <MetricCard
            title="Confidence Level"
            value="85%"
            description="High confidence in analysis"
            icon={<Shield className="w-5 h-5" />}
            color="from-[#3B82F6] to-[#2563EB]"
          />

          {/* Evidence Quality */}
          <MetricCard
            title="Evidence Quality Score"
            value="8.2/10"
            description="Strong supporting documentation"
            icon={<FileText className="w-5 h-5" />}
            color="from-[#F59E0B] to-[#D97706]"
          />

          {/* Timeline */}
          <MetricCard
            title="Estimated Timeline"
            value="120 days"
            description="Based on case complexity"
            icon={<Clock className="w-5 h-5" />}
            color="from-[#C67C4E] to-[#8B6F47]"
          />
        </div>
      </motion.div>

      {/* Detailed Analysis Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
          <h2 className="text-lg font-bold text-[#2B2B2B] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            Key Strengths
          </h2>
          <div className="space-y-3">
            {[
              { label: "Clear contractual evidence", score: 95 },
              { label: "Precedent support", score: 88 },
              { label: "Documentation completeness", score: 92 },
              { label: "Witness credibility", score: 78 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#2B2B2B]">{item.label}</span>
                  <span className="text-xs font-bold text-[#10B981]">{item.score}%</span>
                </div>
                <div className="w-full bg-[#E3E3E3] rounded-full h-2">
                  <div
                    className="bg-[#10B981] h-2 rounded-full transition-all"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-6">
          <h2 className="text-lg font-bold text-[#2B2B2B] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            Potential Risks
          </h2>
          <div className="space-y-3">
            {[
              { label: "Opposing case precedents", risk: "HIGH", actions: 3 },
              { label: "Documentation gaps", risk: "MEDIUM", actions: 2 },
              { label: "Jurisdiction differences", risk: "LOW", actions: 1 },
              { label: "Witness availability", risk: "MEDIUM", actions: 2 },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  item.risk === "HIGH"
                    ? "border-[#FEE2E2] bg-[#FEF5F5]"
                    : item.risk === "MEDIUM"
                      ? "border-[#FEF3C7] bg-[#FFFBEB]"
                      : "border-[#D1FAE5] bg-[#F0FDF4]"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm text-[#2B2B2B]">{item.label}</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      item.risk === "HIGH"
                        ? "bg-[#FEE2E2] text-[#DC2626]"
                        : item.risk === "MEDIUM"
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : "bg-[#D1FAE5] text-[#059669]"
                    }`}
                  >
                    {item.risk}
                  </span>
                </div>
                <p className="text-xs text-[#5A5A5A]">{item.actions} action(s) recommended</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] text-white rounded-xl p-8"
      >
        <h2 className="text-2xl font-bold mb-6">AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Strengthen Evidence",
              description: "Gather additional documentation to support contractual claims",
              priority: "HIGH",
            },
            {
              title: "Review Opposing Arguments",
              description: "Analyze potential counterarguments and prepare rebuttals",
              priority: "HIGH",
            },
            {
              title: "Expert Witness Review",
              description: "Consider expert witness testimony on technical aspects",
              priority: "MEDIUM",
            },
            {
              title: "Settlement Analysis",
              description: "Evaluate settlement options based on case strength",
              priority: "MEDIUM",
            },
            {
              title: "Timeline Optimization",
              description: "Plan case milestones to maximize judge availability",
              priority: "LOW",
            },
            {
              title: "Documentation Audit",
              description: "Complete audit of all case-related documentation",
              priority: "MEDIUM",
            },
          ].map((rec, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur p-4 rounded-lg border border-white/20">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold">{rec.title}</h3>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    rec.priority === "HIGH"
                      ? "bg-[#FEE2E2] text-[#DC2626]"
                      : rec.priority === "MEDIUM"
                        ? "bg-[#FEF3C7] text-[#D97706]"
                        : "bg-[#D1FAE5] text-[#059669]"
                  }`}
                >
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm opacity-90">{rec.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Similar Cases */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-[#E3E3E3] p-6">
        <h2 className="text-lg font-bold text-[#2B2B2B] mb-6">Similar Precedent Cases</h2>
        <div className="space-y-4">
          {[
            { case: "Smith v. Johnson Corp (2022)", similarity: 92, outcome: "Favorable" },
            { case: "Contract Dispute Landmark (2021)", similarity: 87, outcome: "Favorable" },
            { case: "Similar Precedent (2020)", similarity: 75, outcome: "Partial" },
          ].map((caseItem, idx) => (
            <div key={idx} className="p-4 border border-[#E3E3E3] rounded-lg hover:bg-[#FAFAFA] transition-all">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#2B2B2B]">{caseItem.case}</h3>
                <span className="text-xs font-bold text-[#10B981] px-2 py-1 bg-[#D1FAE5] rounded-full">
                  {caseItem.similarity}% similar
                </span>
              </div>
              <p className="text-sm text-[#8A8A8A]">
                Outcome:{" "}
                <span
                  className={`font-semibold ${
                    caseItem.outcome === "Favorable" ? "text-[#059669]" : "text-[#D97706]"
                  }`}
                >
                  {caseItem.outcome}
                </span>
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-gradient-to-br ${color} text-white rounded-lg p-4 flex items-start gap-4`}
    >
      <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs opacity-75 mt-1">{description}</p>
      </div>
    </motion.div>
  )
}