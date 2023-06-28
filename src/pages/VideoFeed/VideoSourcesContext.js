import { createContext, useState, useEffect } from 'react';

const VideoSourcesContext = createContext();

export const VideoSourcesProvider = ({ children }) => {
  const [videoSources, setVideoSources] = useState([]);

  useEffect(() => {
    // Load video sources from local storage on component mount
    const storedVideoSources = localStorage.getItem('videoSources');
    if (storedVideoSources) {
      setVideoSources(JSON.parse(storedVideoSources));
    }
  }, []);

  useEffect(() => {
    // Save video sources to local storage whenever it changes
    localStorage.setItem('videoSources', JSON.stringify(videoSources));
  }, [videoSources]);

  const addVideoSource = (devices) => {
    setVideoSources((prevSources) => [
      ...prevSources,
      { name:devices.name, ip: devices.ip,  username: devices.username, password: devices.password,port: devices.port,stream: devices.stream },
    ]);
  };

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

