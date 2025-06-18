import type { Response } from './types';

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

export function createSuccessResponse<T>(data?: T, message: string = 'Operation completed successfully'): Response<T> {
  return createResponse('success', message, data);
}

export function createErrorResponse<T>(
  message: string,
  details?: Record<string, unknown>,
  data?: T
): Response<T> {
  return createResponse('error', message, data, details);
} 