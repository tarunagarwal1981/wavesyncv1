import { NextResponse } from 'next/server';
import { ApiResponse, ApiError as ApiErrorType } from './api/types';
import { handleApiError } from './api/errors';

// Success response helper
export function apiSuccess<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    statusCode,
  };

  return NextResponse.json(response, { status: statusCode });
}

// Error response helper
export function apiError(
  error: unknown,
  statusCode?: number
): NextResponse<ApiResponse<never>> {
  const errorData = handleApiError(error);
  const finalStatusCode = statusCode || errorData.statusCode;

  const response: ApiResponse<never> = {
    success: false,
    error: errorData.message,
    timestamp: new Date().toISOString(),
    statusCode: finalStatusCode,
  };

  return NextResponse.json(response, { status: finalStatusCode });
}

// Paginated response helper
export function apiPaginatedSuccess<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): NextResponse<ApiResponse<T[]>> {
  const pages = Math.ceil(pagination.total / pagination.limit);
  
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    statusCode: 200,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages,
      hasNext: pagination.page < pages,
      hasPrev: pagination.page > 1,
    },
  };

  return NextResponse.json(response);
}

// Redirect response helper
export function apiRedirect(url: string, statusCode: number = 302): NextResponse {
  return NextResponse.redirect(url, { status: statusCode });
}

// Created response helper
export function apiCreated<T>(
  data: T,
  message: string = 'Resource created successfully'
): NextResponse<ApiResponse<T>> {
  return apiSuccess(data, message, 201);
}

// No content response helper
export function apiNoContent(message: string = 'Operation completed successfully'): NextResponse {
  return NextResponse.json(null, { status: 204 });
}

// Not found response helper
export function apiNotFound(message: string = 'Resource not found'): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    statusCode: 404,
  };

  return NextResponse.json(response, { status: 404 });
}

// Validation error response helper
export function apiValidationError(
  message: string,
  details?: any
): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    statusCode: 400,
    ...(details && { details }),
  };

  return NextResponse.json(response, { status: 400 });
}

// Unauthorized response helper
export function apiUnauthorized(message: string = 'Authentication required'): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    statusCode: 401,
  };

  return NextResponse.json(response, { status: 401 });
}

// Forbidden response helper
export function apiForbidden(message: string = 'Insufficient permissions'): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    statusCode: 403,
  };

  return NextResponse.json(response, { status: 403 });
}

// Rate limit response helper
export function apiRateLimitExceeded(): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: 'Too many requests. Please try again later.',
    timestamp: new Date().toISOString(),
    statusCode: 429,
  };

  return NextResponse.json(response, { status: 429 });
}



