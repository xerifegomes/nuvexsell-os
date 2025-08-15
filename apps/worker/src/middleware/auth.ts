import { createMiddleware } from 'hono/factory'
import { jwt } from 'hono/jwt'
import { AuthenticationError } from '@nuvexsell/core'
import type { Env, Context } from '../types/env'
import { Logger } from '../utils/logger'

export const authMiddleware = createMiddleware<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>(async (c, next) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const token = authHeader.substring(7)
    
    // Verify JWT using Hono's JWT middleware
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: 'HS256'
    })

    await jwtMiddleware(c, async () => {})

    const payload = c.get('jwtPayload') as any

    if (!payload || !payload.sub || !payload.tenantId) {
      throw new AuthenticationError('Invalid token payload')
    }

    // Update context with user info
    context.userId = payload.sub
    context.tenantId = payload.tenantId
    context.plan = payload.plan

    logger.debug('User authenticated', {
      userId: payload.sub,
      tenantId: payload.tenantId,
      plan: payload.plan
    })

    await next()
  } catch (error) {
    logger.error('Authentication failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: error instanceof Error ? error.message : 'Authentication failed'
      },
      requestId: context.requestId
    }, 401)
  }
})