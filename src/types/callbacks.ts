import type { Data, ProcessingError, ProcessingResult } from './data';

import type { State } from './state';

export interface OnStateUpdateCallback {
  (params: { state: State; data: { [key: string]: Data[] } }): void;
}

export interface OnTimeUpdateCallback {
  (params: { videoPlayerTimeSeconds: number; timestamp: string }): void;
}

export interface DataProcessingErrorOptions {
  onError?: (error: {
    message: string;
    details?: {
      successfulEntries?: ProcessingResult[];
      failedEntries?: ProcessingError[];
    };
  }) => void;
}

export interface DataProcessingSuccessOptions {
  onProgress?: (status: {
    status: 'loading' | 'error' | 'success';
    progress: number;
  }) => void;
  onSuccess?: (data: { [key: string]: Data[] }) => void;
}
