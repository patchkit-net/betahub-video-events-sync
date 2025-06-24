import type { Data, DataInternal } from '../types';

/**
 * Retrieves the data items corresponding to the given matching indexes for each category.
 * 
 * @param matchingIndexes - An object mapping category names to arrays of indexes
 * @param data - An object mapping category names to arrays of data items
 * @returns An object mapping category names to arrays of matching data items
 * 
 * @example
 * const matchingIndexes = { logs: [0, 1], interactions: [2] };
 * const data = { logs: [log1, log2], interactions: [interaction1, interaction2, interaction3] };
 * const result = getMatchingData(matchingIndexes, data);
 * // Returns: { logs: [log1, log2], interactions: [interaction3] }
 */
export const getMatchingData = (
  matchingIndexes: { [key: string]: number[] },
  data: { [key: string]: Data[] }
): { [key: string]: Data[] } => {
  return Object.entries(matchingIndexes).reduce(
    (acc, [category, indexes]) => ({
      ...acc,
      [category]: indexes.map(index => data[category][index])
    }),
    {}
  );
};