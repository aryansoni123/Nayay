// ============================================
// Message Types
// ============================================

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
  caseId?: string
  citations?: string[]
}

// ============================================
// Document Types
// ============================================

export interface Document {
  id: string
  name: string
  size: number
  uploadedAt: Date
  caseId?: string
  type?: string
  url?: string
}

// ============================================
// Case Types
// ============================================

export interface Case {
  id: string
  title: string
  description?: string
  createdAt: Date
  updatedAt: Date
  status: "active" | "archived" | "closed"
  messages: Message[]
  documents: Document[]
  laws: Law[]
  tags?: string[]
  caseNumber?: string
  lastMessagePreview?: string
}

// ============================================
// Law Types
// ============================================

export interface Law {
  id: string
  name: string
  section: string
  description: string
  content: string
}

// ============================================
// Legal Analysis Types
// ============================================

export interface LegalAnalysis {
  strength: number
  confidence: number
  findings: string[]
  recommendations?: string[]
  riskLevel?: "low" | "medium" | "high"
}

// ============================================
// Chat Service Types
// ============================================

export interface SendMessagePayload {
  caseId?: string
  message: string
}

// ============================================
// Dashboard Types
// ============================================

export interface CaseStatistics {
  totalCases: number
  activeCases: number
  uploadedDocuments: number
  recentCases: Case[]
}
