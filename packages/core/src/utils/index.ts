import { Plan } from '../types'

export const PLAN_LIMITS = {
  FREE: {
    products: 50,
    importsPerDay: 20,
    ordersPerDay: 0
  },
  VIP: {
    products: 500,
    importsPerDay: 200,
    ordersPerDay: 50
  },
  CORPORATE: {
    products: 5000,
    importsPerDay: 2000,
    ordersPerDay: 500
  },
  GODMODE: {
    products: 20000,
    importsPerDay: 10000,
    ordersPerDay: 2000
  }
} as const

export const PLAN_FEATURES = {
  FREE: ['scrape', 'basic-dashboard'],
  VIP: ['scrape', 'ai-score', 'basic-dashboard'],
  CORPORATE: ['scrape', 'ai-score', 'ops-automation', 'basic-dashboard'],
  GODMODE: ['scrape', 'ai-score', 'ops-automation', 'advanced-dashboard', 'white-label']
} as const

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan]
}

export function getPlanFeatures(plan: Plan) {
  return PLAN_FEATURES[plan]
}

export function hasFeature(plan: Plan, feature: string): boolean {
  return PLAN_FEATURES[plan].includes(feature as any)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidSubdomain(subdomain: string): boolean {
  const pattern = /^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$/
  return pattern.test(subdomain)
}

export function calculateProductScore(
  priceScore: number,
  demandScore: number,
  sentimentScore: number
): number {
  const weights = {
    price: 0.3,
    demand: 0.4,
    sentiment: 0.3
  }
  
  return Math.round(
    priceScore * weights.price +
    demandScore * weights.demand +
    sentimentScore * weights.sentiment
  )
}

export function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attemptsLeft = attempts

    const tryAttempt = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        attemptsLeft--
        if (attemptsLeft === 0) {
          reject(error)
        } else {
          setTimeout(tryAttempt, delay)
        }
      }
    }

    tryAttempt()
  })
}

export function rateLimitKey(ip: string, path: string): string {
  return `rate_limit:${ip}:${path}`
}

export function parseUserAgent(userAgent: string) {
  return {
    browser: userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || 'Unknown',
    os: userAgent.match(/(?:Windows|Mac|Linux|Android|iOS)/)?.[0] || 'Unknown',
    device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
  }
}