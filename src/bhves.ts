import type {
  AddDataParams,
  BHVESConstructorParams,
  Data,
  OnStateUpdateCallback,
  OnTimeUpdateCallback,
  ProcessMultipleEntriesOptions,
  Response,
  State,
} from './types';
import {
  convertVideoTimeToISOTimestamp,
  countTotalItems,
  createStandardError,
  findActiveEvents,
  findVideoPlayer,
  handleDataProcessingErrors,
  handleDataProcessingSuccess,
  parseTimestamp,
  processMultipleEntries,
  validateRequiredString,
} from './utils';

import { DataStore } from './DataStore';

/**
 * BHVESInstance manages video event synchronization by tracking and displaying
 * events that should be active at specific timestamps during video playback.
 */
export class BHVESInstance {
  private startTimestampParsed: Date | null = null;
  private dataStore: DataStore = new DataStore();
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

    this.startTimestampParsed = parseTimestamp(startTimestamp);

    this.videoPlayer = findVideoPlayer(videoPlayerDomId);
    this.setupVideoPlayer(onStateUpdate, onTimeUpdate);
  }

  /**
   * Sets up the video player event listeners and state management
   */
  private setupVideoPlayer(
    onStateUpdate?: OnStateUpdateCallback,
    onTimeUpdate?: OnTimeUpdateCallback
  ): void {
    if (!this.videoPlayer) {
      throw createStandardError({
        type: 'ConfigurationError',
        message: 'Video player is not initialized',
        context: {
          operation: 'setupVideoPlayer',
          component: 'BHVESInstance',
          timestamp: new Date().toISOString(),
        },
      });
    }

    this.timeUpdateHandler = () => {
      this.handleTimeUpdate(onStateUpdate, onTimeUpdate);
    };

    this.videoPlayer.addEventListener('timeupdate', this.timeUpdateHandler);
  }

  /**
   * Handles video time updates and triggers appropriate callbacks
   */
  private handleTimeUpdate(
    onStateUpdate?: OnStateUpdateCallback,
    onTimeUpdate?: OnTimeUpdateCallback
  ): void {
    const context = {
      operation: 'handleTimeUpdate',
      component: 'BHVESInstance',
    };

    if (!this.startTimestampParsed || !this.videoPlayer) {
      throw createStandardError({
        type: 'ConfigurationError',
        message: 'startTimestampParsed or videoPlayer is not initialized',
        context: {
          ...context,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const videoPlayerTimeSeconds = this.videoPlayer.currentTime;
    const videoPlayerTimeMilliseconds = videoPlayerTimeSeconds * 1000;
    const timestamp = convertVideoTimeToISOTimestamp(
      this.startTimestampParsed,
      videoPlayerTimeSeconds
    );
    const absoluteTimestampMs =
      this.startTimestampParsed.getTime() + videoPlayerTimeMilliseconds;
    const currentTimeDate = new Date(absoluteTimestampMs);

    // Get all events that should be displayed at current time
    const matchingIndexes = this.dataStore.findMatchingIndexes(currentTimeDate);

    // Find the most recent event that should be active at current time
    const activeMatchingIndexes = findActiveEvents(
      matchingIndexes,
      this.dataStore.getDataInternal(),
      absoluteTimestampMs
    );

    const state: State = {
      videoPlayerTimeSeconds: this.videoPlayer.currentTime,
      timestamp,
      matchingIndexes,
      activeMatchingIndexes,
    };

    if (Object.keys(state.matchingIndexes).length > 0) {
      onStateUpdate?.({ state, data: this.dataStore.getData() });
    }

    onTimeUpdate?.({ videoPlayerTimeSeconds: this.videoPlayer.currentTime, timestamp });
  }

  /**
   * Adds event data to the instance and indexes it for time-based lookups
   */
  async addData({
    entries,
    options,
  }: AddDataParams): Promise<Response<{ name: string; itemCount: number }[]>> {
    const totalItems = countTotalItems(entries);
    const processOptions: ProcessMultipleEntriesOptions = {
      onProgress: options?.onProgress,
      sortData: options?.sortData,
    };

    const { results, errors } = await processMultipleEntries(
      entries,
      totalItems,
      async (name: string, data: Data[], sortData: boolean) => {
        await this.dataStore.storeData(name, data, sortData);
      },
      processOptions
    );

    if (errors.length > 0) {
      return handleDataProcessingErrors(results, errors, {
        onError: options?.onError,
      });
    }

    return handleDataProcessingSuccess(results, this.dataStore.getData(), {
      onProgress: options?.onProgress,
      onSuccess: options?.onSuccess,
    });
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
   * Gets the data store for external access
   */
  get data(): { [key: string]: Data[] } {
    return this.dataStore.getData();
  }
}

export * from './publicUtils/getMatchingData';
export * from './publicUtils/getMovingWindowIndexes';
export * from './publicUtils/getShiftedIndexes';
export * from './publicUtils/getSecondsFromTimestamp';
export * from './types';

