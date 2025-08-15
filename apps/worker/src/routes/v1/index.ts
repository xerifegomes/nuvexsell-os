import { Hono } from 'hono'
import { scrape } from './scrape'
import type { Env, Context } from '../../types/env'
import type { Logger } from '../../utils/logger'

const v1 = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

// Mount scraping routes
v1.route('/scrape', scrape)

// Placeholder routes for other modules
v1.get('/ai/score', async (c) => {
  const context = c.get('context')
  return c.json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'AI scoring not yet implemented'
    },
    requestId: context.requestId
  }, 501)
})

v1.post('/orders', async (c) => {
  const context = c.get('context')
  return c.json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Order management not yet implemented'
    },
    requestId: context.requestId
  }, 501)
})

v1.post('/stock/sync', async (c) => {
  const context = c.get('context')
  return c.json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Stock sync not yet implemented'
    },
    requestId: context.requestId
  }, 501)
})

export { v1 }