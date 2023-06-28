import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import "./StreamFeed.css";
import 'video.js/dist/video-js.css';

const StreamFeed = ({ src }) => {
  const videoRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [showStream, setShowStream] = useState(false);

  useEffect(() => {
    // make sure Video.js player is only initialized once
    if (!player) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      setPlayer(
        videojs(videoElement, {}, () => {
          console.log('player is ready');
        })
      );
    }
  }, [videoRef]);

  useEffect(() => {
    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [player]);

  return (
    <div className="onvif-video-feed video-feed">
     
        <video className="onvif-video-js video-js" ref={videoRef} controls autoPlay>
          <source src={src} type="application/x-mpegURL" />
        </video>
    </div>
  );
};

export default StreamFeed;
