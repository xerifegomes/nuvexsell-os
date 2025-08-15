export interface Env {
  // Environment variables
  ENVIRONMENT: 'development' | 'staging' | 'production'
  JWT_SECRET: string
  STRIPE_SECRET: string
  STRIPE_PUBLISHABLE: string
  STRIPE_WEBHOOK_SECRET: string
  OLLAMA_HOST: string

  // Cloudflare bindings
  D1_DB: D1Database
  LOGS_KV: KVNamespace
  SESSION_KV: KVNamespace
  RATE_KV: KVNamespace
  PRODUCT_MEDIA: R2Bucket
  SCRAPE_QUEUE: Queue
  AI_SCORE_QUEUE: Queue
  ORDER_QUEUE: Queue
  AI: any // Cloudflare Worker IA

  // Stripe
  STRIPE: any
}

export interface Context {
  requestId: string
  userId?: string
  tenantId?: string
  plan?: string
  userAgent: string
  ip: string
  startTime: number
}
