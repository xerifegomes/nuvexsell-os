import { createMiddleware } from 'hono/factory'
import { generateRequestId } from '@nuvexsell/core'
import type { Env, Context } from '../types/env'
import { Logger } from '../utils/logger'

export const contextMiddleware = createMiddleware<{ Bindings: Env; Variables: { context: Context; logger: Logger } }>(
  async (c, next) => {
    const requestId = generateRequestId()
    const userAgent = c.req.header('user-agent') || 'Unknown'
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'Unknown'
    const startTime = Date.now()

    const context: Context = {
      requestId,
      userAgent,
      ip,
      startTime
    }

    const logger = new Logger(c.env, context)

    c.set('context', context)
    c.set('logger', logger)

    // Log incoming request
    logger.info(`Incoming request: ${c.req.method} ${c.req.path}`)

    await next()

    // Log request completion
    const duration = Date.now() - startTime
    logger.request(c.req.method, c.req.path, c.res.status, duration)
  }
)