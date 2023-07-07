import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import "./VA.css";

const AddStream = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [newVideoSource, setNewVideoSource] = useState("");

  useEffect(() => {
    // Check if the user is logged in
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      // User is authenticated
      setAuthenticated(true);
    } else {
      // User is not authenticated, navigate to the login page
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleNavigation = (path) => {
    // Function to handle navigation to different routes
    navigate(path);
  };

  const handleLogout = () => {
    // Function to handle user logout
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <div>
      <div className="sidebar">
        <img src={logo}></img> {/* Render the logo image */}
        <button onClick={() => handleNavigation("/dashboard")}>Dashboard</button> {/* Button to navigate to the dashboard */}
        <button onClick={() => handleNavigation("/playback")}>Playback</button> {/* Button to navigate to the playback page */}
        <button onClick={() => handleNavigation("/add-stream")}>Add Stream</button> {/* Button to navigate to the add stream page */}
        <button onClick={() => handleNavigation("/video-analytics")}>Video Analytics</button> {/* Button to navigate to the video analytics page */}
        <button onClick={() => handleNavigation("/stream-settings")}>ONVIF Settings</button> {/* Button to navigate to the ONVIF settings page */}
        <button onClick={handleLogout}>Logout</button> {/* Button to logout the user */}
      </div>
      <div class="container12">
        <div class="header12">
          <div class="left12">CAMERA RESULT / DEPARTMENT / CAMERA NAME</div> {/* Display camera information */}
          <div class="notification-icon12">
            <img src="./assets/Bell.png" /> {/* Render the notification icon */}
          </div>
          <div class="profile12">
            <img src="" /> {/* Render the user's profile image */}
          </div>
          <div class="menu12">NAME SURNAME</div> {/* Display the user's name */}
        </div>
        <div class="row112">
          <div class="dropdown12">
            <select>
              <option value="department" selected>Department</option> {/* Default department option */}
              <option value="option1">Option 1</option> {/* Department option 1 */}
              <option value="option2">Option 2</option> {/* Department option 2 */}
            </select>
          </div>
          <div class="dropdown12">
            <select>
              <option value="department" selected>Selection of Violation:</option> {/* Default violation option */}
              <option value="option1">Option 1</option> {/* Violation option 1 */}
              <option value="option2">Option 2</option> {/* Violation option 2 */}
            </select>
          </div>
          <div class="date-chooser12">
            <div class="calendar-icon12">
              <img src="/Users/mac/Desktop/VMS/react/frontend-backend/ABS_VMS/src/assets/icon/Calender.png" alt="Calendar Icon" /> {/* Render the calendar icon */}
              <span>Duration:</span> {/* Display the duration label */}
            </div>
            <input type="text" id="duration-picker" /> {/* Input field for selecting duration */}
          </div>

          <button class="download-btn12">
            <img src="/Users/mac/Desktop/VMS/react/frontend-backend/ABS_VMS/src/assets/icon/download.png" /> {/* Render the download icon */}
          </button>
          <button class="search-btn12">Search</button> {/* Button for search */}
        </div>
        <div class="row212">
          <span style={{width: "140px;"}}>HEADING</span> {/* Heading with specified width */}
          <span style={{width: "170px;"}}>HEADING</span> {/* Heading with specified width */}
          <span style={{width: "110px;"}}>HEADING</span> {/* Heading with specified width */}
          <span style={{width: "260px;"}}>HEADING</span> {/* Heading with specified width */}
          <span style={{width: "300px;"}}>HEADING</span> {/* Heading with specified width */}
          <span style={{width: "10px;"}}>HEADING</span> {/* Heading with specified width */}
        </div>
        <div class="row-scrollable12">
          <div class="rows12">
            <span style={{width: "140px;"}}></span> {/* Empty span with specified width */}
            <span style={{width: "170px;"}}></span> {/* Empty span with specified width */}
            <span style={{width: "110px;"}}></span> {/* Empty span with specified width */}
            <span style={{width: "260px;"}}></span> {/* Empty span with specified width */}
            <span style={{width: "300px;"}}></span> {/* Empty span with specified width */}
            <span style={{width: "10px;"}}></span> {/* Empty span with specified width */}
          </div>
        </div>
      </div>
      <div className="footer">
        <div className="copyright">
          &copy; 2023 Arcturus Business Solutions {/* Copyright information */}
        </div>
      </div>
    </div>
  );
};

export default AddStream;
