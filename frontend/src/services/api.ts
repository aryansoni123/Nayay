import { Message, Document } from "../types"

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/* ---------------- CHAT SERVICE ---------------- */

export const chatService = {

  async sendMessage(message: string): Promise<Message> {

    await delay(800)

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Based on Indian law this situation may fall under IPC Section 420 (Cheating). You may consider filing a complaint.",
      createdAt: new Date(),
    }

  },
}

/* ---------------- DOCUMENT SERVICE ---------------- */

export const documentService = {

  async uploadDocument(file: File): Promise<Document> {

    await delay(500)

    return {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    }

  },

  async deleteDocument(id: string) {
    await delay(300)
    return true
  },

}

/* ---------------- LEGAL SERVICE ---------------- */

export const legalService = {

  async analyzeCase() {

    await delay(900)

    return {
      strength: 72,
      confidence: 84,
      findings: [
        "Evidence supports claim",
        "Applicable IPC sections found",
        "Civil litigation possible",
        "Moderate success probability",
      ],
    }

  },

}