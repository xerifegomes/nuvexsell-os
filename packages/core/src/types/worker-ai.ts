export interface WorkerAIRequest {
  model: string
  prompt: string
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

export interface WorkerAIResponse {
  result: {
    response: string
  }
  success: boolean
  errors?: string[]
  messages?: string[]
}

export interface ProductAnalysis {
  productId: string
  priceScore: number
  demandScore: number
  sentimentScore: number
  features: string[]
  pros: string[]
  cons: string[]
  recommendation: 'high' | 'medium' | 'low'
  confidence: number
  analysis: string
}

export interface QueueMessage {
  id: string
  type: 'SCRAPE' | 'AI_SCORE' | 'ORDER_PROCESS'
  data: any
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  processedAt?: Date
  error?: string
}
