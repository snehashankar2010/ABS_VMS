import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import "./AddStream.css";
import VideoSourcesContext from "../VideoFeed/VideoSourcesContext";

const AddStream = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [newVideoSource, setNewVideoSource] = useState("");  

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

  const { addVideoSource } = useContext(VideoSourcesContext);

  const handleAddVideoSource = () => {
    if (newVideoSource) {
      addVideoSource(newVideoSource);
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e) => {
    setNewVideoSource(e.target.value);
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
          <h1>Add Stream</h1>
        </div>
        <input
          type="text"
          value={newVideoSource}
          onChange={handleInputChange}
          placeholder="Enter video source URL"
        />
        <button onClick={handleAddVideoSource}>Add Video Source</button>
      </div>
    </div>
  );
};

export default AddStream;

