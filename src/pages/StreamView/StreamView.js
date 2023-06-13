import {useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import StreamFeed from "../VideoFeed/StreamFeed";

import "./StreamView.css";

const StreamView = () => {
 const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const src = searchParams.get("src"); 
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
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
  if (!authenticated) {
    return navigate("/login", { replace: true });
  } else {
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
            <h1>Stream View</h1><br></br>
          </div>
          <StreamFeed src={src} /> 
        </div>
      </div>
    );
  }
};

export default StreamView;
