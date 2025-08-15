export class NuvexSellError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: Record<string, any>

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'NuvexSellError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details
    }
  }
}

export class ValidationError extends NuvexSellError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends NuvexSellError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends NuvexSellError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends NuvexSellError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends NuvexSellError {
  constructor(message: string) {
    super('CONFLICT', message, 409)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends NuvexSellError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', message, 429)
    this.name = 'RateLimitError'
  }
}

export class PlanLimitError extends NuvexSellError {
  constructor(limit: string) {
    super('PLAN_LIMIT_EXCEEDED', `Plan limit exceeded: ${limit}`, 402)
    this.name = 'PlanLimitError'
  }
}

export class ExternalServiceError extends NuvexSellError {
  constructor(service: string, message: string) {
    super('EXTERNAL_SERVICE_ERROR', `${service}: ${message}`, 502)
    this.name = 'ExternalServiceError'
  }
}

export class QueueError extends NuvexSellError {
  constructor(message: string) {
    super('QUEUE_ERROR', message, 500)
    this.name = 'QueueError'
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  PLAN_LIMIT_EXCEEDED: 'PLAN_LIMIT_EXCEEDED',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  QUEUE_ERROR: 'QUEUE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const