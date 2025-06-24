import type { Data, DataInternal } from './types';
import { convertToInternalData, createStandardError } from './utils';

import { DataIndexManager } from './DataIndexManager';

/**
 * DataStore handles all storage-related operations for BHVES data
 */
export class DataStore {
  private data: { [key: string]: Data[] } = {};
  private dataInternal: { [key: string]: DataInternal[] } = {};
  private dataIndexManager: DataIndexManager = new DataIndexManager();

  /**
   * Stores processed data in both original and internal formats and indexes it
   */
  async storeData(
    name: string,
    data: Data[],
    sortData: boolean = true
  ): Promise<void> {
    const context = {
      operation: 'storeData',
      component: 'DataStore',
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
          ...context,
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
   * Finds matching indexes for a given timestamp
   */
  findMatchingIndexes(timestamp: Date): { [key: string]: number[] } {
    return this.dataIndexManager.findMatchingIndexes(timestamp);
  }

  /**
   * Gets the original data
   */
  getData(): { [key: string]: Data[] } {
    return this.data;
  }

  /**
   * Gets the internal data
   */
  getDataInternal(): { [key: string]: DataInternal[] } {
    return this.dataInternal;
  }

  /**
   * Gets data for a specific category
   */
  getCategoryData(category: string): Data[] | undefined {
    return this.data[category];
  }

  /**
   * Gets internal data for a specific category
   */
  getCategoryDataInternal(category: string): DataInternal[] | undefined {
    return this.dataInternal[category];
  }

  /**
   * Checks if data exists for a category
   */
  hasCategory(category: string): boolean {
    return category in this.data;
  }

  /**
   * Gets all category names
   */
  getCategories(): string[] {
    return Object.keys(this.data);
  }

  /**
   * Clears all stored data
   */
  clear(): void {
    this.data = {};
    this.dataInternal = {};
    this.dataIndexManager = new DataIndexManager();
  }
} 