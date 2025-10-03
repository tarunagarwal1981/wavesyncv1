import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiError, apiRateLimitExceeded } from '@/lib/api-response';
import { RateLimitError } from '@/lib/api/errors';

// Rate limiting storage (in production, use Redis or similar)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const DEFAULT_LIMIT = 100; // requests per window

// Check rate limit
function checkRateLimit(identifier: string, limit: number = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  const entry = rateLimits.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip;
  return ip || 'unknown';
}

// Authentication middleware
export async function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: { requireAuth?: boolean; roles?: string[] } = {}
): Function {
  const { requireAuth = true, roles = [] } = options;

  return async (request: NextRequest) => {
    try {
      // Check authentication if required
      if (requireAuth) {
        const authorization = request.headers.get('authorization');
        const token = authorization?.replace('Bearer ', '');

        if (!token) {
          return apiError(new Error('Authentication required'), 401);
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
          return apiError(new Error('Invalid authentication token'), 401);
        }

        // Check roles if specified
        if (roles.length > 0) {
          const userRole = user.user_metadata?.role;
          if (!userRole || !roles.includes(userRole)) {
            return apiError(new Error('Insufficient permissions'), 403);
          }
        }

        // Add user to request metadata (you might need to adapt this)
        (request as any).user = user;
      }

      return await handler(request);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return apiError(error, 500);
    }
  };
}

// Rate limiting middleware
export function withRateLimit(
  handler: Function,
  options: { limit?: number; endpoint?: string } = {}
): Function {
  const { limit = DEFAULT_LIMIT, endpoint } = options;

  return (request: NextRequest) => {
    const identifier = endpoint 
      ? `${getClientIdentifier(request)}:${endpoint}`
      : getClientIdentifier(request);

    if (!checkRateLimit(identifier, limit)) {
      return apiRateLimitExceeded();
    }

    return handler(request);
  };
}

// Request logging middleware
export function withLogging(handler: Function, options: { logBody?: boolean } = {}): Function {
  const { logBody = false } = options;

  return async (request: NextRequest) => {
    const startTime = Date.now();
    const { pathname, searchParams } = new URL(request.url);
    
    const logData = {
      method: request.method,
      path: pathname,
      query: Object.fromEntries(searchParams.entries()),
      userAgent: request.headers.get('user-agent'),
      ip: getClientIdentifier(request),
      timestamp: new Date().toISOString(),
    };

    if (logBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.clone().json();
        (logData as any).body = body;
      } catch {
        // Body is not JSON or empty
      }
    }

    console.log('API Request:', logData);

    const response = await handler(request);
    
    const duration = Date.now() - startTime;
    console.log('API Response:', {
      ...logData,
      status: response.status,
      duration: `${duration}ms`,
    });

    return response;
  };
}

// Error handling middleware
export function withErrorHandling(handler: Function): Function {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      });

      return apiError(error, 500);
    }
  };
}

// CORS middleware
export function withCORS(handler: Function, options: { 
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
} = {}): Function {
  const {
    allowedOrigins = ['http://localhost:3000', 'https://wavesync.app'],
    allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
  } = options;

  return async (request: NextRequest) => {
    const origin = request.headers.get('origin');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      response.headers.set('Access-Control-Max-Age', '86400');
      
      return response;
    }

    const response = await handler(request);

    // Add CORS headers to response
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  };
}

// Combine all middleware
export function createApiHandler(
  handler: Function,
  options: {
    requireAuth?: boolean;
    roles?: string[];
    rateLimit?: number;
    endpoint?: string;
    logBody?: boolean;
    cors?: boolean;
  } = {}
): Function {
  const {
    requireAuth = false,
    roles = [],
    rateLimit,
    endpoint,
    logBody = false,
    cors = true,
  } = options;

  let middleware = handler;

  // Apply middlewares in order
  if (rateLimit) {
    middleware = withRateLimit(middleware, { limit: rateLimit, endpoint });
  }

  if (requireAuth || roles.length > 0) {
    middleware = withAuth(middleware, { requireAuth, roles });
  }

  middleware = withLogging(middleware, { logBody });
  middleware = withErrorHandling(middleware);

  if (cors) {
    middleware = withCORS(middleware);
  }

  return middleware;
}

// Specific rate limits for different endpoints
export const ENDPOINT_RATE_LIMITS = {
  auth: {
    login: 5,
    signup: 3,
    passwordReset: 3,
    refresh: 10,
  },
  upload: {
    certificates: 5,
    documents: 10,
    avatar: 2,
  },
  export: {
    pdf: 3,
    csv: 5,
  },
  default: 100,
} as const;

// Helper to get rate limit for endpoint
export function getRateLimitForEndpoint(endpoint: string): number {
  const parts = endpoint.split('/');
  
  if (parts.includes('auth')) {
    const authAction = parts[parts.length - 1];
    return ENDPOINT_RATE_LIMITS.auth[authAction as keyof typeof ENDPOINT_RATE_LIMITS.auth] || ENDPOINT_RATE_LIMITS.default;
  }
  
  if (parts.includes('upload')) {
    const uploadType = parts[parts.length - 1];
    return ENDPOINT_RATE_LIMITS.upload[uploadType as keyof typeof ENDPOINT_RATE_LIMITS.upload] || ENDPOINT_RATE_LIMITS.default;
  }
  
  if (parts.includes('export')) {
    const exportType = parts[parts.length - 1];
    return ENDPOINT_RATE_LIMITS.export[exportType as keyof typeof ENDPOINT_RATE_LIMITS.export] || ENDPOINT_RATE_LIMITS.default;
  }
  
  return ENDPOINT_RATE_LIMITS.default;
}



