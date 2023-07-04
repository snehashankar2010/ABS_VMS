import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { VideoSourcesProvider } from "./pages/VideoFeed/VideoSourcesContext";
import reportWebVitals from "./reportWebVitals";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddStream from "./pages/AddStream/AddStream";
import Playback from "./pages/Playback/Playback";
import VA from "./pages/VA/VA";
import Settings from "./pages/Settings/Settings";
import "./index.css";

// Render the React application
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <VideoSourcesProvider>
        <Routes>
          {/* Define routes for different pages */}
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="login" element={<Login />} /> {/* Route for Login page */}
          <Route path="dashboard" element={<Dashboard />} /> {/* Route for Dashboard page */}
          <Route path="add-stream" element={<AddStream />} /> {/* Route for AddStream page */}
          <Route path="playback" element={<Playback />} /> {/* Route for Playback page */}
          <Route path="video-analytics" element={<VA />} /> {/* Route for VA page */}
          <Route path="stream-settings" element={<Settings />} /> {/* Route for Settings page */}
        </Routes>
      </VideoSourcesProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root") // Mount the application in the 'root' element of the HTML
);

reportWebVitals();
