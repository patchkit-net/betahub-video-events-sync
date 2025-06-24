/**
 * Converts a video's current time (in seconds) to an ISO timestamp based on a start time.
 * 
 * @param startTimestamp - The initial timestamp as a Date object
 * @param videoPlayerTimeSeconds - The current time in seconds from the video's start
 * @returns A new ISO timestamp representing the current time relative to the start time
 * 
 * @example
 * const startTimestamp = new Date("2024-03-20T10:00:00Z");
 * const videoPlayerTimeSeconds = 65; // 1 minute and 5 seconds into the video
 * const timestamp = convertVideoTimeToISOTimestamp(startTimestamp, videoPlayerTimeSeconds);
 * // Returns: "2024-03-20T10:01:05.000Z"
 */
export const convertVideoTimeToISOTimestamp = (startTimestamp: Date, videoPlayerTimeSeconds: number): string => {
  // Convert currentTime from seconds to milliseconds and add to start time
  const currentTimeMs = videoPlayerTimeSeconds * 1000;
  const newTime = new Date(startTimestamp.getTime() + currentTimeMs);
  
  return newTime.toISOString();
};