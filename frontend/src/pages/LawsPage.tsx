import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Bookmark, BookmarkCheck, ExternalLink, Plus, X } from "lucide-react"

interface Law {
  id: string
  act: string
  section: string
  subsection?: string
  desc: string
  category: string
  relatedCases: number
  bookmarked?: boolean
}

export default function LawsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const laws: Law[] = [
    {
      id: "1",
      act: "Indian Penal Code",
      section: "420",
      desc: "Cheating and dishonestly inducing delivery of property",
      category: "Criminal",
      relatedCases: 156,
    },
    {
      id: "2",
      act: "IT Act",
      section: "66",
      desc: "Computer related offences",
      category: "Technology",
      relatedCases: 89,
    },
    {
      id: "3",
      act: "Contract Act",
      section: "2(h)",
      desc: "Definition of agreement",
      category: "Civil",
      relatedCases: 234,
    },
    {
      id: "4",
      act: "Property Rights Act",
      section: "5",
      desc: "Rights of property owners",
      category: "Real Estate",
      relatedCases: 78,
    },
    {
      id: "5",
      act: "Labor Law",
      section: "12",
      desc: "Employment contract terms",
      category: "Employment",
      relatedCases: 145,
    },
    {
      id: "6",
      act: "Intellectual Property Act",
      section: "3",
      desc: "Copyright protection",
      category: "IP",
      relatedCases: 102,
    },
  ]

  const categories = ["all", "Criminal", "Civil", "Employment", "Real Estate", "Technology", "IP"]

  const filteredLaws = laws.filter((law) => {
    const matchesSearch =
      law.act.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.section.includes(searchTerm)
    const matchesCategory = selectedCategory === "all" || law.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarks)
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id)
    } else {
      newBookmarks.add(id)
    }
    setBookmarks(newBookmarks)
  }

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
        <h1 className="text-4xl font-bold text-[#2B2B2B]">Laws & References</h1>
        <p className="text-[#8A8A8A] mt-2">Browse comprehensive legal database with AI explanations</p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search by act name, section number, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#E3E3E3] rounded-lg bg-white text-[#2B2B2B] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C67C4E] focus:border-transparent transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#8A8A8A]" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
                selectedCategory === cat
                  ? "bg-[#C67C4E] text-white"
                  : "bg-white text-[#5A5A5A] border border-[#E3E3E3] hover:border-[#C67C4E]"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <motion.div variants={itemVariants} className="text-sm text-[#8A8A8A]">
        Showing {filteredLaws.length} of {laws.length} laws
      </motion.div>

      {/* Laws List */}
      <motion.div variants={containerVariants} className="space-y-4">
        {filteredLaws.length > 0 ? (
          filteredLaws.map((law) => (
            <motion.div
              key={law.id}
              variants={itemVariants}
              className="bg-white rounded-xl border border-[#E3E3E3] overflow-hidden hover:border-[#C67C4E] transition-all"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === law.id ? null : law.id)
                }
                className="w-full p-6 text-left hover:bg-[#FAFAFA] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-bold text-[#2B2B2B]">{law.act}</h2>
                      <span className="text-xs font-bold px-2 py-1 bg-[#C67C4E]/10 text-[#C67C4E] rounded-full">
                        Section {law.section}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 bg-[#E3E3E3] text-[#5A5A5A] rounded-full">
                        {law.category}
                      </span>
                    </div>
                    <p className="text-[#5A5A5A]">{law.desc}</p>
                    <p className="text-xs text-[#8A8A8A] mt-2">{law.relatedCases} related case precedents</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark(law.id)
                    }}
                    className="p-2 hover:bg-[#E3E3E3] rounded-lg transition-all flex-shrink-0"
                  >
                    {bookmarks.has(law.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-[#C67C4E]" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-[#8A8A8A]" />
                    )}
                  </button>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedSection === law.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-[#E3E3E3] bg-[#FAFAFA] p-6 space-y-4"
                >
                  {/* AI Explanation */}
                  <div>
                    <h3 className="font-bold text-[#2B2B2B] mb-2">AI Explanation</h3>
                    <p className="text-sm text-[#5A5A5A] leading-relaxed">
                      This section of {law.act} pertains to {law.desc.toLowerCase()}. It is commonly cited in cases
                      involving contractual disputes, fraudulent activities, and formal agreements. The legal framework
                      provides clear guidelines for what constitutes a violation and the associated penalties.
                    </p>
                  </div>

                  {/* Key Points */}
                  <div>
                    <h3 className="font-bold text-[#2B2B2B] mb-2">Key Points</h3>
                    <ul className="space-y-1 text-sm text-[#5A5A5A]">
                      <li>✓ Widely cited in contract disputes</li>
                      <li>✓ Applies to both oral and written agreements</li>
                      <li>✓ Penalties range from fines to imprisonment</li>
                      <li>✓ Precedent established in 156 cases</li>
                    </ul>
                  </div>

                  {/* Related Resources */}
                  <div>
                    <h3 className="font-bold text-[#2B2B2B] mb-3">Related Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Landmark Judgment 2023",
                        "Current Legal Standing",
                        "Amendment Details",
                        "Case Precedents",
                      ].map((resource, idx) => (
                        <button
                          key={idx}
                          className="text-left p-3 border border-[#E3E3E3] rounded-lg hover:bg-white hover:border-[#C67C4E] transition-all flex items-center justify-between group"
                        >
                          <span className="text-sm text-[#5A5A5A] group-hover:text-[#C67C4E]">
                            {resource}
                          </span>
                          <ExternalLink className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#C67C4E]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-4 py-2 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] transition-all font-semibold text-sm">
                      View Full Details
                    </button>
                    <button className="flex-1 px-4 py-2 border border-[#E3E3E3] text-[#5A5A5A] rounded-lg hover:bg-white transition-all font-semibold text-sm">
                      Find Similar Laws
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-[#8A8A8A]">No laws found matching your search criteria</p>
          </div>
        )}
      </motion.div>

      {/* Bookmarks Section */}
      {bookmarks.size > 0 && (
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] text-white rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Your Bookmarked Laws ({bookmarks.size})</h2>
          <div className="flex gap-2 flex-wrap">
            {filteredLaws
              .filter((law) => bookmarks.has(law.id))
              .map((law) => (
                <button
                  key={law.id}
                  onClick={() => toggleBookmark(law.id)}
                  className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-all"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {law.act} §{law.section}
                  <X className="w-3 h-3 ml-1" />
                </button>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}