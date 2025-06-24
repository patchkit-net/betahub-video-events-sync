/**
 * Validates a timestamp string and returns a parsed Date object
 * @param timestamp - The timestamp string to validate
 * @returns The parsed Date object
 * @throws Error if the timestamp is invalid
 */
export function validateTimestamp(timestamp: string): Date {
  if (!timestamp || typeof timestamp !== 'string') {
    throw new Error('Timestamp must be a non-empty string');
  }

  const parsedDate = new Date(timestamp);
  
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid timestamp format: ${timestamp}. Expected ISO 8601 format (e.g., "2023-01-01T00:00:00.000Z")`);
  }

  return parsedDate;
} 