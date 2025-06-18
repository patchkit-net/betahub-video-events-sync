import type { Data, Response } from '../types';
import { createErrorResponse, createSuccessResponse } from '../errors';

/**
 * Validates the format of JSONL data
 */
export function validateDataJSONL(dataJSONL: string): Response & { success: boolean } {
  if (!dataJSONL) {
    return { ...createErrorResponse('dataJSONL is required'), success: false };
  }

  const lines = dataJSONL.split('\n').filter((line) => line.trim());

  for (let index = 0; index < lines.length; index++) {
    let item: Data;
    try {
      item = JSON.parse(lines[index]);
    } catch (error) {
      return { ...createErrorResponse(`Invalid JSON at line ${index + 1}`, {
        lineNumber: index + 1,
        lineContent: lines[index],
      }), success: false };
    }

    if (!item.start_time || typeof item.start_time !== 'string') {
      return { ...createErrorResponse(
        `Item ${index} is missing or has invalid start_time`,
        {
          itemIndex: index,
          field: 'start_time',
          value: item.start_time,
        }
      ), success: false };
    }
    if (!item.type || typeof item.type !== 'string') {
      return { ...createErrorResponse(
        `Item ${index} is missing or has invalid type`,
        {
          itemIndex: index,
          field: 'type',
          value: item.type,
        }
      ), success: false };
    }
    if (item.end_time !== undefined && typeof item.end_time !== 'string') {
      return { ...createErrorResponse(
        `Item ${index} has invalid end_time (must be string if present)`,
        {
          itemIndex: index,
          field: 'end_time',
          value: item.end_time,
        }
      ), success: false };
    }
    if (item.message !== undefined && typeof item.message !== 'string') {
      return { ...createErrorResponse(
        `Item ${index} has invalid message (must be string if present)`,
        {
          itemIndex: index,
          field: 'message',
          value: item.message,
        }
      ), success: false };
    }
    if (
      item.details !== undefined &&
      (typeof item.details !== 'object' ||
        item.details === null ||
        Array.isArray(item.details))
    ) {
      return { ...createErrorResponse(
        `Item ${index} has invalid details (must be object if present)`,
        {
          itemIndex: index,
          field: 'details',
          value: item.details,
        }
      ), success: false };
    }
  }
  return { ...createSuccessResponse(), success: true };
} 