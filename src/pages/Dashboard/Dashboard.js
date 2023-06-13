import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import VideoFeed from "../VideoFeed/VideoFeed";
import ReactPlayer from 'react-player';
import VideoSourcesContext from "../VideoFeed/VideoSourcesContext";

import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const { videoSources,  deleteVideoSource} = useContext(VideoSourcesContext);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      setAuthenticated(true);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };
  
  const handleDeleteVideo = (index, src) => {
    deleteVideoSource(index);
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleStreamView = () => {
    navigate("/stream-view");
  };

  const handleAddStream = () => {
    navigate("/add-stream");
  };

  const handleStreamSettings = () => {
    navigate("/stream-settings");
  };

  return (
    <div>
      <div className="sidebar">
        <button onClick={handleDashboard}>Dashboard</button>
        <button onClick={handleStreamView}>Stream View</button>
        <button onClick={handleAddStream}>Add Stream</button>
        <button onClick={handleStreamSettings}>Stream Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="body-text">
        <div className="header">
          <h1>Dashboard</h1><br></br>
        </div>
        <div className="video-wrapper"  >
          {videoSources.map((src, index) => (
             <div className="video-pos"  >
            <VideoFeed key={index} src={src} onDelete={() => handleDeleteVideo(index, src)}/> 
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

