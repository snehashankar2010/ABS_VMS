import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {  FiHome, FiChevronLeft, FiChevronRight, FiChevronUp, FiSun, FiChevronDown, FiPlus, FiMinus, FiLayers,FiCamera} from "react-icons/fi";
import { MdExposure, MdContrast, MdCameraAlt } from "react-icons/md";
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
  const [presetInput, setPresetInput] = useState("");
  const [presets, setPresets] = useState([]);
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState([false, false]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    setAuthenticated(loggedInUser === "true");
  }, []);

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
  
useEffect(() => {
  console.log(devices.stream);
}, [devices]);

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

  const handleMove = (direction) => {
    const moveData = { devices, direction };

    handleApiCall(`${API_BASE_URL}/pan-tilt`, moveData, (data) => {
      console.log("Response from server:", data);
    });
  };

  const handleHome = () => {
    const moveData = { devices };

    handleApiCall(`${API_BASE_URL}/home`, moveData, (data) => {
      console.log("Response from server:", data);
    });
  };

  const handleZIGF = (action, value) => {
    const moveData = { devices, action, value };

    handleApiCall(`${API_BASE_URL}/ZIGF`, moveData, (data) => {
      console.log("Response from server:", data);
    });
  };

  useEffect(() => {
    const fetchInitialImagingSettings = () => {
      if (!devices) return;
  
      const moveData = { devices };
  
      handleApiCall(`${API_BASE_URL}/initial-imaging-settings`, moveData, (settings) => {
        setBrightness(settings.brightness);
        setSaturation(settings.colorSaturation);
        setContrast(settings.contrast);
        setSharpness(settings.sharpness);
      });
    };
  
    fetchInitialImagingSettings();
  }, [devices]);
    

  const handleSliderChange = (value, action) => {
    switch (action) {
      case "brightness":
        setBrightness(value);
        break;
      case "saturation":
        setSaturation(value);
        break;
      case "contrast":
        setContrast(value);
        break;
      case "sharpness":
        setSharpness(value);
        break;
      default:
        break;
    }

    const moveData = { devices, action, value };

    handleApiCall(`${API_BASE_URL}/image-settings`, moveData, (data) => {
      console.log("Response from server:", data);
    });
  };

  const handlePresetAction = (presetAction) => () => {
    const moveData = { devices, action: presetAction, preset: presetInput };

    handleApiCall(`${API_BASE_URL}/preset`, moveData, (data) => {
      console.log("Response from server:", data);
    });

    setPresets([]);
    setPresetInput("");
  };

  const handleToggle = (index) => {
    const updatedDropdown = [...showDropdown];
    updatedDropdown[index] = !updatedDropdown[index];
    setShowDropdown(updatedDropdown);
  };

  const handlePresetInputChange = (e) => {
    const inputValue = e.target.value.trim();
    const numericValue = parseInt(inputValue, 10);

    if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 25) {
      setPresetInput(numericValue);
    } else {
      setPresetInput("");
    }
  };

  const handleSetPreset = () => {
    if (presetInput !== "") {
      setPresets([presetInput]);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };

  if (!authenticated) {
    handleNavigation("/login");
  } else {
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
            <h1>ONVIF Settings</h1>
            <br />
          </div>
        </div>

        <div className="row">
        <select onChange={handleCameraSelection}>
          <option value="" disabled selected>Select a camera</option>
          {data.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.name}
            </option>
          ))}
        </select>
        <button className="snapshot-button" onClick={handleSnapshot}>
          <FiCamera size={27} />
        </button>
      </div> 

        {devices && devices.stream ? (
          <StreamFeed src={devices.stream} />
        ) : (
          <div ></div>
        )} 
        
        <div className="video-controls">
          <div className="controller">
            <div className="button-group">
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
              <button onClick={() => handleZIGF("zoom","+")}>
                <FiPlus />
              </button>
              <p>Zoom</p>
              <button onClick={() => handleZIGF("zoom","-")}>
                <FiMinus />
              </button>
            </div>
          </div>

          <div className="ID-controls">
            <div className="button-group">
              <button onClick={() => handleZIGF("iris","+")}>
                <FiPlus />
              </button>
              <p>Iris</p>
              <button onClick={() => handleZIGF("iris","-")}>
                <FiMinus />
              </button>
            </div>
          </div>

          <div className="ID-controls">
            <div className="button-group">
              <button onClick={() => handleZIGF("gain","+")}>
              <FiPlus />
              </button>
              <p>Gain</p>
              <button onClick={() => handleZIGF("gain","-")}>
              <FiMinus />
              </button>
            </div>
          </div>

          <div className="ID-controls">
            <div className="button-group">
              <button onClick={() => handleZIGF("focus","+")}>
              <FiPlus />
              </button>
              <p>Focus</p>
              <button onClick={() => handleZIGF("focus","-")}>
              <FiMinus />
              </button>
            </div>
          </div>

        <div className="dropdown">
          <div className="dropdown-header" onClick={() =>handleToggle(0)}>
            <p>Image Settings</p>
            <div className={`arrow-icon ${showDropdown[0] ? "down" : ""}`}>
              <FiChevronLeft /> 
            </div>
          </div>
          {showDropdown[0] && (
            <div className="range-input">
              <div className="slider" title="Brightness">
              <FiSun  size={32}/>
              <Slider min={0} max={100} value={brightness} onChange={(value) => handleSliderChange(value, "brightness")} />
              </div>
              <div className="slider"  title="Saturation"> 
              <FiLayers size={32}/>
              <Slider min={0} max={100} value={saturation} onChange={(value) => handleSliderChange(value, "saturation")} />
              </div>
              <div className="slider" title="Contrast">
              <MdContrast size={32}/>
              <Slider min={0} max={100} value={contrast} onChange={(value) => handleSliderChange(value, "contrast")} />
              </div>
              <div className="slider" title="Sharpness">
              <MdExposure size={32}/>
              <Slider min={0} max={100} value={sharpness} onChange={(value) => handleSliderChange(value, "sharpness")} />
              </div>
            </div>
          )}
        </div>

        <div className="dropdown">
          <div className="dropdown-header" onClick={() =>handleToggle(1)}>
            <p>Preset</p>
            <div className={`arrow-icon ${showDropdown[1] ? "down" : ""}`}>
              <FiChevronLeft /> 
            </div>
          </div>
          {showDropdown[1] && (      
              <div className="preset-input">
                <span>Preset No (1~25):</span>
                <input type="number" min="1" max="25" value={presetInput} onChange={handlePresetInputChange}/>
                <button onClick={handleSetPreset}>SET PRESET</button>
                <button onClick={handlePresetAction("Goto")}>GO TO</button>
                {presets.map((preset) => (
                  <div key={preset}>
                    <div className="preset-button-actions">
                      <button onClick={handlePresetAction("Add")}>ADD</button>
                      <button onClick={handlePresetAction("Delete")}>DELETE</button>
                    </div>
                  </div>
                ))}
              </div>
          )}
        </div>

      </div>
    </div>
    );
  };
};

export default Settings;
