import type { Data, Response, State } from './types';
import { createErrorResponse, createSuccessResponse } from './errors';

import { DataIndexManager } from './DataIndexManager';
import { convertVideoTimeToISOTimestamp } from './utils/convertVideoTimetoISOTimestamp';
import { validateDataJSONL } from './utils/validateDataJSONL';

/**
 * BHVESInstance manages video event synchronization by tracking and displaying
 * events that should be active at specific timestamps during video playback.
 */
export class BHVESInstance {
  startTimestamp: string | null = null;
  data: { [key: string]: Data[] } = {};
  private dataIndexManager: DataIndexManager = new DataIndexManager();

  constructor({
    videoPlayerDomId,
    startTimestamp,
    onStateUpdate,
    onTimeUpdate,
  }: {
    videoPlayerDomId: string;
    startTimestamp: string;
    onStateUpdate?: ({
      state,
      data,
    }: {
      state: State;
      data: { [key: string]: Data[] };
    }) => void;
    onTimeUpdate?: ({ videoPlayerTimeSeconds, timestamp }: { videoPlayerTimeSeconds: number; timestamp: string }) => void;
  }) {
    if (!videoPlayerDomId) {
      throw new Error('videoPlayerDomId is required');
    }
    if (!startTimestamp) {
      throw new Error('startTimestamp is required');
    }

    this.startTimestamp = startTimestamp;
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
    onStateUpdate?: ({ state, data }: { state: State; data: { [key: string]: Data[] } }) => void,
    onTimeUpdate?: ({ videoPlayerTimeSeconds, timestamp }: { videoPlayerTimeSeconds: number; timestamp: string }) => void
  ): void {
    player.addEventListener('timeupdate', () => {
      const timestamp = convertVideoTimeToISOTimestamp(
        this.startTimestamp!,
        player.currentTime
      );
      
      // Get all events that should be displayed at current time
      const currentMatchingIndexes = this.dataIndexManager.findMatchingIndexes(timestamp);
      
      // Find the most recent event that should be active at current time
      const activeMatchingIndexes = this.findActiveEvents(currentMatchingIndexes, timestamp);

      const state: State = {
        videoPlayerTimeSeconds: player.currentTime,
        timestamp,
        matchingIndexes: currentMatchingIndexes,
        activeMatchingIndexes,
      };

      if (Object.keys(state.matchingIndexes).length > 0) {
        onStateUpdate?.({ state, data: this.data });
      }

      onTimeUpdate?.({ videoPlayerTimeSeconds: player.currentTime, timestamp });
    });
  }

  /**
   * Finds the most recent event that should be active at the given timestamp
   */
  private findActiveEvents(
    currentMatchingIndexes: { [key: string]: number[] },
    timestamp: string
  ): { [key: string]: number[] } {
    const activeMatchingIndexes: { [key: string]: number[] } = {};
    const currentTime = new Date(timestamp).getTime();

    Object.entries(currentMatchingIndexes).forEach(([category, indexes]) => {
      let mostRecentIndex = -1;
      let mostRecentTime = -1;

      indexes.forEach(index => {
        const item = this.data[category][index];
        const itemStartTime = new Date(item.start_timestamp).getTime();
        
        if (item.end_timestamp) {
          // For events with end time, check if current time is within the range
          const itemEndTime = new Date(item.end_timestamp).getTime();
          if (currentTime >= itemStartTime && currentTime <= itemEndTime && itemStartTime > mostRecentTime) {
            mostRecentIndex = index;
            mostRecentTime = itemStartTime;
          }
        } else {
          // For events without end time, check if it's the most recent event
          if (currentTime >= itemStartTime && itemStartTime > mostRecentTime) {
            mostRecentIndex = index;
            mostRecentTime = itemStartTime;
          }
        }
      });

      if (mostRecentIndex !== -1) {
        activeMatchingIndexes[category] = [mostRecentIndex];
      }
    });

    return activeMatchingIndexes;
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
    let totalItems = 0;

    // First pass to count total items
    for (const { dataJSONL } of entries) {
      if (dataJSONL) {
        totalItems += dataJSONL
          .split('\n')
          .filter((line) => line.trim()).length;
      }
    }

    for (const { name, dataJSONL } of entries) {
      if (!name) {
        errors.push({
          name,
          message: 'name is required',
        });
        continue;
      }

      if (!dataJSONL) {
        errors.push({
          name,
          message: 'dataJSONL is required',
        });
        continue;
      }

      if (typeof dataJSONL !== 'string') {
        errors.push({
          name,
          message: 'dataJSONL must be a string',
        });
        continue;
      }

      try {
        const validationResponse = validateDataJSONL(dataJSONL);
        if (!validationResponse.success) {
          errors.push({
            name,
            message: validationResponse.message,
            details: validationResponse.details,
          });
          continue;
        }

        const lines = dataJSONL.split('\n').filter((line) => line.trim());
        const parsedData: Data[] = [];

        // Process JSON parsing in chunks to avoid blocking
        const CHUNK_SIZE = 10000;
        for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
          const chunk = lines.slice(i, i + CHUNK_SIZE);

          // Process chunk
          chunk.forEach((line) => {
            const item = JSON.parse(line);
            parsedData.push(item);
          });

          // Update total progress
          totalProgress += chunk.length;
          if (options?.onProgress) {
            options.onProgress({
              status: 'loading',
              progress: (totalProgress / totalItems) * 100,
            });
          }

          // Allow other operations to proceed
          if (i + CHUNK_SIZE < lines.length) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        this.data[name] = parsedData;
        await this.dataIndexManager.addData(name, parsedData, options?.sortData ?? true);

        results.push({
          name,
          itemCount: parsedData.length,
        });
      } catch (error) {
        errors.push({
          name,
          message: `Error processing data for ${name}`,
          details:
            error instanceof Error
              ? { originalError: error.message }
              : undefined,
        });
        if (options?.onProgress) {
          options.onProgress({
            status: 'error',
            progress: 0,
          });
        }
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
export * from './utils/getMatchingData';
export * from './utils/getShiftedIndexes';
export * from './utils/getMovingWindowIndexes';
export * from './errors';
