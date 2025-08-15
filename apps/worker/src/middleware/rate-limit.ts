import { createMiddleware } from 'hono/factory'
import { RateLimitError } from '@nuvexsell/core'
import type { Env, Context } from '../types/env'
import { Logger } from '../utils/logger'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (c: any) => string
}

export function rateLimitMiddleware(config: RateLimitConfig) {
  return createMiddleware<{
    Bindings: Env
    Variables: { context: Context; logger: Logger }
  }>(async (c, next) => {
    const logger = c.get('logger')
    const context = c.get('context')

    try {
      const key = config.keyGenerator 
        ? config.keyGenerator(c)
        : `rate_limit:${context.ip}:${c.req.path}`

      const now = Date.now()
      const windowStart = now - config.windowMs

      // Get current request count from KV
      const counterKey = `${key}:${Math.floor(now / config.windowMs)}`
      const currentCount = await c.env.RATE_KV.get(counterKey)
      const requestCount = currentCount ? parseInt(currentCount) : 0

      if (requestCount >= config.maxRequests) {
        logger.warn('Rate limit exceeded', {
          key,
          currentCount: requestCount,
          limit: config.maxRequests
        })

        const resetTime = Math.ceil((Math.floor(now / config.windowMs) + 1) * config.windowMs / 1000)
        
        return c.json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests'
          },
          requestId: context.requestId
        }, 429, {
          'Retry-After': resetTime.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString()
        })
      }

      // Increment counter
      await c.env.RATE_KV.put(
        counterKey,
        (requestCount + 1).toString(),
        { expirationTtl: Math.ceil(config.windowMs / 1000) }
      )

      // Add rate limit headers
      const remaining = Math.max(0, config.maxRequests - requestCount - 1)
      const resetTime = Math.ceil((Math.floor(now / config.windowMs) + 1) * config.windowMs / 1000)

      c.res.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      c.res.headers.set('X-RateLimit-Remaining', remaining.toString())
      c.res.headers.set('X-RateLimit-Reset', resetTime.toString())

      await next()
    } catch (error) {
      logger.error('Rate limiting error', error as Error)
      // Continue on rate limiting errors to avoid blocking legitimate requests
      await next()
    }
  })
}

// Pre-configured rate limiters
export const globalRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000 // 1000 requests per 15 minutes per IP
})

export const apiRateLimit = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute per IP
})

export const strictRateLimit = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 requests per minute per IP
})