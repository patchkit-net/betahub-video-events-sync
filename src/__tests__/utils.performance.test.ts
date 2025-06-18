import { generateIntervalData, generateTestData, generateTimeIndexData } from '../utils/testUtils';

import { DataIndexManager } from '../DataIndexManager';
import { IntervalTree } from '../utils/IntervalTree';
import { convertTimeToISOTimestamp } from '../utils/convertVideoTimetoISOTimestamp';
import { filterDataByTimestamp } from '../utils/filterDataByTimestamp';
import { getMatchingData } from '../utils/getMatchingData';
import { performance } from 'perf_hooks';

// Reduced data sizes to prevent memory issues
const DATA_SIZES = [1000, 10000, 100000, 1000000, 2000000];

describe('Performance Tests', () => {
  // Store results for summary
  const performanceResults: {
    size: number;
    jsonParsing: number;
    dataAddition: number;
    findTimestamp: number;
  }[] = [];

  describe('JSON Parsing Performance', () => {
    test('should parse JSON efficiently across different scales', () => {
      DATA_SIZES.forEach(size => {
        // Generate test data
        const { data } = generateTestData({ size });
        const category = Object.keys(data)[0];
        
        // Measure JSON parsing
        const parseStart = performance.now();
        const jsonString = JSON.stringify(data[category]);
        const parsedData = JSON.parse(jsonString);
        const parseEnd = performance.now();
        const parseElapsed = parseEnd - parseStart;

        // Store for summary
        performanceResults.push({
          size,
          jsonParsing: parseElapsed,
          dataAddition: 0,
          findTimestamp: 0
        });

        // Adjust threshold based on size
        const threshold = size <= 100000 ? 1000 : 5000;
        expect(parseElapsed).toBeLessThan(threshold);
      });
    });
  });

  describe('Data Addition Performance', () => {
    test('should add data to store efficiently across different scales', () => {
      DATA_SIZES.forEach(size => {
        const manager = new DataIndexManager();
        const category = 'test';
        const data = generateTimeIndexData(size);
        
        const start = performance.now();
        manager.addData(category, data);
        const end = performance.now();
        const elapsed = end - start;
        
        // Update summary with data addition results
        const resultIndex = performanceResults.findIndex(r => r.size === size);
        if (resultIndex !== -1) {
          performanceResults[resultIndex].dataAddition = elapsed;
        }

        // Adjust threshold based on size
        const threshold = size <= 100000 ? 1000 : 5000;
        expect(elapsed).toBeLessThan(threshold);
      });
    });
  });

  describe('Timestamp Finding Performance', () => {
    test('should find timestamps efficiently across different scales', () => {
      DATA_SIZES.forEach(size => {
        const manager = new DataIndexManager();
        const category = 'test';
        const data = generateTimeIndexData(size);
        
        // Add data first
        manager.addData(category, data);
        
        // Measure timestamp finding
        const ts = new Date(Date.now() + 5000 * 1000).toISOString();
        const start = performance.now();
        manager.findMatchingIndexes(ts);
        const end = performance.now();
        const elapsed = end - start;
        
        // Update summary with timestamp finding results
        const resultIndex = performanceResults.findIndex(r => r.size === size);
        if (resultIndex !== -1) {
          performanceResults[resultIndex].findTimestamp = elapsed;
        }

        expect(elapsed).toBeLessThan(10); // <10ms for finding
      });
    });
  });

  describe('convertTimeToISOTimestamp', () => {
    test('should convert times quickly across different scales', () => {
      const startTime = new Date().toISOString();
      const results: { size: number; avgMs: number }[] = [];

      DATA_SIZES.forEach(size => {
        const start = performance.now();
        for (let i = 0; i < size; i++) {
          convertTimeToISOTimestamp(startTime, i);
        }
        const end = performance.now();
        const avg = (end - start) / size;
        results.push({ size, avgMs: avg });
      });

      console.log('convertTimeToISOTimestamp performance:', results);
      results.forEach(result => {
        expect(result.avgMs).toBeLessThan(0.01); // <0.01ms per call
      });
    });
  });

  describe('getMatchingData', () => {
    test('should get matching data quickly across different scales', () => {
      const results: { size: number; elapsedMs: number }[] = [];

      DATA_SIZES.forEach(size => {
        const { data, getMatchingIndexes } = generateTestData({
          size,
          categories: Math.min(10, Math.floor(size / 1000))
        });
        const matchingIndexes = getMatchingIndexes(new Date().toISOString());
        
        const start = performance.now();
        getMatchingData(matchingIndexes, data);
        const end = performance.now();
        const elapsed = end - start;
        results.push({ size, elapsedMs: elapsed });
      });

      console.log('getMatchingData performance:', results);
      results.forEach(result => {
        expect(result.elapsedMs).toBeLessThan(100); // <100ms
      });
    });
  });

  describe('TimeIndexManager', () => {
    test('addData and findMatchingIndexes performance across different scales', () => {
      const results: { size: number; addMs: number; findMs: number }[] = [];

      DATA_SIZES.forEach(size => {
        const manager = new DataIndexManager();
        const category = 'test';
        const data = generateTimeIndexData(size);
        
        const addStart = performance.now();
        manager.addData(category, data);
        const addEnd = performance.now();
        const addElapsed = addEnd - addStart;
        
        const ts = new Date(Date.now() + 5000 * 1000).toISOString();
        const findStart = performance.now();
        manager.findMatchingIndexes(ts);
        const findEnd = performance.now();
        const findElapsed = findEnd - findStart;
        
        results.push({ size, addMs: addElapsed, findMs: findElapsed });
      });

      console.log('TimeIndexManager performance:', results);
      results.forEach(result => {
        expect(result.addMs).toBeLessThan(2000); // <2s for add
        expect(result.findMs).toBeLessThan(10); // <10ms for find
      });
    });
  });

  describe('filterDataByTimestamp', () => {
    test('should filter data quickly across different scales', () => {
      const results: { size: number; elapsedMs: number }[] = [];

      DATA_SIZES.forEach(size => {
        const { data } = generateTestData({ size });
        const category = Object.keys(data)[0];
        
        // filterDataByTimestamp uses a singleton timeIndexManager, so we must add data first
        const { timeIndexManager } = require('../addData');
        timeIndexManager.addData(category, data[category]);
        
        const ts = new Date(Date.now() + 5000 * 1000).toISOString();
        const start = performance.now();
        filterDataByTimestamp(data, ts);
        const end = performance.now();
        const elapsed = end - start;
        results.push({ size, elapsedMs: elapsed });
      });

      console.log('filterDataByTimestamp performance:', results);
      results.forEach(result => {
        expect(result.elapsedMs).toBeLessThan(100); // <100ms
      });
    });
  });

  describe('IntervalTree', () => {
    test('insert, processBatch, and query performance across different scales', () => {
      const results: { size: number; insertMs: number; batchMs: number; queryMs: number }[] = [];

      DATA_SIZES.forEach(size => {
        const tree = new IntervalTree();
        const intervals = generateIntervalData(size);
        
        const insertStart = performance.now();
        intervals.forEach(iv => tree.insert(iv.start, iv.end, iv.index));
        const insertEnd = performance.now();
        const insertElapsed = insertEnd - insertStart;
        
        tree.clear();
        const batchStart = performance.now();
        tree.processBatch(intervals);
        const batchEnd = performance.now();
        const batchElapsed = batchEnd - batchStart;
        
        const queryStart = performance.now();
        tree.query(5000 * 1000);
        const queryEnd = performance.now();
        const queryElapsed = queryEnd - queryStart;
        
        results.push({
          size,
          insertMs: insertElapsed,
          batchMs: batchElapsed,
          queryMs: queryElapsed
        });
      });

      console.log('IntervalTree performance:', results);
      results.forEach(result => {
        expect(result.insertMs).toBeLessThan(2000); // <2s for insert
        expect(result.batchMs).toBeLessThan(2000); // <2s for batch
        expect(result.queryMs).toBeLessThan(10); // <10ms for query
      });
    });
  });

  // Print performance summary after all tests
  afterAll(() => {
    const summary = [
      '\nPerformance Summary',
      '==================',
      'Size'.padEnd(12) +
      'JSON Parse (ms)'.padStart(8).padEnd(16) +
      'Data Add (ms)'.padStart(8).padEnd(16) +
      'Load Total (ms)'.padStart(8).padEnd(16) +
      'Load/Item (ms)'.padStart(8).padEnd(16) +
      'Find Time (ms)'.padStart(8),
      '----------------------------------------------------------------------------------------'
    ];

    performanceResults.forEach(result => {
      const loadTotal = result.jsonParsing + result.dataAddition;
      const perItem = loadTotal / result.size;
      summary.push(
        `${result.size.toLocaleString().padEnd(12)}` +
        `${result.jsonParsing.toFixed(2).padStart(8).padEnd(16)}` +
        `${result.dataAddition.toFixed(2).padStart(8).padEnd(16)}` +
        `${loadTotal.toFixed(2).padStart(8).padEnd(16)}` +
        `${perItem.toFixed(4).padStart(8).padEnd(16)}` +
        `${result.findTimestamp.toFixed(2).padStart(8)}`
      );
    });

    console.log(summary.join('\n'));
  });
}); 