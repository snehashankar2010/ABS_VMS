import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './StreamFeed.css';

const StreamFeed = ({ src }) => {
  // Create a reference to the video element
  const videoRef = useRef(null);
  
  // Use state to keep track of the Video.js player instance
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Initialize the Video.js player when the component mounts
    if (!player) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const newPlayer = videojs(videoElement, {}, () => {
        console.log('Player is ready');
      });
      setPlayer(newPlayer);
    }

    // Dispose the Video.js player when the component unmounts
    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [player]);

  return (
    <div className="onvif-video-feed video-feed">
      {/* Render the video element and attach the video reference */}
      <video className="onvif-video-js video-js" ref={videoRef} controls autoPlay>
        <source src={src} type="application/x-mpegURL" />
      </video>
    </div>
  );
};

export default StreamFeed;
