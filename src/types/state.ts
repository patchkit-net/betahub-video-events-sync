import type { CategoryIndexes } from './data';

export interface State {
  videoPlayerTimeSeconds: number;
  timestamp: string;
  matchingIndexes: CategoryIndexes;
  activeMatchingIndexes: CategoryIndexes;
} 