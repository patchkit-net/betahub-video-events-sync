import type { ErrorContext, ErrorInfo, ErrorType, Response } from '../types';

/**
 * Creates a standardized error with proper context and logging
 */
export function createStandardError(errorInfo: ErrorInfo): Error {
  const error = new Error(errorInfo.message);
  
  // Add custom properties for better error handling
  (error as any).type = errorInfo.type;
  (error as any).context = errorInfo.context;
  (error as any).originalError = errorInfo.originalError;
  (error as any).timestamp = new Date().toISOString();

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('BHVES Error:', {
      type: errorInfo.type,
      message: errorInfo.message,
      context: errorInfo.context,
      originalError: errorInfo.originalError?.message,
      stack: errorInfo.originalError?.stack,
    });
  }

  return error;
}

/**
 * Creates a standardized response object
 */
export function createResponse<T>(
  status: 'success' | 'error',
  message: string,
  data?: T,
  details?: Record<string, unknown>
): Response<T> {
  return {
    status,
    message,
    data,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates that a parameter is a required non-empty string and throws standardized errors
 */
export function validateRequiredString(
  value: unknown,
  name: string,
  context: Omit<ErrorContext, 'timestamp'>
): string {
  if (value === null || value === undefined) {
    throw createStandardError({
      type: 'ValidationError',
      message: `${name} is required`,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw createStandardError({
      type: 'ValidationError',
      message: `${name} must be a non-empty string`,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  return value;
} 