import type { Response } from '../types';
import { createErrorResponse } from '../errors';

export interface ProcessingError {
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ProcessingResult {
  name: string;
  itemCount: number;
}

export interface ErrorHandlingOptions {
  onError?: (error: {
    message: string;
    details?: {
      successfulEntries?: ProcessingResult[];
      failedEntries?: ProcessingError[];
    };
  }) => void;
}

/**
 * Handles data processing errors and creates appropriate error responses
 */
export function handleDataProcessingErrors(
  results: ProcessingResult[],
  errors: ProcessingError[],
  options?: ErrorHandlingOptions
): Response<ProcessingResult[]> {
  const errorResponse = createErrorResponse<ProcessingResult[]>('Some entries failed to process', {
    successfulEntries: results,
    failedEntries: errors,
  });

  options?.onError?.({
    message: errorResponse.message,
    details: errorResponse.details,
  });

  return errorResponse;
} 