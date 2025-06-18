import 'video.js/dist/video-js.css';

import { useEffect, useRef } from 'react';

import type Player from 'video.js/dist/types/player';
import videojs from 'video.js';

export const VideoPlayer = ({ id }: { id: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Set the ID immediately
    videoElement.id = id;

    // Wait for the next tick to ensure the element is in the DOM
    requestAnimationFrame(() => {
      if (!playerRef.current) {
        playerRef.current = videojs(videoElement, {
          controls: true,
          preload: 'auto',
          fluid: true,
          muted: true,
        });
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [id]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js"
      >
        <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to
          a web browser that
          <a
            href="https://videojs.com/html5-video-support/"
            target="_blank"
            rel="noopener noreferrer"
          >
            supports HTML5 video
          </a>
        </p>
      </video>
    </div>
  );
};
