import type { CategoryIndexes } from './data';

export interface State {
  videoPlayerTimeSeconds: number;
  timestamp: string;
  matchingIndexes: CategoryIndexes;
  activeMatchingIndexes: CategoryIndexes;
}

export interface Response<T = void> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  details?: Record<string, unknown>;
  timestamp: string;
} 