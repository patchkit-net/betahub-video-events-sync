import type { Data, Response } from '../types';

import type { ProcessingResult } from './handleDataProcessingErrors';
import { createSuccessResponse } from '../errors';

export interface SuccessHandlingOptions {
  onProgress?: (status: {
    status: 'loading' | 'error' | 'success';
    progress: number;
  }) => void;
  onSuccess?: (data: { [key: string]: Data[] }) => void;
}

/**
 * Handles successful data processing and creates appropriate success responses
 */
export function handleDataProcessingSuccess(
  results: ProcessingResult[],
  data: { [key: string]: Data[] },
  options?: SuccessHandlingOptions
): Response<ProcessingResult[]> {
  if (options?.onProgress) {
    options.onProgress({
      status: 'success',
      progress: 100,
    });
  }

  const successResponse = createSuccessResponse<ProcessingResult[]>(
    results,
    `Successfully processed ${results.length} entries`
  );

  options?.onSuccess?.(data);
  return successResponse;
} 