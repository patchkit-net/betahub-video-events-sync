import type { DataInternal } from '../types';

/**
 * Finds the most recent event that should be active at the given timestamp
 */
export function findActiveEvents(
  currentMatchingIndexes: { [key: string]: number[] },
  dataInternal: { [key: string]: DataInternal[] },
  currentTime: number
): { [key: string]: number[] } {
  const activeMatchingIndexes: { [key: string]: number[] } = {};

  Object.entries(currentMatchingIndexes).forEach(([category, indexes]) => {
    let mostRecentIndex = -1;
    let mostRecentTime = -1;

    indexes.forEach(index => {
      const item = dataInternal[category][index];
      const itemStartTime = item.start_timestamp.getTime();
      
      if (item.end_timestamp) {
        // For events with end time, check if current time is within the range
        const itemEndTime = item.end_timestamp.getTime();
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