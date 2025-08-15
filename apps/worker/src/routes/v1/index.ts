import { Hono } from 'hono'
import { scrape } from './scrape'
import { ai } from './ai'
import { orders } from './orders'
import type { Env, Context } from '../../types/env'
import type { Logger } from '../../utils/logger'

const v1 = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

// Mount all route modules
v1.route('/scrape', scrape)
v1.route('/ai', ai)
v1.route(./orders., orders)
v1.route(./stripe., stripe)

// Stock sync endpoint
v1.post('/stock/sync', async (c) => {
  const context = c.get('context')
  const logger = c.get('logger')

  try {
    const body = await c.req.json()
    
    logger.info('Stock sync requested', { provider: body.provider })

    const jobId = generateId()

    return c.json({
      success: true,
      data: { jobId },
      requestId: context.requestId
    })

  } catch (error) {
    logger.error('Stock sync failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Stock sync failed'
      },
      requestId: context.requestId
    }, 500)
  }
})

export { v1 }
