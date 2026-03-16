import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Trash2, Share2, Download, Calendar, MessageSquare, Tag, X } from "lucide-react"

interface Conversation {
  id: string
  title: string
  date: string
  case?: string
  tags: string[]
  messages: number
  preview: string
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Property Dispute Consultation",
      date: "2024-03-15",
      case: "Smith v. Johnson Corp",
      tags: ["Property", "Dispute"],
      messages: 24,
      preview: "Discussed zoning laws and property rights regarding commercial property...",
    },
    {
      id: "2",
      title: "Cyber Fraud Case Advice",
      date: "2024-03-12",
      case: "Data Breach Investigation",
      tags: ["Technology", "Fraud"],
      messages: 18,
      preview: "Analyzed IT Act violations and potential criminal charges...",
    },
    {
      id: "3",
      title: "Rental Agreement Review",
      date: "2024-03-10",
      case: "Lease Contract",
      tags: ["Real Estate", "Contract"],
      messages: 31,
      preview: "Reviewed rental terms and identified ambiguous clauses...",
    },
    {
      id: "4",
      title: "Employment Contract Analysis",
      date: "2024-03-08",
      case: "HR Matter",
      tags: ["Employment", "Contract"],
      messages: 15,
      preview: "Analyzed compensation terms and non-compete clauses...",
    },
    {
      id: "5",
      title: "IP Protection Strategy",
      date: "2024-03-05",
      case: "Trademark Defense",
      tags: ["IP", "Strategy"],
      messages: 22,
      preview: "Discussed copyright protection strategies and enforcement...",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState("all")

  const allTags = Array.from(new Set(conversations.flatMap((c) => c.tags)))

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || conv.tags.includes(selectedTag)
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "week" && new Date(conv.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && new Date(conv.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesTag && matchesDate
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      className="p-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-[#2B2B2B]">Chat History</h1>
        <p className="text-[#8A8A8A] mt-2">Access your past conversations and case discussions</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A]" />
        <input
          type="text"
          placeholder="Search conversations by title, case name, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-[#E3E3E3] rounded-lg bg-white text-[#2B2B2B] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C67C4E] focus:border-transparent transition-all"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Date Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-[#8A8A8A]" />
          {["all", "week", "month"].map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
                dateFilter === period
                  ? "bg-[#C67C4E] text-white"
                  : "bg-white text-[#5A5A5A] border border-[#E3E3E3] hover:border-[#C67C4E]"
              }`}
            >
              {period === "all" ? "All Time" : period === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>

        {/* Tag Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#8A8A8A]" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full transition-all text-xs font-medium flex items-center gap-2 ${
                selectedTag === tag
                  ? "bg-[#C67C4E] text-white"
                  : "bg-white text-[#5A5A5A] border border-[#E3E3E3] hover:border-[#C67C4E]"
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
              {selectedTag === tag && <X className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div variants={itemVariants} className="text-sm text-[#8A8A8A]">
        {filteredConversations.length} conversation{filteredConversations.length !== 1 ? "s" : ""} found
      </motion.div>

      {/* Conversations Grid */}
      <motion.div variants={containerVariants} className="space-y-4">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv, idx) => (
            <motion.div
              key={conv.id}
              variants={itemVariants}
              className="bg-white rounded-xl border border-[#E3E3E3] p-6 hover:border-[#C67C4E] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-[#C67C4E] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-[#2B2B2B] group-hover:text-[#C67C4E] transition-all">
                        {conv.title}
                      </h2>
                      {conv.case && (
                        <p className="text-sm text-[#8A8A8A] mt-0.5">Case: {conv.case}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-[#5A5A5A] text-sm mb-3">{conv.preview}</p>

                  <div className="flex items-center gap-4 flex-wrap text-xs text-[#8A8A8A]">
                    <span>📅 {new Date(conv.date).toLocaleDateString()}</span>
                    <span>💬 {conv.messages} messages</span>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {conv.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTag(tag)
                        }}
                        className="text-xs px-2 py-1 bg-[#E3E3E3] text-[#5A5A5A] rounded-full hover:bg-[#C67C4E] hover:text-white transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    className="p-2 hover:bg-[#E3E3E3] rounded-lg transition-all text-[#8A8A8A]"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-[#E3E3E3] rounded-lg transition-all text-[#8A8A8A]"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-all text-[#EF4444]"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-[#E3E3E3] mx-auto mb-4" />
            <p className="text-[#8A8A8A]">No conversations found matching your criteria</p>
          </div>
        )}
      </motion.div>

      {/* Archive Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-[#E3E3E3] p-6 mt-12"
      >
        <h2 className="text-lg font-bold text-[#2B2B2B] mb-4">Archive</h2>
        <p className="text-[#8A8A8A] text-sm mb-4">Archived conversations are kept but not shown in your main history</p>
        <button className="px-6 py-3 border border-[#E3E3E3] text-[#5A5A5A] rounded-lg hover:bg-[#FAFAFA] transition-all font-semibold">
          View Archived Conversations
        </button>
      </motion.div>
    </motion.div>
  )
}