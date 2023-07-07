import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import "./VA.css";

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
        <img src={logo}></img>
        <button onClick={() => handleNavigation("/dashboard")}>Dashboard</button>
        <button onClick={() => handleNavigation("/playback")}>Playback</button>
        <button onClick={() => handleNavigation("/add-stream")}>Add Stream</button>
        <button onClick={() => handleNavigation("/video-analytics")}>Video Analytics</button>
        <button onClick={() => handleNavigation("/stream-settings")}>ONVIF Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div class="container12">
        <div class="header12">
          <div class="left12">CAMERA RESULT / DEPARTMENT / CAMERA NAME</div>
          <div class="notification-icon12">
            <img src="/Users/mac/Desktop/VMS/react/frontend-backend/ABS_VMS/src/assets/icon/Bell.png" />
          </div>
          <div class="profile12">
            <img src="" />
          </div>
          <div class="menu12">NAME SURNAME</div>
        </div>
        <div class="row112">
          <div class="dropdown12">
            <select>
              <option value="department" selected>Department</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          </div>
          <div class="dropdown12">
            <select>
              <option value="department" selected>Selection of Violation:</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          </div>
          <div class="date-chooser12">
            <div class="calendar-icon12">
              <img src="/Users/mac/Desktop/VMS/react/frontend-backend/ABS_VMS/src/assets/icon/Calender.png" alt="Calendar Icon" />
              <span>Duration:</span>
            </div>
            <input type="text" id="duration-picker" />
          </div>

          <button class="download-btn12">
            <img src="/Users/mac/Desktop/VMS/react/frontend-backend/ABS_VMS/src/assets/icon/download.png" />
          </button>
          <button class="search-btn12">Search</button>
        </div>
        <div class="row212">
          <span style={{width: "140px;"}}>HEADING</span>
          <span style={{width: "170px;"}}>HEADING</span>
          <span style={{width: "110px;"}}>HEADING</span>
          <span style={{width: "260px;"}}>HEADING</span>
          <span style={{width: "300px;"}}>HEADING</span>
          <span style={{width: "10px;"}}>HEADING</span>
        </div>
        <div class="row-scrollable12">
          <div class="rows12">
            <span style={{width: "140px;"}}></span>
            <span style={{width: "170px;"}}></span>
            <span style={{width: "110px;"}}></span>
            <span style={{width: "260px;"}}></span>
            <span style={{width: "300px;"}}></span>
            <span style={{width: "10px;"}}></span>
          </div>
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

export default AddStream;
