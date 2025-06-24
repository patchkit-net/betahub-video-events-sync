import type { CategoryIndexes, Data, DataInternal } from './types';

interface DataIndex {
  startTimes: number[];
  endTimes: number[];
  indexes: number[];
}

export class DataIndexManager {
  private indexes: { [key: string]: DataIndex } = {};

  async addData(category: string, data: DataInternal[], sortData: boolean = true): Promise<void> {
    const dataIndex: DataIndex = {
      startTimes: [],
      endTimes: [],
      indexes: []
    };

    // Process data in chunks to avoid blocking
    const CHUNK_SIZE = 10000;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      
      // Process chunk - no need to parse timestamps anymore
      chunk.forEach((item, index) => {
        const startTime = item.start_timestamp.getTime();
        const endTime = item.end_timestamp?.getTime() ?? Infinity;
        
        dataIndex.startTimes.push(startTime);
        dataIndex.endTimes.push(endTime);
        dataIndex.indexes.push(i + index);
      });

      // Allow other operations to proceed
      if (i + CHUNK_SIZE < data.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (sortData) {
      // Sort arrays based on start times
      const sortedIndices = dataIndex.startTimes
        .map((_, i) => i)
        .sort((a, b) => dataIndex.startTimes[a] - dataIndex.startTimes[b]);

      dataIndex.startTimes = sortedIndices.map(i => dataIndex.startTimes[i]);
      dataIndex.endTimes = sortedIndices.map(i => dataIndex.endTimes[i]);
      dataIndex.indexes = sortedIndices.map(i => dataIndex.indexes[i]);
    }

    this.indexes[category] = dataIndex;
  }

  findMatchingIndexes(timestamp: Date): CategoryIndexes {
    const result: CategoryIndexes = {};
    const currentTime = timestamp.getTime();

    Object.entries(this.indexes).forEach(([category, index]) => {
      const matchingIndexes: number[] = [];
      
      // Binary search for the first item that starts after current time
      let left = 0;
      let right = index.startTimes.length - 1;
      let startIndex = index.startTimes.length;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (index.startTimes[mid] > currentTime) {
          startIndex = mid;
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }

      // Check all items that start before or at current time
      for (let i = 0; i < startIndex; i++) {
        if (currentTime <= index.endTimes[i]) {
          matchingIndexes.push(index.indexes[i]);
        }
      }

      if (matchingIndexes.length > 0) {
        result[category] = matchingIndexes;
      }
    });

    return result;
  }

  clear() {
    this.indexes = {};
  }
} 