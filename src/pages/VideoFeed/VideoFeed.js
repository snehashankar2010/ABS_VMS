import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import './VideoFeed.css';
import 'video.js/dist/video-js.css';
import deleteIcon from '../../assets/icon/delete.jpg';

const VideoFeed = ({ devices, onDelete }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    playerRef.current = videojs(videoRef.current, {}, () => {
      console.log('player is ready');
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const handleViewStream = () => {
    navigate(`/stream-settings`, { state: { devices } });
  };

  return (
    <div className="dashboard-video-feed video-feed">
      <div data-vjs-player>
        <video ref={videoRef} className="dashboard-video-js video-js" controls autoPlay>
          <source src={devices.stream} type="application/x-mpegURL" />
        </video>
      </div>
      <div className="delete-icon" onClick={onDelete}>
        <img src={deleteIcon} alt="Delete" />
      </div>
      <div>
      <button className="view-stream" onClick={handleViewStream}>ONVIF Settings</button>
     </div>
    </div>
  );
};

export default VideoFeed;
