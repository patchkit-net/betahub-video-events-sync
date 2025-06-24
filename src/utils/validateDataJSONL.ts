import type { Response } from '../types';
import { createResponse } from './errorHandler';

/**
 * Validates the format of JSONL data
 */
export function validateDataJSONL(dataJSONL: string): Response {
  if (!dataJSONL) {
    return createResponse('error', 'dataJSONL is required', undefined);
  }

  let lines: string[];
  try {
    lines = dataJSONL.split('\n').filter((line) => line.trim());
  } catch (error) {
    return createResponse('error', 'Failed to split dataJSONL', undefined, { originalError: error instanceof Error ? error.message : String(error) });
  }

  for (let index = 0; index < lines.length; index++) {
    let item: any;
    try {
      item = JSON.parse(lines[index]);
    } catch (error) {
      return createResponse('error', `Invalid JSON at line ${index + 1}`, undefined, { lineNumber: index + 1, lineContent: lines[index] });
    }

    if (!item.start_timestamp || typeof item.start_timestamp !== 'string') {
      return createResponse('error', `Item ${index} is missing or has invalid start_timestamp`, undefined, { itemIndex: index, field: 'start_timestamp', value: item.start_timestamp });
    }
    if (!item.type || typeof item.type !== 'string') {
      return createResponse('error', `Item ${index} is missing or has invalid type`, undefined, { itemIndex: index, field: 'type', value: item.type });
    }
    if (item.end_timestamp !== undefined && typeof item.end_timestamp !== 'string') {
      return createResponse('error', `Item ${index} has invalid end_timestamp (must be string if present)`, undefined, { itemIndex: index, field: 'end_timestamp', value: item.end_timestamp });
    }
    if (item.message !== undefined && typeof item.message !== 'string') {
      return createResponse('error', `Item ${index} has invalid message (must be string if present)`, undefined, { itemIndex: index, field: 'message', value: item.message });
    }
    if (
      item.details !== undefined &&
      (typeof item.details !== 'object' || Array.isArray(item.details))
    ) {
      return createResponse('error', `Item ${index} has invalid details (must be object if present)`, undefined, { itemIndex: index, field: 'details', value: item.details });
    }
  }
  return createResponse('success', 'Validation successful');
} 