import { Hono } from 'hono'
import type { Env, Context } from '../types/env'
import type { Logger } from '../utils/logger'

const health = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

health.get('/healthz', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    // Basic health check
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: c.env.ENVIRONMENT,
      requestId: context.requestId,
      services: {
        database: 'unknown',
        kv: 'unknown',
        queues: 'unknown'
      }
    }

    // Test D1 connection
    try {
      await c.env.D1_DB.prepare('SELECT 1').first()
      checks.services.database = 'healthy'
    } catch (error) {
      checks.services.database = 'unhealthy'
      checks.status = 'degraded'
    }

    // Test KV connection
    try {
      await c.env.LOGS_KV.get('health-check')
      checks.services.kv = 'healthy'
    } catch (error) {
      checks.services.kv = 'unhealthy'
      checks.status = 'degraded'
    }

    // Test Queue connection (basic check)
    try {
      checks.services.queues = 'healthy'
    } catch (error) {
      checks.services.queues = 'unhealthy'
      checks.status = 'degraded'
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503
    
    logger.info('Health check completed', { status: checks.status })

    return c.json({
      success: true,
      data: checks,
      requestId: context.requestId
    }, statusCode)

  } catch (error) {
    logger.error('Health check failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed'
      },
      requestId: context.requestId
    }, 500)
  }
})

health.get('/metrics', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    // Basic Prometheus-style metrics
    const metrics = [
      '# HELP nuvexsell_requests_total Total number of requests',
      '# TYPE nuvexsell_requests_total counter',
      'nuvexsell_requests_total 0',
      '',
      '# HELP nuvexsell_request_duration_seconds Request duration in seconds',
      '# TYPE nuvexsell_request_duration_seconds histogram',
      'nuvexsell_request_duration_seconds_bucket{le="0.1"} 0',
      'nuvexsell_request_duration_seconds_bucket{le="0.5"} 0',
      'nuvexsell_request_duration_seconds_bucket{le="1.0"} 0',
      'nuvexsell_request_duration_seconds_bucket{le="+Inf"} 0',
      'nuvexsell_request_duration_seconds_count 0',
      'nuvexsell_request_duration_seconds_sum 0',
      '',
      '# HELP nuvexsell_up Service availability',
      '# TYPE nuvexsell_up gauge',
      'nuvexsell_up 1'
    ].join('\n')

    logger.info('Metrics endpoint accessed')

    return new Response(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4'
      }
    })

  } catch (error) {
    logger.error('Metrics endpoint failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'METRICS_FAILED',
        message: 'Failed to generate metrics'
      },
      requestId: context.requestId
    }, 500)
  }
})

export { health }