// Custom Error Classes for API
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super('CONFLICT', message, 409);
  }
}

export class RateLimitError extends ApiError {
  constructor() {
    super('RATE_LIMIT_EXCEEDED', 'Too many requests', 429);
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super('SERVER_ERROR', message, 500);
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message: string = 'External service unavailable') {
    super('EXTERNAL_SERVICE_ERROR', `${service}: ${message}`, 502);
  }
}

// Error handler utility
export function handleApiError(error: unknown): { code: string; message: string; statusCode: number; details?: any } {
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    statusCode: 500,
  };
}

// Rate limiting configuration
export const RATE_LIMITS = {
  auth: {
    login: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    signup: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    passwordReset: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  },
  general: {
    default: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    upload: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
    export: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 exports per 15 minutes
  },
  admin: {
    default: { requests: 500, windowMs: 15 * 60 * 1000 }, // 500 requests per 15 minutes
  },
} as const;



