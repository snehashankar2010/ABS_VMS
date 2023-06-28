import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import VideoFeed from "../VideoFeed/VideoFeed";
import VideoSourcesContext from "../VideoFeed/VideoSourcesContext";

import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const { videoSources, deleteVideoSource } = useContext(VideoSourcesContext);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      setAuthenticated(true);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDeleteVideo = (index, src) => {
    deleteVideoSource(index);
  };

  const handleLogout = () => {
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <div>
      <div className="sidebar">
        <button onClick={() => handleNavigation("/dashboard")}>Dashboard</button>
        <button onClick={() => handleNavigation("/playback")}>Playback</button>
        <button onClick={() => handleNavigation("/add-stream")}>Add Stream</button>
        <button onClick={() => handleNavigation("/stream-settings")}>ONVIF Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="body-text">
        <div className="header">
          <h1>Dashboard</h1><br></br>
        </div>
        <div className="video-wrapper">
          {videoSources.map((src, index) => (
            <div className="video-pos" key={index}>
              <VideoFeed devices={src} onDelete={() => handleDeleteVideo(index, src)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
