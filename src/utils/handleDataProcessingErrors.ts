import type { DataProcessingErrorOptions, ProcessingError, ProcessingResult, Response } from '../types';

import { createResponse } from './errorHandler';

/**
 * Handles data processing errors and creates appropriate error responses
 */
export function handleDataProcessingErrors(
  results: ProcessingResult[],
  errors: ProcessingError[],
  options?: DataProcessingErrorOptions
): Response<ProcessingResult[]> {
  const errorResponse = createResponse<ProcessingResult[]>('error', 'Some entries failed to process', undefined, {
    successfulEntries: results,
    failedEntries: errors,
  });

  options?.onError?.({
    message: errorResponse.message,
    details: errorResponse.details,
  });

  return errorResponse;
} 