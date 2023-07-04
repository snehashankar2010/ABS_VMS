import { createContext, useState, useEffect } from 'react';

// Create a context for managing video sources
const VideoSourcesContext = createContext();

export const VideoSourcesProvider = ({ children }) => {
  // Use state to keep track of video sources
  const [videoSources, setVideoSources] = useState([]);

  useEffect(() => {
    // Load video sources from local storage when the component mounts
    const storedVideoSources = localStorage.getItem('videoSources');
    if (storedVideoSources) {
      setVideoSources(JSON.parse(storedVideoSources));
    }
  }, []);

  useEffect(() => {
    // Save video sources to local storage whenever it changes
    localStorage.setItem('videoSources', JSON.stringify(videoSources));
  }, [videoSources]);

  // Function to add a new video source
  const addVideoSource = (devices) => {
    setVideoSources((prevSources) => [
      ...prevSources,
      {
        name: devices.name,
        ip: devices.ip,
        username: devices.username,
        password: devices.password,
        port: devices.port,
        stream: devices.stream,
      },
    ]);
  };

  // Function to delete a video source based on its index
  const deleteVideoSource = (index) => {
    setVideoSources((prevSources) => {
      const updatedSources = [...prevSources];
      updatedSources.splice(index, 1);
      return updatedSources;
    });
  };

  return (
    <VideoSourcesContext.Provider value={{ videoSources, addVideoSource, deleteVideoSource }}>
      {children}
    </VideoSourcesContext.Provider>
  );
};

export default VideoSourcesContext;
