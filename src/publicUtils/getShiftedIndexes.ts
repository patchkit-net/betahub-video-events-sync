import type { Data, DataInternal } from '../types';

/**
 * Gets shifted indexes for incoming or previous data based on the current matching indexes.
 * This function helps navigate through event data by shifting the current view forward or backward.
 * 
 * @param matchingIndexes - Current matching indexes for each category
 * @param shift - Number of indexes to shift. Negative for previous indexes, positive for next indexes
 * @param data - The data object containing all categories and their data arrays
 * @returns Object containing shifted indexes for each category
 * 
 * @example
 * // Get next 2 events
 * const currentIndexes = { logs: [5, 6] };
 * const data = { logs: [log1, log2, log3, log4, log5, log6, log7, log8] };
 * const nextIndexes = getShiftedIndexes(currentIndexes, 2, data);
 * // Returns: { logs: [7, 8] }
 * 
 * @example
 * // Get previous 2 events
 * const previousIndexes = getShiftedIndexes(currentIndexes, -2, data);
 * // Returns: { logs: [3, 4] }
 */
export const getShiftedIndexes = (
  matchingIndexes: { [key: string]: number[] },
  shift: number,
  data: { [key: string]: Data[] }
): { [key: string]: number[] } => {
  const result = Object.entries(matchingIndexes).reduce(
    (acc, [category, indexes]) => {
      if (!indexes?.length) return acc;

      const categoryData = data[category];
      const shiftedIndexes: number[] = [];

      if (shift > 0) {
        // For incoming data, get the next N events after the last current event
        const lastIndex = indexes[indexes.length - 1];
        for (let i = 1; i <= shift; i++) {
          const nextIndex = lastIndex + i;
          if (nextIndex < categoryData.length) {
            shiftedIndexes.push(nextIndex);
          }
        }
      } else {
        // For last data, get the previous N events before the first current event
        const firstIndex = indexes[0];
        const absShift = Math.abs(shift);
        
        // Get the previous N events before the first current event
        const startIndex = Math.max(0, firstIndex - absShift);
        // Only get the last N events
        for (let i = startIndex; i < firstIndex; i++) {
          shiftedIndexes.push(i);
        }
      }

      if (shiftedIndexes.length > 0) {
        acc[category] = shiftedIndexes;
      }
      return acc;
    },
    {} as { [key: string]: number[] }
  );

  return result;
};

/**
 * Internal version that works with DataInternal for better performance.
 * This function is used internally when we have parsed timestamps.
 */
export const getShiftedIndexesInternal = (
  matchingIndexes: { [key: string]: number[] },
  shift: number,
  data: { [key: string]: DataInternal[] }
): { [key: string]: number[] } => {
  const result = Object.entries(matchingIndexes).reduce(
    (acc, [category, indexes]) => {
      if (!indexes?.length) return acc;

      const categoryData = data[category];
      const shiftedIndexes: number[] = [];

      if (shift > 0) {
        // For incoming data, get the next N events after the last current event
        const lastIndex = indexes[indexes.length - 1];
        for (let i = 1; i <= shift; i++) {
          const nextIndex = lastIndex + i;
          if (nextIndex < categoryData.length) {
            shiftedIndexes.push(nextIndex);
          }
        }
      } else {
        // For last data, get the previous N events before the first current event
        const firstIndex = indexes[0];
        const absShift = Math.abs(shift);
        
        // Get the previous N events before the first current event
        const startIndex = Math.max(0, firstIndex - absShift);
        // Only get the last N events
        for (let i = startIndex; i < firstIndex; i++) {
          shiftedIndexes.push(i);
        }
      }

      if (shiftedIndexes.length > 0) {
        acc[category] = shiftedIndexes;
      }
      return acc;
    },
    {} as { [key: string]: number[] }
  );

  return result;
}; 