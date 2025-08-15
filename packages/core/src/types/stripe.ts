export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
}

export interface StripePlan {
  id: string
  priceId: string
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
}

export interface StripeCustomer {
  id: string
  tenantId: string
  stripeCustomerId: string
  email: string
  subscriptionId?: string
  currentPlan: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  createdAt: Date
  updatedAt: Date
}

export interface StripeWebhookEvent {
  id: string
  type: string
  data: any
  processed: boolean
  createdAt: Date
}
