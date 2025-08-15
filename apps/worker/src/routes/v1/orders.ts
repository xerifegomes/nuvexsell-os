import { Hono } from 'hono'
import { CreateOrderRequestSchema, CreateOrderResponseSchema, generateId, ValidationError } from '@nuvexsell/core'
import type { Env, Context } from '../../types/env'
import type { Logger } from '../../utils/logger'

const orders = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

orders.post('/', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    const body = await c.req.json()
    const request = CreateOrderRequestSchema.parse(body)
    
    logger.info('Order creation request received', {
      itemCount: request.items.length,
      tenantId: context.tenantId
    })

    const orderId = generateId()

    // Queue order processing job
    const job = {
      id: generateId(),
      type: 'PROCESS_ORDER',
      data: {
        orderId,
        items: request.items,
        destination: request.destination,
        tenantId: context.tenantId,
        userId: context.userId
      },
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      scheduledAt: new Date()
    }

    await c.env.ORDER_QUEUE.send(job)

    logger.info('Order processing job queued', { orderId })

    const response: CreateOrderResponseSchema = {
      orderId,
      status: 'CREATED'
    }

    return c.json({
      success: true,
      data: response,
      requestId: context.requestId
    })

  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Validation error in order creation', { error: error.message })
      
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details
        },
        requestId: context.requestId
      }, 400)
    }

    logger.error('Order creation failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create order'
      },
      requestId: context.requestId
    }, 500)
  }
})

orders.get('/:orderId', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')
  const orderId = c.req.param('orderId')

  try {
    logger.info('Order status requested', { orderId })

    // Simular busca de pedido
    const mockOrder = {
      id: orderId,
      tenantId: context.tenantId,
      status: 'ROUTED',
      trackingCode: `TRK${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return c.json({
      success: true,
      data: mockOrder,
      requestId: context.requestId
    })

  } catch (error) {
    logger.error('Failed to get order status', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get order status'
      },
      requestId: context.requestId
    }, 500)
  }
})

export { orders }
