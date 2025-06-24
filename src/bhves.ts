import type { Data, DataInternal, Response, State, BHVESConstructorParams, OnStateUpdateCallback, OnTimeUpdateCallback } from './types';
import { createErrorResponse, createSuccessResponse } from './errors';

import { DataIndexManager } from './DataIndexManager';
import { 
  convertVideoTimeToISOTimestamp,
  convertToInternalData,
  findActiveEvents,
  processDataEntry,
  type ProcessDataEntryOptions,
  countTotalItems,
  validateTimestamp
} from './utils';

/**
 * BHVESInstance manages video event synchronization by tracking and displaying
 * events that should be active at specific timestamps during video playback.
 */
export class BHVESInstance {
  startTimestamp: string | null = null;
  private startTimestampParsed: Date | null = null;
  data: { [key: string]: Data[] } = {};
  private dataInternal: { [key: string]: DataInternal[] } = {};
  private dataIndexManager: DataIndexManager = new DataIndexManager();

  constructor({
    videoPlayerDomId,
    startTimestamp,
    onStateUpdate,
    onTimeUpdate,
  }: BHVESConstructorParams) {
    if (!videoPlayerDomId) {
      throw new Error('videoPlayerDomId is required');
    }
    if (!startTimestamp) {
      throw new Error('startTimestamp is required');
    }

    this.startTimestamp = startTimestamp;
    this.startTimestampParsed = validateTimestamp(startTimestamp);
    
    const player = document.getElementById(videoPlayerDomId);

    if (!(player instanceof HTMLVideoElement)) {
      throw new Error(
        `Element with id ${videoPlayerDomId} is not a video element`
      );
    }

    this.setupVideoPlayer(player, onStateUpdate, onTimeUpdate);
  }

  /**
   * Sets up the video player event listeners and state management
   */
  private setupVideoPlayer(
    player: HTMLVideoElement,
    onStateUpdate?: OnStateUpdateCallback,
    onTimeUpdate?: OnTimeUpdateCallback
  ): void {
    player.addEventListener('timeupdate', () => {
      if (!this.startTimestampParsed) {
        throw new Error('startTimestampParsed is not initialized');
      }

      const videoPlayerTimeSeconds = player.currentTime;
      const videoPlayerTimeMilliseconds = videoPlayerTimeSeconds * 1000;
      const timestamp = convertVideoTimeToISOTimestamp(this.startTimestampParsed, videoPlayerTimeMilliseconds);
      const currentTime = this.startTimestampParsed.getTime() + videoPlayerTimeMilliseconds;
      
      // Get all events that should be displayed at current time
      const matchingIndexes = this.dataIndexManager.findMatchingIndexes(timestamp);
      
      // Find the most recent event that should be active at current time
      const activeMatchingIndexes = findActiveEvents(matchingIndexes, this.dataInternal, currentTime);

      const state: State = {
        videoPlayerTimeSeconds: player.currentTime,
        timestamp,
        matchingIndexes,
        activeMatchingIndexes,
      };

      if (Object.keys(state.matchingIndexes).length > 0) {
        onStateUpdate?.({ state, data: this.data });
      }

      onTimeUpdate?.({ videoPlayerTimeSeconds: player.currentTime, timestamp });
    });
  }

  /**
   * Adds event data to the instance and indexes it for time-based lookups
   */
  async addData(
    entries: { name: string; dataJSONL: string }[],
    options?: {
      onProgress?: (status: {
        status: 'loading' | 'error' | 'success';
        progress: number;
      }) => void;
      onSuccess?: (data: { [key: string]: Data[] }) => void;
      onError?: (error: {
        message: string;
        details?: {
          successfulEntries?: { name: string; itemCount: number }[];
          failedEntries?: {
            name: string;
            message: string;
            details?: Record<string, unknown>;
          }[];
        };
      }) => void;
      sortData?: boolean;
    }
  ): Promise<Response<{ name: string; itemCount: number }[]>> {
    const results: { name: string; itemCount: number }[] = [];
    const errors: {
      name: string;
      message: string;
      details?: Record<string, unknown>;
    }[] = [];
    let totalProgress = 0;
    const totalItems = countTotalItems(entries);

    for (const { name, dataJSONL } of entries) {
      const processOptions: ProcessDataEntryOptions = {
        onProgress: options?.onProgress,
        totalItems,
        totalProgress,
      };

      const result = await processDataEntry(name, dataJSONL, processOptions);
      totalProgress = processOptions.totalProgress;

      if (result.success && result.data) {
        // Store original data
        this.data[name] = result.data;
        
        // Convert to internal format with parsed timestamps
        const internalData = convertToInternalData(result.data);
        this.dataInternal[name] = internalData;
        
        await this.dataIndexManager.addData(name, internalData, options?.sortData ?? true);

        if (result.itemCount === undefined) {
          throw new Error(`Item count is undefined for entry: ${name}`);
        }

        results.push({
          name,
          itemCount: result.itemCount,
        });
      } else if (result.error) {
        errors.push({
          name,
          message: result.error.message,
          details: result.error.details,
        });
      }
    }

    if (errors.length > 0) {
      const errorResponse = createErrorResponse<{ name: string; itemCount: number }[]>('Some entries failed to process', {
        successfulEntries: results,
        failedEntries: errors,
      });
      options?.onError?.({
        message: errorResponse.message,
        details: errorResponse.details,
      });
      return errorResponse;
    }

    if (options?.onProgress) {
      options.onProgress({
        status: 'success',
        progress: 100,
      });
    }

    const successResponse = createSuccessResponse<{ name: string; itemCount: number }[]>(
      results,
      `Successfully processed ${results.length} entries`
    );
    options?.onSuccess?.(this.data);
    return successResponse;
  }
}

export * from './types';
export * from './publicUtils/getMatchingData';
export * from './publicUtils/getShiftedIndexes';
export * from './publicUtils/getMovingWindowIndexes';
export * from './errors';
