import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import "./AddStream.css";
import VideoSourcesContext from "../VideoFeed/VideoSourcesContext";

const AddStream = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const { addVideoSource } = useContext(VideoSourcesContext);
  const [deviceInfo, setDeviceInfo] = useState({name: '',ip: '', username: '', password: '', port: ''}); 
  const [devices, setDevices] = useState({});

  // Check if the user is already authenticated
  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      setAuthenticated(true);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Add video source to the context and navigate to the dashboard
  const handleAddVideoSource = () => {
    if (devices && devices.ip && devices.port) {
      addVideoSource(devices);
      navigate('/dashboard');
    }
  };

  // Handle input change for device information via  context 
  const handleDeviceInput = (e) => {
    const { name, value } = e.target;
    setDeviceInfo((prevDeviceInfo) => ({
      ...prevDeviceInfo,
      [name]: value,
    }));
  };

  // Connect to the device and fetch information
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

  // Handle navigation to different pages
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <div>
      <div className="sidebar">
        <img src={logo}></img>
        <button onClick={() => handleNavigation("/dashboard")}>Dashboard</button>
        <button onClick={() => handleNavigation("/playback")}>Playback</button>
        <button onClick={() => handleNavigation("/add-stream")}>Add Stream</button>
        <button onClick={() => handleNavigation("/video-analytics")}>Video Analytics</button>
        <button onClick={() => handleNavigation("/stream-settings")}>ONVIF Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="body-text">
        <div className="header">
          <h1>Add Stream</h1>
        </div>
         {/* Input fields for device information */}
        <div className="content">
          <input type="text" name="name" value={deviceInfo.name} onChange={handleDeviceInput} placeholder="Camera Name" />
          <input type="text" name="ip" value={deviceInfo.ip} onChange={handleDeviceInput} placeholder="Device IP Address" />
          <input type="text" name="username" value={deviceInfo.username} onChange={handleDeviceInput} placeholder="Username" />
          <input type="password" name="password" value={deviceInfo.password} onChange={handleDeviceInput} placeholder="Password" />
          <input type="number" name="port" value={deviceInfo.port} onChange={handleDeviceInput} placeholder="Port" />
        </div>
        <div className="add">
          <button onClick={handleAddVideoSrc}>Connect</button>
        </div>
        <br></br>
        <div className="add">
          <button onClick={handleAddVideoSource}>Add Video Source</button>
        </div>
        {/* Display connected device information */}
        {devices.ip && devices.port && (
          <div className="connected">
            <h2>Connected to Device: {devices.ip}:{devices.port}</h2>
          </div>
        )}
      </div>
      {/* Footer content */}
      <div className="footer">
        <div className="copyright">
          &copy; 2023 Arcturus Business Solutions
        </div>
      </div>
    </div>
  );
};

export default AddStream;
