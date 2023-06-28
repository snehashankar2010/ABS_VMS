import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { VideoSourcesProvider } from "./pages/VideoFeed/VideoSourcesContext";
import reportWebVitals from "./reportWebVitals";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddStream from "./pages/AddStream/AddStream";
import Playback from "./pages/Playback/Playback";
import Settings from "./pages/Settings/Settings";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <VideoSourcesProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-stream" element={<AddStream />} />
          <Route path="playback"element={<Playback/>}/>
          <Route path="stream-settings" element={<Settings />} />
        </Routes>
      </VideoSourcesProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
