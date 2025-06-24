import type { Data, DataProcessingSuccessOptions, ProcessingResult, Response } from '../types';

import { createResponse } from './errorHandler';

/**
 * Handles successful data processing and creates appropriate success responses
 */
export function handleDataProcessingSuccess(
  results: ProcessingResult[],
  data: { [key: string]: Data[] },
  options?: DataProcessingSuccessOptions
): Response<ProcessingResult[]> {
  if (options?.onProgress) {
    options.onProgress({
      status: 'success',
      progress: 100,
    });
  }

  const successResponse = createResponse<ProcessingResult[]>('success', 'Operation completed successfully', results);

  options?.onSuccess?.(data);

  return successResponse;
} 