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

// Standardized response type for all API responses
export interface Response<T = void> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  details?: Record<string, unknown>;
  timestamp: string;
} 