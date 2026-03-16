import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Copy, RefreshCw, ThumbsUp, ThumbsDown, FileText, Link2, Zap } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  citations?: string[]
  timestamp: Date
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your AI Legal Assistant. I can help you analyze contracts, research laws, summarize documents, and assess case strength. What would you like to work on today?",
      citations: [],
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you're asking about "${input.substring(0, 50)}...". Let me analyze this for you. [This is a simulated response - integrate with your backend API]`,
        citations: ["Contract Law 2024", "Precedent XYZ"],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#FAFAFA]">
      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <AnimatePresence>
          {messages.length === 1 && messages[0].type === "assistant" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { icon: <FileText className="w-5 h-5" />, title: "Analyze Contract", text: "Review and summarize a legal contract" },
                { icon: <Zap className="w-5 h-5" />, title: "Case Assessment", text: "Evaluate case strength and risks" },
                { icon: <Link2 className="w-5 h-5" />, title: "Find Precedents", text: "Search for relevant case law" },
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white border border-[#E3E3E3] rounded-lg hover:border-[#C67C4E] hover:shadow-md transition-all text-left"
                >
                  <div className="text-[#C67C4E] mb-2">{action.icon}</div>
                  <p className="font-semibold text-[#2B2B2B] text-sm">{action.title}</p>
                  <p className="text-xs text-[#8A8A8A] mt-1">{action.text}</p>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
              )}

              <div
                className={`max-w-xl space-y-2 ${
                  message.type === "user" ? "bg-[#C67C4E] text-white" : "bg-white text-[#2B2B2B] border border-[#E3E3E3]"
                } rounded-lg p-4`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>

                {message.type === "assistant" && message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="text-xs opacity-75 font-semibold mb-2">Sources:</p>
                    <div className="flex gap-2 flex-wrap">
                      {message.citations.map((citation, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-[#E3E3E3] text-[#5A5A5A] px-2 py-1 rounded cursor-pointer hover:bg-[#D9D9D9] transition-all"
                        >
                          {citation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {message.type === "assistant" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-current border-opacity-20">
                    <button className="p-1.5 hover:bg-[#E3E3E3] rounded transition-all text-[#8A8A8A]" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-[#E3E3E3] rounded transition-all text-[#8A8A8A]" title="Regenerate">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-[#D1FAE5] rounded transition-all text-[#059669]" title="Helpful">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-[#FEE2E2] rounded transition-all text-[#DC2626]" title="Not helpful">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#E3E3E3] flex items-center justify-center flex-shrink-0 ml-3">
                  <span className="text-[#5A5A5A] text-sm font-bold">You</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="bg-white border border-[#E3E3E3] rounded-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-[#C67C4E] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#C67C4E] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-[#C67C4E] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-[#E3E3E3] bg-white px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Suggested Prompts */}
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              "Analyze this contract",
              "Assess case strength",
              "Find similar precedents",
              "Summarize document",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="text-xs px-3 py-1 border border-[#E3E3E3] rounded-full text-[#5A5A5A] hover:border-[#C67C4E] hover:text-[#C67C4E] transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask me anything about your case, documents, or legal questions..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="w-full px-4 py-3 border border-[#E3E3E3] rounded-lg text-[#2B2B2B] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C67C4E] focus:border-transparent transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] text-xs">
                ⌘ + Enter
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-[#C67C4E] text-white rounded-lg hover:bg-[#A86039] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-[#8A8A8A] text-center">
            🔒 Enterprise-grade encryption. Your data is never used for training. All conversations are confidential.
          </p>
        </div>
      </div>
    </div>
  )
}