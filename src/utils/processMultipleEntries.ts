import type {
  ProcessDataEntryOptions,
  ProcessMultipleEntriesOptions,
  ProcessingError,
  ProcessingResult,
  StorageFunction,
} from '../types';

import { createStandardError } from './errorHandler';
import { processDataEntry } from './processDataEntries';

/**
 * Processes multiple data entries and returns results and errors
 */
export async function processMultipleEntries(
  entries: { name: string; dataJSONL: string }[],
  totalItems: number,
  storeData: StorageFunction,
  options?: ProcessMultipleEntriesOptions
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
      await storeData(name, result.data, options?.sortData ?? true);

      if (result.itemCount === undefined) {
        throw createStandardError({
          type: 'DataProcessingError',
          message: `Item count is undefined for entry: ${name}`,
          context: {
            operation: 'processMultipleEntries',
            component: 'DataProcessing',
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
