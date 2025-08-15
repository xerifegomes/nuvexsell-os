import { Hono } from 'hono'
import { contextMiddleware } from './middleware/context'
import { corsMiddleware } from './middleware/cors'
import { authMiddleware } from './middleware/auth'
import { globalRateLimit, apiRateLimit } from './middleware/rate-limit'
import { health } from './routes/health'
import { v1 } from './routes/v1'
import { runScheduledAutopilot } from './routes/v1/autopilot'
import { QueueProcessor } from './queue-handlers'
// import { MigrationRunner } from './migrations/migrate'
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

// Handlers para eventos do Cloudflare Workers
export default {
  fetch: app.fetch,
  
  // Scheduled event handler (Cron Jobs)
  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    console.log('🕐 Scheduled event triggered:', event.cron)
    
    // Executar autopilot a cada hora
    if (event.cron === '0 * * * *') { // Every hour
      ctx.waitUntil(runScheduledAutopilot(env))
    }
    
    // Executar migrações na primeira execução do dia (temporariamente desabilitado)
    if (event.cron === '0 0 * * *') { // Daily at midnight
      console.log('⏭️ Migration check skipped (will be enabled after database setup)')
    }
  },
  
  // Queue handlers
  async queue(batch: any, env: Env): Promise<void> {
    const processor = new QueueProcessor(env)
    
    for (const message of batch.messages) {
      try {
        console.log('Processing queue message:', message.body?.type)
        
        // Determinar fila baseada no corpo da mensagem
        const queueName = message.body?.type?.includes('SCRAPE') ? 'SCRAPE_QUEUE' :
                         message.body?.type?.includes('AI') ? 'AI_SCORE_QUEUE' :
                         message.body?.type?.includes('ORDER') ? 'ORDER_QUEUE' : 'UNKNOWN'
        
        await processor.processQueueMessage(queueName, message.body)
        message.ack()
        
      } catch (error) {
        console.error('Queue processing failed:', error)
        
        // Retry logic
        if (message.body?.attempts < message.body?.maxAttempts) {
          message.body.attempts++
          message.retry()
        } else {
          console.error('Max retries exceeded for message:', message.body?.id)
          message.ack() // Remove da fila
        }
      }
    }
  }
}