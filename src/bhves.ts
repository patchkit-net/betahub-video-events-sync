import type {
  BHVESConstructorParams,
  Data,
  DataInternal,
  OnStateUpdateCallback,
  OnTimeUpdateCallback,
  Response,
  State,
} from './types';

import { DataIndexManager } from './DataIndexManager';
import {
  convertToInternalData,
  convertVideoTimeToISOTimestamp,
  countTotalItems,
  createStandardError,
  findActiveEvents,
  handleDataProcessingErrors,
  handleDataProcessingSuccess,
  parseTimestamp,
  processDataEntry,
  validateRequiredString,
  validateVideoPlayer,
  type ProcessDataEntryOptions,
  type ProcessingError,
  type ProcessingResult,
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
  private videoPlayer: HTMLVideoElement | null = null;
  private timeUpdateHandler: ((event: Event) => void) | null = null;

  constructor({
    videoPlayerDomId,
    startTimestamp,
    onStateUpdate,
    onTimeUpdate,
  }: BHVESConstructorParams) {
    const context = { operation: 'initialize', component: 'BHVESInstance' };

    // Validate required parameters
    validateRequiredString(videoPlayerDomId, 'videoPlayerDomId', context);
    validateRequiredString(startTimestamp, 'startTimestamp', context);

    this.startTimestamp = startTimestamp;
    this.startTimestampParsed = parseTimestamp(startTimestamp);

    const player = validateVideoPlayer(videoPlayerDomId);
    this.videoPlayer = player;
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
    this.timeUpdateHandler = () => {
      this.handleTimeUpdate(player, onStateUpdate, onTimeUpdate);
    };

    player.addEventListener('timeupdate', this.timeUpdateHandler);
  }

  /**
   * Handles video time updates and triggers appropriate callbacks
   */
  private handleTimeUpdate(
    player: HTMLVideoElement,
    onStateUpdate?: OnStateUpdateCallback,
    onTimeUpdate?: OnTimeUpdateCallback
  ): void {
    const context = {
      operation: 'handleTimeUpdate',
      component: 'BHVESInstance',
    };

    if (!this.startTimestampParsed) {
      throw createStandardError({
        type: 'ConfigurationError',
        message: 'startTimestampParsed is not initialized',
        context: {
          ...context,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const videoPlayerTimeSeconds = player.currentTime;
    const videoPlayerTimeMilliseconds = videoPlayerTimeSeconds * 1000;
    const timestamp = convertVideoTimeToISOTimestamp(
      this.startTimestampParsed,
      videoPlayerTimeSeconds
    );
    const currentTime =
      this.startTimestampParsed.getTime() + videoPlayerTimeMilliseconds;
    const currentTimeDate = new Date(currentTime);

    // Get all events that should be displayed at current time
    const matchingIndexes =
      this.dataIndexManager.findMatchingIndexes(currentTimeDate);

    // Find the most recent event that should be active at current time
    const activeMatchingIndexes = findActiveEvents(
      matchingIndexes,
      this.dataInternal,
      currentTime
    );

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
    const totalItems = countTotalItems(entries);
    const { results, errors } = await this.processDataEntries(
      entries,
      totalItems,
      options
    );

    if (errors.length > 0) {
      return handleDataProcessingErrors(results, errors, {
        onError: options?.onError,
      });
    }

    return handleDataProcessingSuccess(results, this.data, {
      onProgress: options?.onProgress,
      onSuccess: options?.onSuccess,
    });
  }

  /**
   * Processes multiple data entries and returns results and errors
   */
  private async processDataEntries(
    entries: { name: string; dataJSONL: string }[],
    totalItems: number,
    options?: {
      onProgress?: (status: {
        status: 'loading' | 'error' | 'success';
        progress: number;
      }) => void;
      sortData?: boolean;
    }
  ): Promise<{
    results: ProcessingResult[];
    errors: ProcessingError[];
  }> {
    const results: ProcessingResult[] = [];
    const errors: ProcessingError[] = [];
    let totalProgress = 0;

    for (const { name, dataJSONL } of entries) {
      const processOptions: ProcessDataEntryOptions = {
        onProgress: options?.onProgress,
        totalItems,
        totalProgress,
      };

      const result = await processDataEntry(name, dataJSONL, processOptions);
      totalProgress = processOptions.totalProgress;

      if (result.success && result.data) {
        await this.storeProcessedData(
          name,
          result.data,
          options?.sortData ?? true
        );

        if (result.itemCount === undefined) {
          throw createStandardError({
            type: 'DataProcessingError',
            message: `Item count is undefined for entry: ${name}`,
            context: {
              operation: 'processDataEntries',
              component: 'BHVESInstance',
              timestamp: new Date().toISOString(),
              additionalInfo: { entryName: name },
            },
          });
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

    return { results, errors };
  }

  /**
   * Stores processed data in both original and internal formats and indexes it
   */
  private async storeProcessedData(
    name: string,
    data: Data[],
    sortData: boolean
  ): Promise<void> {
    const context = {
      operation: 'storeProcessedData',
      component: 'BHVESInstance',
    };

    try {
      // Store original data
      this.data[name] = data;

      // Convert to internal format with parsed timestamps
      const internalData = convertToInternalData(data);
      this.dataInternal[name] = internalData;

      // Add to index manager
      await this.dataIndexManager.addData(name, internalData, sortData);
    } catch (error) {
      throw createStandardError({
        type: 'DataProcessingError',
        message: `Failed to store data for entry "${name}": ${
          error instanceof Error ? error.message : String(error)
        }`,
        context: {
          operation: 'storeProcessedData',
          component: 'BHVESInstance',
          timestamp: new Date().toISOString(),
          additionalInfo: {
            entryName: name,
            dataLength: data.length,
            sortData,
          },
        },
        originalError:
          error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Cleans up resources and removes event listeners
   */
  destroy(): void {
    if (this.videoPlayer && this.timeUpdateHandler) {
      this.videoPlayer.removeEventListener(
        'timeupdate',
        this.timeUpdateHandler
      );
      this.videoPlayer = null;
      this.timeUpdateHandler = null;
    }
  }

  /**
   * Gets the current state without triggering callbacks
   * @returns Current state or null if video player is not available
   */
  getCurrentState(): State | null {
    if (!this.videoPlayer || !this.startTimestampParsed) {
      return null;
    }

    const videoPlayerTimeSeconds = this.videoPlayer.currentTime;
    const videoPlayerTimeMilliseconds = videoPlayerTimeSeconds * 1000;
    const timestamp = convertVideoTimeToISOTimestamp(
      this.startTimestampParsed,
      videoPlayerTimeSeconds
    );
    const currentTime =
      this.startTimestampParsed.getTime() + videoPlayerTimeMilliseconds;
    const currentTimeDate = new Date(currentTime);

    const matchingIndexes =
      this.dataIndexManager.findMatchingIndexes(currentTimeDate);
    const activeMatchingIndexes = findActiveEvents(
      matchingIndexes,
      this.dataInternal,
      currentTime
    );

    return {
      videoPlayerTimeSeconds,
      timestamp,
      matchingIndexes,
      activeMatchingIndexes,
    };
  }
}

export * from './publicUtils/getMatchingData';
export * from './publicUtils/getMovingWindowIndexes';
export * from './publicUtils/getShiftedIndexes';
export * from './types';

