import type { OnStateUpdateCallback, OnTimeUpdateCallback } from './callbacks';

export interface BHVESConstructorParams {
  videoPlayerDomId: string;
  startTimestamp: string;
  onStateUpdate?: OnStateUpdateCallback;
  onTimeUpdate?: OnTimeUpdateCallback;
} 