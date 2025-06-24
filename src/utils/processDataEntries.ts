import type { Data, ProcessDataEntryOptions, ProcessDataEntryResult } from '../types';

import { validateDataJSONL } from './validateDataJSONL';

/**
 * Processes a single data entry with validation and parsing
 */
export async function processDataEntry(
  name: string,
  dataJSONL: string,
  options: ProcessDataEntryOptions
): Promise<ProcessDataEntryResult> {
  if (!name) {
    return {
      success: false,
      error: {
        message: 'name is required',
      },
    };
  }

  if (!dataJSONL) {
    return {
      success: false,
      error: {
        message: 'dataJSONL is required',
      },
    };
  }

  if (typeof dataJSONL !== 'string') {
    return {
      success: false,
      error: {
        message: 'dataJSONL must be a string',
      },
    };
  }

  try {
    const validationResponse = validateDataJSONL(dataJSONL);
    if (validationResponse.status !== 'success') {
      return {
        success: false,
        error: {
          message: validationResponse.message,
          details: validationResponse.details,
        },
      };
    }

    const lines = dataJSONL.split('\n').filter((line) => line.trim());
    const parsedData: Data[] = [];

    // Process JSON parsing in chunks to avoid blocking
    const CHUNK_SIZE = 10000;
    for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
      const chunk = lines.slice(i, i + CHUNK_SIZE);

      // Process chunk
      chunk.forEach((line) => {
        const item = JSON.parse(line);
        parsedData.push(item);
      });

      // Update total progress
      options.totalProgress += chunk.length;
      if (options.onProgress) {
        options.onProgress({
          status: 'loading',
          progress: (options.totalProgress / options.totalItems) * 100,
        });
      }

      // Allow other operations to proceed
      if (i + CHUNK_SIZE < lines.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return {
      success: true,
      data: parsedData,
      itemCount: parsedData.length,
    };
  } catch (error) {
    if (options.onProgress) {
      options.onProgress({
        status: 'error',
        progress: 0,
      });
    }

    return {
      success: false,
      error: {
        message: `Error processing data for ${name}`,
        details:
          error instanceof Error
            ? { originalError: error.message }
            : undefined,
      },
    };
  }
} 