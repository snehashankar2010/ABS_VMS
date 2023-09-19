import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import './VideoFeed.css';
import 'video.js/dist/video-js.css';
import deleteIcon from '../../assets/icon/delete.jpg';

const VideoFeed = ({ devices, onDelete }) => {
  // Use the `useNavigate` hook from React Router to navigate to a different route
  const navigate = useNavigate();
  
  // Create a reference to the video element
  const videoRef = useRef(null);
  
  // Create a reference to the Video.js player
  const playerRef = useRef(null);

  useEffect(() => {
    // Initialize the Video.js player when the component mounts
    try {
      playerRef.current = videojs(videoRef.current, {}, () => {
        console.log('Player is ready');
      });
    } catch (error) {
      console.error('An error occurred:', error);
    }

    // Dispose the Video.js player when the component unmounts
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  // Handle the action when the user wants to view the stream settings
  const handleViewStream = () => {
    navigate('/stream-settings', { state: { devices } });
  };

  return (
    <div className="dashboard-video-feed video-feed">
      <div data-vjs-player>
        {/* Render the video element and attach the video reference */}
        <video ref={videoRef} className="dashboard-video-js video-js" controls autoPlay>
          <source src={devices.stream} type="application/x-mpegURL" />
        </video>
      </div>
      
      {/* Render the delete icon and attach the onDelete event */}
      <div className="delete-icon" onClick={onDelete}>
        <img src={deleteIcon} alt="Delete" />
      </div>
      
      <div>
        {/* Render the "ONVIF Settings" button and attach the handleViewStream event */}
        <button className="view-stream" onClick={handleViewStream}>ONVIF Settings</button>
      </div>
    </div>
  );
};

export default VideoFeed;
