export type Plan = 'FREE' | 'VIP' | 'CORPORATE' | 'GODMODE'

export interface PlanLimits {
  products: number
  importsPerDay: number
  ordersPerDay?: number
}

export interface Tenant {
  id: string
  subdomain: string
  name: string
  plan: Plan
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  tenantId: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
}

export interface ProductRaw {
  url: string
  title: string
  price: number
  currency: string
  images: string[]
  description: string
  availability: boolean
  asin?: string
  sku?: string
  brand?: string
  category?: string
  reviews?: ReviewRaw[]
}

export interface ReviewRaw {
  rating: number
  text: string
  author: string
  date: string
}

export interface Product {
  id: string
  tenantId: string
  title: string
  description: string
  price: number
  currency: string
  images: string[]
  availability: boolean
  asin?: string
  sku?: string
  brand?: string
  category?: string
  sourceUrl: string
  aiScore?: number
  priceScore?: number
  demandScore?: number
  sentimentScore?: number
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  tenantId: string
  name: string
  type: 'shopify' | 'woo' | 'ml' | 'manual'
  credentials: Record<string, string>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  tenantId: string
  supplierId?: string
  status: 'CREATED' | 'ROUTED' | 'FULFILLED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  items: OrderItem[]
  destination: Address
  trackingCode?: string
  totalAmount: number
  currency: string
  createdAt: Date
  updatedAt: Date
  externalOrderId?: string
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  email?: string
}

export interface Stock {
  id: string
  tenantId: string
  productId: string
  supplierId: string
  quantity: number
  reservedQuantity: number
  lastUpdated: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  requestId: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface QueueJob {
  id: string
  type: string
  data: Record<string, any>
  attempts: number
  maxAttempts: number
  createdAt: Date
  scheduledAt?: Date
}