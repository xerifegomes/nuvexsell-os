import { Hono } from 'hono'
import { contextMiddleware } from './middleware/context'
import { corsMiddleware } from './middleware/cors'
import { authMiddleware } from './middleware/auth'
import { globalRateLimit, apiRateLimit } from './middleware/rate-limit'
import { health } from './routes/health'
import { v1 } from './routes/v1'
import type { Env, Context } from './types/env'
import type { Logger } from './utils/logger'

const app = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

// Global middleware
app.use('*', corsMiddleware)
app.use('*', contextMiddleware)
app.use('*', globalRateLimit)

// Health checks (no auth required)
app.route('/', health)

// API routes (auth required)
app.use('/v1/*', authMiddleware)
app.use('/v1/*', apiRateLimit)
app.route('/v1', v1)

// 404 handler
app.notFound((c) => {
  const context = c.get('context')
  const logger = c.get('logger')
  
  logger.warn('Route not found', { path: c.req.path })
  
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    },
    requestId: context.requestId
  }, 404)
})

// Error handler
app.onError((error, c) => {
  const context = c.get('context')
  const logger = c.get('logger')
  
  logger.error('Unhandled error', error)
  
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    },
    requestId: context.requestId
  }, 500)
})

export default app