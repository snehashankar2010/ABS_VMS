import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {  FiHome, FiChevronLeft, FiChevronRight, FiChevronUp, FiSun, FiChevronDown, FiPlus, FiMinus, FiLayers,FiCamera} from "react-icons/fi";
import { MdExposure, MdContrast} from "react-icons/md";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import StreamFeed from "../VideoFeed/StreamFeed";
import data from "../../data/camList.json";
import camData from "../../data/camDetails.json";
import logo from "../../assets/imgs/logo.png";
import "./Settings.css";

const API_BASE_URL = "http://localhost:7000";

const Settings = () => {
  const location = useLocation();
  const cameraDetails = location.state?.devices;
  const navigate = useNavigate();
  const [devices, setCameraDetails] = useState(cameraDetails || {});
  const [presetInput, setPresetInput] = useState("");//To store preset Integer value
  const [setp, setPresets] = useState([]);//To check if Set Preset is selected with a preset No value
  const [presets, getPresets] = useState([]);//To get All presets from backend once goto,add or delete functionality is performed
  const [brightness, setBrightness] = useState({min:0,max:100,value:0});
  const [saturation, setSaturation] = useState({min:0,max:100,value:0});
  const [contrast, setContrast] = useState({min:0,max:100,value:0});
  const [sharpness, setSharpness] = useState({min:0,max:100,value:0});
  const [authenticated, setAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState([false, false]);

  // Check if the user is already authenticated
  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    setAuthenticated(loggedInUser === "true");
  }, []);

  // Make an API call to the server
  const handleApiCall = (url, data, successCallback) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error connecting to the server");
        }
        return response.json();
      })
      .then(successCallback)
      .catch((error) => {
        console.error("Error connecting to the server:", error);
      });
  };

  // Handle camera selection
  const handleCameraSelection = (event) => {
    try {
      const selectedId = event.target.value;
      const selectedCamera = camData.find(
        (camera) => camera.id === Number(selectedId)
      );
      const { ip, port, username, password } = selectedCamera;
      console.log(selectedCamera.ip, selectedCamera.port, selectedCamera.username, selectedCamera.password);
      const data = { ip, port, username, password };
      handleApiCall(API_BASE_URL + "/initial-setup", data, (response) => {
        setCameraDetails(response);
        navigate("/stream-settings", { state: { devices: response } });
        setTimeout(() => {window.location.reload(); }, 2000);
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Log the devices state when it changes
  useEffect(() => {
    console.log(devices.stream);
  }, [devices]);

  // Handle taking a snapshot
  const handleSnapshot = () => {
    const moveData = { devices };

    handleApiCall(`${API_BASE_URL}/snapshot`, moveData, (data) => {
      console.log("Response from server:", data);

      if (data.snapshotUri) {
        const link = document.createElement("a");
        link.href = data.snapshotUri;
        link.target = "_blank";
        link.setAttribute("download", "snapshot.jpg");
        link.click();
      }
    });
  };

  // Handle camera movement
  const handleMove = (direction) => {
    const moveData = { devices, direction };

    handleApiCall(`${API_BASE_URL}/pan-tilt`, moveData, (data) => {
      console.log("Response from server:", data);
    });
  };

  // Handle returning to home position
  const handleHome = () => {
    const moveData = { devices };

    handleApiCall(`${API_BASE_URL}/home`, moveData, (data) => {
      console.log("Response from server:", data);
    });
  };

  // Handle ZIGF action
  const handleZIGF = (action, value) => {
    const moveData = { devices, action, value };

    handleApiCall(`${API_BASE_URL}/ZIGF`, moveData, (data) => {
      console.log("Response from server:", data);
    });
  };

  // Fetch initial imaging settings when devices state changes
  useEffect(() => {
    const fetchInitialImagingSettings = () => {
      if (!devices) return;
      const moveData = { devices };

      handleApiCall(
        `${API_BASE_URL}/initial-imaging-settings`,
        moveData,
        (response) => {
          const { imageOptions, settings } = response;

          // Set the min and max values for sliders
          const { min: brightnessMin, max: brightnessMax } = imageOptions.brightness;
          const { min: saturationMin, max: saturationMax } = imageOptions.saturation;
          const { min: contrastMin, max: contrastMax } = imageOptions.contrast;
          const { min: sharpnessMin, max: sharpnessMax } = imageOptions.sharpness;

          // Update the min and max values of the sliders
          setBrightness({
            min: brightnessMin, max:brightnessMax,value:settings.brightness
          })
          console.log(brightness);
          setSaturation({
            min: saturationMin, max:saturationMax,value:settings.colorSaturation
          })
          console.log(saturation);
          setContrast({
            min: contrastMin, max:contrastMax,value:settings.contrast
          })
          console.log(contrast);
          setSharpness({
            min: sharpnessMin, max:sharpnessMax,value:settings.sharpness
          })
          console.log(sharpness)
        }
      );
    };

    fetchInitialImagingSettings();
  }, [devices]);

  // Handle slider value change
  const handleSliderChange = (value, action) => {
    switch (action) {
      case "brightness":
        setBrightness((prev) => ({
          ...prev,
          value: Math.max(prev.min, Math.min(prev.max, value)),
        }));
        break;
      case "saturation":
        setSaturation((prev) => ({
          ...prev,
          value: Math.max(prev.min, Math.min(prev.max, value)),
        }));
        break;
      case "contrast":
        setContrast((prev) => ({
          ...prev,
          value: Math.max(prev.min, Math.min(prev.max, value)),
        }));
        break;
      case "sharpness":
        setSharpness((prev) => ({
          ...prev,
          value: Math.max(prev.min, Math.min(prev.max, value)),
        }));
        break;
      default: break;
    }
      const moveData = { devices, action, value };
  
      handleApiCall(`${API_BASE_URL}/image-settings`, moveData, (data) => {
        console.log("Response from server:", data);
      });
    };

  // Handle preset actions
  const handlePresetAction = (presetAction) => () => {
    const moveData = { devices, action: presetAction, preset: presetInput };

    handleApiCall(`${API_BASE_URL}/preset`, moveData, (response) => {
      const { presets, value } = response;
      getPresets(presets);
      console.log("Response from server:", value);
    });

    setPresets([]);
    setPresetInput("");
  };

  // Toggle dropdown visibility
  const handleToggle = (index) => {
    const updatedDropdown = [...showDropdown];
    updatedDropdown[index] = !updatedDropdown[index];
    setShowDropdown(updatedDropdown);
  };

  // Handle preset value input change and check if it is within 1-25 range
  const handlePresetInputChange = (e) => {
    const inputValue = e.target.value.trim();
    const numericValue = parseInt(inputValue, 10);
  
    let formattedValue = "";
    if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 25) {
      // Add leading zero if the numericValue is a single digit
      formattedValue = numericValue < 10 ? `0${numericValue}` : numericValue.toString();
    }
    setPresetInput(formattedValue);
  };
  

  /* Once presetInput(value) is added and set preset is clicked, 
  call setPresets to show add and delete button*/
  const handleSetPreset = () => {
    if (presetInput !== "") {
      setPresets([presetInput]);
    }
  };

  // Handle navigation to a different page
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };

  if (!authenticated) {
    // If user is not authenticated, navigate to the login page
    handleNavigation("/login");
  } else {
    return (
      <div>
        <div className="sidebar">
          {/* Sidebar navigation */}
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
            <h1>ONVIF Settings</h1>
            <br />
          </div>
        </div>
  
        <div className="row">
          {/* Camera selection dropdown */}
          <select onChange={handleCameraSelection}>
            <option value="" disabled selected>Select a camera</option>
            {data.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name}
              </option>
            ))}
          </select>
          <button className="snapshot-button" onClick={handleSnapshot}>
            <FiCamera />
          </button>
        </div>
  
        {devices && devices.stream ? (
          // Display stream feed if available
          <StreamFeed src={devices.stream} />
        ) : (
          <div></div>
        )}
  
        <div className="video-controls">
          <div className="controller">
            <div className="button-group">
              {/* Camera Pan-Tilt buttons */}
              <button onClick={() => handleMove("top-left")}>
                <FiChevronLeft style={{ transform: "rotate(45deg)" }} />
              </button>
              <button onClick={() => handleMove("top")}>
                <FiChevronUp />
              </button>
              <button onClick={() => handleMove("top-right")}>
                <FiChevronUp style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
            <div className="button-group">
              <button onClick={() => handleMove("left")}>
                <FiChevronLeft />
              </button>
              <button className="center-button" onClick={handleHome}>
                <FiHome />
              </button>
              <button onClick={() => handleMove("right")}>
                <FiChevronRight />
              </button>
            </div>
            <div className="button-group">
              <button onClick={() => handleMove("down-left")}>
                <FiChevronDown style={{ transform: "rotate(45deg)" }} />
              </button>
              <button onClick={() => handleMove("down")}>
                <FiChevronDown />
              </button>
              <button onClick={() => handleMove("down-right")}>
                <FiChevronRight style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
          </div>
          <div className="ID-controls">
            <div className="button-group">
              {/* Zoom controls */}
              <button onClick={() => handleZIGF("zoom", "+")}>
                <FiPlus />
              </button>
              <p>Zoom</p>
              <button onClick={() => handleZIGF("zoom", "-")}>
                <FiMinus />
              </button>
            </div>
          </div>
  
          <div className="ID-controls">
            <div className="button-group">
              {/* Iris controls */}
              <button onClick={() => handleZIGF("iris", "+")}>
                <FiPlus />
              </button>
              <p>Iris</p>
              <button onClick={() => handleZIGF("iris", "-")}>
                <FiMinus />
              </button>
            </div>
          </div>
  
          <div className="ID-controls">
            <div className="button-group">
              {/* Gain controls */}
              <button onClick={() => handleZIGF("gain", "+")}>
                <FiPlus />
              </button>
              <p>Gain</p>
              <button onClick={() => handleZIGF("gain", "-")}>
                <FiMinus />
              </button>
            </div>
          </div>
  
          <div className="ID-controls">
            <div className="button-group">
              {/* Focus controls */}
              <button onClick={() => handleZIGF("focus", "+")}>
                <FiPlus />
              </button>
              <p>Focus</p>
              <button onClick={() => handleZIGF("focus", "-")}>
                <FiMinus />
              </button>
            </div>
          </div>
  
          <div className="dropdown">
            {/* Image settings dropdown */}
            <div className="dropdown-header" onClick={() => handleToggle(0)}>
              <p>Image Settings</p>
              <div className={`arrow-icon ${showDropdown[0] ? "down" : ""}`}>
                <FiChevronLeft />
              </div>
            </div>
            {showDropdown[0] && (
              <div className="range-input">
                {/* Sliders for image settings */}
                <div className="slider" title="Brightness">
                  <FiSun />
                  <Slider id="brightness" min={brightness.min} max={brightness.max} value={brightness.value} onChange={(value) => handleSliderChange(value, "brightness")} />
                </div>
                <div className="slider" title="Saturation">
                  <FiLayers />
                  <Slider id="saturation" min={saturation.min} max={saturation.max} value={saturation.value} onChange={(value) => handleSliderChange(value, "saturation")} />
                </div>
                <div className="slider" title="Contrast">
                  <MdContrast />
                  <Slider id="contrast" min={contrast.min} max={contrast.max} value={contrast.value} onChange={(value) => handleSliderChange(value, "contrast")} />
                </div>
                <div className="slider" title="Sharpness">
                  <MdExposure />
                  <Slider id="sharpness" min={sharpness.min} max={sharpness.max} value={sharpness.value} onChange={(value) => handleSliderChange(value, "sharpness")} />
                </div>
              </div>
            )}
          </div>
  
          <div className="dropdown">
            {/* Preset dropdown */}
            <div className="dropdown-header" onClick={() => handleToggle(1)}>
              <p>Preset</p>
              <div className={`arrow-icon ${showDropdown[1] ? "down" : ""}`}>
                <FiChevronLeft />
              </div>
            </div>
            {showDropdown[1] && (
              <div className="preset-input">
                {/* Preset input and actions */}
                <span>Preset No (1~25):</span>
                <input type="number" min="1" max="25" value={presetInput} onChange={handlePresetInputChange} />
                <button onClick={handleSetPreset}>SET PRESET</button>
                <button onClick={handlePresetAction("Goto")}>GO TO</button>
                {setp.map((preset) => (
                  <div key={preset}>
                    <div className="preset-button-actions">
                      <button onClick={handlePresetAction("Add")}>ADD</button>
                      <button onClick={handlePresetAction("Delete")}>DELETE</button>
                    </div>
                  </div>
                ))}
               <div className="preset-display">
                <span>{presets}</span>
              </div>
              </div>
            )}
          </div>
        </div>
  
        <div className="footer">
          <div className="copyright">
            &copy; 2023 Arcturus Business Solutions
          </div>
        </div>
      </div>
    );
  };
}  

export default Settings;
