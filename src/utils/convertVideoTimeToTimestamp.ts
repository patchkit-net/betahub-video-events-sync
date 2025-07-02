/**
 * Converts video time to timestamp format (YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ss.SSS)
 * This matches the format used in the data files, preserving milliseconds if present
 * 
 * @param videoTimeSeconds - The current time in seconds from the video's start
 * @param startTimestamp - The initial timestamp as a Date object or string
 * @returns A timestamp string in local format, preserving milliseconds if present in startTimestamp
 * 
 * @example
 * const startTimestamp = new Date("2025-06-12T14:03:20");
 * const videoPlayerTimeSeconds = 3; // 3 seconds into the video
 * const timestamp = convertVideoTimeToTimestamp(videoPlayerTimeSeconds, startTimestamp);
 * // Returns: "2025-06-12T14:03:23"
 * 
 * @example
 * const startTimestamp = new Date("2025-06-12T14:03:20.321");
 * const videoPlayerTimeSeconds = 3.5; // 3.5 seconds into the video
 * const timestamp = convertVideoTimeToTimestamp(videoPlayerTimeSeconds, startTimestamp);
 * // Returns: "2025-06-12T14:03:23.821"
 */
export function convertVideoTimeToTimestamp(
  videoTimeSeconds: number,
  startTimestamp: Date | string
): string {
  // Convert startTimestamp to Date if it's a string
  const startDate = typeof startTimestamp === 'string' ? new Date(startTimestamp) : startTimestamp;
  
  // Check if the original startTimestamp had milliseconds
  const originalHasMs = typeof startTimestamp === 'string' 
    ? startTimestamp.includes('.') 
    : startDate.getMilliseconds() !== 0;
  
  const videoTimeMilliseconds = videoTimeSeconds * 1000;
  const absoluteTimestampMs = startDate.getTime() + videoTimeMilliseconds;
  const currentTimeDate = new Date(absoluteTimestampMs);
  
  const year = currentTimeDate.getFullYear();
  const month = String(currentTimeDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentTimeDate.getDate()).padStart(2, '0');
  const hours = String(currentTimeDate.getHours()).padStart(2, '0');
  const minutes = String(currentTimeDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentTimeDate.getSeconds()).padStart(2, '0');
  
  // Include milliseconds if the original timestamp had them or if the calculated time has non-zero ms
  if (originalHasMs || currentTimeDate.getMilliseconds() !== 0) {
    const ms = String(currentTimeDate.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
  }
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
} 