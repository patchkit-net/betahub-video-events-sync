/**
 * Converts a video's current time (in seconds) to an ISO timestamp based on a start time.
 * 
 * @param startTime - The initial timestamp in ISO format (e.g., "2024-03-20T10:00:00Z")
 * @param currentTime - The current time in seconds from the video's start
 * @returns A new ISO timestamp representing the current time relative to the start time
 * 
 * @example
 * const startTime = "2024-03-20T10:00:00Z";
 * const currentTime = 65; // 1 minute and 5 seconds into the video
 * const timestamp = convertVideoTimeToISOTimestamp(startTime, currentTime);
 * // Returns: "2024-03-20T10:01:05.000Z"
 */
export const convertVideoTimeToISOTimestamp = (startTime: string, currentTime: number): string => {
  const startTimeDate = new Date(startTime);
  // Convert currentTime from seconds to milliseconds and add to start time
  const currentTimeMs = currentTime * 1000;
  const newTime = new Date(startTimeDate.getTime() + currentTimeMs);
  
  return newTime.toISOString();
};