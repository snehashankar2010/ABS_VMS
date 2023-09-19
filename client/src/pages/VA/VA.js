// Importing necessary dependencies and resources.

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import bell from "../../assets/icon/Bell.png";
import cal from "../../assets/icon/Calendar.png";
import download from "../../assets/icon/download.png";
import "./VA.css";

// Defining the AddStream functional component and initializing state variables using the useState hook.

const AddStream = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [newVideoSource, setNewVideoSource] = useState("");

  // Using the useEffect hook to run a code snippet after the component is rendered. 
  // It checks if the user is logged in by reading the authenticated value from local storage. 
  // If the user is authenticated, it updates the state variable authenticated to true, otherwise it navigates to the login page.

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

  // Defining a function handleNavigation that takes a path parameter and uses the navigate function to navigate to the specified path.

  const handleNavigation = (path) => {
    // Function to handle navigation to different routes
    navigate(path);
  };

  // Defining a function handleLogout that logs out the user by updating the authenticated state variable to false, 
  // clearing the authentication status in local storage, and navigating to the login page.

  const handleLogout = () => {
    // Function to handle user logout
    localStorage.setItem("authenticated", false);
    setAuthenticated(false);
    navigate("/login");
  };

  // The return statement returns JSX code that represents the structure and content of the component.

  // The remaining code is the JSX markup that defines the visual layout and components of the AddStream component. 
  // It consists of HTML-like tags and utilizes CSS classes and inline styles to style the elements. 
  // Each line of the JSX code is commented to describe its purpose and functionality.
  // Overall, the VA.js file represents a React component that handles authentication, navigation, and rendering of the Add Stream page, with various UI elements like buttons, dropdowns, and headers.

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
            <img src={bell} /> {/* Render the notification icon */}
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
              <img src={cal} alt="Calendar Icon" /> {/* Render the calendar icon */}
              <span>Duration:</span> {/* Display the duration label */}
            </div>
            <input type="text" id="duration-picker" /> {/* Input field for selecting duration */}
          </div>

          <button class="download-btn12">
            <img src={download} /> {/* Render the download icon */}
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