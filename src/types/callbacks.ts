import type { Data } from './data';
import type { State } from './state';

export interface OnStateUpdateCallback {
  (params: { state: State; data: { [key: string]: Data[] } }): void;
}

export interface OnTimeUpdateCallback {
  (params: { videoPlayerTimeSeconds: number; timestamp: string }): void;
} 