import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import "./AddStream.css";
import VideoSourcesContext from "../VideoFeed/VideoSourcesContext";
import ReactPlayer from 'react-player';

const AddStream = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [newVideoSource, setNewVideoSource] = useState(""); 
  const { addVideoSource } = useContext(VideoSourcesContext);
  const [deviceInfo, setDeviceInfo] = useState({ip: '', username: '', password: '', port: ''}); 
  const [devices, setDevices] = useState({});

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      setAuthenticated(true);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleAddVideoSource = () => {
    if (devices && devices.ip && devices.port) {
      addVideoSource(devices);
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e) => {
    setNewVideoSource(e.target.value);
  };

  const handleDeviceInput = (e) => {
    const { name, value } = e.target;
    setDeviceInfo((prevDeviceInfo) => ({
      ...prevDeviceInfo,
      [name]: value,
    }));
  };
  
  const handleAddVideoSrc = () => {
    fetch('http://localhost:7000/initial-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceInfo),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error connecting to the server');
      }
      return response.json();
    })
    .then((data) => {
      setDevices(data);
    })
    .catch((error) => {
      console.error('Error connecting to the server:', error);
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
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
          <h1>Add Stream</h1>
        </div>
        
        <div className="content">
          <input
            type="text"
            name="ip"
            value={deviceInfo.ip}
            onChange={handleDeviceInput}
            placeholder="Device IP Address"
          />
          <input
            type="text"
            name="username"
            value={deviceInfo.username}
            onChange={handleDeviceInput}
            placeholder="Username"
          />
          <input
            type="password"
            name="password"
            value={deviceInfo.password}
            onChange={handleDeviceInput}
            placeholder="Password"
          />
          <input
            type="number"
            name="port"
            value={deviceInfo.port}
            onChange={handleDeviceInput}
            placeholder="Port"
          />
        </div>
        <div className="add">
          <button onClick={handleAddVideoSrc}>Connect</button>
        </div>   
        {devices.ip && devices.port && (
          <div>
            <h2>Connected to Device: {devices.ip}:{devices.port}</h2>
          </div>
        )}
        <br></br>
        <div className="add">
          <button onClick={handleAddVideoSource}>Add Video Source</button>
        </div>
      </div>
    </div>
  );
};

export default AddStream;
