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

  // Check if the user is authenticated
  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      setAuthenticated(true);
    } else {
      // If not authenticated, redirect to the login page
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Handle navigation to different pages
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle deleting a video source from context
  const handleDeleteVideo = (index, src) => {
    deleteVideoSource(index);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="sidebar">
        <img src={logo} alt="Logo" />
        <button onClick={() => handleNavigation("/dashboard")}>Dashboard</button>
        <button onClick={() => handleNavigation("/playback")}>Playback</button>
        <button onClick={() => handleNavigation("/add-stream")}>Add Stream</button>
        <button onClick={() => handleNavigation("/video-analytics")}>Video Analytics</button>
        <button onClick={() => handleNavigation("/stream-settings")}>ONVIF Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main content */}
      <div className="body-text">
        <div className="header">
          <h1>Dashboard</h1>
        </div>
        <div className="video-wrapper">
          {/* Render video feeds */}
          {videoSources.map((src, index) => (
            <div className="video-pos" key={index}>
              <VideoFeed devices={src} onDelete={() => handleDeleteVideo(index, src)} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="copyright">
          &copy; 2023 Arcturus Business Solutions
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
