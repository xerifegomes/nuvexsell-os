import { Hono } from 'hono'
import { ScrapeImportRequestSchema, ScrapeImportResponseSchema, generateId, ValidationError } from '@nuvexsell/core'
import type { Env, Context } from '../../types/env'
import type { Logger } from '../../utils/logger'

const scrape = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

scrape.post('/import', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    const body = await c.req.json()
    
    // Validate request
    const request = ScrapeImportRequestSchema.parse(body)
    
    logger.info('Scrape import request received', {
      urlCount: request.urls.length,
      tenantId: context.tenantId
    })

    // Generate task ID
    const taskId = generateId()

    // Queue scraping jobs
    const jobs = request.urls.map(url => ({
      id: generateId(),
      type: 'SCRAPE_PRODUCT',
      data: {
        taskId,
        url,
        tenantId: context.tenantId,
        userId: context.userId
      },
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      scheduledAt: new Date()
    }))

    // Send jobs to queue
    for (const job of jobs) {
      await c.env.SCRAPE_QUEUE.send(job)
    }

    logger.info('Scrape jobs queued', {
      taskId,
      jobCount: jobs.length
    })

    const response: ScrapeImportResponseSchema = {
      taskId
    }

    return c.json({
      success: true,
      data: response,
      requestId: context.requestId
    })

  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Validation error in scrape import', { error: error.message })
      
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

    logger.error('Scrape import failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to queue scrape jobs'
      },
      requestId: context.requestId
    }, 500)
  }
})

scrape.get('/status/:taskId', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')
  const taskId = c.req.param('taskId')

  try {
    // TODO: Implement task status tracking
    // For now, return a placeholder response
    logger.info('Scrape status requested', { taskId })

    return c.json({
      success: true,
      data: {
        taskId,
        status: 'PROCESSING',
        total: 0,
        completed: 0,
        failed: 0
      },
      requestId: context.requestId
    })

  } catch (error) {
    logger.error('Failed to get scrape status', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get task status'
      },
      requestId: context.requestId
    }, 500)
  }
})

export { scrape }