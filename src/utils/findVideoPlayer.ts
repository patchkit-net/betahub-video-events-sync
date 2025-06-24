/**
 * Finds, validates and retrieves a video player element by ID
 * @param videoPlayerDomId - The DOM ID of the video element
 * @returns The HTMLVideoElement
 * @throws Error if the element is not found or not a video element
 */
export function findVideoPlayer(videoPlayerDomId: string): HTMLVideoElement {
  if (!videoPlayerDomId || typeof videoPlayerDomId !== 'string') {
    throw new Error('videoPlayerDomId must be a non-empty string');
  }

  const element = document.getElementById(videoPlayerDomId);
  
  if (!element) {
    throw new Error(`Video element with id "${videoPlayerDomId}" not found in the DOM`);
  }

  if (!(element instanceof HTMLVideoElement)) {
    throw new Error(`Element with id "${videoPlayerDomId}" is not a video element. Found: ${element.tagName}`);
  }

  return element;
} 