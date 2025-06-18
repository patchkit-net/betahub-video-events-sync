import type { Data } from '../types';

interface TestDataOptions {
  size: number;
  startTime?: number;
  timeStep?: number;
  categories?: number;
  itemsPerCategory?: number;
}

export const generateTestData = (options: TestDataOptions) => {
  const {
    size,
    startTime = Date.now(),
    timeStep = 1000,
    categories = 1,
    itemsPerCategory = Math.floor(size / categories)
  } = options;

  // Generate data for a single category
  const generateCategoryData = (categoryIndex: number) => {
    return Array.from({ length: itemsPerCategory }, (_, i) => {
      const timestamp = startTime + (categoryIndex * itemsPerCategory + i) * timeStep;
      return {
        start_time: new Date(timestamp).toISOString(),
        end_time: new Date(timestamp + timeStep).toISOString(),
        type: `test-${categoryIndex}`,
        data: { value: i }
      };
    });
  };

  // Generate data for all categories
  const data: { [key: string]: Data[] } = {};
  for (let i = 0; i < categories; i++) {
    data[`category-${i}`] = generateCategoryData(i);
  }

  return {
    data,
    // Helper to get matching indexes for testing
    getMatchingIndexes: (timestamp: string) => {
      const result: { [key: string]: number[] } = {};
      const targetTime = new Date(timestamp).getTime();
      Object.entries(data).forEach(([category, items]) => {
        const indexes = items
          .map((item, index) => ({ index, time: new Date(item.start_time).getTime() }))
          .filter(item => item.time <= targetTime)
          .map(item => item.index);
        if (indexes.length > 0) {
          result[category] = indexes;
        }
      });
      return result;
    }
  };
};

// Helper to generate test data for TimeIndexManager
export const generateTimeIndexData = (size: number) => {
  const now = Date.now();
  return Array.from({ length: size }, (_, i) => ({
    start_time: new Date(now + i * 1000).toISOString(),
    end_time: new Date(now + (i + 1) * 1000).toISOString(),
    type: 'test',
    data: { value: i }
  }));
};

// Helper to generate test data for IntervalTree
export const generateIntervalData = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    start: i * 1000,
    end: (i + 1) * 1000,
    index: i
  }));
}; 