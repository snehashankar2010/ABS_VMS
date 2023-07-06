import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo.png";
import "./VA.css";

var viewportHeight = window.innerHeight;
console.log("Viewport height: " + viewportHeight + "px"); // To view the height of the viewport and make CSS adjustments

const VA = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  // Check if the user is already authenticated
  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === "true") {
      setAuthenticated(true);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

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
      <div className="va-body-text">
        <div className="va-header">
          <h1>Video Analytics</h1>
        </div>
        {/* User Header */}
        <div className="va-row">
          <h2>User Header</h2>
          {/* Add your content for the User Header row */}
        </div>

        {/* Selection Bar */}
        <div className="va-row">
          <h2>Selection Bar</h2>
          {/* Add your content for the Selection Bar row */}
        </div>

        {/* Headings Bar */}
        <div className="va-row">
          <h2>Headings Bar</h2>
          {/* Add your content for the Headings Bar row */}
        </div>
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

export default VA;
