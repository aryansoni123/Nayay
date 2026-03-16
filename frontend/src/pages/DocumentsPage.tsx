import { useState } from "react"
import { motion } from "framer-motion"
import {
  Upload,
  File,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Zap,
} from "lucide-react"

interface Document {
  id: string
  name: string
  size: string
  uploadDate: string
  status: "processing" | "analyzed" | "error"
  type: string
  insights: string
  riskLevel: "low" | "medium" | "high"
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Employment Agreement.pdf",
      size: "2.4 MB",
      uploadDate: "2024-03-10",
      status: "analyzed",
      type: "Employment Contract",
      insights: "5 key clauses identified • 2 potential liabilities",
      riskLevel: "medium",
    },
    {
      id: "2",
      name: "Service Agreement.pdf",
      size: "1.8 MB",
      uploadDate: "2024-03-09",
      status: "analyzed",
      type: "Service Contract",
      insights: "3 critical clauses • Favorable terms",
      riskLevel: "low",
    },
    {
      id: "3",
      name: "Property Lease.docx",
      size: "3.1 MB",
      uploadDate: "2024-03-08",
      status: "processing",
      type: "Real Estate",
      insights: "Analyzing... (~45% complete)",
      riskLevel: "medium",
    },
  ])

  const [dragActive, setDragActive] = useState(false)

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
        <h1 className="text-4xl font-bold text-[#2B2B2B]">Document Intelligence</h1>
        <p className="text-[#8A8A8A] mt-2">Upload, analyze, and extract insights from legal documents</p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        variants={itemVariants}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? "border-[#C67C4E] bg-[#C67C4E]/5"
            : "border-[#E3E3E3] bg-white"
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-[#C67C4E]/10 rounded-lg">
            <Upload className="w-8 h-8 text-[#C67C4E]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2B2B2B]">Drag files here or click to upload</h2>
            <p className="text-[#8A8A8A] text-sm mt-1">
              Supports PDF, DOCX, TXT | Max 100 MB per file
            </p>
          </div>
          <button className="px-6 py-3 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all font-semibold">
            Select Files
          </button>

          <div className="mt-6 pt-6 border-t border-[#E3E3E3]">
            <p className="text-xs text-[#8A8A8A]">
              ✨ AI will automatically extract clauses, identify risks, and summarize key terms
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-[#E3E3E3] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8A8A8A] text-sm">Total Documents</p>
              <p className="text-3xl font-bold text-[#2B2B2B] mt-1">{documents.length}</p>
            </div>
            <FileText className="w-12 h-12 text-[#C67C4E] opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E3E3E3] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8A8A8A] text-sm">Analyzed</p>
              <p className="text-3xl font-bold text-[#2B2B2B] mt-1">
                {documents.filter((d) => d.status === "analyzed").length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-[#10B981] opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E3E3E3] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8A8A8A] text-sm">High Risk</p>
              <p className="text-3xl font-bold text-[#2B2B2B] mt-1">
                {documents.filter((d) => d.riskLevel === "high").length}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-[#EF4444] opacity-20" />
          </div>
        </div>
      </motion.div>

      {/* Documents List */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-[#E3E3E3] shadow-xs overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 items-center p-6 bg-[#FAFAFA] border-b border-[#E3E3E3] font-semibold text-sm text-[#5A5A5A]">
          <div className="col-span-4">Document</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Risk</div>
          <div className="col-span-2">Actions</div>
        </div>

        {/* Documents */}
        <div className="divide-y divide-[#E3E3E3]">
          {documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-12 gap-4 items-center p-6 hover:bg-[#FAFAFA] transition-all"
            >
              {/* Document Info */}
              <div className="col-span-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#C67C4E]/10 rounded-lg">
                    <File className="w-5 h-5 text-[#C67C4E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2B2B2B] truncate">{doc.name}</p>
                    <p className="text-xs text-[#8A8A8A] mt-1">{doc.size}</p>
                    <p className="text-xs text-[#8A8A8A]">{doc.insights}</p>
                  </div>
                </div>
              </div>

              {/* Type */}
              <div className="col-span-2">
                <span className="text-sm text-[#5A5A5A]">{doc.type}</span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {doc.status === "analyzed" && (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-[#10B981] font-medium">Done</span>
                    </>
                  )}
                  {doc.status === "processing" && (
                    <>
                      <Clock className="w-4 h-4 text-[#F59E0B] animate-spin" />
                      <span className="text-sm text-[#F59E0B] font-medium">Processing</span>
                    </>
                  )}
                  {doc.status === "error" && (
                    <>
                      <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                      <span className="text-sm text-[#EF4444] font-medium">Error</span>
                    </>
                  )}
                </div>
              </div>

              {/* Risk Level */}
              <div className="col-span-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    doc.riskLevel === "low"
                      ? "bg-[#D1FAE5] text-[#059669]"
                      : doc.riskLevel === "medium"
                        ? "bg-[#FEF3C7] text-[#D97706]"
                        : "bg-[#FEE2E2] text-[#DC2626]"
                  }`}
                >
                  {doc.riskLevel.charAt(0).toUpperCase() + doc.riskLevel.slice(1)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center gap-2">
                <button className="p-2 hover:bg-[#E3E3E3] rounded-lg transition-all text-[#8A8A8A]" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-[#E3E3E3] rounded-lg transition-all text-[#8A8A8A]" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-all text-[#EF4444]" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights Panel */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] text-white rounded-xl p-8"
      >
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-2">Document Analysis Summary</h2>
            <ul className="space-y-2 text-sm opacity-90">
              <li>✓ 12 key clauses identified across all documents</li>
              <li>✓ 3 potential legal risks flagged for review</li>
              <li>✓ 2 documents fully analyzed and ready for action</li>
              <li>✓ Average processing time: 2.3 seconds per document</li>
            </ul>
            <button className="mt-4 px-4 py-2 bg-white text-[#C67C4E] font-semibold rounded-lg hover:bg-[#FAFAFA] transition-all">
              View Detailed Report
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}