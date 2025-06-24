export type ErrorType = 'ValidationError' | 'DataProcessingError' | 'ConfigurationError' | 'UnknownError';

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

export interface Response<T = void> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  details?: Record<string, unknown>;
  timestamp: string;
} 