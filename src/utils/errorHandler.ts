import type { ErrorDetails, ErrorType } from '../types';

export interface ErrorContext {
  operation: string;
  component: string;
  timestamp: string;
  additionalInfo?: Record<string, unknown>;
}

export interface ErrorInfo {
  type: ErrorType;
  code: string;
  message: string;
  context?: ErrorContext;
  originalError?: Error;
}

/**
 * Creates a standardized error with proper context and logging
 */
export function createStandardError(
  errorInfo: ErrorInfo,
  details?: ErrorDetails
): Error {
  const error = new Error(errorInfo.message);
  
  // Add custom properties for better error handling
  (error as any).type = errorInfo.type;
  (error as any).code = errorInfo.code;
  (error as any).context = errorInfo.context;
  (error as any).originalError = errorInfo.originalError;
  (error as any).details = details;
  (error as any).timestamp = new Date().toISOString();

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('BHVES Error:', {
      type: errorInfo.type,
      code: errorInfo.code,
      message: errorInfo.message,
      context: errorInfo.context,
      originalError: errorInfo.originalError?.message,
      details,
      stack: errorInfo.originalError?.stack,
    });
  }

  return error;
}

/**
 * Wraps an operation with error handling and context
 */
export function withErrorHandling<T>(
  operation: () => T | Promise<T>,
  context: Omit<ErrorContext, 'timestamp'>,
  errorType: ErrorType = 'UnknownError'
): T | Promise<T> {
  const errorContext: ErrorContext = {
    ...context,
    timestamp: new Date().toISOString(),
  };

  try {
    const result = operation();
    
    if (result instanceof Promise) {
      return result.catch((error) => {
        throw createStandardError({
          type: errorType,
          code: `${context.component.toUpperCase()}_${context.operation.toUpperCase()}_ERROR`,
          message: `Failed to ${context.operation} in ${context.component}: ${error.message}`,
          context: errorContext,
          originalError: error instanceof Error ? error : new Error(String(error)),
        });
      });
    }
    
    return result;
  } catch (error) {
    throw createStandardError({
      type: errorType,
      code: `${context.component.toUpperCase()}_${context.operation.toUpperCase()}_ERROR`,
      message: `Failed to ${context.operation} in ${context.component}: ${error instanceof Error ? error.message : String(error)}`,
      context: errorContext,
      originalError: error instanceof Error ? error : new Error(String(error)),
    });
  }
}

/**
 * Validates required parameters and throws standardized errors
 */
export function validateRequired<T>(
  value: T | null | undefined,
  name: string,
  context: Omit<ErrorContext, 'timestamp'>
): T {
  if (value === null || value === undefined) {
    throw createStandardError({
      type: 'ValidationError',
      code: 'MISSING_REQUIRED_PARAMETER',
      message: `${name} is required`,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }
  return value;
}

/**
 * Validates string parameters and throws standardized errors
 */
export function validateString(
  value: unknown,
  name: string,
  context: Omit<ErrorContext, 'timestamp'>
): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createStandardError({
      type: 'ValidationError',
      code: 'INVALID_STRING_PARAMETER',
      message: `${name} must be a non-empty string`,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }
  return value;
} 