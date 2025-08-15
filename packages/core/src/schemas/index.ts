import { z } from 'zod'

export const PlanSchema = z.enum(['FREE', 'VIP', 'CORPORATE', 'GODMODE'])

export const TenantSchema = z.object({
  id: z.string().uuid(),
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  plan: PlanSchema,
  createdAt: z.date(),
  updatedAt: z.date()
})

export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'USER']),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const ReviewRawSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string(),
  author: z.string(),
  date: z.string()
})

export const ProductRawSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().length(3),
  images: z.array(z.string().url()),
  description: z.string(),
  availability: z.boolean(),
  asin: z.string().optional(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  reviews: z.array(ReviewRawSchema).optional()
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  currency: z.string().length(3),
  images: z.array(z.string().url()),
  availability: z.boolean(),
  asin: z.string().optional(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  sourceUrl: z.string().url(),
  aiScore: z.number().min(0).max(100).optional(),
  priceScore: z.number().min(0).max(100).optional(),
  demandScore: z.number().min(0).max(100).optional(),
  sentimentScore: z.number().min(0).max(100).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['shopify', 'woo', 'ml', 'manual']),
  credentials: z.record(z.string()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().length(2)
})

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive().int(),
  price: z.number().positive()
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  status: z.enum(['CREATED', 'ROUTED', 'FULFILLED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  items: z.array(OrderItemSchema).min(1),
  destination: AddressSchema,
  trackingCode: z.string().optional(),
  totalAmount: z.number().positive(),
  currency: z.string().length(3),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const StockSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  supplierId: z.string().uuid(),
  quantity: z.number().nonnegative().int(),
  reservedQuantity: z.number().nonnegative().int(),
  lastUpdated: z.date()
})

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional()
})

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: ApiErrorSchema.optional(),
  requestId: z.string().uuid()
})

export const QueueJobSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  data: z.record(z.any()),
  attempts: z.number().nonnegative().int(),
  maxAttempts: z.number().positive().int(),
  createdAt: z.date(),
  scheduledAt: z.date().optional()
})

// Request/Response schemas for API endpoints
export const ScrapeImportRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(100)
})

export const ScrapeImportResponseSchema = z.object({
  taskId: z.string().uuid()
})

export const AiScoreRequestSchema = z.object({
  productId: z.array(z.string().uuid()).min(1).max(50)
})

export const AiScoreResponseSchema = z.object({
  scores: z.array(z.object({
    productId: z.string().uuid(),
    score: z.number().min(0).max(100),
    details: z.any()
  }))
})

export const CreateOrderRequestSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  destination: AddressSchema
})

export const CreateOrderResponseSchema = z.object({
  orderId: z.string().uuid(),
  status: z.literal('CREATED')
})

export const StockSyncRequestSchema = z.object({
  provider: z.enum(['shopify', 'woo', 'ml']),
  credsRef: z.string()
})

export const StockSyncResponseSchema = z.object({
  jobId: z.string().uuid()
})

// Type inference exports
export type TenantInput = z.infer<typeof TenantSchema>
export type UserInput = z.infer<typeof UserSchema>
export type ProductRawInput = z.infer<typeof ProductRawSchema>
export type ProductInput = z.infer<typeof ProductSchema>
export type SupplierInput = z.infer<typeof SupplierSchema>
export type OrderInput = z.infer<typeof OrderSchema>
export type StockInput = z.infer<typeof StockSchema>
export type ScrapeImportRequest = z.infer<typeof ScrapeImportRequestSchema>
export type ScrapeImportResponse = z.infer<typeof ScrapeImportResponseSchema>
export type AiScoreRequest = z.infer<typeof AiScoreRequestSchema>
export type AiScoreResponse = z.infer<typeof AiScoreResponseSchema>
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>
export type StockSyncRequest = z.infer<typeof StockSyncRequestSchema>
export type StockSyncResponse = z.infer<typeof StockSyncResponseSchema>