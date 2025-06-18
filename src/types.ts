export enum Status {
  SUCCESS = 'success',
  ERROR = 'error',
}

export type ErrorType = 'ValidationError' | 'DataProcessingError' | 'ConfigurationError' | 'UnknownError';

export interface ErrorDetails {
  [key: string]: unknown;
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
  start_time: string;
  end_time?: string;
  type: string;
  message?: string;
  details?: object;
}

export interface State {
  videoPlayerTime: number;
  timestamp: string;
  matchingIndexes: { [key: string]: number[] };
  activeMatchingIndexes: { [key: string]: number[] };
}
