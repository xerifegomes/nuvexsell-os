import type { Env, Context } from '../types/env'

export interface LogEntry {
  timestamp: string
  requestId: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  userId?: string
  tenantId?: string
  path?: string
  method?: string
  status?: number
  duration?: number
  metadata?: Record<string, any>
}

export class Logger {
  constructor(
    private env: Env,
    private context: Context
  ) {}

  private async log(entry: LogEntry) {
    try {
      const key = `log:${entry.requestId}:${Date.now()}`
      await this.env.LOGS_KV.put(key, JSON.stringify(entry), {
        expirationTtl: 7 * 24 * 60 * 60 // 7 days
      })
      
      // Also log to console in development
      if (this.env.ENVIRONMENT === 'development') {
        console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.metadata || '')
      }
    } catch (error) {
      console.error('Failed to write log:', error)
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      requestId: this.context.requestId,
      level: 'debug',
      message,
      userId: this.context.userId,
      tenantId: this.context.tenantId,
      metadata
    })
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      requestId: this.context.requestId,
      level: 'info',
      message,
      userId: this.context.userId,
      tenantId: this.context.tenantId,
      metadata
    })
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      requestId: this.context.requestId,
      level: 'warn',
      message,
      userId: this.context.userId,
      tenantId: this.context.tenantId,
      metadata
    })
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      requestId: this.context.requestId,
      level: 'error',
      message,
      userId: this.context.userId,
      tenantId: this.context.tenantId,
      metadata: {
        ...metadata,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      }
    })
  }

  request(method: string, path: string, status: number, duration: number) {
    this.log({
      timestamp: new Date().toISOString(),
      requestId: this.context.requestId,
      level: 'info',
      message: `${method} ${path} - ${status} (${duration}ms)`,
      userId: this.context.userId,
      tenantId: this.context.tenantId,
      path,
      method,
      status,
      duration
    })
  }
}