/**
 * Converts a timestamp to the corresponding video time in seconds based on a start time.
 * This is the reverse operation of convertVideoTimeToISOTimestamp.
 * 
 * @param startTimestamp - The initial timestamp when the video starts (can be string or Date)
 * @param targetTimestamp - The target timestamp to convert to video time (can be string or Date)
 * @returns The video time in seconds from the start
 * 
 * @example
 * const startTimestamp = "2024-03-20T10:00:00Z";
 * const targetTimestamp = "2024-03-20T10:01:05Z";
 * const videoTime = getSecondsFromTimestamp(startTimestamp, targetTimestamp);
 * // Returns: 65 (1 minute and 5 seconds)
 * 
 * @example
 * const startTimestamp = new Date("2024-03-20T10:00:00Z");
 * const targetTimestamp = new Date("2024-03-20T10:01:05Z");
 * const videoTime = getSecondsFromTimestamp(startTimestamp, targetTimestamp);
 * // Returns: 65
 */
export const getSecondsFromTimestamp = (
  startTimestamp: string | Date,
  targetTimestamp: string | Date
): number => {
  // Convert timestamps to Date objects if they're strings
  const startDate = typeof startTimestamp === 'string' ? new Date(startTimestamp) : startTimestamp;
  const targetDate = typeof targetTimestamp === 'string' ? new Date(targetTimestamp) : targetTimestamp;

  // Validate that both dates are valid
  if (isNaN(startDate.getTime())) {
    throw new Error(`Invalid start timestamp: ${startTimestamp}`);
  }
  
  if (isNaN(targetDate.getTime())) {
    throw new Error(`Invalid target timestamp: ${targetTimestamp}`);
  }

  // Calculate the difference in milliseconds
  const timeDifferenceMs = targetDate.getTime() - startDate.getTime();
  
  // Convert to seconds
  const videoTimeSeconds = timeDifferenceMs / 1000;
  
  return videoTimeSeconds;
}; 