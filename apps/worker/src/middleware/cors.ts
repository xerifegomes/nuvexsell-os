import { cors } from 'hono/cors'
import type { Env } from '../types/env'

export const corsMiddleware = cors({
  origin: (origin, c) => {
    const env = c.env as Env
    
    // In development, allow localhost
    if (env.ENVIRONMENT === 'development') {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin || '*'
      }
    }

    // In production, only allow specific origins
    const allowedOrigins = [
      'https://nuvexsell.com',
      'https://app.nuvexsell.com',
      'https://*.nuvexsell.com'
    ]

    if (env.ENVIRONMENT === 'staging') {
      allowedOrigins.push(
        'https://staging.nuvexsell.com',
        'https://*.staging.nuvexsell.com'
      )
    }

    // Check if origin matches allowed patterns
    if (origin) {
      for (const allowed of allowedOrigins) {
        if (allowed.includes('*')) {
          const pattern = allowed.replace('*', '.*')
          if (new RegExp(`^${pattern}$`).test(origin)) {
            return origin
          }
        } else if (origin === allowed) {
          return origin
        }
      }
    }

    return null // Block the request
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Origin',
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With'
  ],
  exposeHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
})