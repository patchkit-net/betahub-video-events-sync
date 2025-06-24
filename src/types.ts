export type ErrorType = 'ValidationError' | 'DataProcessingError' | 'ConfigurationError' | 'UnknownError';

export interface ErrorDetails {
  [key: string]: unknown;
}

export interface ErrorContext {
  operation: string;
  component: string;
  timestamp: string;
  additionalInfo?: Record<string, unknown>;
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  context?: ErrorContext;
  originalError?: Error;
}

export interface BHVLError {
  type: ErrorType;
  code: string;
  message: string;
  details?: ErrorDetails;
  originalError?: Error;
  timestamp: string;
}

export interface ErrorResponse {
  status: 'error';
  error: BHVLError;
}

export interface SuccessResponse<T = void> {
  status: 'success';
  data?: T;
  message?: string;
}

export interface Response<T = void> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface Data {
  start_timestamp: string;
  end_timestamp?: string;
  type: string;
  message?: string;
  details?: object;
}

// Internal data structure with parsed timestamps for better performance
export interface DataInternal {
  start_timestamp: Date;
  end_timestamp?: Date;
  type: string;
  message?: string;
  details?: object;
}

// Standardized type for category-to-indexes mapping
export type CategoryIndexes = { [key: string]: number[] };

export interface State {
  videoPlayerTimeSeconds: number;
  timestamp: string;
  matchingIndexes: CategoryIndexes;
  activeMatchingIndexes: CategoryIndexes;
}

// Constructor parameter interfaces
export interface OnStateUpdateCallback {
  (params: { state: State; data: { [key: string]: Data[] } }): void;
}

export interface OnTimeUpdateCallback {
  (params: { videoPlayerTimeSeconds: number; timestamp: string }): void;
}

export interface BHVESConstructorParams {
  videoPlayerDomId: string;
  startTimestamp: string;
  onStateUpdate?: OnStateUpdateCallback;
  onTimeUpdate?: OnTimeUpdateCallback;
}
