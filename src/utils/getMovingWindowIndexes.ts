import type { Data } from '../types';

/**
 * Configuration for the moving window of events.
 */
interface MovingWindowConfig {
  /** Number of events to show before current position */
  prependSize: number;
  /** Number of events to show after current position */
  appendSize: number;
  /** Minimum number of events to show total */
  minimumSize: number;
}

/**
 * Calculates indexes for a moving window of events based on the current position and configuration.
 * This function helps maintain a consistent view of events around the current position,
 * showing a specified number of events before and after the current position.
 * 
 * @param currentIndexes - Object mapping category names to arrays of current matching event indexes
 * @param data - Object mapping category names to arrays of all event data
 * @param config - Configuration for the moving window size and behavior
 * @returns Object containing prepend and append indexes for each category
 * 
 * @example
 * const currentIndexes = { logs: [5, 6, 7] };
 * const data = { logs: [log1, log2, log3, log4, log5, log6, log7, log8, log9] };
 * const config = { prependSize: 2, appendSize: 2, minimumSize: 5 };
 * const result = getMovingWindowIndexes(currentIndexes, data, config);
 * // Returns: {
 * //   prepend: { logs: [3, 4] },
 * //   append: { logs: [8, 9] }
 * // }
 */
export function getMovingWindowIndexes(
  currentIndexes: { [key: string]: number[] },
  data: { [key: string]: Data[] },
  config: MovingWindowConfig
): { prepend: { [key: string]: number[] }; append: { [key: string]: number[] } } {
  const { prependSize, appendSize, minimumSize } = config;

  return Object.entries(currentIndexes).reduce((acc, [category, indexes]) => {
    const categoryData = data[category];
    
    // If we're at the start (no current indexes), show minimum window
    if (!indexes?.length) {
      acc.append[category] = Array.from({ length: Math.min(minimumSize, categoryData.length) }, (_, i) => i);
      return acc;
    }

    // Get the first and last current indexes
    const firstIndex = indexes[0];
    const lastIndex = indexes[indexes.length - 1];

    // Calculate prepend indexes (previous events)
    const prependIndexes: number[] = [];
    for (let i = 1; i <= prependSize; i++) {
      const index = firstIndex - i;
      if (index >= 0) {
        prependIndexes.unshift(index);
      }
    }

    // Calculate append indexes (next events)
    const appendIndexes: number[] = [];
    const remainingSize = minimumSize - (prependIndexes.length + indexes.length);
    const targetAppendSize = Math.max(appendSize, remainingSize);
    
    for (let i = 1; i <= targetAppendSize; i++) {
      const index = lastIndex + i;
      if (index < categoryData.length) {
        appendIndexes.push(index);
      }
    }

    if (prependIndexes.length > 0) acc.prepend[category] = prependIndexes;
    if (appendIndexes.length > 0) acc.append[category] = appendIndexes;
    return acc;
  }, { prepend: {}, append: {} } as { prepend: { [key: string]: number[] }; append: { [key: string]: number[] } });
} 