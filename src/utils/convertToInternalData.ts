import type { Data, DataInternal } from '../types';

/**
 * Converts Data to DataInternal by parsing timestamps
 */
export function convertToInternalData(data: Data[]): DataInternal[] {
  return data.map(item => ({
    ...item,
    start_timestamp: new Date(item.start_timestamp),
    end_timestamp: item.end_timestamp ? new Date(item.end_timestamp) : undefined,
  }));
} 