import { Hono } from 'hono'
import { AiScoreRequestSchema, AiScoreResponseSchema, generateId, ValidationError } from '@nuvexsell/core'
import type { Env, Context } from '../../types/env'
import type { Logger } from '../../utils/logger'

const ai = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

ai.post('/score', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    const body = await c.req.json()
    const request = AiScoreRequestSchema.parse(body)
    
    logger.info('AI scoring request received', {
      productCount: request.productId.length,
      tenantId: context.tenantId
    })

    // Queue AI scoring jobs
    const jobs = request.productId.map(productId => ({
      id: generateId(),
      type: 'AI_SCORE_PRODUCT',
      data: {
        productId,
        tenantId: context.tenantId,
        userId: context.userId
      },
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      scheduledAt: new Date()
    }))

    // Send jobs to AI queue
    for (const job of jobs) {
      await c.env.AI_SCORE_QUEUE.send(job)
    }

    logger.info('AI scoring jobs queued', {
      jobCount: jobs.length
    })

    // Simular resposta imediata para desenvolvimento
    const scores = request.productId.map(productId => ({
      productId,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      details: {
        priceScore: Math.floor(Math.random() * 30) + 70,
        demandScore: Math.floor(Math.random() * 30) + 70,
        sentimentScore: Math.floor(Math.random() * 30) + 70,
        recommendation: 'medium',
        confidence: 0.85
      }
    }))

    const response: AiScoreResponseSchema = { scores }

    return c.json({
      success: true,
      data: response,
      requestId: context.requestId
    })

  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Validation error in AI scoring', { error: error.message })
      
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

    logger.error('AI scoring failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process AI scoring'
      },
      requestId: context.requestId
    }, 500)
  }
})

ai.post('/worker-ai', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    const body = await c.req.json()
    
    // Usar Worker IA do Cloudflare
    const aiResponse = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        { role: 'user', content: body.prompt }
      ]
    })

    logger.info('Worker AI request processed')

    return c.json({
      success: true,
      data: aiResponse,
      requestId: context.requestId
    })

  } catch (error) {
    logger.error('Worker AI failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'AI_ERROR',
        message: 'Worker AI processing failed'
      },
      requestId: context.requestId
    }, 500)
  }
})

export { ai }
